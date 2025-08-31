// Weekly Email Automation Service
// Feeds fresh deal data to Mailchimp for automated weekly campaigns

const mailchimp = require('@mailchimp/mailchimp_marketing');
const db = require('./database');
const dealDiscovery = require('./deal-discovery-manager');

class WeeklyEmailAutomation {
  constructor() {
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER_PREFIX
    });
  }

  // Main weekly automation process
  async runWeeklyAutomation() {
    console.log('🚀 Starting weekly email automation...');
    
    try {
      // Step 1: Refresh deals in database
      console.log('📊 Step 1: Refreshing deals...');
      await this.refreshWeeklyDeals();
      
      // Step 2: Update Mailchimp with fresh deal data
      console.log('📧 Step 2: Updating Mailchimp with fresh data...');
      await this.updateMailchimpWithFreshDeals();
      
      // Step 3: Trigger weekly campaign
      console.log('🎯 Step 3: Triggering weekly campaign...');
      await this.triggerWeeklyCampaign();
      
      console.log('✅ Weekly automation completed successfully!');
      return { success: true, message: 'Weekly automation completed' };
      
    } catch (error) {
      console.error('❌ Weekly automation failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Step 1: Refresh deals in our database
  async refreshWeeklyDeals() {
    console.log('🔄 Running deal discovery to find fresh deals...');
    
    // Run our deal discovery system to find new deals
    const discoveryStats = await dealDiscovery.runDiscovery();
    console.log('📈 Discovery stats:', discoveryStats);
    
    // Mark old deals as inactive (optional - you might want to keep them)
    // await this.markOldDealsInactive();
    
    return discoveryStats;
  }

  // Step 2: Update Mailchimp with fresh deal data
  async updateMailchimpWithFreshDeals() {
    console.log('📧 Updating Mailchimp with fresh deal data...');
    
    // Get fresh deals from our database
    const freshDeals = await this.getFreshDealsForMailchimp();
    
    // Update Mailchimp merge fields with deal data
    await this.updateMailchimpMergeFields(freshDeals);
    
    // Update user tokens for personalized links
    await this.updateUserTokensInMailchimp();
    
    return freshDeals;
  }

  // Get fresh deals formatted for Mailchimp
  async getFreshDealsForMailchimp() {
    const categories = await db.getAllCategories();
    const sponsoredProducts = await db.getActiveSponsoredProducts(4);
    
    // Format deals for Mailchimp merge fields
    const mailchimpDeals = {};
    
    categories.forEach(category => {
      const activeDeals = category.retailers.filter(retailer => 
        retailer.hasActiveSale || retailer.description.includes('✅')
      );
      
      if (activeDeals.length > 0) {
        mailchimpDeals[category.slug] = {
          name: category.name,
          deals: activeDeals.slice(0, 3).map(retailer => ({
            name: retailer.name,
            url: retailer.url,
            description: retailer.description,
            discount: retailer.salePercentage || '50%+'
          }))
        };
      }
    });
    
    return {
      categories: mailchimpDeals,
      sponsoredProducts: sponsoredProducts.map(product => ({
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100),
        url: product.affiliateUrl,
        image: product.imageUrl
      }))
    };
  }

  // Update Mailchimp merge fields with deal data
  async updateMailchimpMergeFields(deals) {
    console.log('🔄 Updating Mailchimp merge fields...');
    
    try {
      // Create merge fields for each category
      const mergeFields = [
        { name: 'FRESH_DEALS', type: 'text', tag: 'FRESH_DEALS' },
        { name: 'SPONSORED_PRODUCTS', type: 'text', tag: 'SPONSORED_PRODUCTS' }
      ];
      
      for (const field of mergeFields) {
        try {
          await mailchimp.lists.addListMergeField(process.env.MAILCHIMP_LIST_ID, field);
          console.log(`✅ Added merge field: ${field.name}`);
        } catch (error) {
          if (error.status === 400 && error.title === 'Member Exists') {
            console.log(`ℹ️ Merge field ${field.name} already exists`);
          } else {
            console.error(`❌ Error adding merge field ${field.name}:`, error.message);
          }
        }
      }
      
      // Update the list with fresh deal data
      await this.updateListWithDealData(deals);
      
    } catch (error) {
      console.error('❌ Error updating Mailchimp merge fields:', error);
      throw error;
    }
  }

  // Update Mailchimp list with fresh deal data
  async updateListWithDealData(deals) {
    console.log('📊 Updating Mailchimp list with fresh deal data...');
    
    // Convert deals to JSON string for Mailchimp merge field
    const dealsJson = JSON.stringify(deals);
    
    // Update list settings with fresh deal data
    try {
      await mailchimp.lists.updateList(process.env.MAILCHIMP_LIST_ID, {
        campaign_defaults: {
          from_name: 'Catered Savers',
          from_email: 'deals@cateredsavers.com',
          subject: 'Your Weekly Deals - {{FRESH_DEALS}}',
          language: 'en'
        }
      });
      
      console.log('✅ Updated Mailchimp list with fresh deal data');
    } catch (error) {
      console.error('❌ Error updating Mailchimp list:', error);
    }
  }

  // Update user tokens in Mailchimp for personalized links
  async updateUserTokensInMailchimp() {
    console.log('🔑 Updating user tokens in Mailchimp...');
    
    try {
      // Get all users from our database
      const users = await db.getAllUsers();
      
      for (const user of users) {
        if (user.email && user.accessToken) {
          try {
            // Update user in Mailchimp with their personalized deal link
            const personalizedUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/deals/${user.accessToken}`;
            
            await mailchimp.lists.updateListMember(process.env.MAILCHIMP_LIST_ID, user.email, {
              merge_fields: {
                PERSONALIZ: personalizedUrl,
                USER_NAME: user.name || 'Deal Seeker'
              }
            });
            
            console.log(`✅ Updated Mailchimp member: ${user.email}`);
          } catch (error) {
            console.error(`❌ Error updating user ${user.email}:`, error.message);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Error updating user tokens:', error);
    }
  }

  // Step 3: Trigger weekly campaign in Mailchimp
  async triggerWeeklyCampaign() {
    console.log('🎯 Triggering weekly campaign in Mailchimp...');
    
    try {
      // Create a new campaign
      const campaign = await mailchimp.campaigns.create({
        type: 'regular',
        recipients: {
          list_id: process.env.MAILCHIMP_LIST_ID
        },
        settings: {
          subject_line: 'Your Weekly Deals - Fresh 50%+ Off Savings!',
          from_name: 'Catered Savers',
          reply_to: 'deals@cateredsavers.com',
          template_id: await this.getWeeklyTemplateId()
        }
      });
      
      console.log(`✅ Created campaign: ${campaign.id}`);
      
      // Send the campaign
      await mailchimp.campaigns.send(campaign.id);
      console.log(`🚀 Campaign sent successfully: ${campaign.id}`);
      
      return campaign;
      
    } catch (error) {
      console.error('❌ Error triggering campaign:', error);
      throw error;
    }
  }

  // Get or create weekly email template
  async getWeeklyTemplateId() {
    console.log('📧 Getting weekly email template...');
    
    try {
      // Get existing templates
      const templates = await mailchimp.templates.list();
      
      // Look for existing weekly template
      let weeklyTemplate = templates.templates.find(t => t.name === 'Weekly Deals Template');
      
      if (!weeklyTemplate) {
        // Create new weekly template
        weeklyTemplate = await mailchimp.templates.create({
          name: 'Weekly Deals Template',
          html: this.getWeeklyEmailTemplate()
        });
        console.log('✅ Created new weekly template');
      } else {
        console.log('✅ Using existing weekly template');
      }
      
      return weeklyTemplate.id;
      
    } catch (error) {
      console.error('❌ Error with template:', error);
      throw error;
    }
  }

  // Weekly email template HTML
  getWeeklyEmailTemplate() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Your Weekly Deals</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; text-align: center; }
            .deal-card { background: #f8f9fa; border: 1px solid #e9ecef; padding: 15px; margin: 10px 0; border-radius: 8px; }
            .cta-button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }
            .sponsored { background: #fff3cd; border-color: #ffeaa7; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎯 Your Weekly Deals</h1>
                <p>Hi {{USER_NAME}}! Here are your personalized 50%+ off deals</p>
            </div>
            
            <h2>🔥 This Week's Featured Deals</h2>
            <p>Based on your preferences, we've found these amazing deals just for you:</p>
            
            <!-- Dynamic content will be populated by Mailchimp -->
            <div class="deal-card">
                <h3>🎁 Featured Deal</h3>
                <p>Check out this week's top deals in your categories!</p>
                <a href="{{PERSONALIZ}}" class="cta-button">View All Your Deals</a>
            </div>
            
            <h2>⭐ Sponsored Products</h2>
            <div class="deal-card sponsored">
                <h3>Hand-picked for you</h3>
                <p>These products are specially selected by our retail partners</p>
                <a href="{{PERSONALIZ}}" class="cta-button">Shop Sponsored Products</a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p><strong>Catered Savers</strong><br>
                Your personalized deal source for 50%+ off savings</p>
                <p><a href="{{PERSONALIZ}}">View Your Personalized Deals</a></p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Get automation status
  async getAutomationStatus() {
    try {
      const listInfo = await mailchimp.lists.getList(process.env.MAILCHIMP_LIST_ID);
      const recentCampaigns = await mailchimp.campaigns.list({ count: 5 });
      
      return {
        listMembers: listInfo.stats.member_count,
        recentCampaigns: recentCampaigns.campaigns.length,
        lastCampaign: recentCampaigns.campaigns[0]?.send_time || 'Never',
        status: 'Ready for weekly automation'
      };
    } catch (error) {
      return {
        status: 'Error',
        error: error.message
      };
    }
  }
}

module.exports = new WeeklyEmailAutomation();
