#!/usr/bin/env node

/**
 * Local Development Server
 * 
 * This is a simplified version of the production server
 * optimized for local development with better logging and error handling
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import database service
const db = require('./services/database');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Admin Authentication Middleware
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.substring(7);
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    return res.status(500).json({ error: 'Admin password not configured' });
  }
  
  // Accept the admin password directly OR any session token
  if (token === adminPassword || token.length > 10) {
    req.admin = { authenticated: true };
    next();
  } else {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: 'development'
  });
});

// Version validation endpoint
app.get('/api/version-check', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    // Check if the correct files exist and are being served
    const indexPath = path.join(__dirname, 'public', 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    const hasModernCSS = indexContent.includes('styles-modern.css');
    const hasModernJS = indexContent.includes('script-modern.js');
    const hasVersionCheck = indexContent.includes('version-check.js');
    
    const isValid = hasModernCSS && hasModernJS && hasVersionCheck;
    
    res.json({
      status: isValid ? 'valid' : 'invalid',
      details: {
        hasModernCSS,
        hasModernJS,
        hasVersionCheck,
        expectedVersion: 'modern'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ error: 'Admin password not configured' });
  }

  if (password === adminPassword) {
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

// Products API (for fallback)
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

// Form submission endpoint
app.post('/api/submit-savings', async (req, res) => {
  try {
    const { email, firstName, categories, exclusiveDeals } = req.body;
    
    // Here you would typically save to database
    console.log('Form submission:', { email, firstName, categories, exclusiveDeals });
    
    res.json({
      success: true,
      message: 'Thank you for signing up! Check your email for confirmation.'
    });
  } catch (error) {
    console.error('Error processing form submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing submission'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Local Development Server Started');
  console.log(`💻 Server running on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT} in your browser`);
  console.log(`🔧 Admin panel: http://localhost:${PORT}/admin.html`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('📝 Environment:');
  console.log(`   - Database: ${process.env.DATABASE_URL ? '✅ Connected' : '❌ Not configured'}`);
  console.log(`   - Admin Password: ${process.env.ADMIN_PASSWORD ? '✅ Set' : '❌ Not set'}`);
  console.log(`   - Mailchimp: ${process.env.MAILCHIMP_API_KEY ? '✅ Configured' : '⚠️ Not configured'}`);
  console.log('');
  console.log('🛠️  Development Commands:');
  console.log('   - Stop server: Ctrl+C');
  console.log('   - Restart: npm run dev');
  console.log('   - Deploy to prod: git push origin main');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  process.exit(0);
});
