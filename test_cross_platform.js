// Cross-Platform Compatibility Test Script
// Tests the website on different operating systems and browsers

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configurations for different platforms
const testConfigs = [
    {
        name: 'Windows Chrome',
        platform: 'win32',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 }
    },
    {
        name: 'Windows Firefox',
        platform: 'win32',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        viewport: { width: 1920, height: 1080 }
    },
    {
        name: 'macOS Safari',
        platform: 'macOS',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
        viewport: { width: 1920, height: 1080 }
    },
    {
        name: 'macOS Chrome',
        platform: 'macOS',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 }
    },
    {
        name: 'Linux Chrome',
        platform: 'linux',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 }
    },
    {
        name: 'Mobile iOS Safari',
        platform: 'iOS',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
        viewport: { width: 375, height: 812 }
    },
    {
        name: 'Mobile Android Chrome',
        platform: 'Android',
        userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        viewport: { width: 412, height: 915 }
    }
];

// Responsive breakpoints to test
const breakpoints = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Large Desktop', width: 2560, height: 1440 }
];

class CrossPlatformTester {
    constructor() {
        this.results = [];
        this.browser = null;
    }

    async init() {
        console.log('🚀 Initializing Cross-Platform Tester...');
        this.browser = await puppeteer.launch({
            headless: false, // Set to true for CI/CD
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });
    }

    async testPlatform(config) {
        console.log(`\n🔍 Testing ${config.name}...`);
        
        const page = await this.browser.newPage();
        
        try {
            // Set user agent and viewport
            await page.setUserAgent(config.userAgent);
            await page.setViewport(config.viewport);
            
            // Navigate to test page
            const testPagePath = path.join(__dirname, 'test_responsive_design.html');
            await page.goto(`file://${testPagePath}`, { waitUntil: 'networkidle0' });
            
            // Wait for fonts to load
            await page.waitForFunction(() => {
                return document.fonts && document.fonts.ready;
            }, { timeout: 10000 });
            
            // Test header alignment
            const headerAlignment = await page.evaluate(() => {
                const header = document.querySelector('header');
                const logo = header.querySelector('.flex.items-center.space-x-3');
                const nav = header.querySelector('.hidden.lg\\:block');
                
                if (!logo || !nav) return { error: 'Elements not found' };
                
                const logoRect = logo.getBoundingClientRect();
                const navRect = nav.getBoundingClientRect();
                
                return {
                    logoTop: logoRect.top,
                    navTop: navRect.top,
                    logoHeight: logoRect.height,
                    navHeight: navRect.height,
                    verticalAlignment: Math.abs(logoRect.top - navRect.top),
                    centerAlignment: Math.abs(logoRect.top + logoRect.height/2 - navRect.top - navRect.height/2)
                };
            });
            
            // Test font rendering
            const fontRendering = await page.evaluate(() => {
                const dancingScript = document.querySelector('.font-dancing-script');
                const computedStyle = window.getComputedStyle(dancingScript);
                
                return {
                    fontFamily: computedStyle.fontFamily,
                    fontSize: computedStyle.fontSize,
                    fontWeight: computedStyle.fontWeight,
                    isDancingScript: computedStyle.fontFamily.includes('Dancing Script'),
                    textRendering: computedStyle.textRendering,
                    webkitFontSmoothing: computedStyle.webkitFontSmoothing
                };
            });
            
            // Test responsive design
            const responsiveDesign = await page.evaluate(() => {
                const heroTitle = document.querySelector('h1');
                const heroRect = heroTitle.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(heroTitle);
                
                return {
                    titleWidth: heroRect.width,
                    titleHeight: heroRect.height,
                    fontSize: computedStyle.fontSize,
                    lineHeight: computedStyle.lineHeight,
                    isVisible: heroRect.width > 0 && heroRect.height > 0
                };
            });
            
            // Test post-it note positioning
            const postItNote = await page.evaluate(() => {
                const postIt = document.querySelector('.absolute.top-\\[32\\%\\]');
                if (!postIt) return { error: 'Post-it note not found' };
                
                const rect = postIt.getBoundingClientRect();
                return {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    isVisible: rect.width > 0 && rect.height > 0
                };
            });
            
            // Take screenshot
            const screenshot = await page.screenshot({
                fullPage: true,
                type: 'png'
            });
            
            const result = {
                platform: config.name,
                userAgent: config.userAgent,
                viewport: config.viewport,
                headerAlignment,
                fontRendering,
                responsiveDesign,
                postItNote,
                screenshot: screenshot.toString('base64'),
                timestamp: new Date().toISOString()
            };
            
            this.results.push(result);
            console.log(`✅ ${config.name} test completed`);
            
            return result;
            
        } catch (error) {
            console.error(`❌ Error testing ${config.name}:`, error.message);
            this.results.push({
                platform: config.name,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        } finally {
            await page.close();
        }
    }

    async testResponsiveBreakpoints() {
        console.log('\n📱 Testing responsive breakpoints...');
        
        const page = await this.browser.newPage();
        
        try {
            const testPagePath = path.join(__dirname, 'test_responsive_design.html');
            
            for (const breakpoint of breakpoints) {
                console.log(`  Testing ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})...`);
                
                await page.setViewport(breakpoint);
                await page.goto(`file://${testPagePath}`, { waitUntil: 'networkidle0' });
                
                // Wait for fonts to load
                await page.waitForFunction(() => {
                    return document.fonts && document.fonts.ready;
                }, { timeout: 10000 });
                
                // Test layout at this breakpoint
                const layoutTest = await page.evaluate(() => {
                    const header = document.querySelector('header');
                    const hero = document.querySelector('section');
                    const title = document.querySelector('h1');
                    
                    return {
                        headerHeight: header.getBoundingClientRect().height,
                        heroHeight: hero.getBoundingClientRect().height,
                        titleFontSize: window.getComputedStyle(title).fontSize,
                        titleWidth: title.getBoundingClientRect().width,
                        titleHeight: title.getBoundingClientRect().height
                    };
                });
                
                // Take screenshot
                const screenshot = await page.screenshot({
                    fullPage: true,
                    type: 'png'
                });
                
                this.results.push({
                    platform: `Responsive - ${breakpoint.name}`,
                    breakpoint,
                    layoutTest,
                    screenshot: screenshot.toString('base64'),
                    timestamp: new Date().toISOString()
                });
            }
            
        } catch (error) {
            console.error('❌ Error testing responsive breakpoints:', error.message);
        } finally {
            await page.close();
        }
    }

    async runAllTests() {
        console.log('🎯 Starting Cross-Platform Tests...\n');
        
        await this.init();
        
        // Test each platform
        for (const config of testConfigs) {
            await this.testPlatform(config);
        }
        
        // Test responsive breakpoints
        await this.testResponsiveBreakpoints();
        
        // Generate report
        await this.generateReport();
        
        await this.browser.close();
        console.log('\n🎉 All tests completed!');
    }

    async generateReport() {
        console.log('\n📊 Generating test report...');
        
        const report = {
            summary: {
                totalTests: this.results.length,
                successfulTests: this.results.filter(r => !r.error).length,
                failedTests: this.results.filter(r => r.error).length,
                timestamp: new Date().toISOString()
            },
            results: this.results
        };
        
        // Save JSON report
        fs.writeFileSync(
            path.join(__dirname, 'cross_platform_test_report.json'),
            JSON.stringify(report, null, 2)
        );
        
        // Generate HTML report
        const htmlReport = this.generateHTMLReport(report);
        fs.writeFileSync(
            path.join(__dirname, 'cross_platform_test_report.html'),
            htmlReport
        );
        
        console.log('📄 Report saved: cross_platform_test_report.html');
    }

    generateHTMLReport(report) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cross-Platform Test Report</title>
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
        .screenshot { max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px; margin-top: 10px; }
        .details { margin-top: 10px; font-size: 0.9em; color: #666; }
        .platform-name { font-weight: bold; color: #333; }
        .error-message { color: #dc3545; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Cross-Platform Test Report</h1>
            <p>Generated on: ${new Date(report.summary.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="number">${report.summary.totalTests}</div>
            </div>
            <div class="summary-card">
                <h3>Successful</h3>
                <div class="number" style="color: #28a745;">${report.summary.successfulTests}</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div class="number" style="color: #dc3545;">${report.summary.failedTests}</div>
            </div>
        </div>
        
        <h2>Test Results</h2>
        ${report.results.map(result => `
            <div class="test-result ${result.error ? 'error' : 'success'}">
                <div class="platform-name">${result.platform}</div>
                ${result.error ? `
                    <div class="error-message">Error: ${result.error}</div>
                ` : `
                    <div class="details">
                        <strong>User Agent:</strong> ${result.userAgent || 'N/A'}<br>
                        <strong>Viewport:</strong> ${result.viewport ? `${result.viewport.width}x${result.viewport.height}` : 'N/A'}<br>
                        ${result.headerAlignment ? `
                            <strong>Header Alignment:</strong> Vertical: ${result.headerAlignment.verticalAlignment?.toFixed(2)}px, Center: ${result.headerAlignment.centerAlignment?.toFixed(2)}px<br>
                        ` : ''}
                        ${result.fontRendering ? `
                            <strong>Font Rendering:</strong> ${result.fontRendering.isDancingScript ? 'Dancing Script Loaded' : 'Font Not Loaded'}<br>
                        ` : ''}
                        ${result.responsiveDesign ? `
                            <strong>Title Size:</strong> ${result.responsiveDesign.fontSize}, Width: ${result.responsiveDesign.titleWidth?.toFixed(1)}px<br>
                        ` : ''}
                    </div>
                    ${result.screenshot ? `
                        <img src="data:image/png;base64,${result.screenshot}" class="screenshot" alt="Screenshot of ${result.platform}">
                    ` : ''}
                `}
            </div>
        `).join('')}
    </div>
</body>
</html>`;
    }
}

// Run the tests
if (require.main === module) {
    const tester = new CrossPlatformTester();
    tester.runAllTests().catch(console.error);
}

module.exports = CrossPlatformTester;
