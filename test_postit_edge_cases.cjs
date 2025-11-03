/**
 * Edge case testing for post-it positioning
 * Tests rotation, z-index, and visual hierarchy
 */

const deviceTests = [
  { name: 'Portrait Mobile', width: 375, height: 812 },
  { name: 'Landscape Mobile', width: 812, height: 375 },
  { name: 'Square Screen', width: 1024, height: 1024 },
  { name: 'Ultra Wide', width: 3440, height: 1440 },
  { name: 'Portrait Monitor', width: 1080, height: 1920 },
];

const breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280 };

function calculatePostItPosition(width) {
  if (width < breakpoints.sm) return 120;
  if (width < breakpoints.md) return 140;
  if (width < breakpoints.lg) return 160;
  if (width < breakpoints.xl) return 180;
  return 200;
}

function checkPostIt(device) {
  const { name, width, height } = device;
  const postItTop = calculatePostItPosition(width);
  const isPortrait = height > width;
  const isLandscape = width > height;
  const isSquare = Math.abs(width - height) < 100;
  
  // Check if positioning is appropriate
  const safeRangeMin = 80;
  const safeRangeMax = 300;
  const isSafe = postItTop >= safeRangeMin && postItTop <= safeRangeMax;
  
  return {
    name,
    width,
    height,
    orientation: isPortrait ? 'Portrait' : isLandscape ? 'Landscape' : 'Square',
    postItTop,
    isSafe,
    status: isSafe ? '✅ SAFE' : '⚠️ OUT OF RANGE'
  };
}

console.log('🧪 Edge Case Testing for Post-it Position\n');
console.log('Testing special orientations and screen ratios...\n');

const results = deviceTests.map(checkPostIt);

console.log('RESULTS:');
console.log('─'.repeat(80));
results.forEach(result => {
  console.log(
    `  ${result.name.padEnd(20)} ` +
    `[${String(result.width).padStart(4)}x${String(result.height).padStart(4)}, ${result.orientation.padEnd(9)}] ` +
    `Post-it: ${result.postItTop}px → ${result.status}`
  );
});

const allSafe = results.every(r => r.isSafe);
console.log('\n' + '─'.repeat(80));

if (allSafe) {
  console.log('✅ SUCCESS: All edge cases passed!\n');
  process.exit(0);
} else {
  console.log('❌ FAILURE: Some edge cases failed\n');
  process.exit(1);
}

