const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path'); // Added missing import for path

const app = express();
const PORT = process.env.PORT || 8080;

console.log('🚀 Starting WORKING Catered Savers server...');
console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);

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
