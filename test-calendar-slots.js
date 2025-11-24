// Test script to check calendar slots for Dr. Fytrou on 28/11/25
// Simulates both Greece and Switzerland timezones

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://vdrmgzoupwyisiyrnjdi.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcm1nem91cHd5aXNpeXJuamRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUzMDAxNiwiZXhwIjoyMDc1MTA2MDE2fQ.uH3E-xqFmKkMF6Uul3jaSHTqloqklWDg7KaIAMxq_CQ';

const supabase = createClient(supabaseUrl, supabaseKey);

// Timezone conversion function (simplified version)
function convertTimeToTimezone(dateStr, timeStr, fromTimezone, toTimezone) {
  if (fromTimezone === toTimezone) {
    return timeStr;
  }
  
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  let newHour = hours;
  
  // Greece is 1 hour ahead of Switzerland
  if (fromTimezone === 'Europe/Zurich' && toTimezone === 'Europe/Athens') {
    newHour = hours + 1;
  } else if (fromTimezone === 'Europe/Athens' && toTimezone === 'Europe/Zurich') {
    newHour = hours - 1;
  }
  
  // Handle overflow/underflow
  if (newHour >= 24) {
    newHour = newHour - 24;
  } else if (newHour < 0) {
    newHour = 24 + newHour;
  }
  
  return `${String(Math.floor(newHour)).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
}

function toHHMM(t) {
  return (t || '').slice(0, 5);
}

async function testCalendarSlots() {
  const appointmentDate = '2025-11-28';
  const doctorId = '6e4c30d9-d295-467f-be3c-86a0c2aa70e9'; // Dr. Fytrou
  
  console.log('='.repeat(80));
  console.log(`Testing Calendar Slots for Dr. Fytrou on ${appointmentDate}`);
  console.log('='.repeat(80));
  
  // Fetch availability
  const { data: availability, error: availError } = await supabase
    .from('availability')
    .select('start_time, end_time, increment_minutes')
    .eq('doctor_id', doctorId)
    .eq('date', appointmentDate)
    .order('start_time');
  
  if (availError) {
    console.error('Error fetching availability:', availError);
    return;
  }
  
  console.log('\n📅 Availability (Doctor Timezone - Switzerland):');
  availability.forEach(a => {
    console.log(`  ${a.start_time} - ${a.end_time} (${a.increment_minutes} min increments)`);
  });
  
  // Fetch appointments
  const { data: appointments, error: aptError } = await supabase
    .from('appointments')
    .select('time, user_timezone')
    .eq('doctor_id', doctorId)
    .eq('date', appointmentDate);
  
  if (aptError) {
    console.error('Error fetching appointments:', aptError);
    return;
  }
  
  console.log('\n📋 Appointments in Database:');
  appointments.forEach(apt => {
    console.log(`  Time: ${apt.time}, User Timezone: ${apt.user_timezone || 'NULL (legacy)'}`);
  });
  
  // Test for Greece (Europe/Athens)
  console.log('\n' + '='.repeat(80));
  console.log('🇬🇷 GREECE (Europe/Athens) - User View');
  console.log('='.repeat(80));
  
  const doctorTimezone = 'Europe/Zurich';
  const patientTimezoneGreece = 'Europe/Athens';
  
  // Convert appointments to patient timezone
  const bookedSetGreece = new Set(
    appointments.map(apt => {
      const appointmentTimeInDb = toHHMM(apt.time);
      let appointmentSourceTimezone;
      
      if (apt.user_timezone) {
        appointmentSourceTimezone = apt.user_timezone;
      } else {
        appointmentSourceTimezone = doctorTimezone;
      }
      
      if (appointmentSourceTimezone === patientTimezoneGreece) {
        return appointmentTimeInDb;
      }
      
      const converted = convertTimeToTimezone(
        appointmentDate,
        appointmentTimeInDb,
        appointmentSourceTimezone,
        patientTimezoneGreece
      );
      return toHHMM(converted);
    })
  );
  
  console.log('\n📌 Booked Times (converted to Greece timezone):');
  console.log('  ' + Array.from(bookedSetGreece).join(', ') || '  (none)');
  
  // Generate slots for Greece
  const slotsGreece = [];
  availability.forEach(a => {
    const convertedStart = convertTimeToTimezone(
      appointmentDate,
      a.start_time,
      doctorTimezone,
      patientTimezoneGreece
    );
    const convertedEnd = convertTimeToTimezone(
      appointmentDate,
      a.end_time,
      doctorTimezone,
      patientTimezoneGreece
    );
    
    const [sh, sm] = convertedStart.split(':').map(Number);
    const [eh, em] = convertedEnd.split(':').map(Number);
    let cur = sh * 60 + sm;
    const end = eh * 60 + em;
    const step = a.increment_minutes;
    
    while (cur < end) {
      const hh = Math.floor(cur / 60).toString().padStart(2, '0');
      const mm = (cur % 60).toString().padStart(2, '0');
      const time = `${hh}:${mm}`;
      const isBooked = bookedSetGreece.has(time);
      
      slotsGreece.push({
        time,
        available: !isBooked,
        reason: isBooked ? 'booked' : undefined
      });
      
      cur += step;
    }
  });
  
  slotsGreece.sort((a, b) => a.time.localeCompare(b.time));
  
  console.log('\n🟢 Available Slots (GREEN):');
  const availableGreece = slotsGreece.filter(s => s.available);
  if (availableGreece.length > 0) {
    availableGreece.forEach(s => console.log(`  ${s.time}`));
  } else {
    console.log('  (none)');
  }
  
  console.log('\n🔴 Booked Slots (RED):');
  const bookedGreece = slotsGreece.filter(s => !s.available);
  if (bookedGreece.length > 0) {
    bookedGreece.forEach(s => console.log(`  ${s.time} (${s.reason})`));
  } else {
    console.log('  (none)');
  }
  
  // Test for Switzerland (Europe/Zurich)
  console.log('\n' + '='.repeat(80));
  console.log('🇨🇭 SWITZERLAND (Europe/Zurich) - User View');
  console.log('='.repeat(80));
  
  const patientTimezoneSwitzerland = 'Europe/Zurich';
  
  // Convert appointments to patient timezone
  const bookedSetSwitzerland = new Set(
    appointments.map(apt => {
      const appointmentTimeInDb = toHHMM(apt.time);
      let appointmentSourceTimezone;
      
      if (apt.user_timezone) {
        appointmentSourceTimezone = apt.user_timezone;
      } else {
        appointmentSourceTimezone = doctorTimezone;
      }
      
      if (appointmentSourceTimezone === patientTimezoneSwitzerland) {
        return appointmentTimeInDb;
      }
      
      const converted = convertTimeToTimezone(
        appointmentDate,
        appointmentTimeInDb,
        appointmentSourceTimezone,
        patientTimezoneSwitzerland
      );
      return toHHMM(converted);
    })
  );
  
  console.log('\n📌 Booked Times (converted to Switzerland timezone):');
  console.log('  ' + Array.from(bookedSetSwitzerland).join(', ') || '  (none)');
  
  // Generate slots for Switzerland
  const slotsSwitzerland = [];
  availability.forEach(a => {
    const convertedStart = convertTimeToTimezone(
      appointmentDate,
      a.start_time,
      doctorTimezone,
      patientTimezoneSwitzerland
    );
    const convertedEnd = convertTimeToTimezone(
      appointmentDate,
      a.end_time,
      doctorTimezone,
      patientTimezoneSwitzerland
    );
    
    const [sh, sm] = convertedStart.split(':').map(Number);
    const [eh, em] = convertedEnd.split(':').map(Number);
    let cur = sh * 60 + sm;
    const end = eh * 60 + em;
    const step = a.increment_minutes;
    
    while (cur < end) {
      const hh = Math.floor(cur / 60).toString().padStart(2, '0');
      const mm = (cur % 60).toString().padStart(2, '0');
      const time = `${hh}:${mm}`;
      const isBooked = bookedSetSwitzerland.has(time);
      
      slotsSwitzerland.push({
        time,
        available: !isBooked,
        reason: isBooked ? 'booked' : undefined
      });
      
      cur += step;
    }
  });
  
  slotsSwitzerland.sort((a, b) => a.time.localeCompare(b.time));
  
  console.log('\n🟢 Available Slots (GREEN):');
  const availableSwitzerland = slotsSwitzerland.filter(s => s.available);
  if (availableSwitzerland.length > 0) {
    availableSwitzerland.forEach(s => console.log(`  ${s.time}`));
  } else {
    console.log('  (none)');
  }
  
  console.log('\n🔴 Booked Slots (RED):');
  const bookedSwitzerland = slotsSwitzerland.filter(s => !s.available);
  if (bookedSwitzerland.length > 0) {
    bookedSwitzerland.forEach(s => console.log(`  ${s.time} (${s.reason})`));
  } else {
    console.log('  (none)');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Test Complete');
  console.log('='.repeat(80));
}

testCalendarSlots().catch(console.error);

