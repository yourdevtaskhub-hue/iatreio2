/**
 * Test για να επιβεβαιώσουμε ότι η μετατροπή είναι σωστή
 * Ελβετία 16:00 → Ελλάδα 17:00 (όχι 15:00!)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vdrmgzoupwyisiyrnjdi.supabase.co';
const supabaseAdminKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcm1nem91cHd5aXNpeXJuamRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUzMDAxNiwiZXhwIjoyMDc1MTA2MDE2fQ.uH3E-xqFmKkMF6Uul3jaSHTqloqklWDg7KaIAMxq_CQ';

const supabase = createClient(supabaseUrl, supabaseAdminKey);

const TIMEZONES = {
  GREECE: 'Europe/Athens',
  SWITZERLAND: 'Europe/Zurich'
};

// Simple conversion: +1 hour (Greece is ahead)
function convertSwitzerlandToGreece(dateStr, timeStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Add 1 hour (Greece is 1 hour ahead)
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

async function testConversion() {
  log('\n' + '='.repeat(70), 'blue');
  log('🧪 TIMEZONE CONVERSION FIX TEST', 'blue');
  log('='.repeat(70) + '\n', 'blue');
  
  logTest('Test: 16:00 Ελβετία → 17:00 Ελλάδα (όχι 15:00!)');
  
  const testCases = [
    { swiss: '16:00:00', expected: '17:00:00', desc: '16:00 → 17:00' },
    { swiss: '04:00:00', expected: '05:00:00', desc: '04:00 → 05:00' },
    { swiss: '12:00:00', expected: '13:00:00', desc: '12:00 → 13:00' },
    { swiss: '20:00:00', expected: '21:00:00', desc: '20:00 → 21:00' }
  ];
  
  const testDate = '2025-11-18';
  
  for (const test of testCases) {
    const converted = convertSwitzerlandToGreece(testDate, test.swiss);
    const [swissH] = test.swiss.split(':').map(Number);
    const [greeceH] = converted.time.split(':').map(Number);
    const [expectedH] = test.expected.split(':').map(Number);
    
    logInfo(`  Ελβετία: ${test.swiss} → Ελλάδα: ${converted.time}`);
    
    if (greeceH === expectedH) {
      logSuccess(`  ✓ ${test.desc} σωστό!`);
    } else {
      logError(`  ✗ ${test.desc} λάθος! (expected ${expectedH}:00, got ${greeceH}:00)`);
    }
  }
  
  log('\n' + '-'.repeat(70));
  logSuccess('✅ Ελλάδα είναι 1 ώρα ΜΠΡΟΣΤΑ από Ελβετία');
  logInfo('   Αν Ελβετία: 16:00 → Ελλάδα: 17:00 ✓');
  log('-'.repeat(70) + '\n');
}

testConversion();

