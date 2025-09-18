#!/usr/bin/env node

/**
 * Test Personalized URLs
 * Verifies that personalized URLs are generated correctly
 */

const { getPersonalizedDealsUrl, getPendingDealsUrl, getUrlDebugInfo } = require('../utils/url-helper');

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function testPersonalizedUrls() {
  console.log(`${COLORS.bold}${COLORS.blue}🔗 Testing Personalized URL Generation${COLORS.reset}\n`);
  
  // Test with different environments
  const testCases = [
    { env: 'development', expected: 'http://localhost:3000' },
    { env: 'production', expected: 'https://cateredsavers.com' }
  ];
  
  for (const testCase of testCases) {
    console.log(`Testing ${testCase.env} environment:`);
    
    // Set environment
    process.env.NODE_ENV = testCase.env;
    delete process.env.BASE_URL; // Clear BASE_URL to test fallback
    
    const debugInfo = getUrlDebugInfo();
    const personalizedUrl = getPersonalizedDealsUrl('test-token-123');
    const pendingUrl = getPendingDealsUrl();
    
    console.log(`  NODE_ENV: ${debugInfo.NODE_ENV}`);
    console.log(`  BASE_URL: ${debugInfo.BASE_URL}`);
    console.log(`  Computed Base URL: ${debugInfo.computedBaseUrl}`);
    console.log(`  Personalized URL: ${personalizedUrl}`);
    console.log(`  Pending URL: ${pendingUrl}`);
    
    const isCorrect = personalizedUrl.includes(testCase.expected) && pendingUrl.includes(testCase.expected);
    
    if (isCorrect) {
      console.log(`  ${COLORS.green}✅ URLs are correct for ${testCase.env}${COLORS.reset}`);
    } else {
      console.log(`  ${COLORS.red}❌ URLs are incorrect for ${testCase.env}${COLORS.reset}`);
    }
    
    console.log('');
  }
  
  // Test with explicit BASE_URL
  console.log('Testing with explicit BASE_URL:');
  process.env.BASE_URL = 'https://custom-domain.com';
  process.env.NODE_ENV = 'development';
  
  const debugInfo = getUrlDebugInfo();
  const personalizedUrl = getPersonalizedDealsUrl('test-token-123');
  
  console.log(`  BASE_URL: ${debugInfo.BASE_URL}`);
  console.log(`  Computed Base URL: ${debugInfo.computedBaseUrl}`);
  console.log(`  Personalized URL: ${personalizedUrl}`);
  
  if (personalizedUrl.includes('https://custom-domain.com')) {
    console.log(`  ${COLORS.green}✅ Custom BASE_URL works correctly${COLORS.reset}`);
  } else {
    console.log(`  ${COLORS.red}❌ Custom BASE_URL not working${COLORS.reset}`);
  }
  
  console.log(`\n${COLORS.bold}📊 Summary:${COLORS.reset}`);
  console.log(`- Production URLs will use: https://cateredsavers.com`);
  console.log(`- Development URLs will use: http://localhost:3000`);
  console.log(`- Custom BASE_URL will override both`);
}

// Run the test
testPersonalizedUrls();
