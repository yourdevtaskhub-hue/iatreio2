/**
 * Visual consistency test for post-it across different viewport sizes
 * Tests that the post-it maintains proper visual hierarchy
 */

const deviceTests = [
  { name: 'Mobile Small', width: 320, height: 568 },
  { name: 'Mobile Medium', width: 375, height: 667 },
  { name: 'Mobile Large', width: 390, height: 844 },
  { name: 'Tablet Portrait', width: 768, height: 1024 },
  { name: 'Tablet Landscape', width: 1024, height: 768 },
  { name: 'Laptop Small', width: 1280, height: 720 },
  { name: 'Laptop Medium', width: 1366, height: 768 },
  { name: 'Desktop HD', width: 1920, height: 1080 },
  { name: 'Desktop 2K', width: 2560, height: 1440 },
  { name: 'Desktop 4K', width: 3840, height: 2160 },
];

const breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280 };

function getBreakpoint(width) {
  if (width < breakpoints.sm) return 'mobile (base)';
  if (width < breakpoints.md) return 'sm (640px+)';
  if (width < breakpoints.lg) return 'md (768px+)';
  if (width < breakpoints.xl) return 'lg (1024px+)';
  return 'xl (1280px+)';
}

function calculatePostItPosition(width) {
  if (width < breakpoints.sm) return 120;
  if (width < breakpoints.md) return 140;
  if (width < breakpoints.lg) return 160;
  if (width < breakpoints.xl) return 180;
  return 200;
}

function analyzePosition(device) {
  const { name, width, height } = device;
  const postItTop = calculatePostItPosition(width);
  const breakpoint = getBreakpoint(width);
  
  // Header calculations
  const headerHeight = width < 640 ? 80 : 96;
  const sectionPadding = 80;
  const headerBottom = headerHeight;
  const contentStart = headerBottom + sectionPadding;
  
  // Post-it dimensions
  const postItHeight = 80;
  const postItBottom = postItTop + postItHeight;
  
  // Visual positioning analysis
  const spaceAbovePostIt = postItTop - headerBottom;
  const spaceBelowPostIt = contentStart - postItBottom;
  const totalSpace = contentStart - headerBottom;
  
  const postItCenter = postItTop + (postItHeight / 2);
  const contentCenter = contentStart + 100; // Rough title center
  
  return {
    name,
    width,
    height,
    breakpoint,
    postItTop,
    postItBottom,
    postItCenter: postItCenter.toFixed(0),
    headerBottom,
    contentStart,
    spaceAbovePostIt,
    spaceBelowPostIt,
    totalSpace,
    visualBalance: spaceBelowPostIt >= 0 ? '✅ Balanced' : '⚠️ Possible Overlap'
  };
}

console.log('🎨 Visual Consistency Test for Post-it Position\n');
console.log('Analyzing visual hierarchy and balance...\n');

const results = deviceTests.map(analyzePosition);

// Display detailed results
console.log('DETAILED ANALYSIS:');
console.log('═'.repeat(100));

results.forEach(result => {
  console.log(`\n📱 ${result.name.padEnd(20)} [${String(result.width).padStart(4)}x${String(result.height).padStart(4)}] - ${result.breakpoint}`);
  console.log(`   Post-it Position: top=${result.postItTop}px, bottom=${result.postItBottom}px`);
  console.log(`   Header Bottom: ${result.headerBottom}px, Content Start: ${result.contentStart}px`);
  console.log(`   Space Analysis: Above Post-it: ${result.spaceAbovePostIt}px, Below: ${result.spaceBelowPostIt}px`);
  console.log(`   Visual Balance: ${result.visualBalance}`);
});

console.log('\n' + '═'.repeat(100));
console.log('SUMMARY STATISTICS:\n');

const safeCount = results.filter(r => r.spaceBelowPostIt >= 0).length;
const minSpaceAbove = Math.min(...results.map(r => r.spaceAbovePostIt));
const maxSpaceAbove = Math.max(...results.map(r => r.spaceAbovePostIt));
const avgSpaceAbove = (results.reduce((sum, r) => sum + r.spaceAbovePostIt, 0) / results.length).toFixed(1);
const minSpaceBelow = Math.min(...results.map(r => r.spaceBelowPostIt));

console.log(`   Safe Devices: ${safeCount}/${results.length} (${((safeCount/results.length)*100).toFixed(1)}%)`);
console.log(`   Space Above Post-it: min=${minSpaceAbove}px, max=${maxSpaceAbove}px, avg=${avgSpaceAbove}px`);
console.log(`   Minimum Space Below: ${minSpaceBelow}px\n`);

if (minSpaceBelow >= 0) {
  console.log('✅ SUCCESS: Post-it is properly positioned with no visual conflicts!\n');
  process.exit(0);
} else {
  console.log(`⚠️  WARNING: Some devices show potential overlap (${Math.abs(minSpaceBelow)}px)\n`);
  console.log('   Consider adjusting post-it positions for these devices.');
  process.exit(1);
}

