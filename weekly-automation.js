#!/usr/bin/env node

// Weekly Email Automation Script
// This script can be run manually or scheduled with cron for weekly automation

const weeklyAutomation = require('./services/weekly-email-automation');

async function runWeeklyAutomation() {
  console.log('🚀 Starting Weekly Email Automation...');
  console.log('📅 Date:', new Date().toISOString());
  console.log('=' .repeat(50));
  
  try {
    const result = await weeklyAutomation.runWeeklyAutomation();
    
    if (result.success) {
      console.log('✅ Weekly automation completed successfully!');
      console.log('📧 Emails sent to all subscribers');
      console.log('🔄 Fresh deals updated in database');
      console.log('📊 Mailchimp updated with new data');
    } else {
      console.error('❌ Weekly automation failed:', result.error);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Fatal error in weekly automation:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runWeeklyAutomation();
}

module.exports = { runWeeklyAutomation };
