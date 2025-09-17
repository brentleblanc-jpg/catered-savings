#!/usr/bin/env node

/**
 * Version Test Script
 * Automatically tests that the correct version is being served
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class VersionTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runTests() {
    console.log(`${COLORS.bold}${COLORS.blue}🧪 Running Version Tests${COLORS.reset}\n`);
    
    await this.testVersionCheckAPI();
    await this.testMainPageFiles();
    await this.testFileStructure();
    await this.testFeaturedDealsAPI();
    
    this.printResults();
  }

  async testVersionCheckAPI() {
    console.log('📡 Testing version check API...');
    
    try {
      const response = await this.makeRequest('/api/version-check');
      const data = JSON.parse(response);
      
      if (data.status === 'valid') {
        this.addResult('Version Check API', true, 'API returns valid status');
      } else {
        this.addResult('Version Check API', false, `API returns invalid status: ${JSON.stringify(data.details)}`);
      }
    } catch (error) {
      this.addResult('Version Check API', false, `API request failed: ${error.message}`);
    }
  }

  async testMainPageFiles() {
    console.log('📄 Testing main page file references...');
    
    try {
      const response = await this.makeRequest('/');
      const html = response;
      
      const hasModernCSS = html.includes('styles-modern.css');
      const hasModernJS = html.includes('script-modern.js');
      const hasVersionCheck = html.includes('version-check.js');
      const hasOldCSS = html.includes('styles.css');
      const hasOldJS = html.includes('script.js');
      
      if (hasModernCSS && hasModernJS && hasVersionCheck && !hasOldCSS && !hasOldJS) {
        this.addResult('Main Page Files', true, 'Correct files referenced');
      } else {
        this.addResult('Main Page Files', false, 
          `CSS: ${hasModernCSS ? '✅' : '❌'} modern, ${hasOldCSS ? '❌' : '✅'} old | ` +
          `JS: ${hasModernJS ? '✅' : '❌'} modern, ${hasOldJS ? '❌' : '✅'} old | ` +
          `Version Check: ${hasVersionCheck ? '✅' : '❌'}`
        );
      }
    } catch (error) {
      this.addResult('Main Page Files', false, `Failed to fetch main page: ${error.message}`);
    }
  }

  async testFileStructure() {
    console.log('📁 Testing file structure...');
    
    const requiredFiles = [
      'public/index.html',
      'public/index-old.html',
      'public/styles-modern.css',
      'public/script-modern.js',
      'public/version-check.js'
    ];
    
    const forbiddenFiles = [
      'public/index-modern.html'
    ];
    
    let allGood = true;
    let message = '';
    
    // Check required files exist
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        allGood = false;
        message += `Missing: ${file} | `;
      }
    }
    
    // Check forbidden files don't exist
    for (const file of forbiddenFiles) {
      if (fs.existsSync(file)) {
        allGood = false;
        message += `Should not exist: ${file} | `;
      }
    }
    
    if (allGood) {
      this.addResult('File Structure', true, 'All files in correct locations');
    } else {
      this.addResult('File Structure', false, message);
    }
  }

  async testFeaturedDealsAPI() {
    console.log('🎯 Testing featured deals API...');
    
    try {
      const response = await this.makeRequest('/api/featured-deals');
      const data = JSON.parse(response);
      
      if (data.success && Array.isArray(data.deals)) {
        this.addResult('Featured Deals API', true, `API returns ${data.deals.length} deals`);
      } else {
        this.addResult('Featured Deals API', false, 'API response invalid');
      }
    } catch (error) {
      this.addResult('Featured Deals API', false, `API request failed: ${error.message}`);
    }
  }

  makeRequest(path) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, BASE_URL);
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'GET',
        timeout: 5000
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      req.end();
    });
  }

  addResult(testName, passed, message) {
    this.results.tests.push({ testName, passed, message });
    if (passed) {
      this.results.passed++;
      console.log(`  ${COLORS.green}✅${COLORS.reset} ${testName}: ${message}`);
    } else {
      this.results.failed++;
      console.log(`  ${COLORS.red}❌${COLORS.reset} ${testName}: ${message}`);
    }
  }

  printResults() {
    console.log(`\n${COLORS.bold}📊 Test Results:${COLORS.reset}`);
    console.log(`  ${COLORS.green}Passed: ${this.results.passed}${COLORS.reset}`);
    console.log(`  ${COLORS.red}Failed: ${this.results.failed}${COLORS.reset}`);
    
    if (this.results.failed === 0) {
      console.log(`\n${COLORS.green}${COLORS.bold}🎉 All tests passed! Version is correct.${COLORS.reset}`);
      process.exit(0);
    } else {
      console.log(`\n${COLORS.red}${COLORS.bold}⚠️  Some tests failed. Check the issues above.${COLORS.reset}`);
      process.exit(1);
    }
  }
}

// Run tests
const tester = new VersionTester();
tester.runTests().catch(error => {
  console.error(`${COLORS.red}Test runner error:${COLORS.reset}`, error);
  process.exit(1);
});