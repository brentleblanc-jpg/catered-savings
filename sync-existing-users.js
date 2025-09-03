const mailchimp = require('@mailchimp/mailchimp_marketing');
const { PrismaClient } = require('@prisma/client');

require('dotenv').config();

const prisma = new PrismaClient();

// Configure Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER,
});

async function syncExistingUsers() {
  try {
    console.log('🔄 Syncing existing users to Mailchimp...');
    
    // Find users with pending Mailchimp status
    const pendingUsers = await prisma.user.findMany({
      where: {
        mailchimpStatus: 'pending'
      }
    });

    console.log(`📊 Found ${pendingUsers.length} users with pending Mailchimp status`);

    for (const user of pendingUsers) {
      try {
        console.log(`\n📧 Syncing user: ${user.email}`);
        
        // Parse preferences
        const preferences = JSON.parse(user.preferences || '[]');
        
        // Create member data
        const memberData = {
          email_address: user.email,
          status: 'subscribed',
          merge_fields: {
            FNAME: user.name || '',
            LNAME: ''
          },
          tags: preferences
        };

        // Add to Mailchimp
        const response = await mailchimp.lists.addListMember(
          process.env.MAILCHIMP_LIST_ID,
          memberData
        );

        console.log(`✅ Successfully synced ${user.email} to Mailchimp`);
        console.log(`   Mailchimp ID: ${response.id}`);

        // Update user status in database
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            mailchimpStatus: 'subscribed',
            mailchimpId: response.id
          }
        });

        console.log(`✅ Updated database status for ${user.email}`);

      } catch (error) {
        if (error.status === 400 && error.response?.body?.title === 'Member Exists') {
          console.log(`⚠️  User ${user.email} already exists in Mailchimp`);
          
          // Update status to subscribed
          await prisma.user.update({
            where: { id: user.id },
            data: { mailchimpStatus: 'subscribed' }
          });
          
          console.log(`✅ Updated database status for ${user.email}`);
        } else {
          console.error(`❌ Failed to sync ${user.email}:`, error.message);
        }
      }
    }

    console.log('\n🎉 Sync completed!');
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncExistingUsers();
