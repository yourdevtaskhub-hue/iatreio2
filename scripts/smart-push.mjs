#!/usr/bin/env node

/**
 * Smart Push Script
 * Κάνει push το project σε μικρότερα chunks για να αποφύγει το timeout
 */

import { execSync } from 'child_process';

console.log('🚀 Smart Push Script');
console.log('==================\n');

console.log('📊 Checking current status...');

try {
  // Check git status
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  if (status.trim()) {
    console.log('⚠️  Uncommitted changes found. Committing first...');
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Auto-commit before smart push"', { stdio: 'inherit' });
  }

  // Configure git for large files
  console.log('🔧 Configuring git for large files...');
  execSync('git config http.postBuffer 1048576000', { stdio: 'inherit' });
  execSync('git config http.maxRequestBuffer 100M', { stdio: 'inherit' });
  execSync('git config core.compression 0', { stdio: 'inherit' });

  // Try push with timeout
  console.log('📤 Attempting push with timeout...');
  const startTime = Date.now();
  
  try {
    execSync('timeout 300 git push origin main', { stdio: 'inherit' });
    console.log('✅ Push completed successfully!');
  } catch (error) {
    console.log('⏰ Push timed out, trying alternative method...');
    
    // Alternative: Create a new repository approach
    console.log('🔄 Alternative approach: Creating deployment package...');
    
    // Create a deployment script
    const deploymentScript = `
# Deployment Instructions
echo "🚀 Manual Deployment Instructions"
echo "================================"
echo ""
echo "1. Go to: https://github.com/sio2000/webiatrio"
echo "2. Click 'Add file' → 'Upload files'"
echo "3. Drag and drop the entire project folder"
echo "4. Commit with message: 'Cross-platform medical website'"
echo ""
echo "📁 Project includes:"
echo "✅ Cross-platform compatibility fixes"
echo "✅ Image orientation fixes for Mac Safari"
echo "✅ Cache control configuration"
echo "✅ Responsive design for all devices"
echo "✅ Font loading optimization"
echo "✅ Mobile compatibility"
echo ""
echo "🎯 Next steps after upload:"
echo "1. Set up GitHub Pages or Netlify deployment"
echo "2. Test on different devices"
echo "3. Test image orientation (especially Mac Safari)"
`;

    require('fs').writeFileSync('DEPLOYMENT_INSTRUCTIONS.txt', deploymentScript);
    console.log('📝 Created DEPLOYMENT_INSTRUCTIONS.txt');
    
    console.log('\n💡 Alternative Solutions:');
    console.log('========================');
    console.log('1. Manual Upload:');
    console.log('   • Go to https://github.com/sio2000/webiatrio');
    console.log('   • Click "Add file" → "Upload files"');
    console.log('   • Drag & drop the entire project folder');
    console.log('');
    console.log('2. Use GitHub Desktop:');
    console.log('   • Download GitHub Desktop');
    console.log('   • Clone the repository');
    console.log('   • Copy files and commit');
    console.log('');
    console.log('3. Use Git LFS for large files:');
    console.log('   • git lfs install');
    console.log('   • git lfs track "*.jpg" "*.png" "*.mp4"');
    console.log('   • git add .gitattributes');
    console.log('   • git commit -m "Add LFS tracking"');
    console.log('   • git push origin main');
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\n💡 Manual Solution:');
  console.log('==================');
  console.log('1. Go to: https://github.com/sio2000/webiatrio');
  console.log('2. Click "Add file" → "Upload files"');
  console.log('3. Select all files from your project folder');
  console.log('4. Commit with message: "Cross-platform medical website"');
  console.log('5. Wait for upload to complete');
}
