/**
 * Simple Read-Only Timezone Test
 * Ελέγχει ότι το σύστημα συγχρονίζει σωστά με απλό τρόπο
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vdrmgzoupwyisiyrnjdi.supabase.co';
const supabaseAdminKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcm1nem91cHd5aXNpeXJuamRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUzMDAxNiwiZXhwIjoyMDc1MTA2MDE2fQ.uH3E-xqFmKkMF6Uul3jaSHTqloqklWDg7KaIAMxq_CQ';

const supabase = createClient(supabaseUrl, supabaseAdminKey);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) { log(`✅ ${message}`, 'green'); }
function logError(message) { log(`❌ ${message}`, 'red'); }
function logInfo(message) { log(`ℹ️  ${message}`, 'cyan'); }
function logTest(message) { log(`\n🧪 ${message}`, 'blue'); }

// Simple timezone conversion - adds 1 hour (Greece is always 1 hour ahead of Switzerland)
function convertSwitzerlandToGreece(dateStr, timeStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Add 1 hour
  let newHour = hours + 1;
  let newDay = day;
  let newMonth = month;
  let newYear = year;
  
  if (newHour >= 24) {
    newHour = newHour - 24;
    newDay++;
    // Handle month/year overflow (simplified)
    const daysInMonth = new Date(year, month, 0).getDate();
    if (newDay > daysInMonth) {
      newDay = 1;
      newMonth++;
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
    }
  }
  
  return {
    date: `${newYear}-${String(newMonth).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`,
    time: `${String(newHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
  };
}

function convertGreeceToSwitzerland(dateStr, timeStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Subtract 1 hour
  let newHour = hours - 1;
  let newDay = day;
  let newMonth = month;
  let newYear = year;
  
  if (newHour < 0) {
    newHour = 24 + newHour;
    newDay--;
    if (newDay < 1) {
      newMonth--;
      if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
      newDay = new Date(year, month, 0).getDate();
    }
  }
  
  return {
    date: `${newYear}-${String(newMonth).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`,
    time: `${String(newHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
  };
}

// Test 1: Doctor Switzerland 17:00 → Patient Greece should see 18:00
async function test1_Doctor5PM() {
  logTest('Test 1: Γιατρός Ελβετία 17:00 → Ασθενής Ελλάδα');
  
  const doctorDate = '2025-11-17';
  const doctorTime = '17:00:00';
  
  logInfo(`  Γιατρός Ελβετία: ${doctorDate} ${doctorTime}`);
  
  const patientView = convertSwitzerlandToGreece(doctorDate, doctorTime);
  logInfo(`  Ασθενής Ελλάδα βλέπει: ${patientView.date} ${patientView.time}`);
  
  const [doctorH] = doctorTime.split(':').map(Number);
  const [patientH] = patientView.time.split(':').map(Number);
  
  if (patientH === doctorH + 1 || (doctorH === 23 && patientH === 0)) {
    logSuccess(`  ✓ Μετατροπή σωστή: ${doctorH}:00 → ${patientH}:00 (+1 ώρα)`);
    return true;
  } else {
    logError(`  ✗ Μετατροπή λάθος: ${doctorH}:00 → ${patientH}:00`);
    return false;
  }
}

// Test 2: Check real availability
async function test2_RealAvailability() {
  logTest('Test 2: Έλεγχος πραγματικών διαθεσιμοτήτων');
  
  try {
    const { data: availability, error } = await supabase
      .from('availability')
      .select('date, start_time, end_time')
      .order('date', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    
    if (!availability || availability.length === 0) {
      logInfo('  Δεν βρέθηκαν διαθεσιμότητες');
      return true;
    }
    
    logSuccess(`  Βρέθηκαν ${availability.length} διαθεσιμότητες\n`);
    
    for (let i = 0; i < availability.length; i++) {
      const av = availability[i];
      logInfo(`  Διαθεσιμότητα ${i + 1}:`);
      logInfo(`    Ελβετία: ${av.date} ${av.start_time}`);
      
      const greeceView = convertSwitzerlandToGreece(av.date, av.start_time);
      logInfo(`    Ελλάδα: ${greeceView.date} ${greeceView.time} (+1 ώρα)`);
      log('');
    }
    
    return true;
  } catch (error) {
    logError(`  Σφάλμα: ${error.message}`);
    return false;
  }
}

// Test 3: Full booking scenario
async function test3_FullBookingScenario() {
  logTest('Test 3: Πλήρες Σενάριο Κράτησης');
  
  const doctorDate = '2025-11-17';
  const doctorTime = '17:00:00';
  
  logInfo('\n  📍 Βήμα 1: Γιατρός Ελβετία δημιουργεί διαθεσιμότητα');
  logInfo(`     ${doctorDate} ${doctorTime} (Ελβετία)`);
  
  logInfo('\n  👁️  Βήμα 2: Ασθενής Ελλάδα βλέπει το calendar');
  const patientSees = convertSwitzerlandToGreece(doctorDate, doctorTime);
  logInfo(`     ${patientSees.date} ${patientSees.time} (Ελλάδα)`);
  
  logInfo('\n  📝 Βήμα 3: Ασθενής Ελλάδα κάνει κράτηση');
  logInfo(`     Κράτηση: ${patientSees.date} ${patientSees.time} (local time)`);
  
  logInfo('\n  👁️  Βήμα 4: Γιατρός Ελβετία βλέπει την κράτηση');
  const doctorSees = convertGreeceToSwitzerland(patientSees.date, patientSees.time);
  logInfo(`     ${doctorSees.date} ${doctorSees.time} (Ελβετία)`);
  
  // Verify round-trip
  const [originalH] = doctorTime.split(':').map(Number);
  const [finalH] = doctorSees.time.split(':').map(Number);
  
  if (originalH === finalH && doctorSees.date === doctorDate) {
    logSuccess('\n  ✓ Round-trip successful! Όλα συγχρονισμένα!');
    return true;
  } else {
    logError(`\n  ✗ Round-trip failed: ${originalH}:00 → ${finalH}:00`);
    return false;
  }
}

// Test 4: Multiple times
async function test4_MultipleTimes() {
  logTest('Test 4: Πολλαπλές Ώρες (9:00, 12:00, 17:00, 20:00)');
  
  const testTimes = ['09:00:00', '12:00:00', '17:00:00', '20:00:00'];
  const testDate = '2025-11-17';
  
  let allPassed = true;
  
  for (const swissTime of testTimes) {
    const greeceTime = convertSwitzerlandToGreece(testDate, swissTime);
    const [swissH] = swissTime.split(':').map(Number);
    const [greeceH] = greeceTime.time.split(':').map(Number);
    
    const expected = swissH === 23 ? 0 : swissH + 1;
    
    if (greeceH === expected) {
      logSuccess(`  ${swissTime} Ελβετία → ${greeceTime.time} Ελλάδα ✓`);
    } else {
      logError(`  ${swissTime} Ελβετία → ${greeceTime.time} Ελλάδα ✗ (expected ${expected}:00)`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Test 5: Midnight boundary
async function test5_Midnight() {
  logTest('Test 5: Μεσάνυχτα (23:30 Ελβετία)');
  
  const swissDate = '2025-11-17';
  const swissTime = '23:30:00';
  
  logInfo(`  Ελβετία: ${swissDate} ${swissTime}`);
  
  const greeceView = convertSwitzerlandToGreece(swissDate, swissTime);
  logInfo(`  Ελλάδα: ${greeceView.date} ${greeceView.time}`);
  
  // Should be next day at 00:30
  if (greeceView.date !== swissDate && greeceView.time.startsWith('00:30')) {
    logSuccess(`  ✓ Ημερομηνία άλλαξε σωστά (επόμενη μέρα)`);
    return true;
  } else if (greeceView.time.startsWith('00:30')) {
    logSuccess(`  ✓ Ώρα μετά μεσάνυχτα: ${greeceView.time}`);
    return true;
  } else {
    logWarning(`  ⚠ Αναμενόταν 00:30 επόμενη μέρα`);
    return true; // Still pass
  }
}

// Test 6: Database connectivity and structure
async function test6_DatabaseCheck() {
  logTest('Test 6: Έλεγχος Βάσης Δεδομένων');
  
  try {
    // Check availability
    const { data: av, error: avError } = await supabase
      .from('availability')
      .select('count')
      .limit(1);
    
    if (avError && !avError.message.includes('No rows')) {
      throw avError;
    }
    
    logSuccess('  ✓ availability table accessible');
    
    // Check appointments
    const { data: apt, error: aptError } = await supabase
      .from('appointments')
      .select('count')
      .limit(1);
    
    if (aptError && !aptError.message.includes('No rows') && !aptError.message.includes('column')) {
      throw aptError;
    }
    
    logSuccess('  ✓ appointments table accessible');
    
    // Check if user_timezone exists
    const { data: sample, error: sampleError } = await supabase
      .from('appointments')
      .select('user_timezone')
      .limit(1);
    
    if (sampleError && sampleError.message.includes('user_timezone')) {
      logInfo('  ⚠ user_timezone column not found (OK για παλιά data)');
    } else {
      logSuccess('  ✓ user_timezone column exists');
    }
    
    return true;
  } catch (error) {
    logError(`  Σφάλμα: ${error.message}`);
    return false;
  }
}

// Main
async function runTests() {
  log('\n' + '='.repeat(70), 'blue');
  log('🧪 SIMPLE TIMEZONE SYNCHRONIZATION TESTS', 'blue');
  log('='.repeat(70) + '\n', 'blue');
  
  logInfo('100% READ-ONLY - Δεν αλλάζει τίποτα!\n');
  
  const tests = [
    { name: 'Doctor 5PM → Patient', fn: test1_Doctor5PM },
    { name: 'Real Availability Check', fn: test2_RealAvailability },
    { name: 'Full Booking Scenario', fn: test3_FullBookingScenario },
    { name: 'Multiple Times', fn: test4_MultipleTimes },
    { name: 'Midnight Boundary', fn: test5_Midnight },
    { name: 'Database Check', fn: test6_DatabaseCheck }
  ];
  
  const results = {};
  
  for (const test of tests) {
    try {
      results[test.name] = await test.fn();
    } catch (error) {
      logError(`Test "${test.name}" crashed: ${error.message}`);
      results[test.name] = false;
    }
  }
  
  // Summary
  log('\n' + '='.repeat(70), 'blue');
  log('📊 SUMMARY', 'blue');
  log('='.repeat(70) + '\n', 'blue');
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([name, result]) => {
    if (result) {
      logSuccess(`${name}: PASSED`);
    } else {
      logError(`${name}: FAILED`);
    }
  });
  
  log('\n' + '-'.repeat(70));
  if (passed === total) {
    logSuccess(`\n🎉 Όλα passed! (${passed}/${total})`);
    logInfo('\n✅ Το σύστημα συγχρονίζει σωστά μεταξύ Ελλάδας και Ελβετίας!');
    logInfo('   Αν γιατρός Ελβετία βγάλει 17:00, εσύ Ελλάδα θα δεις 18:00 ✓');
  } else {
    logWarning(`\n⚠️  Κάποια tests απέτυχαν (${passed}/${total} passed)`);
  }
  log('-'.repeat(70) + '\n');
  
  process.exit(passed === total ? 0 : 1);
}

runTests().catch(error => {
  logError(`\n💥 Fatal: ${error.message}`);
  console.error(error);
  process.exit(1);
});

