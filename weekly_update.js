const mailchimp = require('@mailchimp/mailchimp_marketing');
const categoriesData = require('./data/categories');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configure Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER
});

// Function to generate weekly deal digest with current data
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

// Function to generate category-specific deal templates
function generateCategoryDealTemplate(categoryKey, categoryInfo) {
  let template = `
    <div style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 12px; border: 2px solid #e5e7eb;">
      <h3 style="color: #1a1a1a; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-bottom: 20px;">
        ${categoryInfo.name} - This Week's Deals
      </h3>
      <p style="color: #6b7280; margin-bottom: 20px;">${categoryInfo.description}</p>
  `;
  
  // Add all companies for this category
  categoryInfo.companies.forEach(company => {
    const affiliateBadge = company.affiliate ? 
      ' <span style="background: #ffd700; color: #1a1a1a; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem;">Affiliate</span>' : '';
    
    template += `
      <div style="margin: 15px 0; padding: 15px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
        <h4 style="margin: 0 0 8px 0;">
          <a href="${company.url}" style="color: #667eea; text-decoration: none;">${company.name}</a>${affiliateBadge}
        </h4>
        <p style="margin: 0; color: #6b7280;">${company.description}</p>
      </div>
    `;
  });
  
  template += `</div>`;
  return template;
}

// Function to show weekly update summary
function showWeeklyUpdateSummary() {
  console.log('📊 WEEKLY UPDATE SUMMARY');
  console.log('='.repeat(50));
  
  let totalCompanies = 0;
  let totalAffiliate = 0;
  
  Object.entries(categoriesData).forEach(([key, category]) => {
    const companyCount = category.companies.length;
    const affiliateCount = category.companies.filter(c => c.affiliate).length;
    
    totalCompanies += companyCount;
    totalAffiliate += affiliateCount;
    
    console.log(`📁 ${category.name}: ${companyCount} companies (${affiliateCount} affiliate)`);
  });
  
  console.log('='.repeat(50));
  console.log(`📈 Total: ${totalCompanies} companies across ${Object.keys(categoriesData).length} categories`);
  console.log(`💰 Affiliate: ${totalAffiliate} companies`);
  console.log(`📅 Last Updated: ${new Date().toLocaleDateString()}`);
}

// Function to generate all email templates
function generateAllTemplates() {
  console.log('\n📧 GENERATING EMAIL TEMPLATES');
  console.log('='.repeat(50));
  
  // Generate weekly digest template
  const weeklyDigest = generateWeeklyDigestTemplate();
  console.log('✅ Weekly Digest Template Generated');
  
  // Generate category-specific templates
  Object.entries(categoriesData).forEach(([key, category]) => {
    const categoryTemplate = generateCategoryDealTemplate(key, category);
    console.log(`✅ ${category.name} Template Generated`);
    
    // Save individual category templates
    const fileName = `templates/${key}-template.html`;
    const dir = path.dirname(fileName);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fileName, categoryTemplate);
  });
  
  // Save weekly digest template
  const weeklyFileName = 'templates/weekly-digest-template.html';
  const weeklyDir = path.dirname(weeklyFileName);
  if (!fs.existsSync(weeklyDir)) {
    fs.mkdirSync(weeklyDir, { recursive: true });
  }
  fs.writeFileSync(weeklyFileName, weeklyDigest);
  
  console.log('\n📁 Templates saved to /templates folder');
  console.log('📋 Copy these HTML files into Mailchimp for your campaigns');
}

// Function to check for data changes
function checkForChanges() {
  console.log('\n🔍 CHECKING FOR DATA CHANGES');
  console.log('='.repeat(50));
  
  // This could be enhanced to compare with previous versions
  // For now, just show current state
  Object.entries(categoriesData).forEach(([key, category]) => {
    const newCompanies = category.companies.filter(c => 
      c.description.includes('NEW') || 
      c.description.includes('This Week') ||
      c.description.includes('Limited Time')
    );
    
    if (newCompanies.length > 0) {
      console.log(`🆕 ${category.name}: ${newCompanies.length} new/updated deals`);
      newCompanies.forEach(company => {
        console.log(`   • ${company.name}: ${company.description}`);
      });
    }
  });
}

// Function to sync with Mailchimp
async function syncWithMailchimp() {
  try {
    console.log('\n🔄 SYNCING WITH MAILCHIMP');
    console.log('='.repeat(50));
    
    // Get current subscriber count
    const listInfo = await mailchimp.lists.getList(process.env.MAILCHIMP_LIST_ID);
    console.log(`📊 Audience: ${listInfo.stats.member_count} subscribers`);
    
    // Get category tags
    const segments = await mailchimp.lists.listSegments(process.env.MAILCHIMP_LIST_ID);
    console.log(`🏷️ Segments: ${segments.segments.length} available`);
    
    console.log('✅ Mailchimp sync completed');
    
  } catch (error) {
    console.error('❌ Mailchimp sync failed:', error.message);
  }
}

// Main weekly update function
async function runWeeklyUpdate() {
  console.log('🚀 CATERED SAVERS - WEEKLY UPDATE TOOL');
  console.log('='.repeat(50));
  console.log(`📅 ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
  
  try {
    // Step 1: Show current data summary
    showWeeklyUpdateSummary();
    
    // Step 2: Check for changes
    checkForChanges();
    
    // Step 3: Generate fresh templates
    generateAllTemplates();
    
    // Step 4: Sync with Mailchimp
    await syncWithMailchimp();
    
    console.log('\n🎉 WEEKLY UPDATE COMPLETED!');
    console.log('\n📋 Next Steps:');
    console.log('1. Review the generated templates in /templates folder');
    console.log('2. Copy HTML to Mailchimp campaigns');
    console.log('3. Target subscribers by category tags');
    console.log('4. Send your weekly deals!');
    
  } catch (error) {
    console.error('❌ Weekly update failed:', error);
  }
}

// Export functions for use in other scripts
module.exports = {
  generateWeeklyDigestTemplate,
  generateCategoryDealTemplate,
  showWeeklyUpdateSummary,
  generateAllTemplates,
  syncWithMailchimp,
  runWeeklyUpdate
};

// Run weekly update if this file is executed directly
if (require.main === module) {
  runWeeklyUpdate();
}
