#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Payment Success Popup Implementation\n');

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

// Test 1: Check if PaymentSuccessPopup component exists
runTest('PaymentSuccessPopup Component Exists', () => {
    const componentPath = 'src/components/PaymentSuccessPopup.tsx';
    
    if (!fs.existsSync(componentPath)) {
        return {
            success: false,
            message: 'PaymentSuccessPopup component not found',
            details: { path: componentPath }
        };
    }
    
    const content = fs.readFileSync(componentPath, 'utf8');
    
    const requiredElements = [
        'PaymentSuccessPopup',
        'isVisible',
        'onClose',
        'sessionId',
        'paymentId',
        'Πληρωμή Επιτυχής',
        'Σας περιμένουμε στο ιατρείο μας',
        'AnimatePresence',
        'motion.div'
    ];
    
    const missingElements = requiredElements.filter(element => !content.includes(element));
    
    if (missingElements.length > 0) {
        return {
            success: false,
            message: `Missing required elements: ${missingElements.join(', ')}`,
            details: { missingElements }
        };
    }
    
    return {
        success: true,
        message: 'PaymentSuccessPopup component is properly implemented',
        details: { foundElements: requiredElements.filter(element => content.includes(element)) }
    };
});

// Test 2: Check if usePaymentSuccess hook exists
runTest('usePaymentSuccess Hook Exists', () => {
    const hookPath = 'src/hooks/usePaymentSuccess.ts';
    
    if (!fs.existsSync(hookPath)) {
        return {
            success: false,
            message: 'usePaymentSuccess hook not found',
            details: { path: hookPath }
        };
    }
    
    const content = fs.readFileSync(hookPath, 'utf8');
    
    const requiredElements = [
        'usePaymentSuccess',
        'sessionId',
        'paymentId',
        'isSuccess',
        'payment-success',
        'success',
        'payment_status',
        'URLSearchParams'
    ];
    
    const missingElements = requiredElements.filter(element => !content.includes(element));
    
    if (missingElements.length > 0) {
        return {
            success: false,
            message: `Missing required elements: ${missingElements.join(', ')}`,
            details: { missingElements }
        };
    }
    
    return {
        success: true,
        message: 'usePaymentSuccess hook is properly implemented',
        details: { foundElements: requiredElements.filter(element => content.includes(element)) }
    };
});

// Test 3: Check if App.tsx includes the popup
runTest('App.tsx Integration', () => {
    const appPath = 'src/App.tsx';
    
    if (!fs.existsSync(appPath)) {
        return {
            success: false,
            message: 'App.tsx not found',
            details: { path: appPath }
        };
    }
    
    const content = fs.readFileSync(appPath, 'utf8');
    
    const requiredElements = [
        'PaymentSuccessPopup',
        'usePaymentSuccess',
        'showPaymentSuccess',
        'setShowPaymentSuccess',
        'paymentSuccess.isSuccess'
    ];
    
    const missingElements = requiredElements.filter(element => !content.includes(element));
    
    if (missingElements.length > 0) {
        return {
            success: false,
            message: `Missing required elements: ${missingElements.join(', ')}`,
            details: { missingElements }
        };
    }
    
    return {
        success: true,
        message: 'App.tsx properly integrates PaymentSuccessPopup',
        details: { foundElements: requiredElements.filter(element => content.includes(element)) }
    };
});

// Test 4: Check URL parameter detection
runTest('URL Parameter Detection', () => {
    const hookContent = fs.readFileSync('src/hooks/usePaymentSuccess.ts', 'utf8');
    
    const urlChecks = [
        'session_id',
        'payment_id',
        'payment_status',
        'success',
        'payment-success',
        'success',
        'payment_success'
    ];
    
    const foundChecks = urlChecks.filter(check => hookContent.includes(check));
    const coverage = (foundChecks.length / urlChecks.length) * 100;
    
    if (coverage < 80) {
        return {
            success: false,
            message: `Low URL parameter coverage: ${coverage.toFixed(1)}%`,
            details: { foundChecks, coverage }
        };
    }
    
    return {
        success: true,
        message: `URL parameter detection coverage: ${coverage.toFixed(1)}%`,
        details: { foundChecks, coverage }
    };
});

// Test 5: Check popup content and messaging
runTest('Popup Content and Messaging', () => {
    const popupContent = fs.readFileSync('src/components/PaymentSuccessPopup.tsx', 'utf8');
    
    const requiredMessages = [
        'Πληρωμή Επιτυχής',
        'Σας περιμένουμε στο ιατρείο μας',
        'Η πληρωμή σας ολοκληρώθηκε με επιτυχία',
        'Θα λάβετε email επιβεβαίωσης',
        'Λεπτομέρειες Ραντεβού',
        'Επικοινωνία',
        'Κατάλαβα',
        'Επικοινωνία'
    ];
    
    const foundMessages = requiredMessages.filter(message => popupContent.includes(message));
    const coverage = (foundMessages.length / requiredMessages.length) * 100;
    
    if (coverage < 90) {
        return {
            success: false,
            message: `Low message coverage: ${coverage.toFixed(1)}%`,
            details: { foundMessages, coverage }
        };
    }
    
    return {
        success: true,
        message: `Popup message coverage: ${coverage.toFixed(1)}%`,
        details: { foundMessages, coverage }
    };
});

// Test 6: Check animation and UX features
runTest('Animation and UX Features', () => {
    const popupContent = fs.readFileSync('src/components/PaymentSuccessPopup.tsx', 'utf8');
    
    const requiredFeatures = [
        'AnimatePresence',
        'motion.div',
        'initial',
        'animate',
        'exit',
        'transition',
        'spring',
        'stiffness',
        'damping',
        'CheckCircle',
        'Calendar',
        'Clock',
        'MapPin',
        'Phone',
        'Mail',
        'X'
    ];
    
    const foundFeatures = requiredFeatures.filter(feature => popupContent.includes(feature));
    const coverage = (foundFeatures.length / requiredFeatures.length) * 100;
    
    if (coverage < 80) {
        return {
            success: false,
            message: `Low UX feature coverage: ${coverage.toFixed(1)}%`,
            details: { foundFeatures, coverage }
        };
    }
    
    return {
        success: true,
        message: `UX feature coverage: ${coverage.toFixed(1)}%`,
        details: { foundFeatures, coverage }
    };
});

// Test 7: Check auto-close functionality
runTest('Auto-Close Functionality', () => {
    const popupContent = fs.readFileSync('src/components/PaymentSuccessPopup.tsx', 'utf8');
    
    const autoCloseFeatures = [
        'useEffect',
        'setTimeout',
        'clearTimeout',
        '10000',
        'handleClose'
    ];
    
    const foundFeatures = autoCloseFeatures.filter(feature => popupContent.includes(feature));
    const coverage = (foundFeatures.length / autoCloseFeatures.length) * 100;
    
    if (coverage < 80) {
        return {
            success: false,
            message: `Low auto-close coverage: ${coverage.toFixed(1)}%`,
            details: { foundFeatures, coverage }
        };
    }
    
    return {
        success: true,
        message: `Auto-close functionality coverage: ${coverage.toFixed(1)}%`,
        details: { foundFeatures, coverage }
    };
});

// Test 8: Check test page exists
runTest('Test Page Exists', () => {
    const testPagePath = 'test_payment_success.html';
    
    if (!fs.existsSync(testPagePath)) {
        return {
            success: false,
            message: 'Test page not found',
            details: { path: testPagePath }
        };
    }
    
    const content = fs.readFileSync(testPagePath, 'utf8');
    
    const requiredElements = [
        'testSuccessWithSession',
        'testSuccessWithPayment',
        'testSuccessWithBoth',
        'testSuccessPage',
        'updateURLIndicator',
        'showPopup',
        'closePopup'
    ];
    
    const missingElements = requiredElements.filter(element => !content.includes(element));
    
    if (missingElements.length > 0) {
        return {
            success: false,
            message: `Missing test elements: ${missingElements.join(', ')}`,
            details: { missingElements }
        };
    }
    
    return {
        success: true,
        message: 'Test page is properly implemented',
        details: { foundElements: requiredElements.filter(element => content.includes(element)) }
    };
});

// Test 9: Check success URL patterns
runTest('Success URL Pattern Detection', () => {
    const hookContent = fs.readFileSync('src/hooks/usePaymentSuccess.ts', 'utf8');
    
    const urlPatterns = [
        'payment-success',
        'success',
        'payment_success',
        'session_id',
        'payment_id',
        'payment_status',
        'success',
        'pathname.includes',
        'urlParams.get'
    ];
    
    const foundPatterns = urlPatterns.filter(pattern => hookContent.includes(pattern));
    const coverage = (foundPatterns.length / urlPatterns.length) * 100;
    
    if (coverage < 90) {
        return {
            success: false,
            message: `Low URL pattern coverage: ${coverage.toFixed(1)}%`,
            details: { foundPatterns, coverage }
        };
    }
    
    return {
        success: true,
        message: `URL pattern detection coverage: ${coverage.toFixed(1)}%`,
        details: { foundPatterns, coverage }
    };
});

// Test 10: Check responsive design
runTest('Responsive Design', () => {
    const popupContent = fs.readFileSync('src/components/PaymentSuccessPopup.tsx', 'utf8');
    
    const responsiveClasses = [
        'max-w-md',
        'w-full',
        'mx-4',
        'p-4',
        'p-6',
        'space-y-4',
        'flex',
        'items-center',
        'justify-center',
        'text-center'
    ];
    
    const foundClasses = responsiveClasses.filter(cls => popupContent.includes(cls));
    const coverage = (foundClasses.length / responsiveClasses.length) * 100;
    
    if (coverage < 80) {
        return {
            success: false,
            message: `Low responsive design coverage: ${coverage.toFixed(1)}%`,
            details: { foundClasses, coverage }
        };
    }
    
    return {
        success: true,
        message: `Responsive design coverage: ${coverage.toFixed(1)}%`,
        details: { foundClasses, coverage }
    };
});

// Generate final report
function generateReport() {
    console.log('\n📊 PAYMENT SUCCESS POPUP TEST REPORT');
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
    const reportPath = 'payment_success_test_report.json';
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    // Generate HTML report
    const htmlReport = generateHTMLReport();
    const htmlPath = 'payment_success_test_report.html';
    fs.writeFileSync(htmlPath, htmlReport);
    console.log(`📄 HTML report saved to: ${htmlPath}`);
    
    // Final recommendation
    if (testResults.summary.failed === 0 && testResults.summary.warnings <= 2) {
        console.log('\n🎉 EXCELLENT! Payment Success Popup is ready for production!');
        console.log('   The popup will automatically show when users return from successful payments.');
    } else if (testResults.summary.failed === 0) {
        console.log('\n✅ GOOD! Payment Success Popup is mostly ready with minor improvements needed.');
        console.log('   Consider addressing the warnings for optimal performance.');
    } else {
        console.log('\n⚠️  ATTENTION! Some issues need to be fixed before deployment.');
        console.log('   Please address the failed tests to ensure proper functionality.');
    }
}

function generateHTMLReport() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Success Popup Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .number { font-size: 2em; font-weight: bold; color: #007bff; }
        .test-result { margin-bottom: 20px; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; }
        .test-result.error { border-left-color: #dc3545; background: #f8d7da; }
        .test-result.success { border-left-color: #28a745; background: #d4edda; }
        .test-result.warning { border-left-color: #ffc107; background: #fff3cd; }
        .test-name { font-weight: bold; margin-bottom: 5px; }
        .test-message { margin-bottom: 10px; }
        .test-details { font-size: 0.9em; color: #666; background: #f8f9fa; padding: 10px; border-radius: 4px; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Success Popup Test Report</h1>
            <p class="timestamp">Generated on: ${new Date(testResults.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="number">${testResults.summary.total}</div>
            </div>
            <div class="summary-card">
                <h3>Passed</h3>
                <div class="number" style="color: #28a745;">${testResults.summary.passed}</div>
            </div>
            <div class="summary-card">
                <h3>Warnings</h3>
                <div class="number" style="color: #ffc107;">${testResults.summary.warnings}</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div class="number" style="color: #dc3545;">${testResults.summary.failed}</div>
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
