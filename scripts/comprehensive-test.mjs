#!/usr/bin/env node

/**
 * Comprehensive Cross-Platform Test
 * Ελέγχει όλα τα πιθανά προβλήματα cross-platform compatibility
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🧪 Comprehensive Cross-Platform Test');
console.log('===================================\n');

let allTestsPassed = true;
const issues = [];

// Test 1: Image Orientation Fixes
console.log('📸 Testing Image Orientation Fixes...');
const cssPath = join(process.cwd(), 'src', 'index.css');
if (existsSync(cssPath)) {
  const cssContent = readFileSync(cssPath, 'utf8');
  
  const imageOrientationFix = cssContent.includes('image-orientation: from-image');
  const transformFix = cssContent.includes('transform: none');
  const webkitFix = cssContent.includes('-webkit-transform: none');
  const hardwareAccel = cssContent.includes('translateZ(0)');
  
  if (imageOrientationFix && transformFix && webkitFix && hardwareAccel) {
    console.log('✅ All image orientation fixes present');
  } else {
    console.log('❌ Missing image orientation fixes');
    issues.push('Image orientation fixes incomplete');
    allTestsPassed = false;
  }
} else {
  console.log('❌ CSS file not found');
  issues.push('CSS file missing');
  allTestsPassed = false;
}

// Test 2: Cache Control
console.log('\n💾 Testing Cache Control...');
const netlifyPath = join(process.cwd(), 'netlify.toml');
if (existsSync(netlifyPath)) {
  const netlifyContent = readFileSync(netlifyPath, 'utf8');
  
  const noCache = netlifyContent.includes('no-cache');
  const mustRevalidate = netlifyContent.includes('must-revalidate');
  const maxAge = netlifyContent.includes('max-age=0');
  
  if (noCache && mustRevalidate && maxAge) {
    console.log('✅ Cache control properly configured');
  } else {
    console.log('❌ Cache control configuration incomplete');
    issues.push('Cache control not properly configured');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Netlify configuration not found');
  issues.push('Netlify configuration missing');
  allTestsPassed = false;
}

// Test 3: Meta Tags
console.log('\n📱 Testing Meta Tags...');
const htmlPath = join(process.cwd(), 'index.html');
if (existsSync(htmlPath)) {
  const htmlContent = readFileSync(htmlPath, 'utf8');
  
  const viewport = htmlContent.includes('viewport');
  const userScalable = htmlContent.includes('user-scalable=no');
  const appleMobile = htmlContent.includes('apple-mobile-web-app');
  const themeColor = htmlContent.includes('theme-color');
  
  if (viewport && userScalable && appleMobile && themeColor) {
    console.log('✅ All meta tags present');
  } else {
    console.log('❌ Missing meta tags');
    issues.push('Meta tags incomplete');
    allTestsPassed = false;
  }
} else {
  console.log('❌ HTML file not found');
  issues.push('HTML file missing');
  allTestsPassed = false;
}

// Test 4: Responsive Design
console.log('\n📱 Testing Responsive Design...');
const componentsPath = join(process.cwd(), 'src', 'components');
if (existsSync(componentsPath)) {
  const { readdirSync } = await import('fs');
  const componentFiles = readdirSync(componentsPath).filter(f => f.endsWith('.tsx'));
  
  let responsiveComponents = 0;
  let mobileFirstComponents = 0;
  
  for (const file of componentFiles) {
    const filePath = join(componentsPath, file);
    const content = readFileSync(filePath, 'utf8');
    
    if (content.includes('sm:') || content.includes('md:') || content.includes('lg:')) {
      responsiveComponents++;
    }
    
    if (content.includes('flex-col') && content.includes('lg:flex-row')) {
      mobileFirstComponents++;
    }
  }
  
  if (responsiveComponents >= 10) {
    console.log(`✅ Responsive design found in ${responsiveComponents} components`);
  } else {
    console.log(`⚠️  Responsive design found in only ${responsiveComponents} components`);
    issues.push('Limited responsive design implementation');
  }
  
  if (mobileFirstComponents >= 3) {
    console.log(`✅ Mobile-first design found in ${mobileFirstComponents} components`);
  } else {
    console.log(`⚠️  Mobile-first design found in only ${mobileFirstComponents} components`);
  }
  
} else {
  console.log('❌ Components directory not found');
  issues.push('Components directory missing');
  allTestsPassed = false;
}

// Test 5: Build Output
console.log('\n🔨 Testing Build Output...');
const distPath = join(process.cwd(), 'dist');
if (existsSync(distPath)) {
  const { readdirSync } = await import('fs');
  const files = readdirSync(distPath);
  
  const hasIndexHtml = files.includes('index.html');
  const hasAssets = existsSync(join(distPath, 'assets'));
  
  if (hasIndexHtml && hasAssets) {
    console.log('✅ Build output complete');
  } else {
    console.log('❌ Build output incomplete');
    issues.push('Build output incomplete');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Dist folder not found - run "npm run build" first');
  issues.push('Build not completed');
  allTestsPassed = false;
}

// Test 6: Font Loading
console.log('\n🔤 Testing Font Loading...');
if (existsSync(htmlPath)) {
  const htmlContent = readFileSync(htmlPath, 'utf8');
  
  const fontPreload = htmlContent.includes('preconnect');
  const fontDisplay = htmlContent.includes('font-display: swap');
  const fontLoadingScript = htmlContent.includes('showDancingScriptElements');
  
  if (fontPreload && fontDisplay && fontLoadingScript) {
    console.log('✅ Font loading optimized');
  } else {
    console.log('⚠️  Font loading could be improved');
    issues.push('Font loading not fully optimized');
  }
} else {
  console.log('❌ HTML file not found');
  issues.push('HTML file missing');
  allTestsPassed = false;
}

// Test 7: Image Assets
console.log('\n🖼️  Testing Image Assets...');
const assetsPath = join(distPath, 'assets');
if (existsSync(assetsPath)) {
  const { readdirSync } = await import('fs');
  const files = readdirSync(assetsPath);
  
  const imageFiles = files.filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));
  const profileImages = files.filter(f => f.includes('profile'));
  
  if (imageFiles.length >= 5) {
    console.log(`✅ ${imageFiles.length} image assets found`);
  } else {
    console.log(`⚠️  Only ${imageFiles.length} image assets found`);
  }
  
  if (profileImages.length >= 1) {
    console.log(`✅ ${profileImages.length} profile image(s) found`);
  } else {
    console.log('⚠️  No profile images found');
  }
  
} else {
  console.log('❌ Assets directory not found');
  issues.push('Assets directory missing');
  allTestsPassed = false;
}

// Summary
console.log('\n📊 Test Summary');
console.log('===============');

if (allTestsPassed && issues.length === 0) {
  console.log('✅ ALL TESTS PASSED!');
  console.log('\n🎉 Your website is ready for cross-platform deployment!');
  console.log('\n📋 Final Checklist:');
  console.log('• Test on Windows Chrome');
  console.log('• Test on Mac Safari');
  console.log('• Test on Mac Chrome');
  console.log('• Test on iPhone Safari');
  console.log('• Test on Android Chrome');
  console.log('• Test in incognito/private mode');
  console.log('• Test with different screen sizes');
  console.log('• Test image orientation (especially profile images)');
  console.log('• Test font loading');
  console.log('• Test cache behavior (hard refresh)');
  
} else {
  console.log('❌ SOME TESTS FAILED');
  console.log('\n🔧 Issues found:');
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue}`);
  });
  
  console.log('\n💡 Recommendations:');
  console.log('1. Fix the issues above');
  console.log('2. Run "npm run build" again');
  console.log('3. Test in incognito/private window');
  console.log('4. Clear browser cache completely');
  console.log('5. Check image EXIF data for rotation issues');
}

console.log('\n🚀 Deployment Instructions:');
console.log('1. git add .');
console.log('2. git commit -m "Fix cross-platform compatibility issues"');
console.log('3. git push origin main');
console.log('4. Wait for Netlify deployment');
console.log('5. Test in incognito/private window');
console.log('6. Test on different devices/browsers');

if (!allTestsPassed) {
  process.exit(1);
}
