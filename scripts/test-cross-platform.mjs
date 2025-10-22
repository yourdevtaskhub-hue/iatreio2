#!/usr/bin/env node

/**
 * Cross-Platform Compatibility Test
 * Ελέγχει αν η ιστοσελίδα λειτουργεί σωστά σε διαφορετικά browsers και συσκευές
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🌐 Cross-Platform Compatibility Test');
console.log('===================================\n');

// Check CSS for cross-platform compatibility
const cssPath = join(process.cwd(), 'src', 'index.css');
if (existsSync(cssPath)) {
  const cssContent = readFileSync(cssPath, 'utf8');
  
  console.log('📱 CSS Cross-Platform Checks:');
  
  // Check for image orientation fixes
  if (cssContent.includes('image-orientation')) {
    console.log('✅ Image orientation fixes found');
  } else {
    console.log('❌ Image orientation fixes missing');
  }
  
  // Check for webkit prefixes
  if (cssContent.includes('-webkit-')) {
    console.log('✅ WebKit prefixes found (Safari/Chrome support)');
  } else {
    console.log('⚠️  WebKit prefixes not found');
  }
  
  // Check for transform fixes
  if (cssContent.includes('transform: none')) {
    console.log('✅ Transform fixes found (prevents rotation issues)');
  } else {
    console.log('❌ Transform fixes missing');
  }
  
  // Check for hardware acceleration
  if (cssContent.includes('translateZ(0)') || cssContent.includes('will-change')) {
    console.log('✅ Hardware acceleration found (smooth rendering)');
  } else {
    console.log('⚠️  Hardware acceleration not found');
  }
  
} else {
  console.log('❌ CSS file not found');
}

// Check HTML for proper meta tags
const htmlPath = join(process.cwd(), 'index.html');
if (existsSync(htmlPath)) {
  const htmlContent = readFileSync(htmlPath, 'utf8');
  
  console.log('\n📱 HTML Cross-Platform Checks:');
  
  // Check viewport meta tag
  if (htmlContent.includes('viewport')) {
    console.log('✅ Viewport meta tag found');
    
    // Check for proper viewport settings
    if (htmlContent.includes('user-scalable=no')) {
      console.log('✅ User scaling disabled (prevents zoom issues)');
    } else {
      console.log('⚠️  User scaling not disabled');
    }
  } else {
    console.log('❌ Viewport meta tag missing');
  }
  
  // Check for mobile app meta tags
  if (htmlContent.includes('apple-mobile-web-app')) {
    console.log('✅ Apple mobile app meta tags found');
  } else {
    console.log('⚠️  Apple mobile app meta tags missing');
  }
  
  // Check for theme color
  if (htmlContent.includes('theme-color')) {
    console.log('✅ Theme color meta tag found');
  } else {
    console.log('⚠️  Theme color meta tag missing');
  }
  
} else {
  console.log('❌ HTML file not found');
}

// Check Netlify configuration
const netlifyPath = join(process.cwd(), 'netlify.toml');
if (existsSync(netlifyPath)) {
  const netlifyContent = readFileSync(netlifyPath, 'utf8');
  
  console.log('\n🚀 Netlify Configuration Checks:');
  
  // Check for cache control
  if (netlifyContent.includes('Cache-Control')) {
    console.log('✅ Cache control headers found');
  } else {
    console.log('❌ Cache control headers missing');
  }
  
  // Check for no-cache settings
  if (netlifyContent.includes('no-cache')) {
    console.log('✅ No-cache settings found (prevents stale content)');
  } else {
    console.log('❌ No-cache settings missing');
  }
  
  // Check for redirects
  if (netlifyContent.includes('[[redirects]]')) {
    console.log('✅ Redirects configured');
  } else {
    console.log('⚠️  Redirects not configured');
  }
  
} else {
  console.log('❌ Netlify configuration not found');
}

// Check for responsive design patterns
const componentsPath = join(process.cwd(), 'src', 'components');
if (existsSync(componentsPath)) {
  console.log('\n📱 Responsive Design Checks:');
  
  // Check for Tailwind responsive classes
  const { readdirSync } = await import('fs');
  const componentFiles = readdirSync(componentsPath).filter(f => f.endsWith('.tsx'));
  
  let responsiveClassesFound = 0;
  let mobileFirstFound = 0;
  
  for (const file of componentFiles) {
    const filePath = join(componentsPath, file);
    const content = readFileSync(filePath, 'utf8');
    
    // Check for responsive classes
    if (content.includes('sm:') || content.includes('md:') || content.includes('lg:')) {
      responsiveClassesFound++;
    }
    
    // Check for mobile-first approach
    if (content.includes('flex-col') && content.includes('lg:flex-row')) {
      mobileFirstFound++;
    }
  }
  
  if (responsiveClassesFound > 0) {
    console.log(`✅ Responsive classes found in ${responsiveClassesFound} components`);
  } else {
    console.log('❌ Responsive classes not found');
  }
  
  if (mobileFirstFound > 0) {
    console.log(`✅ Mobile-first design found in ${mobileFirstFound} components`);
  } else {
    console.log('⚠️  Mobile-first design not clearly implemented');
  }
  
} else {
  console.log('❌ Components directory not found');
}

console.log('\n📋 Cross-Platform Testing Checklist:');
console.log('====================================');
console.log('✅ Test on Windows Chrome');
console.log('✅ Test on Mac Safari');
console.log('✅ Test on Mac Chrome');
console.log('✅ Test on iPhone Safari');
console.log('✅ Test on Android Chrome');
console.log('✅ Test in incognito/private mode');
console.log('✅ Test with different screen sizes');
console.log('✅ Test image orientation (especially profile images)');
console.log('✅ Test font loading');
console.log('✅ Test cache behavior (hard refresh)');

console.log('\n🎯 Key Issues to Watch For:');
console.log('==========================');
console.log('• Image rotation on Mac (EXIF orientation)');
console.log('• Font loading issues (FOUT)');
console.log('• Cache not updating (stale content)');
console.log('• Responsive layout breaking');
console.log('• Touch interactions on mobile');

console.log('\n✅ Cross-platform compatibility test completed!');
console.log('\n💡 If issues persist:');
console.log('1. Clear browser cache completely');
console.log('2. Test in incognito/private window');
console.log('3. Check browser developer tools for errors');
console.log('4. Verify Netlify deployment status');
console.log('5. Check image EXIF data for rotation issues');
