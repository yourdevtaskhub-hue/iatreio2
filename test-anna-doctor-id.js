// Test για Anna Doctor ID detection

console.log('🧪 Testing Anna Doctor ID Detection');
console.log('='.repeat(60));

// Simulate normalizeName function (updated version)
function normalizeName(value) {
  if (!value) return '';
  // Μετατροπή ελληνικών χαρακτήρων σε λατινικούς
  const greekToLatin = {
    'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z',
    'η': 'i', 'θ': 'th', 'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm',
    'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p', 'ρ': 'r', 'σ': 's',
    'τ': 't', 'υ': 'y', 'φ': 'f', 'χ': 'ch', 'ψ': 'ps', 'ω': 'o',
    'Α': 'A', 'Β': 'B', 'Γ': 'G', 'Δ': 'D', 'Ε': 'E', 'Ζ': 'Z',
    'Η': 'I', 'Θ': 'Th', 'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M',
    'Ν': 'N', 'Ξ': 'X', 'Ο': 'O', 'Π': 'P', 'Ρ': 'R', 'Σ': 'S',
    'Τ': 'T', 'Υ': 'Y', 'Φ': 'F', 'Χ': 'Ch', 'Ψ': 'Ps', 'Ω': 'O'
  };
  
  let normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase();
  
  // Μετατροπή ελληνικών σε λατινικούς
  normalized = normalized.split('').map(char => greekToLatin[char] || char).join('');
  
  return normalized
    .replace(/δρ\./g, 'dr')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Simulate isAnnaName function
const annaKeywords = [
  'dr anna maria fytrou',
  'anna maria fytrou',
  'fytrou anna maria',
  'dr anna maria fytroy',
  'anna maria fytroy',
  'fytrou' // Μόνο επώνυμο
];

function isAnnaName(name) {
  if (!name) return false;
  const normalized = normalizeName(name);
  if (!normalized) {
    // Αν το normalize δώσει κενό, ελέγχουμε το original name
    const lowerName = name.toLowerCase();
    return lowerName.includes('φύτρου') || lowerName.includes('φυτρου') || lowerName.includes('fytrou');
  }
  // Ελέγχος αν το normalized όνομα περιέχει κάποιο από τα keywords
  const matches = annaKeywords.some(keyword => normalized.includes(keyword));
  // Επίσης ελέγχος αν το όνομα περιέχει "fytrou" (μετά το normalize)
  const hasFytrou = normalized.includes('fytrou');
  return matches || hasFytrou;
}

// Test cases
const testCases = [
  {
    name: 'Dr. Άννα Μαρία Φύτρου',
    expected: true,
    description: 'Full Greek name with Dr.'
  },
  {
    name: 'Dr. Anna Maria Fytrou',
    expected: true,
    description: 'Full English name with Dr.'
  },
  {
    name: 'Άννα Μαρία Φύτρου',
    expected: true,
    description: 'Full Greek name without Dr.'
  },
  {
    name: 'Anna Maria Fytrou',
    expected: true,
    description: 'Full English name without Dr.'
  },
  {
    name: 'Σοφία Σπυριάδου',
    expected: false,
    description: 'Different doctor'
  },
  {
    name: 'Ιωάννα Πισσάρη',
    expected: false,
    description: 'Different doctor'
  }
];

console.log('\n🧪 Testing isAnnaName() function');
console.log('─'.repeat(60));

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = isAnnaName(test.name);
  const normalized = normalizeName(test.name);
  
  if (result === test.expected) {
    console.log(`✅ Test ${index + 1}: ${test.description}`);
    console.log(`   Input: "${test.name}"`);
    console.log(`   Normalized: "${normalized}"`);
    console.log(`   Result: ${result} (expected: ${test.expected})`);
    passed++;
  } else {
    console.log(`❌ Test ${index + 1}: ${test.description}`);
    console.log(`   Input: "${test.name}"`);
    console.log(`   Normalized: "${normalized}"`);
    console.log(`   Result: ${result} (expected: ${test.expected})`);
    failed++;
  }
});

// Test manual deposit doctor matching
console.log('\n🧪 Testing Manual Deposit Doctor Matching');
console.log('─'.repeat(60));

const manualDeposit = {
  doctor_id: '6e4c30d9-d295-467f-be3c-86a0c2aa70e9',
  doctor_name: 'Dr. Άννα Μαρία Φύτρου'
};

const doctors = [
  { id: '6e4c30d9-d295-467f-be3c-86a0c2aa70e9', name: 'Dr. Άννα Μαρία Φύτρου' },
  { id: '9a37c676-3e2c-4b87-8ad6-780368dd4b72', name: 'Σοφία Σπυριάδου' },
  { id: 'b5bcd56a-ac1d-4a1a-a852-d79ae7a95635', name: 'Ιωάννα Πισσάρη' }
];

const annaDoctorId = doctors.find((doc) => isAnnaName(doc.name))?.id || null;

if (annaDoctorId === manualDeposit.doctor_id) {
  console.log('✅ Manual deposit doctor_id matches Anna Doctor ID');
  console.log(`   Anna Doctor ID: ${annaDoctorId}`);
  console.log(`   Manual Deposit doctor_id: ${manualDeposit.doctor_id}`);
  passed++;
} else {
  console.log('❌ Manual deposit doctor_id does NOT match Anna Doctor ID');
  console.log(`   Anna Doctor ID: ${annaDoctorId}`);
  console.log(`   Manual Deposit doctor_id: ${manualDeposit.doctor_id}`);
  failed++;
}

// Summary
console.log('\n' + '='.repeat(60));
console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('\n✅ ✅ ✅ ALL TESTS PASSED! ✅ ✅ ✅');
  console.log('\n✅ Anna Doctor ID detection works correctly!');
} else {
  console.log('\n⚠️  Some tests failed. Please check the output above.');
}

console.log('\n' + '='.repeat(60));
console.log('\n💡 Key Points:');
console.log('   1. normalizeName() removes accents and converts to lowercase');
console.log('   2. isAnnaName() checks if normalized name includes keywords');
console.log('   3. Also checks for "φύτρου" in original name');
console.log('   4. Manual deposits should match by doctor_id or doctor_name');

