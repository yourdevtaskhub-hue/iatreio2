/**
 * Comprehensive testing script for post-it positioning
 * Simulates multiple devices and viewport sizes to ensure no overlap
 */

const fs = require('fs');
const path = require('path');

// Test configurations for various devices
const deviceTests = [
  // Mobile Phones
  { name: 'iPhone SE (1st)', width: 320, height: 568, category: 'mobile' },
  { name: 'iPhone SE (2nd)', width: 375, height: 667, category: 'mobile' },
  { name: 'iPhone 12 Pro', width: 390, height: 844, category: 'mobile' },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932, category: 'mobile' },
  { name: 'Samsung Galaxy S20', width: 360, height: 800, category: 'mobile' },
  { name: 'Pixel 5', width: 393, height: 851, category: 'mobile' },
  
  // Tablets
  { name: 'iPad Mini', width: 768, height: 1024, category: 'tablet' },
  { name: 'iPad Air', width: 820, height: 1180, category: 'tablet' },
  { name: 'iPad Pro 11"', width: 834, height: 1194, category: 'tablet' },
  { name: 'iPad Pro 12.9"', width: 1024, height: 1366, category: 'tablet' },
  { name: 'Samsung Galaxy Tab', width: 800, height: 1280, category: 'tablet' },
  
  // Laptops
  { name: 'MacBook Air 13"', width: 1280, height: 800, category: 'laptop' },
  { name: 'MacBook Pro 13"', width: 1280, height: 800, category: 'laptop' },
  { name: 'MacBook Pro 14"', width: 1512, height: 982, category: 'laptop' },
  { name: 'MacBook Pro 16"', width: 1728, height: 1117, category: 'laptop' },
  { name: 'Dell XPS 13', width: 1920, height: 1080, category: 'laptop' },
  { name: 'HP EliteBook', width: 1366, height: 768, category: 'laptop' },
  
  // Desktops
  { name: 'Full HD Monitor', width: 1920, height: 1080, category: 'desktop' },
  { name: '2K Monitor', width: 2560, height: 1440, category: 'desktop' },
  { name: '4K Monitor', width: 3840, height: 2160, category: 'desktop' },
  { name: 'Ultrawide 21:9', width: 2560, height: 1080, category: 'desktop' },
  { name: 'Super Ultrawide', width: 3840, height: 1600, category: 'desktop' },
  
  // Small screens
  { name: 'Very Small Screen', width: 280, height: 500, category: 'mobile' },
  { name: 'Small Tablet', width: 600, height: 960, category: 'tablet' },
  
  // Large displays
  { name: 'Large 4K', width: 5120, height: 2880, category: 'desktop' },
  { name: 'Ultra Large', width: 7680, height: 4320, category: 'desktop' },
];

// Tailwind breakpoints
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

// Calculate post-it position based on width
function calculatePostItPosition(width) {
  if (width < breakpoints.sm) {
    return 120; // mobile
  } else if (width < breakpoints.md) {
    return 140; // sm
  } else if (width < breakpoints.lg) {
    return 160; // md
  } else if (width < breakpoints.xl) {
    return 180; // lg
  } else {
    return 200; // xl
  }
}

// Calculate header height based on width
function calculateHeaderHeight(width) {
  return width < breakpoints.sm ? 80 : 96;
}

// Calculate safe area
function calculateSafeArea(width) {
  const headerHeight = calculateHeaderHeight(width);
  const sectionPadding = 80; // pt-20
  return headerHeight + sectionPadding;
}

// Check if post-it overlaps with title
function checkOverlap(device) {
  const { name, width, height, category } = device;
  const postItTop = calculatePostItPosition(width);
  const postItHeight = 80; // approximate height
  const postItBottom = postItTop + postItHeight;
  const safeArea = calculateSafeArea(width);
  
  // Check if post-it overlaps
  const overlap = postItBottom > safeArea;
  const clearance = overlap ? postItBottom - safeArea : safeArea - postItBottom;
  
  return {
    name,
    width,
    height,
    category,
    postItTop,
    postItBottom,
    safeArea,
    overlap,
    clearance,
    status: overlap ? '⚠️ OVERLAP' : '✅ SAFE'
  };
}

// Run all tests
console.log('🧪 Comprehensive Post-it Position Testing\n');
console.log('Testing across', deviceTests.length, 'different devices/screen sizes...\n');

const results = deviceTests.map(checkOverlap);

// Group results by category
const byCategory = {
  mobile: [],
  tablet: [],
  laptop: [],
  desktop: []
};

results.forEach(result => {
  byCategory[result.category].push(result);
});

// Display results
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log('RESULTS BY CATEGORY');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════\n');

Object.keys(byCategory).forEach(category => {
  const categoryResults = byCategory[category];
  const safeCount = categoryResults.filter(r => !r.overlap).length;
  const overlapCount = categoryResults.filter(r => r.overlap).length;
  
  console.log(`📱 ${category.toUpperCase()} DEVICES (${categoryResults.length} total, ${safeCount} ✅ safe, ${overlapCount} ⚠️ overlap)`);
  console.log('─'.repeat(100));
  
  categoryResults.forEach(result => {
    const clearanceInfo = result.overlap 
      ? `⚠️ Overlap: ${result.clearance}px` 
      : `✅ Clearance: ${result.clearance}px`;
    
    console.log(
      `  ${result.name.padEnd(25)} ` +
      `[${String(result.width).padStart(4)}x${String(result.height).padStart(4)}] ` +
      `Post-it: ${result.postItTop}px, ` +
      `Safe area: ${result.safeArea}px → ` +
      clearanceInfo
    );
  });
  
  console.log('');
});

// Summary
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log('SUMMARY');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════\n');

const totalSafe = results.filter(r => !r.overlap).length;
const totalOverlap = results.filter(r => r.overlap).length;
const successRate = ((totalSafe / results.length) * 100).toFixed(1);

console.log(`Total Devices Tested: ${results.length}`);
console.log(`✅ Safe Positioning: ${totalSafe} (${successRate}%)`);
console.log(`⚠️ Overlapping: ${totalOverlap} (${(100 - parseFloat(successRate)).toFixed(1)}%)\n`);

if (totalOverlap > 0) {
  console.log('⚠️  ISSUES FOUND: The following devices have positioning problems:\n');
  results.filter(r => r.overlap).forEach(result => {
    console.log(`   • ${result.name}: Post-it at ${result.postItTop}px overlaps safe area at ${result.safeArea}px (${result.clearance}px overlap)`);
  });
  console.log('\n❌ FAILURE: Post-it positioning needs adjustment\n');
  process.exit(1);
} else {
  console.log('✅ SUCCESS: All devices show proper post-it positioning with no overlap!\n');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════\n');
  
  // Additional verification
  console.log('📊 STATISTICAL ANALYSIS:\n');
  
  const clearances = results.map(r => r.clearance);
  const minClearance = Math.min(...clearances);
  const maxClearance = Math.max(...clearances);
  const avgClearance = (clearances.reduce((a, b) => a + b, 0) / clearances.length).toFixed(1);
  
  console.log(`   Minimum clearance: ${minClearance}px`);
  console.log(`   Maximum clearance: ${maxClearance}px`);
  console.log(`   Average clearance: ${avgClearance}px\n`);
  
  process.exit(0);
}

