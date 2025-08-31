const express = require('express');
const cors = require('cors');
const mailchimp = require('@mailchimp/mailchimp_marketing');
const path = require('path');
// const cron = require('node-cron');
const db = require('./services/database');
// const dealDiscovery = require('./services/deal-discovery-manager');
const weeklyAutomation = require('./services/weekly-email-automation');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Production environment detection
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint for production monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    message: 'Catered Savers API is running'
  });
});

// Routes (must be before static middleware)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index-modern.html'));
});

app.use(express.static('public'));

// Store questionnaire responses (in production, use a database)
let questionnaireResponses = [];

// Configure Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX
});

// Function to send personalized welcome email with company data
async function sendPersonalizedWelcomeEmail(email, firstName, categories) {
  try {
    // Generate personalized email content based on selected categories
    let emailContent = `
      <h2>Welcome to Catered Savings! 🎉</h2>
      <p>Hi ${firstName},</p>
      <p>Thank you for signing up for Catered Savings! Here are your personalized deal sources with 50%+ savings:</p>
    `;

    // Add company data for each selected category
    categories.forEach(category => {
      if (categoriesData[category]) {
        const categoryInfo = categoriesData[category];
        emailContent += `
          <h3>${categoryInfo.name}</h3>
          <p>${categoryInfo.description}</p>
        `;
        
        categoryInfo.companies.forEach(company => {
          const affiliateBadge = company.affiliate ? ' <span style="background: #ffd700; color: #1a1a1a; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem;">Affiliate</span>' : '';
          emailContent += `
            <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
              <h4 style="margin: 0 0 8px 0;">
                <a href="${company.url}" style="color: #667eea; text-decoration: none;">${company.name}</a>${affiliateBadge}
              </h4>
              <p style="margin: 0; color: #6b7280;">${company.description}</p>
            </div>
          `;
        });
      }
    });

    emailContent += `
      <p><strong>Coming Next Week:</strong> Your first curated deal digest featuring 50%+ off deals from these sources!</p>
      <p>Happy saving! 💰</p>
      <p>Best regards,<br>The Catered Savings Team</p>
    `;

    // Log personalized email content for manual sending through Mailchimp
    console.log('Personalized email content generated for:', email);
    console.log('Email content:', emailContent);
    console.log('📧 Copy this content and send through Mailchimp campaigns!');
    
      } catch (error) {
      console.error('Error generating personalized email:', error);
    }
}







// Routes

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Submit savings preferences
app.post('/api/submit-savings', async (req, res) => {
  try {
    const response = req.body;
    const timestamp = new Date().toISOString();
    
    // Validate required fields
    if (!response.email || !response.email.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email address is required' 
      });
    }
    
    if (!response.firstName || !response.firstName.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'First name is required' 
      });
    }
    
    if (!response.categories || response.categories.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please select at least one category' 
      });
    }
    
    // Store the response
    const savingsResponse = {
      ...response,
      timestamp,
      id: Date.now().toString()
    };
    
    // Save user to database
    try {
      const existingUser = await db.getUserByEmail(response.email);
      if (!existingUser) {
        await db.createUser(response.email, response.firstName, {
          categories: response.categories,
          submittedAt: timestamp
        });
      }
    } catch (dbError) {
      console.error('Error saving user to database:', dbError);
      // Continue with Mailchimp even if DB save fails
    }

        // Add subscriber to Mailchimp audience
    if (response.email) {
      try {
        // Get the user's access token from database
        const user = await db.getUserByEmail(response.email);
        const personalizedUrl = user?.accessToken ? 
          `${process.env.BASE_URL || 'http://localhost:3000'}/deals/${user.accessToken}` : 
          `${process.env.BASE_URL || 'http://localhost:3000'}/deals/pending`;

        const mailchimpResult = await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
          email_address: response.email,
          status: 'subscribed',
          merge_fields: {
            FNAME: response.firstName.trim(),
            CATEGORIES: response.categories.join(', '),
            EXCLUSIVE_DEALS: response.exclusiveDeals ? 'Yes' : 'No',
            PERSONALIZ: personalizedUrl
          },
          tags: response.categories
        });

        console.log('✅ Mailchimp Success! User added to audience:', response.email);
        console.log('Mailchimp response:', mailchimpResult);

        // Send personalized welcome email with company data
        await sendPersonalizedWelcomeEmail(response.email, response.firstName.trim(), response.categories);
        
      } catch (mailchimpError) {
        console.error('❌ Mailchimp Error:', mailchimpError.message);
        console.error('Full error details:', mailchimpError);
        console.log('⚠️  User signup saved locally, but Mailchimp sync failed for:', response.email);
      }
    }

    // Log the signup for your team (you can view this in Mailchimp dashboard)
    console.log('New Catered Savings Signup! 🎯');
    console.log('Email:', response.email);
    console.log('First Name:', response.firstName.trim());
    console.log('Selected Categories:', response.categories.join(', '));
    console.log('Exclusive Deals:', response.exclusiveDeals ? 'Yes' : 'No');
    console.log('Submitted:', timestamp);

    res.json({ 
      success: true, 
      message: 'Welcome to Catered Savings!',
      id: timestamp
    });

  } catch (error) {
    console.error('Error submitting questionnaire:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting savings preferences' 
    });
  }
});

// Get all users (for admin purposes)
app.get('/api/savings-responses', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get admin clicks data
app.get('/api/admin/clicks', async (req, res) => {
  try {
    const clickAnalytics = await db.getClickAnalytics(30); // Last 30 days
    res.json({ clicks: clickAnalytics });
  } catch (error) {
    console.error('Error fetching click analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get admin dashboard analytics
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const analytics = await db.getAnalyticsSummary();
    const users = await db.getAllUsers();
    
    // Get Mailchimp members for comparison
    let mailchimpMembers = [];
    try {
      const mailchimp = require('@mailchimp/mailchimp_marketing');
      mailchimp.setConfig({
        apiKey: process.env.MAILCHIMP_API_KEY,
        server: process.env.MAILCHIMP_SERVER_PREFIX,
      });
      const mailchimpResponse = await mailchimp.lists.getListMembersInfo(process.env.MAILCHIMP_LIST_ID, {
        count: 1000,
        status: 'subscribed'
      });
      mailchimpMembers = mailchimpResponse.members.map(member => member.email_address);
    } catch (error) {
      console.error('Error fetching Mailchimp members for comparison:', error);
    }

    // Add Mailchimp status to users and transform data for frontend
    const usersWithStatus = users.map(user => ({
      ...user,
      categories: user.preferences?.categories || [],
      mailchimpStatus: mailchimpMembers.includes(user.email) ? 'subscribed' : 'not-synced'
    }));
    
    res.json({
      ...analytics,
      users: usersWithStatus
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Deal Discovery API Endpoints

// Run deal discovery process
app.post('/api/deal-discovery/run', async (req, res) => {
  try {
    const stats = await dealDiscovery.runDiscovery();
    res.json({
      success: true,
      message: 'Deal discovery completed',
      stats
    });
  } catch (error) {
    console.error('Error running deal discovery:', error);
    res.status(500).json({
      success: false,
      message: 'Error running deal discovery',
      error: error.message
    });
  }
});

// Get deal discovery status
app.get('/api/deal-discovery/status', (req, res) => {
  try {
    const status = dealDiscovery.getStatus();
    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Error getting deal discovery status:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting status'
    });
  }
});

// Get recent discovered deals
app.get('/api/deal-discovery/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const deals = await dealDiscovery.getRecentDeals(limit);
    res.json({
      success: true,
      deals
    });
  } catch (error) {
    console.error('Error getting recent deals:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting recent deals'
    });
  }
});

// Get deal statistics
app.get('/api/deal-discovery/stats', async (req, res) => {
  try {
    const stats = await dealDiscovery.getDealStatistics();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting deal statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting statistics'
    });
  }
});

// Test a specific scraper
app.post('/api/deal-discovery/test/:scraper', async (req, res) => {
  try {
    const scraperName = req.params.scraper;
    const deals = await dealDiscovery.testScraper(scraperName);
    res.json({
      success: true,
      message: `Test completed for ${scraperName}`,
      deals
    });
  } catch (error) {
    console.error('Error testing scraper:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing scraper',
      error: error.message
    });
  }
});

// Get savings response by ID
app.get('/api/savings-responses/:id', (req, res) => {
  const response = (global.savingsResponses || []).find(r => r.id === req.params.id);
  if (response) {
    res.json(response);
  } else {
    res.status(404).json({ message: 'Response not found' });
  }
});

// Get all categories data
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.getAllCategories();
    
    // Transform to match the existing frontend format
    const categoriesData = {};
    categories.forEach(category => {
      categoriesData[category.slug] = {
        name: category.name,
        description: category.description,
        companies: category.retailers.map(retailer => ({
          name: retailer.hasActiveSale ? `✅ ${retailer.name}` : retailer.name,
          url: retailer.url,
          description: retailer.description,
          affiliate: true
        }))
      };
    });
    
    res.json(categoriesData);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get sponsored products
app.get('/api/sponsored-products', async (req, res) => {
  try {
    const products = await db.getActiveSponsoredProducts(4);
    res.json({
      success: true,
      products: products
    });
  } catch (error) {
    console.error('Error fetching sponsored products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sponsored products'
    });
  }
});

// Track sponsored product clicks
app.post('/api/track-sponsored-click', async (req, res) => {
  try {
    const { productId } = req.body;
    const metadata = {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    const clickData = await db.trackSponsoredClick(productId, metadata);
    console.log('Sponsored click tracked:', clickData);
    
    res.json({
      success: true,
      message: 'Click tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking sponsored click:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking click'
    });
  }
});





// Add new company to a category
app.post('/api/add-company', (req, res) => {
  try {
    const { category, name, url, affiliate, description } = req.body;
    
    if (!categoriesData[category]) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }
    
    const newCompany = {
      name,
      url,
      affiliate,
      description
    };
    
    categoriesData[category].companies.push(newCompany);
    
    res.json({ success: true, message: 'Company added successfully' });
  } catch (error) {
    console.error('Error adding company:', error);
    res.status(500).json({ success: false, message: 'Error adding company' });
  }
});

// Get sponsored products for admin
app.get('/api/admin/sponsored-products', (req, res) => {
  try {
    const { sponsoredProducts } = require('./data/sponsored-products');
    const totalRevenue = sponsoredProducts.reduce((sum, product) => {
      return product.active ? sum + product.monthlyFee : sum;
    }, 0);
    
    res.json({
      success: true,
      products: sponsoredProducts,
      totalRevenue: totalRevenue,
      activeCount: sponsoredProducts.filter(p => p.active).length
    });
  } catch (error) {
    console.error('Error fetching admin sponsored products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sponsored products'
    });
  }
});

// Admin panel route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Personalized deals page
app.get('/deals/:token', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'deals.html'));
});

// Mailchimp users endpoint
app.get('/api/mailchimp/users', async (req, res) => {
  try {
    const mailchimp = require('@mailchimp/mailchimp_marketing');
    
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER_PREFIX,
    });

    // Get list members from Mailchimp
    const response = await mailchimp.lists.getListMembersInfo(process.env.MAILCHIMP_LIST_ID, {
      count: 1000, // Get up to 1000 members
      status: 'subscribed'
    });

    res.json({
      success: true,
      totalSubscribers: response.total_items,
      members: response.members.map(member => ({
        email: member.email_address,
        status: member.status,
        subscribedAt: member.timestamp_opt,
        merge_fields: member.merge_fields
      })),
      message: 'Mailchimp data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching Mailchimp users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching Mailchimp users',
      error: error.message
    });
  }
});

// Delete user endpoint
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Delete from database
    await db.deleteUser(userId);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// Email Automation System - Personalized Deals

// Get personalized deals for user (by token)
app.get('/api/deals/personalized/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const deals = await db.getPersonalizedDeals(token);
    
    res.json({
      success: true,
      deals
    });
  } catch (error) {
    console.error('Error getting personalized deals:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired access token'
    });
  }
});

// Track deal clicks
app.post('/api/deals/click/:token/:dealId', async (req, res) => {
  try {
    const { token, dealId } = req.params;
    const metadata = {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    };
    
    // Verify token is valid
    const user = await db.getUserByToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired access token'
      });
    }
    
    // Track the click (you can expand this to store in analytics_events table)
    console.log(`Deal click tracked: User ${user.email}, Deal ${dealId}`, metadata);
    
    res.json({
      success: true,
      message: 'Click tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking deal click:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking click'
    });
  }
});

// Generate new access token for user
app.post('/api/user/generate-token', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Generate new token
    const accessToken = db.generateAccessToken();
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 7);
    
    // Update user with new token
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.user.update({
      where: { email },
      data: { accessToken, tokenExpiresAt }
    });
    
    res.json({
      success: true,
      accessToken,
      tokenExpiresAt,
      personalizedDealsUrl: `/deals/${accessToken}`
    });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating access token'
    });
  }
});



// Weekly Email Automation Endpoints

// Run weekly automation (refresh deals + send emails)
app.post('/api/weekly-automation/run', async (req, res) => {
  try {
    console.log('🚀 Manual weekly automation triggered');
    const result = await weeklyAutomation.runWeeklyAutomation();
    
    res.json({
      success: result.success,
      message: result.success ? 'Weekly automation completed successfully' : 'Weekly automation failed',
      details: result
    });
  } catch (error) {
    console.error('Error running weekly automation:', error);
    res.status(500).json({
      success: false,
      message: 'Error running weekly automation',
      error: error.message
    });
  }
});

// Get automation status
app.get('/api/weekly-automation/status', async (req, res) => {
  try {
    const status = await weeklyAutomation.getAutomationStatus();
    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Error getting automation status:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting automation status',
      error: error.message
    });
  }
});

// Refresh deals only (without sending emails)
app.post('/api/weekly-automation/refresh-deals', async (req, res) => {
  try {
    console.log('🔄 Refreshing deals only...');
    const result = await weeklyAutomation.refreshWeeklyDeals();
    
    res.json({
      success: true,
      message: 'Deals refreshed successfully',
      stats: result
    });
  } catch (error) {
    console.error('Error refreshing deals:', error);
    res.status(500).json({
      success: false,
      message: 'Error refreshing deals',
      error: error.message
    });
  }
});

// Update Mailchimp with fresh data (without sending emails)
app.post('/api/weekly-automation/update-mailchimp', async (req, res) => {
  try {
    console.log('📧 Updating Mailchimp with fresh data...');
    const result = await weeklyAutomation.updateMailchimpWithFreshDeals();
    
    res.json({
      success: true,
      message: 'Mailchimp updated with fresh deal data',
      deals: result
    });
  } catch (error) {
    console.error('Error updating Mailchimp:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating Mailchimp',
      error: error.message
    });
  }
});

// Manual Weekly Automation (MVP Approach)
// No automatic scheduling - you control when to send emails

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  if (isProduction) {
    console.log(`🌐 Production server is live!`);
    console.log(`📧 Weekly automation ready for production use`);
  } else {
    console.log(`💻 Development server - Open http://localhost:${PORT} in your browser`);
    console.log('🎯 Manual Weekly Automation Ready:');
    console.log('   - Run: npm run weekly-automation');
    console.log('   - Or: curl -X POST http://localhost:3000/api/weekly-automation/run');
  }
});
