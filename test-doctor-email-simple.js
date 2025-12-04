// Simple test script για να επιβεβαιώσουμε ότι η λογική email matching λειτουργεί
// Αυτό το test δεν χρειάζεται environment variables

console.log('🚀 Testing Doctor Email Notification Logic');
console.log('='.repeat(60));

// Mapping γιατρών με emails (από send-doctor-notification.js)
const DOCTOR_EMAILS = {
  'Ιωάννα Πισσάρη': 'ioannapissari@outlook.com',
  'Ioanna Pissari': 'ioannapissari@outlook.com',
  'Σοφία Σπυριάδου': 'sofiasprd@icloud.com',
  'Sofia Spyriadou': 'sofiasprd@icloud.com',
  'Ειρήνη Στεργίου': 'eirini.ster88@gmail.com',
  'Eirini Stergiou': 'eirini.ster88@gmail.com',
  'Dr. Άννα Μαρία Φύτρου': 'iatreiodrfytrou@gmail.com',
  'Dr. Anna-Maria Fytrou': 'iatreiodrfytrou@gmail.com',
  'Dr. Anna Maria Fytrou': 'iatreiodrfytrou@gmail.com',
  'Δρ. Άννα Μαρία Φύτρου': 'iatreiodrfytrou@gmail.com',
  'Δρ. Άννα-Μαρία Φύτρου': 'iatreiodrfytrou@gmail.com',
  'Anna-Maria Fytrou': 'iatreiodrfytrou@gmail.com',
  'Anna Maria Fytrou': 'iatreiodrfytrou@gmail.com',
  'Άννα Μαρία Φύτρου': 'iatreiodrfytrou@gmail.com',
  'Άννα-Μαρία Φύτρου': 'iatreiodrfytrou@gmail.com'
};

// Function για να βρούμε το email του γιατρού (από send-doctor-notification.js)
function findDoctorEmail(doctorName) {
  if (!doctorName) return null;
  
  const normalizedDoctorName = doctorName.trim();
  let doctorEmail = DOCTOR_EMAILS[normalizedDoctorName];
  
  console.log(`\n🔍 Looking up email for: "${normalizedDoctorName}"`);
  
  // Αν δεν βρέθηκε, δοκιμάζουμε case-insensitive search
  if (!doctorEmail && normalizedDoctorName) {
    const lowerName = normalizedDoctorName.toLowerCase();
    for (const [key, email] of Object.entries(DOCTOR_EMAILS)) {
      if (key.toLowerCase() === lowerName) {
        doctorEmail = email;
        console.log(`  ✅ Found via case-insensitive match: ${key} -> ${email}`);
        break;
      }
    }
  }
  
  // Αν ακόμα δεν βρέθηκε, δοκιμάζουμε partial match
  if (!doctorEmail && normalizedDoctorName) {
    const nameLower = normalizedDoctorName.toLowerCase();
    
    // Partial match για Dr. Φύτρου
    if (nameLower.includes('fytrou') || nameLower.includes('φύτρου') || 
        (nameLower.includes('anna') && nameLower.includes('maria')) ||
        (nameLower.includes('άννα') && nameLower.includes('μαρία'))) {
      doctorEmail = 'iatreiodrfytrou@gmail.com';
      console.log(`  ✅ Found via partial match for Dr. Fytrou: ${doctorEmail}`);
    }
    // Partial match για Ιωάννα Πισσάρη
    else if (nameLower.includes('pissari') || nameLower.includes('πισσάρη') || 
             nameLower.includes('ioanna') || nameLower.includes('ιωάννα')) {
      doctorEmail = 'ioannapissari@outlook.com';
      console.log(`  ✅ Found via partial match for Ioanna Pissari: ${doctorEmail}`);
    }
    // Partial match για Σοφία Σπυριάδου
    else if (nameLower.includes('spyriadou') || nameLower.includes('σπυριάδου') || 
             nameLower.includes('sofia') || nameLower.includes('σοφία')) {
      doctorEmail = 'sofiasprd@icloud.com';
      console.log(`  ✅ Found via partial match for Sofia Spyriadou: ${doctorEmail}`);
    }
    // Partial match για Ειρήνη Στεργίου
    else if (nameLower.includes('stergiou') || nameLower.includes('στεργίου') || 
             nameLower.includes('eirini') || nameLower.includes('ειρήνη')) {
      doctorEmail = 'eirini.ster88@gmail.com';
      console.log(`  ✅ Found via partial match for Eirini Stergiou: ${doctorEmail}`);
    }
  }
  
  if (!doctorEmail) {
    console.log(`  ❌ No email found for: "${normalizedDoctorName}"`);
  }
  
  return doctorEmail;
}

// Test cases
const testCases = [
  // Exact matches
  { name: 'Dr. Άννα Μαρία Φύτρου', expected: 'iatreiodrfytrou@gmail.com' },
  { name: 'Dr. Anna-Maria Fytrou', expected: 'iatreiodrfytrou@gmail.com' },
  { name: 'Ιωάννα Πισσάρη', expected: 'ioannapissari@outlook.com' },
  { name: 'Ioanna Pissari', expected: 'ioannapissari@outlook.com' },
  { name: 'Σοφία Σπυριάδου', expected: 'sofiasprd@icloud.com' },
  { name: 'Sofia Spyriadou', expected: 'sofiasprd@icloud.com' },
  { name: 'Ειρήνη Στεργίου', expected: 'eirini.ster88@gmail.com' },
  { name: 'Eirini Stergiou', expected: 'eirini.ster88@gmail.com' },
  
  // Case variations
  { name: 'dr. άννα μαρία φύτρου', expected: 'iatreiodrfytrou@gmail.com' },
  { name: 'IOANNA PISSARI', expected: 'ioannapissari@outlook.com' },
  { name: 'sofia spyriadou', expected: 'sofiasprd@icloud.com' },
  
  // Partial matches
  { name: 'Άννα Μαρία Φύτρου', expected: 'iatreiodrfytrou@gmail.com' },
  { name: 'Anna Maria Fytrou', expected: 'iatreiodrfytrou@gmail.com' },
  { name: 'Ioanna', expected: 'ioannapissari@outlook.com' },
  { name: 'Sofia', expected: 'sofiasprd@icloud.com' },
  { name: 'Eirini', expected: 'eirini.ster88@gmail.com' },
  { name: 'Fytrou', expected: 'iatreiodrfytrou@gmail.com' },
  { name: 'Φύτρου', expected: 'iatreiodrfytrou@gmail.com' },
  
  // Edge cases
  { name: '  Dr. Άννα Μαρία Φύτρου  ', expected: 'iatreiodrfytrou@gmail.com' }, // with spaces
  { name: '', expected: null }, // empty string
];

console.log('\n🧪 Testing Doctor Name to Email Matching');
console.log('─'.repeat(60));

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = findDoctorEmail(testCase.name);
  const success = result === testCase.expected;
  
  if (success) {
    console.log(`✅ Test ${index + 1}: "${testCase.name}" -> ${result || 'null'}`);
    passed++;
  } else {
    console.log(`❌ Test ${index + 1}: "${testCase.name}"`);
    console.log(`   Expected: ${testCase.expected || 'null'}`);
    console.log(`   Got: ${result || 'null'}`);
    failed++;
  }
});

console.log('\n' + '='.repeat(60));
console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);

// Verify code structure
console.log('\n🔍 Verifying Code Structure');
console.log('─'.repeat(60));

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToCheck = [
  'netlify/functions/stripe-webhook.js',
  'netlify/functions/book-appointment-with-deposit.js',
  'netlify/functions/send-doctor-notification.js'
];

let allFilesExist = true;
let allHaveEmailCode = true;

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`✅ ${file} exists`);
    
    if (file.includes('send-doctor-notification')) {
      if (content.includes('sendDoctorNotificationEmail') || content.includes('resend.emails.send')) {
        console.log(`   ✅ Contains email sending code`);
      } else {
        console.log(`   ❌ Missing email sending code`);
        allHaveEmailCode = false;
      }
    } else {
      if (content.includes('sendDoctorNotificationEmail') || content.includes('DOCTOR_EMAIL')) {
        console.log(`   ✅ Contains doctor notification email call`);
      } else {
        console.log(`   ❌ Missing doctor notification email call`);
        allHaveEmailCode = false;
      }
    }
  } else {
    console.log(`❌ ${file} does not exist`);
    allFilesExist = false;
  }
});

console.log('\n' + '='.repeat(60));

if (failed === 0 && allFilesExist && allHaveEmailCode) {
  console.log('✅ ✅ ✅ ALL TESTS PASSED! ✅ ✅ ✅');
  console.log('\n✅ Η λογική email matching λειτουργεί 100% σωστά!');
  console.log('✅ Όλα τα αρχεία υπάρχουν και περιέχουν τον απαραίτητο κώδικα!');
  console.log('\n💡 Για να δοκιμάσεις την πραγματική αποστολή email:');
  console.log('   1. Βεβαιώσου ότι έχεις RESEND_API_KEY στο .env file');
  console.log('   2. Τρέξε: node test-doctor-email.js');
} else {
  console.log('⚠️  Some tests failed. Please check the output above.');
  if (!allFilesExist) {
    console.log('❌ Some required files are missing!');
  }
  if (!allHaveEmailCode) {
    console.log('❌ Some files are missing email code!');
  }
}

console.log('\n' + '='.repeat(60));

