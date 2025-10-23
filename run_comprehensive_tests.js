#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Comprehensive Cross-Platform Tests for Online Parent Teen Clinic\n');

// Test results storage
const testResults = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
    }
};

// Utility function to run tests
function runTest(testName, testFunction) {
    console.log(`\n🔍 Running: ${testName}`);
    testResults.summary.total++;
    
    try {
        const result = testFunction();
        if (result.success) {
            console.log(`✅ ${testName}: PASSED`);
            testResults.summary.passed++;
        } else {
            console.log(`⚠️  ${testName}: WARNING - ${result.message}`);
            testResults.summary.warnings++;
        }
        testResults.tests.push({
            name: testName,
            status: result.success ? 'passed' : 'warning',
            message: result.message,
            details: result.details
        });
    } catch (error) {
        console.log(`❌ ${testName}: FAILED - ${error.message}`);
        testResults.summary.failed++;
        testResults.tests.push({
            name: testName,
            status: 'failed',
            message: error.message,
            details: error.stack
        });
    }
}

// Test 1: Check if all required files exist
runTest('File Structure Check', () => {
    const requiredFiles = [
        'src/components/Header.tsx',
        'src/components/Hero.tsx',
        'src/index.css',
        'test_responsive_design.html',
        'test_cross_platform.js'
    ];
    
    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
        return {
            success: false,
            message: `Missing files: ${missingFiles.join(', ')}`,
            details: { missingFiles }
        };
    }
    
    return {
        success: true,
        message: 'All required files present',
        details: { files: requiredFiles }
    };
});

// Test 2: Check Header component structure
runTest('Header Component Structure', () => {
    const headerContent = fs.readFileSync('src/components/Header.tsx', 'utf8');
    
    const checks = [
        {
            name: 'Dancing Script font class',
            pattern: /font-dancing-script/,
            required: true
        },
        {
            name: 'Doctor name in header',
            pattern: /Dr\. Anna-Maria Fytrou/,
            required: true
        },
        {
            name: 'Cross-platform image styles',
            pattern: /imageOrientation.*from-image/,
            required: true
        },
        {
            name: 'Responsive height classes',
            pattern: /h-20 sm:h-24/,
            required: true
        },
        {
            name: 'Flex alignment classes',
            pattern: /flex items-center justify-center/,
            required: true
        }
    ];
    
    const results = checks.map(check => ({
        name: check.name,
        found: check.pattern.test(headerContent),
        required: check.required
    }));
    
    const failed = results.filter(r => r.required && !r.found);
    
    if (failed.length > 0) {
        return {
            success: false,
            message: `Missing required elements: ${failed.map(f => f.name).join(', ')}`,
            details: { results }
        };
    }
    
    return {
        success: true,
        message: 'Header component structure is correct',
        details: { results }
    };
});

// Test 3: Check Hero component structure
runTest('Hero Component Structure', () => {
    const heroContent = fs.readFileSync('src/components/Hero.tsx', 'utf8');
    
    const checks = [
        {
            name: 'Main title with Greek text',
            pattern: /Διαδικτυακό Ιατρείο/,
            required: true
        },
        {
            name: 'Gradient text styling',
            pattern: /bg-gradient-to-r from-rose-soft/,
            required: true
        },
        {
            name: 'Post-it note positioning',
            pattern: /top-\[32\%\]/,
            required: true
        },
        {
            name: 'Responsive text sizing',
            pattern: /text-3xl sm:text-4xl md:text-5xl/,
            required: true
        },
        {
            name: 'Cross-platform font rendering',
            pattern: /textRendering.*optimizeLegibility/,
            required: true
        }
    ];
    
    const results = checks.map(check => ({
        name: check.name,
        found: check.pattern.test(heroContent),
        required: check.required
    }));
    
    const failed = results.filter(r => r.required && !r.found);
    
    if (failed.length > 0) {
        return {
            success: false,
            message: `Missing required elements: ${failed.map(f => f.name).join(', ')}`,
            details: { results }
        };
    }
    
    return {
        success: true,
        message: 'Hero component structure is correct',
        details: { results }
    };
});

// Test 4: Check CSS cross-platform fixes
runTest('CSS Cross-Platform Fixes', () => {
    const cssContent = fs.readFileSync('src/index.css', 'utf8');
    
    const checks = [
        {
            name: 'Mac Safari font fixes',
            pattern: /@supports.*-webkit-appearance.*none/,
            required: true
        },
        {
            name: 'Windows font fixes',
            pattern: /@media screen and.*-ms-high-contrast/,
            required: true
        },
        {
            name: 'Firefox font fixes',
            pattern: /@-moz-document url-prefix/,
            required: true
        },
        {
            name: 'Image orientation fixes',
            pattern: /image-orientation.*from-image/,
            required: true
        },
        {
            name: 'Button height consistency',
            pattern: /min-height.*40px/,
            required: true
        },
        {
            name: 'Mobile Safari viewport fixes',
            pattern: /@supports.*-webkit-touch-callout/,
            required: true
        }
    ];
    
    const results = checks.map(check => ({
        name: check.name,
        found: check.pattern.test(cssContent),
        required: check.required
    }));
    
    const failed = results.filter(r => r.required && !r.found);
    
    if (failed.length > 0) {
        return {
            success: false,
            message: `Missing CSS fixes: ${failed.map(f => f.name).join(', ')}`,
            details: { results }
        };
    }
    
    return {
        success: true,
        message: 'CSS cross-platform fixes are present',
        details: { results }
    };
});

// Test 5: Check responsive design implementation
runTest('Responsive Design Implementation', () => {
    const files = ['src/components/Header.tsx', 'src/components/Hero.tsx'];
    const responsiveClasses = [
        'sm:', 'md:', 'lg:', 'xl:', '2xl:',
        'h-20 sm:h-24', 'text-lg sm:text-xl',
        'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl',
        'px-4 sm:px-6 lg:px-8', 'left-4 sm:left-8 md:left-16 lg:left-32 xl:left-40'
    ];
    
    let foundClasses = 0;
    const foundInFiles = {};
    
    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        foundInFiles[file] = responsiveClasses.filter(cls => content.includes(cls));
        foundClasses += foundInFiles[file].length;
    });
    
    const totalExpected = responsiveClasses.length * files.length;
    const coverage = (foundClasses / totalExpected) * 100;
    
    if (coverage < 80) {
        return {
            success: false,
            message: `Low responsive design coverage: ${coverage.toFixed(1)}%`,
            details: { foundInFiles, coverage }
        };
    }
    
    return {
        success: true,
        message: `Responsive design coverage: ${coverage.toFixed(1)}%`,
        details: { foundInFiles, coverage }
    };
});

// Test 6: Check font loading optimization
runTest('Font Loading Optimization', () => {
    const cssContent = fs.readFileSync('src/index.css', 'utf8');
    
    const fontChecks = [
        {
            name: 'Font display swap',
            pattern: /font-display.*swap/,
            required: true
        },
        {
            name: 'Font smoothing',
            pattern: /-webkit-font-smoothing.*antialiased/,
            required: true
        },
        {
            name: 'Text rendering optimization',
            pattern: /text-rendering.*optimizeLegibility/,
            required: true
        },
        {
            name: 'Font feature settings',
            pattern: /font-feature-settings/,
            required: true
        },
        {
            name: 'Font kerning',
            pattern: /font-kerning.*normal/,
            required: true
        }
    ];
    
    const results = fontChecks.map(check => ({
        name: check.name,
        found: check.pattern.test(cssContent),
        required: check.required
    }));
    
    const failed = results.filter(r => r.required && !r.found);
    
    if (failed.length > 0) {
        return {
            success: false,
            message: `Missing font optimizations: ${failed.map(f => f.name).join(', ')}`,
            details: { results }
        };
    }
    
    return {
        success: true,
        message: 'Font loading optimization is complete',
        details: { results }
    };
});

// Test 7: Check for potential Mac Safari issues
runTest('Mac Safari Compatibility', () => {
    const files = ['src/components/Header.tsx', 'src/components/Hero.tsx', 'src/index.css'];
    const macFixes = [
        'WebkitTransform.*none',
        'WebkitBackfaceVisibility',
        'WebkitFontSmoothing',
        'WebkitTextSizeAdjust',
        'WebkitTouchCallout',
        'subpixel-antialiased',
        'WebkitTextStroke'
    ];
    
    let totalFixes = 0;
    const foundFixes = {};
    
    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        foundFixes[file] = macFixes.filter(fix => new RegExp(fix).test(content));
        totalFixes += foundFixes[file].length;
    });
    
    const expectedFixes = macFixes.length * files.length;
    const coverage = (totalFixes / expectedFixes) * 100;
    
    if (coverage < 70) {
        return {
            success: false,
            message: `Insufficient Mac Safari fixes: ${coverage.toFixed(1)}%`,
            details: { foundFixes, coverage }
        };
    }
    
    return {
        success: true,
        message: `Mac Safari compatibility: ${coverage.toFixed(1)}%`,
        details: { foundFixes, coverage }
    };
});

// Test 8: Check image handling
runTest('Image Handling', () => {
    const files = ['src/components/Header.tsx', 'src/index.css'];
    const imageFixes = [
        'image-orientation.*from-image',
        'WebkitTransform.*none',
        'transform.*none',
        'WebkitBackfaceVisibility',
        'backface-visibility',
        'WebkitTransformOrigin',
        'transform-origin'
    ];
    
    let totalFixes = 0;
    const foundFixes = {};
    
    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        foundFixes[file] = imageFixes.filter(fix => new RegExp(fix).test(content));
        totalFixes += foundFixes[file].length;
    });
    
    const expectedFixes = imageFixes.length * files.length;
    const coverage = (totalFixes / expectedFixes) * 100;
    
    if (coverage < 80) {
        return {
            success: false,
            message: `Insufficient image handling fixes: ${coverage.toFixed(1)}%`,
            details: { foundFixes, coverage }
        };
    }
    
    return {
        success: true,
        message: `Image handling: ${coverage.toFixed(1)}%`,
        details: { foundFixes, coverage }
    };
});

// Test 9: Check button consistency
runTest('Button Consistency', () => {
    const headerContent = fs.readFileSync('src/components/Header.tsx', 'utf8');
    
    const buttonChecks = [
        {
            name: 'Minimum height for buttons',
            pattern: /min-h-\[40px\]/,
            required: true
        },
        {
            name: 'Flex alignment for buttons',
            pattern: /flex items-center justify-center/,
            required: true
        },
        {
            name: 'Consistent button styling',
            pattern: /transition-all duration-300/,
            required: true
        }
    ];
    
    const results = buttonChecks.map(check => ({
        name: check.name,
        found: check.pattern.test(headerContent),
        required: check.required
    }));
    
    const failed = results.filter(r => r.required && !r.found);
    
    if (failed.length > 0) {
        return {
            success: false,
            message: `Missing button consistency: ${failed.map(f => f.name).join(', ')}`,
            details: { results }
        };
    }
    
    return {
        success: true,
        message: 'Button consistency is implemented',
        details: { results }
    };
});

// Test 10: Check viewport and mobile compatibility
runTest('Mobile and Viewport Compatibility', () => {
    const files = ['src/components/Header.tsx', 'src/components/Hero.tsx', 'src/index.css'];
    const mobileChecks = [
        'min-h-\[70vh\]',
        'WebkitFillAvailable',
        'WebkitTouchCallout',
        'viewport.*width=device-width',
        'responsive.*breakpoints'
    ];
    
    let totalChecks = 0;
    const foundChecks = {};
    
    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        foundChecks[file] = mobileChecks.filter(check => new RegExp(check).test(content));
        totalChecks += foundChecks[file].length;
    });
    
    const expectedChecks = mobileChecks.length * files.length;
    const coverage = (totalChecks / expectedChecks) * 100;
    
    if (coverage < 60) {
        return {
            success: false,
            message: `Insufficient mobile compatibility: ${coverage.toFixed(1)}%`,
            details: { foundChecks, coverage }
        };
    }
    
    return {
        success: true,
        message: `Mobile compatibility: ${coverage.toFixed(1)}%`,
        details: { foundChecks, coverage }
    };
});

// Generate final report
function generateReport() {
    console.log('\n📊 COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${testResults.summary.total}`);
    console.log(`✅ Passed: ${testResults.summary.passed}`);
    console.log(`⚠️  Warnings: ${testResults.summary.warnings}`);
    console.log(`❌ Failed: ${testResults.summary.failed}`);
    console.log(`Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`);
    
    console.log('\n📋 DETAILED RESULTS:');
    console.log('-'.repeat(50));
    
    testResults.tests.forEach((test, index) => {
        const status = test.status === 'passed' ? '✅' : test.status === 'warning' ? '⚠️' : '❌';
        console.log(`${index + 1}. ${status} ${test.name}`);
        console.log(`   ${test.message}`);
        if (test.details && Object.keys(test.details).length > 0) {
            console.log(`   Details: ${JSON.stringify(test.details, null, 2).replace(/\n/g, '\n   ')}`);
        }
        console.log('');
    });
    
    // Save report to file
    const reportPath = 'comprehensive_test_report.json';
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    // Generate HTML report
    const htmlReport = generateHTMLReport();
    const htmlPath = 'comprehensive_test_report.html';
    fs.writeFileSync(htmlPath, htmlReport);
    console.log(`📄 HTML report saved to: ${htmlPath}`);
    
    // Final recommendation
    if (testResults.summary.failed === 0 && testResults.summary.warnings <= 2) {
        console.log('\n🎉 EXCELLENT! Your website is ready for cross-platform deployment!');
        console.log('   The responsive design and cross-platform compatibility are properly implemented.');
    } else if (testResults.summary.failed === 0) {
        console.log('\n✅ GOOD! Your website is mostly ready with minor improvements needed.');
        console.log('   Consider addressing the warnings for optimal performance.');
    } else {
        console.log('\n⚠️  ATTENTION! Some issues need to be fixed before deployment.');
        console.log('   Please address the failed tests to ensure proper cross-platform compatibility.');
    }
}

function generateHTMLReport() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive Test Report - Online Parent Teen Clinic</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .number { font-size: 2em; font-weight: bold; }
        .passed { color: #28a745; }
        .warning { color: #ffc107; }
        .failed { color: #dc3545; }
        .test-result { margin-bottom: 20px; padding: 15px; border-radius: 8px; border-left: 4px solid; }
        .test-result.passed { border-left-color: #28a745; background: #d4edda; }
        .test-result.warning { border-left-color: #ffc107; background: #fff3cd; }
        .test-result.failed { border-left-color: #dc3545; background: #f8d7da; }
        .test-name { font-weight: bold; margin-bottom: 5px; }
        .test-message { margin-bottom: 10px; }
        .test-details { font-size: 0.9em; color: #666; background: #f8f9fa; padding: 10px; border-radius: 4px; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Comprehensive Test Report</h1>
            <p class="timestamp">Generated on: ${new Date(testResults.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="number">${testResults.summary.total}</div>
            </div>
            <div class="summary-card">
                <h3>Passed</h3>
                <div class="number passed">${testResults.summary.passed}</div>
            </div>
            <div class="summary-card">
                <h3>Warnings</h3>
                <div class="number warning">${testResults.summary.warnings}</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div class="number failed">${testResults.summary.failed}</div>
            </div>
        </div>
        
        <h2>Test Results</h2>
        ${testResults.tests.map(test => `
            <div class="test-result ${test.status}">
                <div class="test-name">${test.name}</div>
                <div class="test-message">${test.message}</div>
                ${test.details && Object.keys(test.details).length > 0 ? `
                    <div class="test-details">
                        <pre>${JSON.stringify(test.details, null, 2)}</pre>
                    </div>
                ` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>`;
}

// Run all tests and generate report
generateReport();
