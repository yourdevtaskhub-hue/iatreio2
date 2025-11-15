/**
 * Test για να επιβεβαιώσουμε ότι οι διαθεσιμότητες μετατρέπονται σωστά
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vdrmgzoupwyisiyrnjdi.supabase.co';
const supabaseAdminKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcm1nem91cHd5aXNpeXJuamRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUzMDAxNiwiZXhwIjoyMDc1MTA2MDE2fQ.uH3E-xqFmKkMF6Uul3jaSHTqloqklWDg7KaIAMxq_CQ';

const supabase = createClient(supabaseUrl, supabaseAdminKey);

const TIMEZONES = {
  GREECE: 'Europe/Athens',
  SWITZERLAND: 'Europe/Zurich'
};

// Simple conversion: +1 hour
function convertSwitzerlandToGreece(dateStr, timeStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  let newHour = hours + 1;
  let newDay = day;
  let newMonth = month;
  let newYear = year;
  
  if (newHour >= 24) {
    newHour = newHour - 24;
    newDay++;
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

async function testAvailabilityConversion() {
  log('\n' + '='.repeat(70), 'blue');
  log('🧪 AVAILABILITY TIMEZONE CONVERSION TEST', 'blue');
  log('='.repeat(70) + '\n', 'blue');
  
  logTest('Test: Γιατρός Ελβετία 16:00 → Ασθενής Ελλάδα');
  
  try {
    // Get availability records
    const { data: availability, error } = await supabase
      .from('availability')
      .select('id, date, start_time, end_time, doctor_id')
      .order('date', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    if (!availability || availability.length === 0) {
      logInfo('Δεν βρέθηκαν διαθεσιμότητες');
      return;
    }
    
    logSuccess(`Βρέθηκαν ${availability.length} διαθεσιμότητες\n`);
    
    // Test conversion
    for (let i = 0; i < Math.min(5, availability.length); i++) {
      const av = availability[i];
      
      logInfo(`Διαθεσιμότητα ${i + 1}:`);
      logInfo(`  Ελβετία: ${av.date} ${av.start_time} - ${av.end_time}`);
      
      const greeceStart = convertSwitzerlandToGreece(av.date, av.start_time);
      const greeceEnd = convertSwitzerlandToGreece(av.date, av.end_time);
      
      logInfo(`  Ελλάδα: ${greeceStart.date} ${greeceStart.time} - ${greeceEnd.time}`);
      
      const [swissH] = av.start_time.split(':').map(Number);
      const [greeceH] = greeceStart.time.split(':').map(Number);
      
      if (greeceH === swissH + 1 || (swissH === 23 && greeceH === 0)) {
        logSuccess(`  ✓ Μετατροπή σωστή: ${swissH}:00 → ${greeceH}:00`);
      } else {
        logError(`  ✗ Μετατροπή λάθος: ${swissH}:00 → ${greeceH}:00`);
      }
      log('');
    }
    
    // Specific test: 16:00 → 17:00
    logTest('Test: 16:00 Ελβετία → 17:00 Ελλάδα');
    const testDate = '2025-11-18';
    const testTime = '16:00:00';
    const converted = convertSwitzerlandToGreece(testDate, testTime);
    
    logInfo(`  Ελβετία: ${testDate} ${testTime}`);
    logInfo(`  Ελλάδα: ${converted.date} ${converted.time}`);
    
    if (converted.time === '17:00:00') {
      logSuccess('  ✓ Μετατροπή 16:00 → 17:00 σωστή!');
    } else {
      logError(`  ✗ Μετατροπή λάθος: ${converted.time}`);
    }
    
    log('\n' + '-'.repeat(70));
    logSuccess('✅ Test completed!');
    logInfo('Το σύστημα πρέπει να μετατρέπει 16:00 Ελβετία → 17:00 Ελλάδα');
    log('-'.repeat(70) + '\n');
    
  } catch (error) {
    logError(`Σφάλμα: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

testAvailabilityConversion();

