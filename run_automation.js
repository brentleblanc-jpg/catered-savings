#!/usr/bin/env node

const { runAutomation } = require('./automate_mailchimp');

console.log('🎯 Catered Savers - Mailchimp Automation Tool');
console.log('='.repeat(50));

// Check if environment variables are set
if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_SERVER_PREFIX || !process.env.MAILCHIMP_LIST_ID) {
  console.error('❌ Missing required environment variables!');
  console.log('Please check your .env file contains:');
  console.log('- MAILCHIMP_API_KEY');
  console.log('- MAILCHIMP_SERVER_PREFIX');
  console.log('- MAILCHIMP_LIST_ID');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('🚀 Starting automation...\n');

// Run the automation
runAutomation()
  .then(() => {
    console.log('\n🎉 Automation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Automation failed:', error);
    process.exit(1);
  });
