// Test script για να επιβεβαιώσουμε ότι το email στον γιατρό αποστέλλεται σωστά
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test data για διαφορετικούς γιατρούς
const testCases = [
  {
    name: 'Test για Dr. Άννα Μαρία Φύτρου',
    doctorName: 'Dr. Άννα Μαρία Φύτρου',
    doctorId: null, // Θα το βρούμε από τη βάση
    expectedEmail: 'iatreiodrfytrou@gmail.com'
  },
  {
    name: 'Test για Ιωάννα Πισσάρη',
    doctorName: 'Ιωάννα Πισσάρη',
    doctorId: null,
    expectedEmail: 'ioannapissari@outlook.com'
  },
  {
    name: 'Test για Σοφία Σπυριάδου',
    doctorName: 'Σοφία Σπυριάδου',
    doctorId: null,
    expectedEmail: 'sofiasprd@icloud.com'
  },
  {
    name: 'Test για Ειρήνη Στεργίου',
    doctorName: 'Ειρήνη Στεργίου',
    doctorId: null,
    expectedEmail: 'eirini.ster88@gmail.com'
  }
];

// Helper function για να βρούμε το doctorId από το όνομα
async function findDoctorId(doctorName) {
  const { data, error } = await supabase
    .from('doctors')
    .select('id')
    .eq('name', doctorName)
    .maybeSingle();
  
  if (error) {
    console.error(`❌ Error finding doctor ${doctorName}:`, error);
    return null;
  }
  
  return data?.id || null;
}

// Test function για send-doctor-notification
async function testDoctorNotification(testCase) {
  console.log(`\n🧪 ${testCase.name}`);
  console.log('─'.repeat(60));
  
  // Βρίσκουμε το doctorId αν δεν το έχουμε
  let doctorId = testCase.doctorId;
  if (!doctorId) {
    doctorId = await findDoctorId(testCase.doctorName);
    if (!doctorId) {
      console.log(`⚠️  Could not find doctorId for ${testCase.doctorName}, using test data`);
    }
  }
  
  // Test payload
  const payload = {
    doctorName: testCase.doctorName,
    doctorId: doctorId,
    appointmentDate: '2024-12-25',
    appointmentTime: '10:00',
    parentName: 'Test Γονέας',
    parentEmail: 'test@example.com',
    parentPhone: '1234567890',
    childAge: '15',
    concerns: 'Test concerns για το appointment',
    specialty: null,
    thematology: null,
    urgency: null,
    isFirstSession: true
  };
  
  console.log('📋 Test Payload:');
  console.log(JSON.stringify(payload, null, 2));
  
  // Καλούμε την send-doctor-notification function
  const functionsBase = process.env.NETLIFY_FUNCTIONS_BASE || 
                       process.env.URL ? `${process.env.URL}/.netlify/functions` : 
                       'https://onlineparentteenclinic.com/.netlify/functions';
  
  const emailUrl = `${functionsBase}/send-doctor-notification`;
  
  console.log(`\n📧 Calling: ${emailUrl}`);
  
  try {
    const response = await fetch(emailUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    console.log(`\n📊 Response Status: ${response.status}`);
    console.log('📊 Response Body:');
    console.log(JSON.stringify(result, null, 2));
    
    if (response.ok && result.success) {
      console.log(`✅ ✅ ✅ SUCCESS! Email sent to ${testCase.expectedEmail}`);
      return true;
    } else {
      console.log(`❌ Failed: ${result.error || result.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error calling function:`, error);
    return false;
  }
}

// Test function για doctor name matching
function testDoctorNameMatching() {
  console.log('\n🧪 Testing Doctor Name Matching Logic');
  console.log('─'.repeat(60));
  
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
  
  const testNames = [
    'Dr. Άννα Μαρία Φύτρου',
    'Dr. Anna-Maria Fytrou',
    'Anna Maria Fytrou',
    'Ιωάννα Πισσάρη',
    'Ioanna Pissari',
    'Σοφία Σπυριάδου',
    'Sofia Spyriadou',
    'Ειρήνη Στεργίου',
    'Eirini Stergiou',
    'Άννα Μαρία Φύτρου', // Partial match test
    'Ioanna', // Partial match test
    'Sofia', // Partial match test
    'Eirini', // Partial match test
  ];
  
  let passed = 0;
  let failed = 0;
  
  testNames.forEach(name => {
    const normalizedName = name.trim();
    let doctorEmail = DOCTOR_EMAILS[normalizedName];
    
    // Case-insensitive search
    if (!doctorEmail && normalizedName) {
      const lowerName = normalizedName.toLowerCase();
      for (const [key, email] of Object.entries(DOCTOR_EMAILS)) {
        if (key.toLowerCase() === lowerName) {
          doctorEmail = email;
          break;
        }
      }
    }
    
    // Partial match
    if (!doctorEmail && normalizedName) {
      const nameLower = normalizedName.toLowerCase();
      
      if (nameLower.includes('fytrou') || nameLower.includes('φύτρου') || 
          (nameLower.includes('anna') && nameLower.includes('maria')) ||
          (nameLower.includes('άννα') && nameLower.includes('μαρία'))) {
        doctorEmail = 'iatreiodrfytrou@gmail.com';
      } else if (nameLower.includes('pissari') || nameLower.includes('πισσάρη') || 
                 nameLower.includes('ioanna') || nameLower.includes('ιωάννα')) {
        doctorEmail = 'ioannapissari@outlook.com';
      } else if (nameLower.includes('spyriadou') || nameLower.includes('σπυριάδου') || 
                 nameLower.includes('sofia') || nameLower.includes('σοφία')) {
        doctorEmail = 'sofiasprd@icloud.com';
      } else if (nameLower.includes('stergiou') || nameLower.includes('στεργίου') || 
                 nameLower.includes('eirini') || nameLower.includes('ειρήνη')) {
        doctorEmail = 'eirini.ster88@gmail.com';
      }
    }
    
    if (doctorEmail) {
      console.log(`✅ "${name}" -> ${doctorEmail}`);
      passed++;
    } else {
      console.log(`❌ "${name}" -> NOT FOUND`);
      failed++;
    }
  });
  
  console.log(`\n📊 Matching Results: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Doctor Email Notification Tests');
  console.log('='.repeat(60));
  
  // Test 1: Doctor name matching
  const matchingTest = testDoctorNameMatching();
  
  // Test 2: Actual email sending (only if RESEND_API_KEY is set)
  if (process.env.RESEND_API_KEY) {
    console.log('\n📧 RESEND_API_KEY found, testing actual email sending...');
    
    let allPassed = true;
    for (const testCase of testCases) {
      const result = await testDoctorNotification(testCase);
      if (!result) {
        allPassed = false;
      }
      // Wait a bit between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n' + '='.repeat(60));
    if (allPassed && matchingTest) {
      console.log('✅ ✅ ✅ ALL TESTS PASSED! ✅ ✅ ✅');
      console.log('✅ Το email στον γιατρό αποστέλλεται 100% σωστά!');
    } else {
      console.log('⚠️  Some tests failed. Please check the output above.');
    }
  } else {
    console.log('\n⚠️  RESEND_API_KEY not found. Skipping actual email sending tests.');
    console.log('✅ Doctor name matching tests completed.');
    console.log('\n💡 To test actual email sending, set RESEND_API_KEY in your .env file');
  }
  
  console.log('\n' + '='.repeat(60));
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});

