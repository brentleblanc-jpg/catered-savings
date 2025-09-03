const express = require('express');
const cors = require('cors');
const mailchimp = require('@mailchimp/mailchimp_marketing');
const path = require('path');
const db = require('./services/database');
const { getActiveSponsoredProducts, buildAffiliateUrl } = require('./data/sponsored-products');
require('dotenv').config();

// Configure Mailchimp
if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_SERVER) {
  mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER,
  });
  console.log('✅ Mailchimp configured successfully');
} else {
  console.log('⚠️  Mailchimp not configured - missing API key or server');
}

const app = express();
const PORT = process.env.PORT || 8080;

// Add startup logging
console.log('🚀 Starting Catered Savers server (ROUTING FIXED)...');
console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔑 Mailchimp configured: ${!!(process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_SERVER)}`);
console.log(`🗄️  Database configured: ${!!process.env.DATABASE_URL}`);

// Force HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Production environment detection
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors());
app.use(express.json());

// Security headers
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Health check endpoint for production monitoring
app.get('/health', (req, res) => {
  console.log(`🔍 Health check request received from ${req.ip}`);
  console.log(`🔍 Request headers:`, req.headers);
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    message: 'Catered Savers API is running',
    domain: 'cateredsavers.com',
    database_url_exists: !!process.env.DATABASE_URL,
    database_url_preview: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'Not set',
    mailchimp_api_key_exists: !!process.env.MAILCHIMP_API_KEY,
    mailchimp_server_exists: !!process.env.MAILCHIMP_SERVER,
    mailchimp_list_id_exists: !!process.env.MAILCHIMP_LIST_ID
  });
});

// Routes (must be before static middleware)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index-modern.html'));
});

// Personalized deals page
app.get('/deals', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'deals.html'));
});

// API Routes
app.post('/api/submit-savings', async (req, res) => {
  try {
    const { email, firstName, categories } = req.body;
    
    if (!email || !categories || categories.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and at least one category are required' 
      });
    }

    // Create user in database
    const user = await db.createUser(
      email,
      firstName || null,
      JSON.stringify(categories)
    );

    // Add to Mailchimp
    try {
      await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: firstName || '',
          PERSONALIZ: `https://cateredsavers.com/deals?token=${user.accessToken}`
        }
      });
    } catch (mailchimpError) {
      console.error('Mailchimp error:', mailchimpError);
      // Continue even if Mailchimp fails
    }

    res.json({ 
      success: true, 
      message: 'Successfully signed up!',
      user: {
        id: user.id,
        email: user.email,
        accessToken: user.accessToken
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing signup',
      error: error.message,
      stack: error.stack
    });
  }
});

// Get categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.getAllCategories();
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get sponsored products
app.get('/api/sponsored-products', async (req, res) => {
  try {
    const { getActiveSponsoredProducts, buildAffiliateUrl } = require('./data/sponsored-products');
    const products = getActiveSponsoredProducts();
    
    // Add affiliate URLs to each product
    const productsWithAffiliateUrls = products.map(product => ({
      ...product,
      affiliateUrl: buildAffiliateUrl(product)
    }));
    
    res.json({ success: true, products: productsWithAffiliateUrls });
  } catch (error) {
    console.error('Error fetching sponsored products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Track sponsored product clicks
app.post('/api/track-sponsored-click', async (req, res) => {
  try {
    const { productId } = req.body;
    await db.trackSponsoredClick(productId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get personalized deals
app.get('/api/deals/personalized/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const deals = await db.getPersonalizedDeals(token);
    
    // Add affiliate URLs to sponsored products (already handled in database service)
    // The database service now handles affiliate URL generation
    
    res.json({ success: true, deals });
  } catch (error) {
    console.error('Error fetching personalized deals:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin routes
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete user endpoint
app.delete('/api/admin/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Delete user from database
    await db.deleteUser(userId);
    
    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update affiliate ID for a product
app.post('/api/admin/update-affiliate', async (req, res) => {
  try {
    const { productId, affiliateId, trackingId } = req.body;
    
    // Use imported sponsored products module
    
    // Find and update the product
    const products = getActiveSponsoredProducts();
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Update affiliate fields
    if (affiliateId !== undefined) product.affiliateId = affiliateId;
    if (trackingId !== undefined) product.trackingId = trackingId;
    
    res.json({ success: true, message: 'Affiliate ID updated successfully' });
  } catch (error) {
    console.error('Error updating affiliate ID:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all sponsored products for admin management
app.get('/api/admin/sponsored-products', async (req, res) => {
  try {
    // Add affiliate URLs to each product
    const products = getActiveSponsoredProducts();
    const productsWithAffiliateUrls = products.map(product => ({
      ...product,
      affiliateUrl: buildAffiliateUrl(product)
    }));
    
    res.json({ success: true, products: productsWithAffiliateUrls });
  } catch (error) {
    console.error('Error fetching sponsored products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin analytics endpoint
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    const sponsoredProducts = await db.getActiveSponsoredProducts();
    
    // Calculate basic stats
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.isActive).length;
    const totalProducts = sponsoredProducts.length;
    
    // Get category distribution
    const categoryCounts = {};
    users.forEach(user => {
      try {
        const categories = JSON.parse(user.preferences || '[]');
        categories.forEach(cat => {
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
      } catch (e) {
        // Skip invalid preferences
      }
    });
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalProducts,
        categoryDistribution: categoryCounts
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Mailchimp sync endpoint
app.post('/api/admin/sync-mailchimp', async (req, res) => {
  try {
    console.log('🔄 Starting Mailchimp sync for pending users...');
    
    // Find users with pending Mailchimp status
    const pendingUsers = await db.getUsersByMailchimpStatus('pending');
    console.log(`📊 Found ${pendingUsers.length} users with pending Mailchimp status`);

    const results = [];
    
    for (const user of pendingUsers) {
      try {
        console.log(`📧 Syncing user: ${user.email}`);
        
        // Parse preferences
        const preferences = JSON.parse(user.preferences || '[]');
        
        // Create member data
        const memberData = {
          email_address: user.email,
          status: 'subscribed',
          merge_fields: {
            FNAME: user.name || '',
            LNAME: '',
            PERSONALIZ: `https://cateredsavers.com/deals?token=${user.accessToken}`
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
        await db.updateUserMailchimpStatus(user.id, 'subscribed', response.id);

        results.push({
          email: user.email,
          status: 'success',
          mailchimpId: response.id
        });

      } catch (error) {
        if (error.status === 400 && error.response?.body?.title === 'Member Exists') {
          console.log(`⚠️  User ${user.email} already exists in Mailchimp`);
          
          // Update status to subscribed
          await db.updateUserMailchimpStatus(user.id, 'subscribed');
          
          results.push({
            email: user.email,
            status: 'already_exists',
            message: 'User already exists in Mailchimp'
          });
        } else {
          console.error(`❌ Failed to sync ${user.email}:`, error.message);
          results.push({
            email: user.email,
            status: 'error',
            error: error.message
          });
        }
      }
    }

    console.log('🎉 Mailchimp sync completed!');
    
    res.json({
      success: true,
      message: `Synced ${results.length} users`,
      results: results
    });
    
  } catch (error) {
    console.error('❌ Mailchimp sync failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Admin clicks endpoint
app.get('/api/admin/clicks', async (req, res) => {
  try {
    const sponsoredProducts = await db.getAllSponsoredProducts();
    const totalClicks = sponsoredProducts.reduce((sum, product) => sum + (product.clickCount || 0), 0);
    
    res.json({
      success: true,
      stats: {
        totalClicks,
        products: sponsoredProducts.map(p => ({
          id: p.id,
          title: p.title,
          clicks: p.clickCount || 0
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching clicks:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mailchimp users endpoint for sync comparison
app.get('/api/mailchimp/users', async (req, res) => {
  try {
    if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_LIST_ID) {
      return res.status(400).json({ 
        success: false, 
        error: 'Mailchimp not configured' 
      });
    }

    // Get Mailchimp list members
    const response = await mailchimp.lists.getListMembersInfo(process.env.MAILCHIMP_LIST_ID);
    
    res.json({
      success: true,
      totalSubscribers: response.total_items,
      members: response.members.map(member => ({
        email: member.email_address,
        status: member.status,
        firstName: member.merge_fields?.FNAME || '',
        subscribedAt: member.timestamp_signup
      }))
    });
  } catch (error) {
    console.error('Error fetching Mailchimp users:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch Mailchimp users' 
    });
  }
});

// Database migration endpoint (run once to create tables)
app.post('/api/migrate', async (req, res) => {
  try {
    console.log('🔄 Running database migration...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    // Use direct PostgreSQL connection instead of Prisma
    const { Client } = require('pg');
    console.log('pg package loaded successfully');
    
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    });
    
    console.log('Attempting to connect to database...');
    await client.connect();
    console.log('Database connected successfully');
    
    // Create all tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "slug" TEXT NOT NULL UNIQUE,
        "description" TEXT,
        "iconUrl" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS "retailers" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "description" TEXT,
        "logoUrl" TEXT,
        "isVerified" BOOLEAN NOT NULL DEFAULT false,
        "hasActiveSale" BOOLEAN NOT NULL DEFAULT false,
        "salePercentage" INTEGER,
        "saleEndDate" TIMESTAMP(3),
        "clickCount" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "categoryId" TEXT NOT NULL,
        FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT,
        "preferences" TEXT,
        "mailchimpStatus" TEXT NOT NULL DEFAULT 'pending',
        "accessToken" TEXT UNIQUE,
        "tokenExpiresAt" TIMESTAMP(3),
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "lastActiveAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS "sponsored_products" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "imageUrl" TEXT,
        "affiliateUrl" TEXT NOT NULL,
        "price" REAL,
        "originalPrice" REAL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "endDate" TIMESTAMP(3),
        "clickCount" INTEGER NOT NULL DEFAULT 0,
        "conversionCount" INTEGER NOT NULL DEFAULT 0,
        "revenueGenerated" REAL NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS "analytics_events" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "eventType" TEXT NOT NULL,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "metadata" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "userId" TEXT,
        "retailerId" TEXT,
        "sponsoredProductId" TEXT,
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY ("retailerId") REFERENCES "retailers"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY ("sponsoredProductId") REFERENCES "sponsored_products"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS "email_campaigns" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "subject" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "campaignType" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "sentCount" INTEGER NOT NULL DEFAULT 0,
        "openCount" INTEGER NOT NULL DEFAULT 0,
        "clickCount" INTEGER NOT NULL DEFAULT 0,
        "scheduledFor" TIMESTAMP(3),
        "sentAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS "admin_users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'admin',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "lastLoginAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);
    
    await client.end();
    
    console.log('✅ Database migration completed successfully!');
    res.json({ 
      success: true, 
      message: 'Database migration completed successfully!',
      tables: ['categories', 'retailers', 'users', 'sponsored_products', 'analytics_events', 'email_campaigns', 'admin_users']
    });
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Unknown error occurred',
      stack: error.stack
    });
  }
});

// Serve static files (must be AFTER all routes)
app.use(express.static('public'));

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Server bound to 0.0.0.0:${PORT}`);
  if (isProduction) {
    console.log(`🌐 Production server is live!`);
    console.log(`📧 Ready for production use`);
    console.log(`🔍 Health endpoint available at: http://0.0.0.0:${PORT}/health`);
  } else {
    console.log(`💻 Development server - Open http://localhost:${PORT} in your browser`);
  }
});
