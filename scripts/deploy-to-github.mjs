#!/usr/bin/env node

/**
 * Deploy to GitHub Script
 * Ανεβάζει το project στο GitHub repository
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 Deploy to GitHub Script');
console.log('==========================\n');

const GITHUB_REPO = 'https://github.com/yourdevtaskhub-hue/iatreioweb.git';

// Check if we're in a git repository
if (!existsSync('.git')) {
  console.log('📦 Initializing Git repository...');
  try {
    execSync('git init', { stdio: 'inherit' });
    console.log('✅ Git repository initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Git repository:', error.message);
    process.exit(1);
  }
}

// Check if remote origin exists
try {
  const remotes = execSync('git remote -v', { encoding: 'utf8' });
  if (remotes.includes('origin')) {
    console.log('✅ Remote origin already exists');
    console.log('📝 Current remotes:');
    console.log(remotes);
  } else {
    console.log('🔗 Adding remote origin...');
    execSync(`git remote add origin ${GITHUB_REPO}`, { stdio: 'inherit' });
    console.log('✅ Remote origin added');
  }
} catch (error) {
  console.log('🔗 Adding remote origin...');
  try {
    execSync(`git remote add origin ${GITHUB_REPO}`, { stdio: 'inherit' });
    console.log('✅ Remote origin added');
  } catch (addError) {
    console.error('❌ Failed to add remote origin:', addError.message);
    process.exit(1);
  }
}

// Check git status
try {
  console.log('\n📊 Git Status:');
  execSync('git status', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to check git status:', error.message);
  process.exit(1);
}

// Add all files
console.log('\n📁 Adding all files...');
try {
  execSync('git add .', { stdio: 'inherit' });
  console.log('✅ All files added to staging');
} catch (error) {
  console.error('❌ Failed to add files:', error.message);
  process.exit(1);
}

// Commit changes
console.log('\n💾 Committing changes...');
try {
  const commitMessage = 'Initial commit: Cross-platform compatible medical website with image orientation fixes and cache control';
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  console.log('✅ Changes committed');
} catch (error) {
  console.error('❌ Failed to commit changes:', error.message);
  process.exit(1);
}

// Push to GitHub
console.log('\n🚀 Pushing to GitHub...');
try {
  execSync('git push -u origin main', { stdio: 'inherit' });
  console.log('✅ Successfully pushed to GitHub!');
} catch (error) {
  console.log('⚠️  Trying alternative branch name...');
  try {
    execSync('git push -u origin master', { stdio: 'inherit' });
    console.log('✅ Successfully pushed to GitHub!');
  } catch (altError) {
    console.error('❌ Failed to push to GitHub:', altError.message);
    console.log('\n💡 Manual steps:');
    console.log('1. Check if you have access to the repository');
    console.log('2. Make sure you have the correct permissions');
    console.log('3. Try: git push -u origin main');
    process.exit(1);
  }
}

console.log('\n🎉 Deployment Complete!');
console.log('========================');
console.log(`📱 Repository: ${GITHUB_REPO}`);
console.log('✅ All files uploaded successfully');
console.log('✅ Cross-platform compatibility fixes included');
console.log('✅ Cache control configuration included');
console.log('✅ Image orientation fixes included');

console.log('\n📋 Next Steps:');
console.log('1. Go to GitHub repository to verify files');
console.log('2. Set up GitHub Pages or Netlify deployment');
console.log('3. Test the website on different devices');
console.log('4. Share the live URL with users');

console.log('\n🔗 Repository URL:');
console.log(GITHUB_REPO);
