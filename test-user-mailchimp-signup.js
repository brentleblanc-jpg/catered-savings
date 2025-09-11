/**
 * Test User Signup to Mailchimp
 * This simulates a user signing up and tests the Mailchimp integration
 */

require('dotenv').config();
const mailchimp = require('@mailchimp/mailchimp_marketing');

async function testUserSignupToMailchimp() {
  console.log('🧪 Testing User Signup to Mailchimp...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`   MAILCHIMP_API_KEY: ${process.env.MAILCHIMP_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   MAILCHIMP_SERVER: ${process.env.MAILCHIMP_SERVER || '❌ Missing'}`);
  console.log(`   MAILCHIMP_LIST_ID: ${process.env.MAILCHIMP_LIST_ID ? '✅ Set' : '❌ Missing'}\n`);
  
  if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_SERVER || !process.env.MAILCHIMP_LIST_ID) {
    console.log('❌ Missing required environment variables');
    return;
  }
  
  // Configure Mailchimp
  mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER
  });
  
  // Test user data
  const testUser = {
    email: `test-user-${Date.now()}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    categories: ['tech-electronics', 'home-garden']
  };
  
  console.log('👤 Test User Data:');
  console.log(`   Email: ${testUser.email}`);
  console.log(`   Name: ${testUser.firstName} ${testUser.lastName}`);
  console.log(`   Categories: ${testUser.categories.join(', ')}\n`);
  
  try {
    // Test 1: Check if list exists
    console.log('📧 Step 1: Checking Mailchimp List...');
    const list = await mailchimp.lists.getList(process.env.MAILCHIMP_LIST_ID);
    console.log('✅ List found:');
    console.log(`   Name: ${list.name}`);
    console.log(`   Member Count: ${list.stats.member_count}\n`);
    
    // Test 2: Add user to Mailchimp
    console.log('👤 Step 2: Adding user to Mailchimp...');
    const memberData = {
      email_address: testUser.email,
      status: 'subscribed',
      merge_fields: {
        FNAME: testUser.firstName,
        LNAME: testUser.lastName,
        CATEGORIES: testUser.categories.join(', ')
      },
      tags: testUser.categories
    };
    
    const result = await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID, memberData);
    console.log('✅ User added successfully:');
    console.log(`   Email: ${result.email_address}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   ID: ${result.id}\n`);
    
    // Test 3: Verify user was added
    console.log('🔍 Step 3: Verifying user in list...');
    const member = await mailchimp.lists.getListMember(process.env.MAILCHIMP_LIST_ID, result.id);
    console.log('✅ User verified:');
    console.log(`   Email: ${member.email_address}`);
    console.log(`   Status: ${member.status}`);
    console.log(`   First Name: ${member.merge_fields.FNAME}`);
    console.log(`   Last Name: ${member.merge_fields.LNAME}`);
    console.log(`   Categories: ${member.merge_fields.CATEGORIES}\n`);
    
    // Test 4: Check updated list stats
    console.log('📊 Step 4: Checking updated list stats...');
    const updatedList = await mailchimp.lists.getList(process.env.MAILCHIMP_LIST_ID);
    console.log('✅ Updated list stats:');
    console.log(`   Member Count: ${updatedList.stats.member_count}\n`);
    
    console.log('🎉 All tests passed! User signup to Mailchimp is working correctly.');
    console.log(`💡 Test user email: ${testUser.email}`);
    console.log('💡 You can delete this test user from Mailchimp if needed.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.status === 400 && error.response?.body?.title === 'Member Exists') {
      console.log('💡 This email already exists in the list. Try running the test again.');
    } else if (error.status === 401) {
      console.log('💡 API key is invalid or expired.');
    } else if (error.status === 404) {
      console.log('💡 List ID is incorrect or list doesn\'t exist.');
    }
  }
}

// Run the test
testUserSignupToMailchimp().catch(console.error);
