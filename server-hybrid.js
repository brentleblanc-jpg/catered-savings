console.log('🚀 Starting HYBRID server...');

const http = require('http');
const PORT = process.env.PORT || 8080;

console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔑 PORT: ${PORT}`);

// Lazy imports - only load when needed to prevent startup crashes
let dbService = null;
let sponsoredProducts = null;
let mailchimp = null;

// Function to get database service (lazy load)
function getDatabaseService() {
  if (!dbService) {
    try {
      console.log('🔄 Lazy loading database service...');
      dbService = require('./services/database');
      console.log('✅ Database service loaded successfully');
    } catch (error) {
      console.log('❌ Database service failed to load:', error.message);
      return null;
    }
  }
  return dbService;
}

// Function to get sponsored products (lazy load)
function getSponsoredProducts() {
  if (!sponsoredProducts) {
    try {
      console.log('🔄 Lazy loading sponsored products...');
      const { getActiveSponsoredProducts, buildAffiliateUrl } = require('./data/sponsored-products');
      sponsoredProducts = { getActiveSponsoredProducts, buildAffiliateUrl };
      console.log('✅ Sponsored products loaded successfully');
    } catch (error) {
      console.log('❌ Sponsored products failed to load:', error.message);
      return null;
    }
  }
  return sponsoredProducts;
}

// Function to get Mailchimp (lazy load)
function getMailchimp() {
  if (!mailchimp) {
    try {
      if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_SERVER) {
        console.log('🔄 Lazy loading Mailchimp...');
        mailchimp = require('@mailchimp/marketing');
        mailchimp.setConfig({
          apiKey: process.env.MAILCHIMP_API_KEY,
          server: process.env.MAILCHIMP_SERVER,
        });
        console.log('✅ Mailchimp loaded successfully');
      } else {
        console.log('⚠️  Mailchimp not configured - skipping');
        return null;
      }
    } catch (error) {
      console.error('❌ Mailchimp failed to load:', error.message);
      return null;
    }
  }
  return mailchimp;
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  console.log(`📥 Request received: ${req.method} ${req.url}`);
  
  try {
    // Health check endpoint
    if (req.url === '/health') {
      console.log('🔍 Health check received!');
      console.log(`🔍 Request from: ${req.connection.remoteAddress}`);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'Hybrid server is running',
        services: {
          database_service: !!getDatabaseService(),
          sponsored_products: !!getSponsoredProducts(),
          mailchimp: !!getMailchimp()
        }
      }));
      
      console.log('✅ Health check response sent successfully');
      return;
    }
    
    // Basic route
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        message: 'Hybrid server is running',
        services: {
          database: !!getDatabaseService(),
          products: !!getSponsoredProducts(),
          mailchimp: !!getMailchimp()
        }
      }));
      return;
    }
    
    // Default response
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    
  } catch (error) {
    console.error('🚨 Request error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on 0.0.0.0:${PORT}`);
  console.log(`🔍 Health endpoint: http://0.0.0.0:${PORT}/health`);
  console.log(`🌐 Ready for Railway healthcheck!`);
  console.log('🚀 Server startup complete!');
});

// Error handling
server.on('error', (error) => {
  console.error('🚨 Server error:', error);
});

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection:', reason);
});
