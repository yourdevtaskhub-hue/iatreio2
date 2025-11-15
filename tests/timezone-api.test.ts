/**
 * API-only tests for timezone handling
 * Can run independently without UI
 */

import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Helper to get auth tokens (mock or real)
async function getAuthToken(email: string, password: string): Promise<string> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  return data.token;
}

// Test 1: UTC Storage Verification
test.describe('API: UTC Storage', () => {
  test('Availability created in Zurich timezone stores correct UTC', async () => {
    const token = await getAuthToken('doctor_zurich@test.local', 'test123456');
    
    // Create availability: 2025-11-20 10:00 CET (UTC+1) = 09:00 UTC
    const response = await fetch(`${API_URL}/availabilities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        doctor_id: 'test-doctor-id',
        date: '2025-11-20',
        start_time: '10:00:00',
        end_time: '10:30:00',
        timezone: 'Europe/Zurich'
      })
    });
    
    const availability = await response.json();
    
    // Verify UTC storage
    expect(availability.start_time_utc).toBe('2025-11-20T09:00:00Z');
    expect(availability.end_time_utc).toBe('2025-11-20T09:30:00Z');
  });
  
  test('Booking from Athens timezone stores correct UTC', async () => {
    const doctorToken = await getAuthToken('doctor_zurich@test.local', 'test123456');
    const patientToken = await getAuthToken('patient_athens@test.local', 'test123456');
    
    // First create availability
    const availResponse = await fetch(`${API_URL}/availabilities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${doctorToken}`
      },
      body: JSON.stringify({
        doctor_id: 'test-doctor-id',
        date: '2025-11-20',
        start_time: '10:00:00',
        end_time: '10:30:00',
        timezone: 'Europe/Zurich'
      })
    });
    const availability = await availResponse.json();
    
    // Patient books (sees 11:00 Athens time, but sends correct UTC)
    const bookingResponse = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${patientToken}`
      },
      body: JSON.stringify({
        availability_id: availability.id,
        date: '2025-11-20',
        time: '11:00:00', // Patient's local time
        timezone: 'Europe/Athens'
      })
    });
    
    const booking = await bookingResponse.json();
    
    // Verify UTC storage
    expect(booking.start_utc).toBe('2025-11-20T09:00:00Z');
  });
});

// Test 2: DST Handling
test.describe('API: DST Handling', () => {
  test('Handles DST transition correctly', async () => {
    const token = await getAuthToken('doctor_zurich@test.local', 'test123456');
    
    // Before DST (Oct 25, 2025 - still summer time)
    // Zurich: UTC+2, Athens: UTC+3
    const beforeDST = await fetch(`${API_URL}/availabilities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        doctor_id: 'test-doctor-id',
        date: '2025-10-25',
        start_time: '10:00:00',
        end_time: '10:30:00',
        timezone: 'Europe/Zurich'
      })
    });
    const before = await beforeDST.json();
    expect(before.start_time_utc).toBe('2025-10-25T08:00:00Z'); // UTC+2
    
    // After DST (Oct 27, 2025 - winter time)
    // Zurich: UTC+1, Athens: UTC+2
    const afterDST = await fetch(`${API_URL}/availabilities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        doctor_id: 'test-doctor-id',
        date: '2025-10-27',
        start_time: '10:00:00',
        end_time: '10:30:00',
        timezone: 'Europe/Zurich'
      })
    });
    const after = await afterDST.json();
    expect(after.start_time_utc).toBe('2025-10-27T09:00:00Z'); // UTC+1
  });
});

// Test 3: Midnight Boundary
test.describe('API: Midnight Boundary', () => {
  test('Handles slot crossing midnight correctly', async () => {
    const token = await getAuthToken('doctor_zurich@test.local', 'test123456');
    
    // Create slot at 23:30 Zurich (should be 00:30 next day in Athens)
    const response = await fetch(`${API_URL}/availabilities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        doctor_id: 'test-doctor-id',
        date: '2025-11-20',
        start_time: '23:30:00',
        end_time: '00:00:00',
        timezone: 'Europe/Zurich'
      })
    });
    
    const availability = await response.json();
    
    // Verify UTC (23:30 CET = 22:30 UTC)
    expect(availability.start_time_utc).toBe('2025-11-20T22:30:00Z');
    
    // Verify date doesn't change incorrectly
    expect(availability.date).toBe('2025-11-20');
    
    // When patient queries for next day, should find this slot
    const patientToken = await getAuthToken('patient_athens@test.local', 'test123456');
    const queryResponse = await fetch(`${API_URL}/availabilities?date=2025-11-21&timezone=Europe/Athens`, {
      headers: {
        'Authorization': `Bearer ${patientToken}`
      }
    });
    
    const slots = await queryResponse.json();
    // Should find the slot showing as 00:30 on Nov 21
    const foundSlot = slots.find((s: any) => s.display_time === '00:30' && s.display_date === '2025-11-21');
    expect(foundSlot).toBeTruthy();
  });
});

// Test 4: Concurrency
test.describe('API: Concurrency', () => {
  test('Prevents duplicate bookings', async () => {
    const doctorToken = await getAuthToken('doctor_zurich@test.local', 'test123456');
    const patient1Token = await getAuthToken('patient_athens@test.local', 'test123456');
    const patient2Token = await getAuthToken('patient2@test.local', 'test123456');
    
    // Create availability
    const availResponse = await fetch(`${API_URL}/availabilities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${doctorToken}`
      },
      body: JSON.stringify({
        doctor_id: 'test-doctor-id',
        date: '2025-11-20',
        start_time: '10:00:00',
        end_time: '10:30:00',
        timezone: 'Europe/Zurich'
      })
    });
    const availability = await availResponse.json();
    
    // Both patients try to book simultaneously
    const [booking1, booking2] = await Promise.allSettled([
      fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${patient1Token}`
        },
        body: JSON.stringify({
          availability_id: availability.id,
          date: '2025-11-20',
          time: '11:00:00',
          timezone: 'Europe/Athens'
        })
      }),
      fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${patient2Token}`
        },
        body: JSON.stringify({
          availability_id: availability.id,
          date: '2025-11-20',
          time: '11:00:00',
          timezone: 'Europe/Athens'
        })
      })
    ]);
    
    // One should succeed, one should fail
    const successCount = [booking1, booking2].filter(
      result => result.status === 'fulfilled' && result.value.ok
    ).length;
    
    expect(successCount).toBe(1);
    
    // Verify only one booking exists
    const bookingsResponse = await fetch(`${API_URL}/bookings?availability_id=${availability.id}`, {
      headers: {
        'Authorization': `Bearer ${doctorToken}`
      }
    });
    const bookings = await bookingsResponse.json();
    expect(bookings.length).toBe(1);
  });
});

