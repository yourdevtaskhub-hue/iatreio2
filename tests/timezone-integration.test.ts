/**
 * Comprehensive Timezone Integration Tests
 * Tests timezone handling between Greece (Europe/Athens) and Switzerland (Europe/Zurich)
 * 
 * Requirements:
 * - Playwright for UI tests
 * - API tests using fetch/axios
 * - DST transition tests
 * - Edge cases (midnight boundaries)
 * - Concurrency tests
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import { chromium } from 'playwright';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Test accounts
const DOCTOR_ZURICH = {
  email: 'doctor_zurich@test.local',
  password: 'test123456',
  timezone: 'Europe/Zurich'
};

const PATIENT_ATHENS = {
  email: 'patient_athens@test.local',
  password: 'test123456',
  timezone: 'Europe/Athens'
};

// Helper functions
async function loginAsDoctor(page: Page) {
  await page.goto(`${BASE_URL}/admin`);
  await page.fill('input[type="email"]', DOCTOR_ZURICH.email);
  await page.fill('input[type="password"]', DOCTOR_ZURICH.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/**');
}

async function loginAsPatient(page: Page) {
  await page.goto(`${BASE_URL}/contact`);
  // Assuming there's a login flow for patients
  // Adjust based on your actual implementation
}

async function setTimezone(page: Page, timezone: string) {
  // Set browser timezone using context
  await page.addInitScript((tz) => {
    // Mock Intl.DateTimeFormat to return specific timezone
    const originalDateTimeFormat = Intl.DateTimeFormat;
    // @ts-ignore
    Intl.DateTimeFormat = function(...args: any[]) {
      if (args.length === 0 || (args.length === 1 && typeof args[0] === 'string')) {
        args.push({ timeZone: tz });
      } else if (args.length === 2 && typeof args[1] === 'object') {
        args[1].timeZone = tz;
      }
      return new originalDateTimeFormat(...args);
    };
  }, timezone);
}

function convertToUTC(dateTime: string, timezone: string): string {
  // Convert local time to UTC
  const date = new Date(dateTime);
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  const offset = tzDate.getTime() - utcDate.getTime();
  return new Date(date.getTime() - offset).toISOString();
}

function convertFromUTC(utcString: string, timezone: string): string {
  // Convert UTC to local timezone
  const utcDate = new Date(utcString);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  return formatter.format(utcDate);
}

// API Helper functions
async function createAvailability(doctorToken: string, start: string, end: string, timezone: string) {
  const response = await fetch(`${API_URL}/availabilities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${doctorToken}`
    },
    body: JSON.stringify({
      start,
      end,
      timezone,
      doctor_id: 'test-doctor-id' // Adjust based on your API
    })
  });
  return response.json();
}

async function getAvailability(availabilityId: string) {
  const response = await fetch(`${API_URL}/availabilities/${availabilityId}`);
  return response.json();
}

async function bookSlot(patientToken: string, slotId: string, start: string) {
  const response = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${patientToken}`
    },
    body: JSON.stringify({
      slot_id: slotId,
      start,
      timezone: PATIENT_ATHENS.timezone
    })
  });
  return response.json();
}

async function getBooking(bookingId: string) {
  const response = await fetch(`${API_URL}/bookings/${bookingId}`);
  return response.json();
}

// Test 1: Simple booking without DST
test.describe('Test 1: Simple Booking (No DST)', () => {
  test('Doctor creates availability, patient books, times are correctly converted', async ({ page, context }) => {
    // Set timezone for doctor context
    const doctorContext = await context.browser()?.newContext({
      locale: 'en-US',
      timezoneId: DOCTOR_ZURICH.timezone
    });
    const doctorPage = await doctorContext?.newPage() || page;
    
    // Set timezone for patient context
    const patientContext = await context.browser()?.newContext({
      locale: 'en-US',
      timezoneId: PATIENT_ATHENS.timezone
    });
    const patientPage = await patientContext?.newPage() || page;

    // Step 1: Doctor creates availability
    // Local time for doctor: 2025-11-20 10:00 (Europe/Zurich)
    const doctorLocalTime = '2025-11-20T10:00:00+01:00'; // CET (UTC+1 in November)
    const expectedUTC = '2025-11-20T09:00:00Z';
    
    await loginAsDoctor(doctorPage);
    await setTimezone(doctorPage, DOCTOR_ZURICH.timezone);
    
    // Create availability via UI or API
    // For UI:
    await doctorPage.goto(`${BASE_URL}/admin/availability`);
    await doctorPage.fill('input[type="date"]', '2025-11-20');
    await doctorPage.fill('input[type="time"]', '10:00');
    await doctorPage.click('button:has-text("Create")');
    
    // Verify backend storage
    // This would require API access or database query
    // For now, we'll check via UI that it was created
    
    // Step 2: Patient views calendar
    await loginAsPatient(patientPage);
    await setTimezone(patientPage, PATIENT_ATHENS.timezone);
    
    await patientPage.goto(`${BASE_URL}/contact`);
    await patientPage.fill('input[type="date"]', '2025-11-20');
    
    // Verify patient sees 11:00 (Athens time, UTC+2 in November)
    const slotTime = await patientPage.textContent('.time-slot:has-text("11:00")');
    expect(slotTime).toBeTruthy();
    
    // Step 3: Patient books slot
    await patientPage.click('.time-slot:has-text("11:00")');
    await patientPage.fill('input[name="parentName"]', 'Test Patient');
    await patientPage.fill('input[name="email"]', PATIENT_ATHENS.email);
    await patientPage.click('button:has-text("Book")');
    
    // Step 4: Verify booking in doctor's calendar
    await doctorPage.reload();
    const doctorAppointment = await doctorPage.textContent('.appointment:has-text("10:00")');
    expect(doctorAppointment).toBeTruthy();
    
    // Step 5: Verify booking in patient's calendar
    await patientPage.reload();
    const patientAppointment = await patientPage.textContent('.appointment:has-text("11:00")');
    expect(patientAppointment).toBeTruthy();
    
    await doctorPage.close();
    await patientPage.close();
  });
});

// Test 2: DST Transition
test.describe('Test 2: DST Transition', () => {
  test('Handles DST switch correctly', async ({ page, context }) => {
    // Test with date around DST transition
    // Last Sunday of October (DST ends) or last Sunday of March (DST starts)
    
    // Example: 2025-10-26 (last Sunday of October in 2025)
    // Before DST: Zurich UTC+2, Athens UTC+3
    // After DST: Zurich UTC+1, Athens UTC+2
    
    const doctorContext = await context.browser()?.newContext({
      locale: 'en-US',
      timezoneId: DOCTOR_ZURICH.timezone
    });
    const doctorPage = await doctorContext?.newPage() || page;
    
    const patientContext = await context.browser()?.newContext({
      locale: 'en-US',
      timezoneId: PATIENT_ATHENS.timezone
    });
    const patientPage = await patientContext?.newPage() || page;
    
    // Create slot before DST change (Oct 25, 10:00 Zurich = UTC+2)
    const beforeDST = '2025-10-25T10:00:00+02:00';
    const expectedUTCBefore = '2025-10-25T08:00:00Z';
    // Athens should show: 11:00 (UTC+3)
    
    // Create slot after DST change (Oct 27, 10:00 Zurich = UTC+1)
    const afterDST = '2025-10-27T10:00:00+01:00';
    const expectedUTCAfter = '2025-10-27T09:00:00Z';
    // Athens should show: 11:00 (UTC+2)
    
    await loginAsDoctor(doctorPage);
    await setTimezone(doctorPage, DOCTOR_ZURICH.timezone);
    
    // Create availability before DST
    await doctorPage.goto(`${BASE_URL}/admin/availability`);
    await doctorPage.fill('input[type="date"]', '2025-10-25');
    await doctorPage.fill('input[type="time"]', '10:00');
    await doctorPage.click('button:has-text("Create")');
    
    // Create availability after DST
    await doctorPage.fill('input[type="date"]', '2025-10-27');
    await doctorPage.fill('input[type="time"]', '10:00');
    await doctorPage.click('button:has-text("Create")');
    
    // Patient views both slots
    await loginAsPatient(patientPage);
    await setTimezone(patientPage, PATIENT_ATHENS.timezone);
    
    await patientPage.goto(`${BASE_URL}/contact`);
    await patientPage.fill('input[type="date"]', '2025-10-25');
    
    // Both should show 11:00 in Athens (but different UTC offsets)
    const slot1 = await patientPage.textContent('.time-slot[data-date="2025-10-25"]:has-text("11:00")');
    const slot2 = await patientPage.textContent('.time-slot[data-date="2025-10-27"]:has-text("11:00")');
    
    expect(slot1).toBeTruthy();
    expect(slot2).toBeTruthy();
    
    await doctorPage.close();
    await patientPage.close();
  });
});

// Test 3: Edge case - Midnight boundary
test.describe('Test 3: Midnight Boundary', () => {
  test('Handles slot near midnight correctly', async ({ page, context }) => {
    // Doctor creates slot: 2025-11-20 23:30 Europe/Zurich
    // This should be 2025-11-21 00:30 Europe/Athens (next day)
    
    const doctorContext = await context.browser()?.newContext({
      locale: 'en-US',
      timezoneId: DOCTOR_ZURICH.timezone
    });
    const doctorPage = await doctorContext?.newPage() || page;
    
    const patientContext = await context.browser()?.newContext({
      locale: 'en-US',
      timezoneId: PATIENT_ATHENS.timezone
    });
    const patientPage = await patientContext?.newPage() || page;
    
    await loginAsDoctor(doctorPage);
    await setTimezone(doctorPage, DOCTOR_ZURICH.timezone);
    
    // Create slot at 23:30 Zurich time
    await doctorPage.goto(`${BASE_URL}/admin/availability`);
    await doctorPage.fill('input[type="date"]', '2025-11-20');
    await doctorPage.fill('input[type="time"]', '23:30');
    await doctorPage.click('button:has-text("Create")');
    
    // Patient should see it on next day (Nov 21) at 00:30
    await loginAsPatient(patientPage);
    await setTimezone(patientPage, PATIENT_ATHENS.timezone);
    
    await patientPage.goto(`${BASE_URL}/contact`);
    await patientPage.fill('input[type="date"]', '2025-11-21');
    
    // Should see 00:30 slot
    const slot = await patientPage.textContent('.time-slot:has-text("00:30")');
    expect(slot).toBeTruthy();
    
    // Verify date is correct (not showing on wrong day)
    const dateLabel = await patientPage.textContent('.date-label');
    expect(dateLabel).toContain('2025-11-21');
    
    await doctorPage.close();
    await patientPage.close();
  });
});

// Test 4: Concurrency - Race condition
test.describe('Test 4: Concurrency Test', () => {
  test('Prevents duplicate bookings for same slot', async ({ page, context }) => {
    const doctorContext = await context.browser()?.newContext({
      locale: 'en-US',
      timezoneId: DOCTOR_ZURICH.timezone
    });
    const doctorPage = await doctorContext?.newPage() || page;
    
    // Create two patient contexts
    const patient1Context = await context.browser()?.newContext({
      locale: 'en-US',
      timezoneId: PATIENT_ATHENS.timezone
    });
    const patient1Page = await patient1Context?.newPage() || page;
    
    const patient2Context = await context.browser()?.newContext({
      locale: 'en-US',
      timezoneId: PATIENT_ATHENS.timezone
    });
    const patient2Page = await patient2Context?.newPage() || page;
    
    // Doctor creates availability
    await loginAsDoctor(doctorPage);
    await setTimezone(doctorPage, DOCTOR_ZURICH.timezone);
    
    await doctorPage.goto(`${BASE_URL}/admin/availability`);
    await doctorPage.fill('input[type="date"]', '2025-11-20');
    await doctorPage.fill('input[type="time"]', '10:00');
    await doctorPage.click('button:has-text("Create")');
    
    // Both patients try to book simultaneously
    await loginAsPatient(patient1Page);
    await setTimezone(patient1Page, PATIENT_ATHENS.timezone);
    
    await loginAsPatient(patient2Page);
    await setTimezone(patient2Page, PATIENT_ATHENS.timezone);
    
    await patient1Page.goto(`${BASE_URL}/contact`);
    await patient1Page.fill('input[type="date"]', '2025-11-20');
    
    await patient2Page.goto(`${BASE_URL}/contact`);
    await patient2Page.fill('input[type="date"]', '2025-11-20');
    
    // Both click the same slot at nearly the same time
    const [response1, response2] = await Promise.all([
      patient1Page.click('.time-slot:has-text("11:00")').then(() => 
        patient1Page.fill('input[name="parentName"]', 'Patient 1').then(() =>
          patient1Page.fill('input[name="email"]', 'patient1@test.local').then(() =>
            patient1Page.click('button:has-text("Book")')
          )
        )
      ),
      patient2Page.click('.time-slot:has-text("11:00")').then(() =>
        patient2Page.fill('input[name="parentName"]', 'Patient 2').then(() =>
          patient2Page.fill('input[name="email"]', 'patient2@test.local').then(() =>
            patient2Page.click('button:has-text("Book")')
          )
        )
      )
    ]);
    
    // Wait for responses
    await Promise.all([
      patient1Page.waitForResponse(resp => resp.url().includes('/bookings')),
      patient2Page.waitForResponse(resp => resp.url().includes('/bookings'))
    ]);
    
    // One should succeed, one should fail with "already booked"
    const error1 = await patient1Page.textContent('.error-message, .alert');
    const error2 = await patient2Page.textContent('.error-message, .alert');
    
    // At least one should show "already booked" or similar
    const hasError = error1?.includes('booked') || error2?.includes('booked') || 
                  error1?.includes('unavailable') || error2?.includes('unavailable');
    
    expect(hasError).toBeTruthy();
    
    // Verify only one booking exists
    await doctorPage.reload();
    const appointments = await doctorPage.$$('.appointment');
    expect(appointments.length).toBe(1);
    
    await doctorPage.close();
    await patient1Page.close();
    await patient2Page.close();
  });
});

// API Tests
test.describe('API Tests: UTC Storage Verification', () => {
  test('API stores times in UTC correctly', async () => {
    // This would require actual API tokens
    // For now, we'll structure the test
    
    const doctorToken = 'test-doctor-token'; // Would get from login
    const patientToken = 'test-patient-token'; // Would get from login
    
    // Create availability via API
    const availability = await createAvailability(
      doctorToken,
      '2025-11-20T10:00:00+01:00',
      '2025-11-20T10:30:00+01:00',
      DOCTOR_ZURICH.timezone
    );
    
    // Verify UTC storage
    expect(availability.start_time_utc).toBe('2025-11-20T09:00:00Z');
    expect(availability.end_time_utc).toBe('2025-11-20T09:30:00Z');
    
    // Book via API
    const booking = await bookSlot(
      patientToken,
      availability.id,
      '2025-11-20T11:00:00+02:00' // Patient's local time
    );
    
    // Verify booking UTC
    expect(booking.start_utc).toBe('2025-11-20T09:00:00Z');
    
    // Get booking and verify
    const retrievedBooking = await getBooking(booking.id);
    expect(retrievedBooking.start_utc).toBe('2025-11-20T09:00:00Z');
  });
});

// Email/Calendar Invite Tests
test.describe('Email/Calendar Invite Tests', () => {
  test('Calendar invite contains correct timezone info', async ({ page }) => {
    // This would require intercepting emails or calendar invites
    // For now, we'll structure the test
    
    await loginAsDoctor(page);
    await setTimezone(page, DOCTOR_ZURICH.timezone);
    
    // Create and book appointment
    // ... booking steps ...
    
    // Intercept calendar invite (ICS file)
    const icsContent = await page.evaluate(() => {
      // This would be intercepted from email or download
      return 'VCALENDAR content';
    });
    
    // Verify ICS contains:
    // - DTSTART with UTC or TZID
    // - Correct timezone information
    expect(icsContent).toContain('DTSTART');
    expect(icsContent).toMatch(/TZID=Europe\/Zurich|DTSTART:.*Z/);
  });
});

// Utility test for timezone conversion functions
test.describe('Timezone Conversion Utilities', () => {
  test('convertToUTC works correctly', () => {
    const zurichTime = '2025-11-20T10:00:00+01:00';
    const utc = convertToUTC(zurichTime, DOCTOR_ZURICH.timezone);
    expect(utc).toContain('2025-11-20T09:00:00');
  });
  
  test('convertFromUTC works correctly', () => {
    const utcTime = '2025-11-20T09:00:00Z';
    const athensTime = convertFromUTC(utcTime, PATIENT_ATHENS.timezone);
    expect(athensTime).toContain('11:00'); // Should be 11:00 in Athens (UTC+2)
  });
});

