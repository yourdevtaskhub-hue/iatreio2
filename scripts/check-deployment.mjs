#!/usr/bin/env node

/**
 * Deployment Check Script
 * Ελέγχει αν το deployment είναι σωστό και αν όλα τα assets φορτώνουν
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 Deployment Check Script');
console.log('========================\n');

// Check if dist folder exists
const distPath = join(process.cwd(), 'dist');
if (!existsSync(distPath)) {
  console.error('❌ Dist folder not found. Run "npm run build" first.');
  process.exit(1);
}

console.log('✅ Dist folder exists');

// Check critical files
const criticalFiles = [
  'index.html'
];

let allFilesExist = true;
for (const file of criticalFiles) {
  const filePath = join(distPath, file);
  if (existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
}

// Check for assets with hashed names
const assetsPath = join(distPath, 'assets');
if (existsSync(assetsPath)) {
  try {
    const { readdirSync } = await import('fs');
    const files = readdirSync(assetsPath);
    
    const cssFiles = files.filter(f => f.endsWith('.css'));
    const jsFiles = files.filter(f => f.endsWith('.js'));
    const imageFiles = files.filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));
    
    if (cssFiles.length > 0) {
      console.log(`✅ ${cssFiles.length} CSS file(s) found: ${cssFiles.join(', ')}`);
    } else {
      console.log('❌ No CSS files found');
      allFilesExist = false;
    }
    
    if (jsFiles.length > 0) {
      console.log(`✅ ${jsFiles.length} JS file(s) found: ${jsFiles.join(', ')}`);
    } else {
      console.log('❌ No JS files found');
      allFilesExist = false;
    }
    
    if (imageFiles.length > 0) {
      console.log(`✅ ${imageFiles.length} image file(s) found`);
    } else {
      console.log('⚠️  No image files found');
    }
    
  } catch (error) {
    console.log('❌ Could not read assets directory');
    allFilesExist = false;
  }
} else {
  console.log('❌ Assets directory not found');
  allFilesExist = false;
}

// Check HTML content
try {
  const htmlPath = join(distPath, 'index.html');
  const htmlContent = readFileSync(htmlPath, 'utf8');
  
  // Check for proper meta tags
  if (htmlContent.includes('viewport')) {
    console.log('✅ Viewport meta tag found');
  } else {
    console.log('❌ Viewport meta tag missing');
  }
  
  if (htmlContent.includes('Cache-Control')) {
    console.log('✅ Cache control headers found');
  } else {
    console.log('⚠️  Cache control headers not found in HTML');
  }
  
  // Check for CSS and JS files
  const cssMatches = htmlContent.match(/href="[^"]*\.css"/g);
  const jsMatches = htmlContent.match(/src="[^"]*\.js"/g);
  
  if (cssMatches && cssMatches.length > 0) {
    console.log(`✅ ${cssMatches.length} CSS file(s) referenced in HTML`);
  }
  
  if (jsMatches && jsMatches.length > 0) {
    console.log(`✅ ${jsMatches.length} JS file(s) referenced in HTML`);
  }
  
} catch (error) {
  console.error('❌ Error reading HTML file:', error.message);
  allFilesExist = false;
}

console.log(`\n📊 Summary:`);
console.log(`- Critical files: ${allFilesExist ? 'All present' : 'Some missing'}`);
console.log(`- Build status: ${allFilesExist ? 'Ready for deployment' : 'Needs attention'}`);

if (allFilesExist) {
  console.log('\n✅ Deployment check passed!');
  console.log('\n📋 Next steps:');
  console.log('1. Commit and push changes to GitHub');
  console.log('2. Wait for Netlify deployment to complete');
  console.log('3. Test in incognito/private window');
  console.log('4. Test on different devices/browsers');
} else {
  console.log('\n❌ Deployment check failed!');
  console.log('Please fix the issues above before deploying.');
  process.exit(1);
}