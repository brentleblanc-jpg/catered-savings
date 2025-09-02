console.log('🚀 Starting HYBRID server (FORCE DEPLOY)...');

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
        mailchimp = require('@mailchimp/mailchimp_marketing');
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
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Catered Savers</title>
          <meta http-equiv="refresh" content="0; url=/index-modern.html">
        </head>
        <body>
          <p>Redirecting to Catered Savers...</p>
        </body>
        </html>
      `);
      return;
    }
    
    // Serve static files
    if (req.url.endsWith('.html') || req.url.endsWith('.css') || req.url.endsWith('.js')) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, 'public', req.url);
      
      try {
        const content = fs.readFileSync(filePath);
        const ext = path.extname(req.url);
        let contentType = 'text/plain';
        
        if (ext === '.html') contentType = 'text/html';
        else if (ext === '.css') contentType = 'text/css';
        else if (ext === '.js') contentType = 'application/javascript';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      } catch (error) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'File not found' }));
      }
      return;
    }
    
    // API Routes
    if (req.url === '/api/sponsored-products' && req.method === 'GET') {
      try {
        const productsModule = getSponsoredProducts();
        if (!productsModule) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Sponsored products not loaded' }));
          return;
        }
        
        const products = productsModule.getActiveSponsoredProducts();
        const productsWithUrls = products.map(product => ({
          ...product,
          affiliateUrl: productsModule.buildAffiliateUrl(product)
        }));
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, products: productsWithUrls }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
      return;
    }
    
    // User signup endpoint
    if (req.url === '/api/submit-savings' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const { email, firstName, categories } = JSON.parse(body);
          
          if (!email || !categories || categories.length === 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Email and at least one category are required' }));
            return;
          }
          
          const db = getDatabaseService();
          if (!db) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Database service not available' }));
            return;
          }
          
          // Check if user already exists
          const existingUser = await db.getUserByEmail(email);
          if (existingUser) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'User already exists with this email' }));
            return;
          }
          
          // Create user in database
          const user = await db.createUser(email, firstName || null, JSON.stringify(categories));
          
          // Add to Mailchimp if available
          const mailchimpService = getMailchimp();
          if (mailchimpService && process.env.MAILCHIMP_LIST_ID) {
            try {
              await mailchimpService.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
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
            }
          }
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: 'Successfully signed up!',
            user: {
              id: user.id,
              email: user.email,
              accessToken: user.accessToken
            }
          }));
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: error.message }));
        }
      });
      return;
    }
    
    // Categories API
    if (req.url === '/api/categories' && req.method === 'GET') {
      try {
        const db = getDatabaseService();
        if (!db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Database service not available' }));
          return;
        }
        
        const categories = await db.getAllCategories();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, categories }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
      return;
    }
    
    // Admin routes
    if (req.url === '/admin' && req.method === 'GET') {
      const fs = require('fs');
      const path = require('path');
      const adminPath = path.join(__dirname, 'public', 'admin.html');
      
      try {
        const content = fs.readFileSync(adminPath);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      } catch (error) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Admin page not found' }));
      }
      return;
    }
    
    // Admin users API
    if (req.url === '/api/admin/users' && req.method === 'GET') {
      try {
        const db = getDatabaseService();
        if (!db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Database service not available' }));
          return;
        }
        
        const users = await db.getAllUsers();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, users }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
      return;
    }
    
    // Admin analytics API
    if (req.url === '/api/admin/analytics' && req.method === 'GET') {
      try {
        const db = getDatabaseService();
        if (!db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Database service not available' }));
          return;
        }
        
        const users = await db.getAllUsers();
        const totalUsers = users.length;
        const activeUsers = users.filter(user => user.isActive).length;
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          analytics: {
            totalUsers,
            activeUsers,
            totalProducts: getSponsoredProducts() ? getSponsoredProducts().getActiveSponsoredProducts().length : 0,
            categoryDistribution: {}
          }
        }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
      return;
    }
    
    // Mailchimp sync endpoint
    if (req.url === '/api/admin/sync-mailchimp' && req.method === 'POST') {
      try {
        const mailchimpService = getMailchimp();
        const db = getDatabaseService();
        
        if (!mailchimpService || !db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Mailchimp or database service not available' }));
          return;
        }
        
        console.log('🔄 Starting Mailchimp sync...');
        
        const users = await db.getAllUsers();
        console.log(`📊 Found ${users.length} users in database`);
        
        let syncedCount = 0;
        let errors = [];
        
        for (const user of users) {
          try {
            const existingMember = await mailchimpService.lists.getListMember(
              process.env.MAILCHIMP_AUDIENCE_ID,
              user.email
            );
            
            if (existingMember) {
              console.log(`✅ User ${user.email} already exists in Mailchimp`);
              syncedCount++;
              continue;
            }
          } catch (error) {
            if (error.status === 404) {
              try {
                await mailchimpService.lists.addListMember(process.env.MAILCHIMP_AUDIENCE_ID, {
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
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: `Mailchimp sync completed. Synced: ${syncedCount}, Errors: ${errors.length}`,
          syncedCount,
          errorCount: errors.length,
          errors: errors.length > 0 ? errors : undefined
        }));
      } catch (error) {
        console.error('🚨 Mailchimp sync error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
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
