#!/usr/bin/env node

/**
 * Check BASE_URL Configuration
 * Verifies that BASE_URL is set correctly for production
 */

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function checkBaseUrl() {
  console.log(`${COLORS.bold}${COLORS.blue}🔍 Checking BASE_URL Configuration${COLORS.reset}\n`);
  
  const baseUrl = process.env.BASE_URL;
  const nodeEnv = process.env.NODE_ENV;
  
  console.log(`Environment: ${nodeEnv || 'development'}`);
  console.log(`BASE_URL: ${baseUrl || 'NOT SET'}`);
  
  if (!baseUrl) {
    console.log(`\n${COLORS.red}❌ BASE_URL is not set!${COLORS.reset}`);
    console.log(`This will cause personalized email links to use localhost instead of production URL.`);
    console.log(`\n${COLORS.yellow}To fix this:${COLORS.reset}`);
    console.log(`1. Set BASE_URL environment variable in Railway dashboard`);
    console.log(`2. For production: BASE_URL=https://cateredsavers.com`);
    console.log(`3. For local development: BASE_URL=http://localhost:3000`);
    return false;
  }
  
  if (nodeEnv === 'production' && baseUrl.includes('localhost')) {
    console.log(`\n${COLORS.red}❌ Production environment using localhost URL!${COLORS.reset}`);
    console.log(`BASE_URL should be https://cateredsavers.com for production`);
    return false;
  }
  
  if (nodeEnv === 'production' && baseUrl === 'https://cateredsavers.com') {
    console.log(`\n${COLORS.green}✅ BASE_URL is correctly configured for production!${COLORS.reset}`);
    return true;
  }
  
  console.log(`\n${COLORS.green}✅ BASE_URL is set: ${baseUrl}${COLORS.reset}`);
  return true;
}

// Run the check
const isValid = checkBaseUrl();

if (!isValid) {
  process.exit(1);
} else {
  process.exit(0);
}
