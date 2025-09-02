const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path'); // Added missing import for path

const app = express();
const PORT = process.env.PORT || 8080;

console.log('🚀 Starting WORKING Catered Savers server...');
console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);

// Force HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Production environment detection
const isProduction = process.env.NODE_ENV === 'production';

// Security headers
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Test 1: Basic imports
console.log('✅ Test 1: Basic imports successful');

// Test 2: Try to import database service
let dbService = null;
try {
  console.log('🔄 Test 2: Testing database service...');
  dbService = require('./services/database');
  console.log('✅ Test 2: Database service import successful');
} catch (error) {
  console.log('❌ Test 2: Database service import failed:', error.message);
  dbService = null;
}

// Test 3: Try to import sponsored products
let sponsoredProducts = null;
try {
  console.log('🔄 Test 3: Testing sponsored products...');
  const { getActiveSponsoredProducts, buildAffiliateUrl } = require('./data/sponsored-products');
  sponsoredProducts = { getActiveSponsoredProducts, buildAffiliateUrl };
  console.log('✅ Test 3: Sponsored products import successful');
} catch (error) {
  console.log('❌ Test 3: Sponsored products import failed:', error.message);
  sponsoredProducts = null;
}

// Test 4: Try to import Mailchimp
let mailchimp = null;
try {
  if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_SERVER) {
    console.log('🔄 Test 4: Testing Mailchimp...');
    mailchimp = require('@mailchimp/marketing');
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER,
    });
    console.log('✅ Test 4: Mailchimp import and config successful');
  } else {
    console.log('⚠️  Test 4: Mailchimp not configured - skipping');
  }
} catch (error) {
  console.log('❌ Test 4: Mailchimp import failed:', error.message);
  mailchimp = null;
}

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('🔍 Health check received!');
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    message: 'Working Catered Savers API is running',
    tests: {
      database_service: !!dbService,
      sponsored_products: !!sponsoredProducts,
      mailchimp: !!mailchimp
    }
  });
});

// Basic routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index-modern.html'));
});

app.get('/deals', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'deals.html'));
});

// Serve static files (CSS, JS, images)
app.use(express.static('public'));

// API Routes (only if dependencies are available)
app.get('/api/sponsored-products', (req, res) => {
  try {
    if (!sponsoredProducts) {
      return res.status(500).json({ 
        success: false, 
        error: 'Sponsored products not loaded' 
      });
    }
    
    const products = sponsoredProducts.getActiveSponsoredProducts();
    const productsWithUrls = products.map(product => ({
      ...product,
      affiliateUrl: sponsoredProducts.buildAffiliateUrl(product)
    }));
    
    res.json({ success: true, products: productsWithUrls });
  } catch (error) {
    console.error('Error in sponsored products endpoint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin routes (only if database service is available)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/api/admin/users', async (req, res) => {
  try {
    if (!dbService) {
      return res.status(500).json({ 
        success: false, 
        error: 'Database service not available' 
      });
    }
    
    const users = await dbService.getAllUsers();
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/analytics', async (req, res) => {
  try {
    if (!dbService) {
      return res.status(500).json({ 
        success: false, 
        error: 'Database service not available' 
      });
    }
    
    const users = await dbService.getAllUsers();
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.isActive).length;
    
    res.json({
      success: true,
      analytics: {
        totalUsers,
        activeUsers,
        totalProducts: sponsoredProducts ? sponsoredProducts.getActiveSponsoredProducts().length : 0,
        categoryDistribution: {}
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mailchimp sync endpoint
app.post('/api/admin/sync-mailchimp', async (req, res) => {
  try {
    if (!mailchimp || !dbService) {
      return res.status(500).json({
        success: false,
        error: 'Mailchimp or database service not available'
      });
    }

    console.log('🔄 Starting Mailchimp sync...');
    
    // Get all users from database
    const users = await dbService.getAllUsers();
    console.log(`📊 Found ${users.length} users in database`);
    
    let syncedCount = 0;
    let errors = [];

    for (const user of users) {
      try {
        // Check if user already exists in Mailchimp
        const existingMember = await mailchimp.lists.getListMember(
          process.env.MAILCHIMP_AUDIENCE_ID,
          user.email
        );
        
        if (existingMember) {
          console.log(`✅ User ${user.email} already exists in Mailchimp`);
          syncedCount++;
          continue;
        }
      } catch (error) {
        // User doesn't exist, add them
        if (error.status === 404) {
          try {
            await mailchimp.lists.addListMember(process.env.MAILCHIMP_AUDIENCE_ID, {
              email_address: user.email,
              status: 'subscribed',
              merge_fields: {
                FNAME: user.firstName || '',
                LNAME: user.lastName || '',
                PERSONALIZ: user.personalizedDealsUrl || ''
              }
            });
            
            console.log(`✅ Added user ${user.email} to Mailchimp`);
            syncedCount++;
          } catch (addError) {
            console.error(`❌ Failed to add user ${user.email}:`, addError.message);
            errors.push(`${user.email}: ${addError.message}`);
          }
        } else {
          console.error(`❌ Error checking user ${user.email}:`, error.message);
          errors.push(`${user.email}: ${error.message}`);
        }
      }
    }

    console.log(`🎯 Mailchimp sync completed. Synced: ${syncedCount}, Errors: ${errors.length}`);
    
    res.json({
      success: true,
      message: `Mailchimp sync completed. Synced: ${syncedCount}, Errors: ${errors.length}`,
      syncedCount,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('🚨 Mailchimp sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// User signup endpoint (compatible with existing frontend)
app.post('/api/submit-savings', async (req, res) => {
  try {
    if (!dbService) {
      return res.status(500).json({
        success: false,
        error: 'Database service not available'
      });
    }

    const { email, firstName, categories } = req.body;
    
    if (!email || !categories || categories.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Email and at least one category are required'
      });
    }

    console.log(`📝 Processing signup for ${email} with categories:`, categories);

    // Check if user already exists
    const existingUser = await dbService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Create user in database (using existing method)
    const user = await dbService.createUser(
      email,
      firstName || null,
      JSON.stringify(categories)
    );

    console.log(`✅ User created: ${email}`);

    // Add to Mailchimp if available
    if (mailchimp && process.env.MAILCHIMP_LIST_ID) {
      try {
        await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
          email_address: email,
          status: 'subscribed',
          merge_fields: {
            FNAME: firstName || '',
            PERSONALIZ: `https://cateredsavers.com/deals?token=${user.accessToken}`
          }
        });
        console.log(`✅ User added to Mailchimp: ${email}`);
      } catch (mailchimpError) {
        console.error(`⚠️ Failed to add user to Mailchimp: ${email}`, mailchimpError.message);
        // Don't fail the signup if Mailchimp fails
      }
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
    console.error('🚨 Signup error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get categories
app.get('/api/categories', async (req, res) => {
  try {
    if (!dbService) {
      return res.status(500).json({
        success: false,
        error: 'Database service not available'
      });
    }
    
    const categories = await dbService.getAllCategories();
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Track sponsored product clicks
app.post('/api/track-sponsored-click', async (req, res) => {
  try {
    if (!dbService) {
      return res.status(500).json({
        success: false,
        error: 'Database service not available'
      });
    }
    
    const { productId } = req.body;
    await dbService.trackSponsoredClick(productId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get personalized deals
app.get('/api/deals/personalized/:token', async (req, res) => {
  try {
    if (!dbService) {
      return res.status(500).json({
        success: false,
        error: 'Database service not available'
      });
    }
    
    const { token } = req.params;
    const deals = await dbService.getPersonalizedDeals(token);
    
    // Add affiliate URLs to sponsored products
    if (deals.sponsoredProducts && sponsoredProducts) {
      deals.sponsoredProducts = deals.sponsoredProducts.map(product => ({
        ...product,
        affiliateUrl: sponsoredProducts.buildAffiliateUrl(product)
      }));
    }
    
    res.json({ success: true, deals });
  } catch (error) {
    console.error('Error fetching personalized deals:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete user endpoint
app.delete('/api/admin/users/:userId', async (req, res) => {
  try {
    if (!dbService) {
      return res.status(500).json({
        success: false,
        error: 'Database service not available'
      });
    }
    
    const { userId } = req.params;
    
    // Check if user exists
    const user = await dbService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Delete user from database
    await dbService.deleteUser(userId);
    
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
    if (!sponsoredProducts) {
      return res.status(500).json({
        success: false,
        error: 'Sponsored products not available'
      });
    }
    
    const { productId, affiliateId, trackingId } = req.body;
    
    // Find and update the product
    const products = sponsoredProducts.getActiveSponsoredProducts();
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
    if (!sponsoredProducts) {
      return res.status(500).json({
        success: false,
        error: 'Sponsored products not available'
      });
    }
    
    // Add affiliate URLs to each product
    const products = sponsoredProducts.getActiveSponsoredProducts();
    const productsWithAffiliateUrls = products.map(product => ({
      ...product,
      affiliateUrl: sponsoredProducts.buildAffiliateUrl(product)
    }));
    
    res.json({ success: true, products: productsWithAffiliateUrls });
  } catch (error) {
    console.error('Error fetching sponsored products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on 0.0.0.0:${PORT}`);
  console.log(`🔍 Health endpoint: http://0.0.0.0:${PORT}/health`);
  console.log(`🌐 Ready for Railway healthcheck!`);
  console.log('📊 Test Results:', {
    database: !!dbService,
    products: !!sponsoredProducts,
    mailchimp: !!mailchimp
  });
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection:', reason);
});
