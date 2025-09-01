const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Capture all uncaught errors
process.on('uncaughtException', (error) => {
  console.error('🚨 UNCAUGHT EXCEPTION:', error.message);
  console.error('Stack trace:', error.stack);
  // Don't exit - keep the server running so we can see the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 UNHANDLED REJECTION at:', promise);
  console.error('Reason:', reason);
});

// Add startup logging
console.log('🚀 Starting DEBUG server...');
console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🗄️  Database URL exists: ${!!process.env.DATABASE_URL}`);
console.log(`🔑 Mailchimp configured: ${!!(process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_SERVER)}`);

// Test imports one by one with detailed error handling
let testResults = {
  express: false,
  cors: false,
  dotenv: false,
  database: false,
  sponsoredProducts: false,
  mailchimp: false
};

try {
  console.log('✅ Express loaded');
  testResults.express = true;
} catch (error) {
  console.error('❌ Express failed:', error.message);
}

try {
  console.log('✅ CORS loaded');
  testResults.cors = true;
} catch (error) {
  console.error('❌ CORS failed:', error.message);
}

try {
  console.log('✅ dotenv loaded');
  testResults.dotenv = true;
} catch (error) {
  console.error('❌ dotenv failed:', error.message);
}

// Test database service
try {
  console.log('🔄 Testing database service...');
  const db = require('./services/database');
  console.log('✅ Database service loaded');
  testResults.database = true;
} catch (error) {
  console.error('❌ Database service failed:', error.message);
  console.error('Error stack:', error.stack);
}

// Test sponsored products
try {
  console.log('🔄 Testing sponsored products...');
  const { getActiveSponsoredProducts, buildAffiliateUrl } = require('./data/sponsored-products');
  console.log('✅ Sponsored products loaded');
  testResults.sponsoredProducts = true;
} catch (error) {
  console.error('❌ Sponsored products failed:', error.message);
  console.error('Error stack:', error.stack);
}

// Test Mailchimp
try {
  if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_SERVER) {
    console.log('🔄 Testing Mailchimp...');
    const mailchimp = require('@mailchimp/mailchimp_marketing');
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER,
    });
    console.log('✅ Mailchimp loaded and configured');
    testResults.mailchimp = true;
  } else {
    console.log('⚠️  Mailchimp not configured - skipping');
  }
} catch (error) {
  console.error('❌ Mailchimp failed:', error.message);
  console.error('Error stack:', error.stack);
}

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint with detailed status
app.get('/health', (req, res) => {
  const allTestsPassed = Object.values(testResults).every(result => result === true);
  
  res.status(allTestsPassed ? 200 : 500).json({
    status: allTestsPassed ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    message: 'DEBUG Server Status',
    tests: testResults,
    allTestsPassed,
    database_url_exists: !!process.env.DATABASE_URL,
    mailchimp_configured: !!(process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_SERVER)
  });
});

// Debug endpoint to show all test results
app.get('/debug', (req, res) => {
  res.json({
    server: 'DEBUG Server Running',
    timestamp: new Date().toISOString(),
    tests: testResults,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY ? 'SET' : 'NOT SET',
      MAILCHIMP_SERVER: process.env.MAILCHIMP_SERVER ? 'SET' : 'NOT SET'
    }
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'DEBUG server is running!',
    tests: testResults,
    status: 'Check /debug for detailed information'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DEBUG server running on port ${PORT}`);
  console.log(`🌐 Server is live!`);
  console.log('📊 Test Results:', testResults);
  console.log('🔍 Check /health and /debug endpoints for status');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
