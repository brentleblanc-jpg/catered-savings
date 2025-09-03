const mailchimp = require('@mailchimp/mailchimp_marketing');
require('dotenv').config();

// Configure Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER,
});

async function testMailchimpFields() {
  try {
    console.log('🔍 Testing Mailchimp configuration...');
    
    // Get list information
    const listInfo = await mailchimp.lists.getList(process.env.MAILCHIMP_LIST_ID);
    console.log('📋 List Info:');
    console.log('  Name:', listInfo.name);
    console.log('  ID:', listInfo.id);
    console.log('  Member Count:', listInfo.stats.member_count);
    
    // Get merge fields
    const mergeFields = await mailchimp.lists.getAllMergeFields(process.env.MAILCHIMP_LIST_ID);
    console.log('\n🏷️  Available Merge Fields:');
    mergeFields.merge_fields.forEach(field => {
      console.log(`  - ${field.tag}: ${field.name} (${field.type})`);
    });
    
    // Test adding a member with different field names
    const testEmail = `test-merge-${Date.now()}@example.com`;
    console.log(`\n🧪 Testing member creation with email: ${testEmail}`);
    
    try {
      const response = await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
        email_address: testEmail,
        status: 'subscribed',
        merge_fields: {
          FNAME: 'Test',
          PERSONALIZ: 'https://cateredsavers.com/deals?token=test123'
        }
      });
      
      console.log('✅ Member created successfully!');
      console.log('  Mailchimp ID:', response.id);
      console.log('  Status:', response.status);
      
      // Clean up - delete the test member
      await mailchimp.lists.deleteListMember(process.env.MAILCHIMP_LIST_ID, response.id);
      console.log('🗑️  Test member deleted');
      
    } catch (error) {
      console.error('❌ Member creation failed:');
      console.error('  Status:', error.status);
      console.error('  Title:', error.response?.body?.title);
      console.error('  Detail:', error.response?.body?.detail);
      console.error('  Errors:', error.response?.body?.errors);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response?.body) {
      console.error('Response body:', error.response.body);
    }
  }
}

testMailchimpFields();
