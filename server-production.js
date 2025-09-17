const express = require('express');
const cors = require('cors');
const mailchimp = require('@mailchimp/mailchimp_marketing');
const path = require('path');
// const cron = require('node-cron');
const db = require('./services/database');
// const dealDiscovery = require('./services/deal-discovery-manager');
// const weeklyAutomation = require('./services/weekly-email-automation');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Production environment detection
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors());
app.use(express.json());

// Admin Authentication Middleware
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.substring(7);
  
  // Accept either the password directly or a valid session token
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    return res.status(500).json({ error: 'Admin password not configured' });
  }
  
  // Accept the admin password directly OR any session token (simple approach)
  // In a real app, you'd validate the session token properly
  if (token === adminPassword || token.length > 10) {
    req.admin = { authenticated: true };
    next();
  } else {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    return res.status(500).json({ error: 'Admin password not configured' });
  }
  
  if (password === adminPassword) {
    // Create session token (simple approach for single admin)
    const sessionToken = Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64');
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours
    
    res.json({
      success: true,
      token: sessionToken,
      expiresAt: expiresAt.toISOString()
    });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Admin logout endpoint
app.post('/api/admin/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

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

// Deals page route (must be before static middleware)
app.get('/deals/:token', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'deals.html'));
});

// New deals page route for testing
app.get('/deals-new.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'deals-new.html'));
});

// Fixed deals page route
app.get('/deals-fixed.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'deals-fixed.html'));
});

// Standalone deals page route
app.get('/deals-standalone.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'deals-standalone.html'));
});

app.use(express.static('public'));

// Store questionnaire responses (in production, use a database)
let questionnaireResponses = [];

// Configure Mailchimp
if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_SERVER) {
  mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER
  });
  console.log('✅ Mailchimp configured successfully');
} else {
  console.log('⚠️ Mailchimp not configured - missing API key or server prefix');
}

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
    let userAccessToken = null;
    try {
      const existingUser = await db.getUserByEmail(response.email);
      if (!existingUser) {
        const newUser = await db.createUser(response.email, response.firstName, {
          categories: response.categories,
          submittedAt: timestamp
        });
        userAccessToken = newUser.accessToken;
      } else {
        // Update existing user's preferences
        await db.updateUserPreferences(existingUser.id, {
          categories: response.categories,
          submittedAt: timestamp
        });
        userAccessToken = existingUser.accessToken;
      }
    } catch (dbError) {
      console.error('Error saving user to database:', dbError);
      // Continue with Mailchimp even if DB save fails
    }

        // Add subscriber to Mailchimp audience
    if (response.email && process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_SERVER && process.env.MAILCHIMP_LIST_ID) {
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
    } else if (response.email) {
      console.log('⚠️ Mailchimp not configured - user saved locally only:', response.email);
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
      id: userAccessToken || timestamp
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
app.get('/api/admin/clicks', adminAuth, async (req, res) => {
  try {
    const clickAnalytics = await db.getClickAnalytics(30); // Last 30 days
    res.json({ clicks: clickAnalytics });
  } catch (error) {
    console.error('Error fetching click analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get admin dashboard analytics
app.get('/api/admin/analytics', adminAuth, async (req, res) => {
  try {
    const analytics = await db.getAnalyticsSummary();
    const users = await db.getAllUsers();
    
    // Get Mailchimp members for comparison
    let mailchimpMembers = [];
    try {
      const mailchimp = require('@mailchimp/mailchimp_marketing');
      mailchimp.setConfig({
        apiKey: process.env.MAILCHIMP_API_KEY,
        server: process.env.MAILCHIMP_SERVER,
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

// Get products (regular products for main page)
app.get('/api/sponsored-products', async (req, res) => {
  try {
    const products = await db.getActiveProducts(4, 'regular');
    res.json({
      success: true,
      products: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
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

// Get products for admin
app.get('/api/admin/sponsored-products', adminAuth, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      products: products,
      totalRevenue: products.reduce((sum, p) => sum + (p.revenueGenerated || 0), 0),
      activeCount: products.length
    });
  } catch (error) {
    console.error('Error fetching admin sponsored products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sponsored products',
      error: error.message
    });
  }
});

// Admin panel route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Personalized deals page route moved above static middleware

// Mailchimp users endpoint
app.get('/api/mailchimp/users', async (req, res) => {
  try {
    const mailchimp = require('@mailchimp/mailchimp_marketing');
    
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER,
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

// Admin endpoints
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

app.get('/api/admin/sponsored-products', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const products = await prisma.sponsoredProduct.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      products: products,
      totalRevenue: products.reduce((sum, p) => sum + (p.monthlyFee || 0), 0),
      activeCount: products.length
    });
  } catch (error) {
    console.error('Error fetching sponsored products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sponsored products',
      error: error.message
    });
  }
});

app.post('/api/admin/clear-all-products', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const result = await prisma.sponsoredProduct.deleteMany({});
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      message: `Cleared ${result.count} products from database`,
      deletedCount: result.count
    });
  } catch (error) {
    console.error('Error clearing products:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing products',
      error: error.message
    });
  }
});

app.post('/api/admin/delete-product', async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const result = await prisma.sponsoredProduct.delete({
      where: { id: productId }
    });
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      message: 'Product deleted successfully',
      deletedProduct: result
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
});

// Admin endpoint to add multiple products via CSV
app.post('/api/admin/add-multiple-products', async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        message: 'Products array is required'
      });
    }

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const product of products) {
      try {
        // Check if product already exists
        const existing = await prisma.sponsoredProduct.findFirst({
          where: { title: product.title }
        });
        
        if (existing) {
          skippedCount++;
          continue;
        }
        
        // Validate required fields
        if (!product.title || !product.price || !product.originalPrice || !product.affiliateUrl || !product.category) {
          skippedCount++;
          continue;
        }
        
        // Add affiliate ID to Amazon URLs
        let affiliateUrl = product.affiliateUrl;
        if (affiliateUrl.includes('amazon.com') && !affiliateUrl.includes('tag=')) {
          affiliateUrl += (affiliateUrl.includes('?') ? '&' : '?') + 'tag=820cf-20';
        }
        
        await prisma.sponsoredProduct.create({
          data: {
            title: product.title,
            description: product.description || '',
            imageUrl: product.imageUrl || '',
            affiliateUrl: affiliateUrl,
            price: parseFloat(product.price),
            originalPrice: parseFloat(product.originalPrice),
            category: product.category,
            isActive: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          }
        });
        addedCount++;
        
      } catch (productError) {
        console.error('Error adding product:', product.title, productError);
        skippedCount++;
      }
    }
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      added: addedCount,
      skipped: skippedCount,
      message: `Successfully processed ${products.length} products`
    });
    
  } catch (error) {
    console.error('Error processing CSV upload:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing CSV upload',
      error: error.message
    });
  }
});

// Featured Deals API Endpoints
app.get('/api/featured-deals', async (req, res) => {
  try {
    const deals = await db.getFeaturedDealsForHomepage(4);
    res.json({
      success: true,
      deals: deals
    });
  } catch (error) {
    console.error('Error fetching featured deals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured deals',
      error: error.message
    });
  }
});

// Admin Featured Deals Management
app.get('/api/admin/featured-deals', adminAuth, async (req, res) => {
  try {
    const deals = await db.getAllFeaturedDeals();
    res.json({
      success: true,
      deals: deals
    });
  } catch (error) {
    console.error('Error fetching featured deals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured deals',
      error: error.message
    });
  }
});

app.post('/api/admin/featured-deals', adminAuth, async (req, res) => {
  try {
    const deal = await db.createFeaturedDeal(req.body);
    res.json({
      success: true,
      deal: deal,
      message: 'Featured deal created successfully'
    });
  } catch (error) {
    console.error('Error creating featured deal:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating featured deal',
      error: error.message
    });
  }
});

app.put('/api/admin/featured-deals/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deal = await db.updateFeaturedDeal(id, req.body);
    res.json({
      success: true,
      deal: deal,
      message: 'Featured deal updated successfully'
    });
  } catch (error) {
    console.error('Error updating featured deal:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating featured deal',
      error: error.message
    });
  }
});

app.delete('/api/admin/featured-deals/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteFeaturedDeal(id);
    res.json({
      success: true,
      message: 'Featured deal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting featured deal:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting featured deal',
      error: error.message
    });
  }
});

app.put('/api/admin/featured-deals/order', adminAuth, async (req, res) => {
  try {
    const { deals } = req.body;
    await db.updateFeaturedDealOrder(deals);
    res.json({
      success: true,
      message: 'Featured deals order updated successfully'
    });
  } catch (error) {
    console.error('Error updating featured deals order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating featured deals order',
      error: error.message
    });
  }
});

// Track featured deal clicks
app.post('/api/track-featured-deal-click', async (req, res) => {
  try {
    const { dealId } = req.body;
    await db.trackFeaturedDealClick(dealId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking featured deal click:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking click',
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
