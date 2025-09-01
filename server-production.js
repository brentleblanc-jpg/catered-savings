const express = require('express');
const cors = require('cors');
const mailchimp = require('@mailchimp/mailchimp_marketing');
const path = require('path');
const db = require('./services/database');
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
    message: 'Catered Savers API is running',
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

// Serve static files
app.use(express.static('public'));

// API Routes
app.post('/api/submit-savings', async (req, res) => {
  try {
    const { email, name, categories } = req.body;
    
    if (!email || !categories || categories.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and at least one category are required' 
      });
    }

    // Create user in database
    const user = await db.createUser({
      email,
      name: name || null,
      preferences: JSON.stringify(categories)
    });

    // Add to Mailchimp
    try {
      await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: name || '',
          PERSONALIZ: `${process.env.BASE_URL || 'https://your-app.railway.app'}/deals?token=${user.accessToken}`
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
    res.status(500).json({ 
      success: false, 
      message: 'Error processing signup' 
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
    const products = await db.getActiveSponsoredProducts();
    res.json({ success: true, products });
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  if (isProduction) {
    console.log(`🌐 Production server is live!`);
    console.log(`📧 Ready for production use`);
  } else {
    console.log(`💻 Development server - Open http://localhost:${PORT} in your browser`);
  }
});
