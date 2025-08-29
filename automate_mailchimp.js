const mailchimp = require('@mailchimp/mailchimp_marketing');
const categoriesData = require('./data/categories');
require('dotenv').config();

// Configure Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX
});

// Function to sync categories as Mailchimp tags
async function syncCategoriesToMailchimp() {
  try {
    console.log('🔄 Syncing categories to Mailchimp...');
    
    // Get all categories from your data
    const categories = Object.keys(categoriesData);
    
    for (const category of categories) {
      try {
        // Create tag if it doesn't exist
        await mailchimp.lists.createSegment(process.env.MAILCHIMP_LIST_ID, {
          name: categoriesData[category].name,
          static_segment: []
        });
        console.log(`✅ Created tag: ${categoriesData[category].name}`);
      } catch (error) {
        if (error.response?.body?.title === 'Member Exists') {
          console.log(`ℹ️ Tag already exists: ${categoriesData[category].name}`);
        } else {
          console.log(`⚠️ Could not create tag ${categoriesData[category].name}:`, error.message);
        }
      }
    }
    
    console.log('🎯 Category sync completed!');
    
  } catch (error) {
    console.error('❌ Error syncing categories:', error);
  }
}

// Function to create automated email templates
async function createEmailTemplates() {
  try {
    console.log('📧 Creating email templates...');
    
    // Create welcome email template
    const welcomeTemplate = generateWelcomeTemplate();
    console.log('✅ Welcome email template generated');
    console.log('📋 Copy this HTML to Mailchimp:');
    console.log('='.repeat(50));
    console.log(welcomeTemplate);
    console.log('='.repeat(50));
    
    // Create weekly digest template
    const digestTemplate = generateWeeklyDigestTemplate();
    console.log('✅ Weekly digest template generated');
    console.log('📋 Copy this HTML to Mailchimp:');
    console.log('='.repeat(50));
    console.log(digestTemplate);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error creating templates:', error);
  }
}

// Function to generate welcome email template
function generateWelcomeTemplate() {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea; text-align: center;">Welcome to Catered Savers! 🎉</h2>
      
      <p>Hi *|FNAME|*,</p>
      
      <p>Thank you for signing up for Catered Savers! Here are your personalized deal sources with 50%+ savings:</p>
      
      <!-- This will be dynamically populated by Mailchimp based on subscriber tags -->
      <div mc:edit="personalized_content">
        <p>Your personalized content will appear here based on your selected categories.</p>
      </div>
      
      <p><strong>Coming Next Week:</strong> Your first curated deal digest featuring 50%+ off deals from these sources!</p>
      
      <p>Happy saving! 💰</p>
      
      <p>Best regards,<br>The Catered Savers Team</p>
    </div>
  `;
}

// Function to generate weekly digest template
function generateWeeklyDigestTemplate() {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea; text-align: center;">🔥 This Week's Hottest Deals!</h2>
      
      <p>Hi *|FNAME|*,</p>
      
      <p>Here are the latest 50%+ off deals from your favorite categories this week:</p>
      
      <!-- Dynamic content based on subscriber preferences -->
      <div mc:edit="weekly_deals">
        <p>Your weekly deals will appear here based on your category preferences.</p>
      </div>
      
      <p><strong>Next Digest:</strong> Coming in 7 days with fresh deals from your categories!</p>
      
      <p>Happy saving! 💰</p>
      
      <p>Best regards,<br>The Catered Savers Team</p>
    </div>
  `;
}

// Function to send automated weekly digest
async function sendAutomatedWeeklyDigest() {
  try {
    console.log('📤 Sending automated weekly digest...');
    
    // Get all subscribers
    const subscribers = await mailchimp.lists.getListMembersInfo(process.env.MAILCHIMP_LIST_ID);
    
    console.log(`📊 Found ${subscribers.members.length} subscribers`);
    
    // Group subscribers by category tags
    const categoryGroups = {};
    
    subscribers.members.forEach(subscriber => {
      if (subscriber.tags && subscriber.tags.length > 0) {
        subscriber.tags.forEach(tag => {
          if (tag.status === 'active') {
            if (!categoryGroups[tag.name]) {
              categoryGroups[tag.name] = [];
            }
            categoryGroups[tag.name].push(subscriber.email_address);
          }
        });
      }
    });
    
    console.log('📋 Category groups:', Object.keys(categoryGroups));
    
    // For each category, you can now send targeted campaigns
    for (const [category, emails] of Object.entries(categoryGroups)) {
      console.log(`📧 Category "${category}": ${emails.length} subscribers`);
      
      // Here you would trigger Mailchimp campaigns
      // You can use Mailchimp's API to create and send campaigns
      console.log(`💡 To send to ${category}: Create campaign targeting tag "${category}"`);
    }
    
    console.log('✅ Weekly digest analysis completed!');
    console.log('💡 Use Mailchimp dashboard to send campaigns to these segments');
    
  } catch (error) {
    console.error('❌ Error sending weekly digest:', error);
  }
}

// Function to create Mailchimp segments for each category
async function createCategorySegments() {
  try {
    console.log('🏷️ Creating category segments...');
    
    for (const [categoryKey, categoryInfo] of Object.entries(categoriesData)) {
      try {
        // Create segment for this category
        await mailchimp.lists.createSegment(process.env.MAILCHIMP_LIST_ID, {
          name: categoryInfo.name,
          static_segment: []
        });
        
        console.log(`✅ Created segment: ${categoryInfo.name}`);
        
      } catch (error) {
        if (error.response?.body?.title === 'Member Exists') {
          console.log(`ℹ️ Segment already exists: ${categoryInfo.name}`);
        } else {
          console.log(`⚠️ Could not create segment ${categoryInfo.name}:`, error.message);
        }
      }
    }
    
    console.log('🎯 Category segments created!');
    
  } catch (error) {
    console.error('❌ Error creating segments:', error);
  }
}

// Main automation function
async function runAutomation() {
  console.log('🚀 Starting Mailchimp automation...');
  
  try {
    // Step 1: Sync categories
    await syncCategoriesToMailchimp();
    
    // Step 2: Create category segments
    await createCategorySegments();
    
    // Step 3: Generate email templates
    await createEmailTemplates();
    
    // Step 4: Analyze subscriber data
    await sendAutomatedWeeklyDigest();
    
    console.log('🎉 Automation completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Copy the HTML templates above into Mailchimp');
    console.log('2. Create campaigns targeting specific category segments');
    console.log('3. Set up automated sending schedules');
    console.log('4. Use Mailchimp\'s merge tags for personalization');
    
  } catch (error) {
    console.error('❌ Automation failed:', error);
  }
}

// Export functions for use in other scripts
module.exports = {
  syncCategoriesToMailchimp,
  createEmailTemplates,
  sendAutomatedWeeklyDigest,
  createCategorySegments,
  runAutomation
};

// Run automation if this file is executed directly
if (require.main === module) {
  runAutomation();
}
