/**
 * Test Mailchimp Connection
 * Run this to verify your Railway environment variables are working
 */

require('dotenv').config();
const mailchimp = require('@mailchimp/mailchimp_marketing');

async function testMailchimpConnection() {
  console.log('🧪 Testing Mailchimp Connection...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`   MAILCHIMP_API_KEY: ${process.env.MAILCHIMP_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   MAILCHIMP_SERVER: ${process.env.MAILCHIMP_SERVER || '❌ Missing'}`);
  console.log(`   MAILCHIMP_LIST_ID: ${process.env.MAILCHIMP_LIST_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}\n`);
  
  // Configure Mailchimp
  if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_SERVER) {
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER
    });
    
    try {
      // Test API connection
      console.log('🔗 Testing API Connection...');
      const response = await mailchimp.ping.get();
      console.log('✅ Mailchimp API Connection: SUCCESS');
      console.log(`   Health Check: ${response.health_status}\n`);
      
      // Test list access
      if (process.env.MAILCHIMP_LIST_ID) {
        console.log('📧 Testing List Access...');
        const list = await mailchimp.lists.getList(process.env.MAILCHIMP_LIST_ID);
        console.log('✅ List Access: SUCCESS');
        console.log(`   List Name: ${list.name}`);
        console.log(`   Member Count: ${list.stats.member_count}`);
        console.log(`   List ID: ${list.id}\n`);
      }
      
      console.log('🎉 All tests passed! Mailchimp is properly configured.');
      
    } catch (error) {
      console.error('❌ Mailchimp Test Failed:', error.message);
      
      if (error.status === 401) {
        console.log('💡 This usually means your API key is invalid or expired.');
      } else if (error.status === 404) {
        console.log('💡 This usually means your List ID is incorrect.');
      }
    }
  } else {
    console.log('❌ Missing required environment variables');
    console.log('💡 Make sure to set MAILCHIMP_API_KEY and MAILCHIMP_SERVER in Railway');
  }
}

// Run the test
testMailchimpConnection().catch(console.error);
