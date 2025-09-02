console.log('🚀 Starting HYBRID server (AMAZON FIX DEPLOY)...');

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
    
    // Admin clicks API
    if (req.url === '/api/admin/clicks' && req.method === 'GET') {
      try {
        const db = getDatabaseService();
        if (!db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Database service not available' }));
          return;
        }
        
        const clicks = await db.getAnalyticsEvents();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, clicks }));
      } catch (error) {
        console.error('🚨 Clicks error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Failed to get clicks' }));
      }
      return;
    }
    
    // Admin update affiliate API
    if (req.url === '/api/admin/update-affiliate' && req.method === 'POST') {
      try {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', async () => {
          try {
            const { productId, affiliateId } = JSON.parse(body);
            const db = getDatabaseService();
            
            if (!db) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: 'Database service not available' }));
              return;
            }
            
            // Update affiliate ID in database
            await db.updateSponsoredProductAffiliate(productId, affiliateId);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Affiliate ID updated successfully' }));
          } catch (error) {
            console.error('🚨 Update affiliate error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Failed to update affiliate ID' }));
          }
        });
      } catch (error) {
        console.error('🚨 Update affiliate error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Failed to update affiliate ID' }));
      }
      return;
    }
    
    // Admin delete user API
    if (req.url.startsWith('/api/admin/users/') && req.method === 'DELETE') {
      try {
        const userId = req.url.split('/').pop();
        const db = getDatabaseService();
        
        if (!db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Database service not available' }));
          return;
        }
        
        await db.deleteUser(userId);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'User deleted successfully' }));
      } catch (error) {
        console.error('🚨 Delete user error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Failed to delete user' }));
      }
      return;
    }
    
    // Personalized deals endpoint
    if (req.url.startsWith('/deals') && req.method === 'GET') {
      try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const token = url.searchParams.get('token');
        
        if (!token) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Token is required' }));
          return;
        }
        
        const db = getDatabaseService();
        if (!db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Database service not available' }));
          return;
        }
        
        // Get user by token
        console.log('🔍 Looking up user with token:', token.substring(0, 10) + '...');
        const user = await db.getUserByToken(token);
        if (!user) {
          console.log('❌ User not found for token');
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid or expired token' }));
          return;
        }
        console.log('✅ User found:', user.email);
        
        // Get user's categories (stored in preferences field)
        const userCategories = JSON.parse(user.preferences || '[]');
        console.log('🔍 User categories:', userCategories);
        console.log('🔍 User preferences raw:', user.preferences);
        
        // Get sponsored products
        const productsModule = getSponsoredProducts();
        if (!productsModule) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Sponsored products not available' }));
          return;
        }
        
        // Get products by user's categories (temporary fix)
        console.log('🔍 Available functions:', Object.keys(productsModule));
        
        // Use the working method for now
        const allProductsTemp = productsModule.getActiveSponsoredProducts(1000);
        const allProducts = allProductsTemp.filter(product => 
          userCategories.includes(product.category)
        );
        console.log('🔍 Products for user categories:', allProducts.map(p => ({ title: p.title, category: p.category })));
        
        // Filter products to ensure 50%+ off (all products are live Amazon products)
        const personalizedProducts = allProducts.filter(product => {
          // Calculate discount percentage
          const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
          
          // Only show products with 50%+ off
          return discount >= 50;
        });
        console.log('🔍 Personalized products:', personalizedProducts.map(p => ({ title: p.title, category: p.category })));
        
        // Add affiliate URLs and fix field names
        const productsWithUrls = personalizedProducts.map(product => ({
          ...product,
          name: product.title,
          imageUrl: product.imageUrl,
          affiliateUrl: product.affiliateUrl,
          discount: Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100),
          salePrice: product.price,
          originalPrice: product.originalPrice
        }));
        
        // Get category display names
        const categoryNames = {
          'tech-electronics': 'Tech & Electronics',
          'fashion': 'Fashion',
          'home-garden': 'Home & Garden',
          'sports-outdoors': 'Sports & Outdoors',
          'health-beauty': 'Health & Beauty',
          'food-dining': 'Food & Dining',
          'travel': 'Travel',
          'kids-family': 'Kids & Family',
          'automotive': 'Automotive',
          'books-media': 'Books & Media',
          'entertainment': 'Entertainment',
          'office-education': 'Office & Education',
          'pets': 'Pets',
          'other': 'Other'
        };

        // Generate personalized deals page with category filtering
        console.log('🔍 About to generate HTML for', productsWithUrls.length, 'products');
        const dealsHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Personalized Deals - Catered Savers</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
              .container { max-width: 1200px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 40px; }
              .header h1 { color: #2c3e50; margin-bottom: 10px; }
              .header p { color: #7f8c8d; font-size: 18px; }

              .filter-section { text-align: center; margin-bottom: 30px; }
              .filter-btn { background: #95a5a6; color: white; border: none; padding: 10px 20px; border-radius: 6px; margin: 0 5px; cursor: pointer; transition: background 0.3s; }
              .filter-btn:hover { background: #7f8c8d; }
              .filter-btn.active { background: #e74c3c; }
              .products { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
              .product { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); transition: transform 0.3s; }
              .product:hover { transform: translateY(-5px); }
              .product img { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 15px; }
              .product h3 { color: #2c3e50; margin: 0 0 10px 0; }
              .product p { color: #7f8c8d; margin: 0 0 15px 0; line-height: 1.5; }
              .product .price { font-size: 24px; font-weight: bold; color: #e74c3c; margin-bottom: 15px; }
              .product .discount { background: #e74c3c; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; display: inline-block; margin-bottom: 10px; }
              .product .category { background: #3498db; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; display: inline-block; margin-bottom: 15px; }
              .product .btn { background: #e74c3c; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block; font-weight: bold; transition: background 0.3s; }
              .product .btn:hover { background: #c0392b; }
              .no-products { text-align: center; padding: 60px 20px; color: #7f8c8d; }
              .stats { text-align: center; margin-bottom: 30px; color: #7f8c8d; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎯 Your Personalized Deals</h1>
                <p>Hi ${user.firstName || 'there'}! Here are deals tailored to your interests:</p>
              </div>
              
              <div class="filter-section">
                <button class="filter-btn active" onclick="filterProducts('all')">All Categories</button>
                ${userCategories.map(cat => `
                  <button class="filter-btn" onclick="filterProducts('${cat}')">${categoryNames[cat] || cat}</button>
                `).join('')}
              </div>
              
              <div class="stats">
                <p>Showing ${productsWithUrls.length} deals across ${userCategories.length} categories</p>
              </div>
              
              ${productsWithUrls.length > 0 ? `
                                        <div class="products" id="products-container">
                          ${productsWithUrls.map(product => `
                            <div class="product" data-category="${product.category}">
                              <img src="${product.imageUrl}" alt="${product.name}">
                              <div class="discount">${product.discount}% OFF</div>
                              <div class="category">${categoryNames[product.category] || product.category}</div>
                              <h3>${product.name}</h3>
                              <p>${product.description}</p>
                              <div class="price">$${product.salePrice} <span style="text-decoration: line-through; color: #bdc3c7; font-size: 16px;">$${product.originalPrice}</span></div>
                              <a href="${product.affiliateUrl}" class="btn" target="_blank" onclick="trackClick(${product.id})">View Deal</a>
                            </div>
                          `).join('')}
                        </div>
              ` : `
                <div class="no-products">
                  <h2>No deals available for your categories yet</h2>
                  <p>Check back soon for personalized offers!</p>
                </div>
              `}
            </div>
            
            <script>
              function filterProducts(category) {
                const products = document.querySelectorAll('.product');
                const buttons = document.querySelectorAll('.filter-btn');
                
                // Update button states
                buttons.forEach(btn => btn.classList.remove('active'));
                event.target.classList.add('active');
                
                // Filter products
                products.forEach(product => {
                  if (category === 'all' || product.dataset.category === category) {
                    product.style.display = 'block';
                  } else {
                    product.style.display = 'none';
                  }
                });
              }
              
              function trackClick(productId) {
                // Track affiliate click for analytics
                fetch('/api/track-sponsored-click', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ productId: productId })
                }).catch(err => console.log('Click tracking failed:', err));
              }
            </script>
          </body>
          </html>
        `;
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(dealsHtml);
        
      } catch (error) {
        console.error('🚨 Personalized deals error:', error);
        console.error('🚨 Error stack:', error.stack);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Internal server error', 
          details: error.message,
          timestamp: new Date().toISOString()
        }));
      }
      return;
    }
    
    // Amazon deals scraping endpoint
    if (req.url === '/api/admin/scrape-amazon-deals' && req.method === 'POST') {
      try {
        // Lazy load the scraper
        const getAmazonScraper = () => {
          try {
            const AmazonDealsScraper = require('./services/scrapers/amazon-deals-scraper');
            return new AmazonDealsScraper('820cf-20');
          } catch (error) {
            console.error('🚨 Failed to load Amazon scraper:', error);
            return null;
          }
        };
        
        const scraper = getAmazonScraper();
        if (!scraper) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Failed to load Amazon scraper' }));
          return;
        }
        
        console.log('🔄 Starting Amazon deals scraping...');
        const deals = await scraper.scrapeDeals();
        
        console.log(`🎯 Found ${deals.length} Amazon deals with 50%+ off`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: `Found ${deals.length} Amazon deals with 50%+ off`,
          deals: deals,
          count: deals.length
        }));
      } catch (error) {
        console.error('🚨 Amazon scraping error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
      return;
    }
    
    // Click tracking endpoint
    if (req.url === '/api/track-sponsored-click' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const { productId } = JSON.parse(body);
          
          const db = getDatabaseService();
          if (db) {
            // Log the click for analytics
            await db.logAnalyticsEvent('sponsored_click', {
              productId: productId,
              timestamp: new Date().toISOString(),
              type: 'affiliate_click'
            });
            console.log(`📊 Sponsored product click tracked: Product ${productId}`);
          }
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } catch (error) {
          console.error('🚨 Click tracking error:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Tracking failed' }));
        }
      });
      return;
    }
    
    // Test scraper endpoint
    if (req.url === '/api/admin/test-scraper' && req.method === 'POST') {
      try {
        // Lazy load the scraper
        const getAmazonScraper = () => {
          try {
            const AmazonDealsScraper = require('./services/scrapers/amazon-deals-scraper');
            return new AmazonDealsScraper('820cf-20');
          } catch (error) {
            console.error('🚨 Failed to load Amazon scraper:', error);
            return null;
          }
        };
        
        const scraper = getAmazonScraper();
        if (!scraper) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Failed to load Amazon scraper' }));
          return;
        }
        
        console.log('🧪 Testing Amazon scraper...');
        const deals = await scraper.scrapeDeals();
        
        console.log(`🎯 Test completed. Found ${deals.length} test deals`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          count: deals.length,
          deals: deals.slice(0, 3), // Return first 3 deals for testing
          message: 'Scraper test completed successfully'
        }));
        
      } catch (error) {
        console.error('🚨 Test scraper error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Test scraper failed: ' + error.message }));
      }
      return;
    }
    
    // Run deal discovery endpoint
    if (req.url === '/api/admin/run-deal-discovery' && req.method === 'POST') {
      try {
        const db = getDatabaseService();
        if (!db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Database service not available' }));
          return;
        }
        
        // Lazy load the scraper
        const getAmazonScraper = () => {
          try {
            const AmazonDealsScraper = require('./services/scrapers/amazon-deals-scraper');
            return new AmazonDealsScraper('820cf-20');
          } catch (error) {
            console.error('🚨 Failed to load Amazon scraper:', error);
            return null;
          }
        };
        
        const scraper = getAmazonScraper();
        if (!scraper) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Failed to load Amazon scraper' }));
          return;
        }
        
        console.log('🔍 Running deal discovery...');
        const deals = await scraper.scrapeDeals();
        
        // Save new deals to database
        let savedCount = 0;
        for (const deal of deals) {
          try {
            await db.createSponsoredProduct(deal);
            savedCount++;
          } catch (error) {
            console.log(`⚠️ Deal already exists or error saving: ${deal.title}`);
          }
        }
        
        console.log(`🎯 Deal discovery completed. Found ${deals.length} deals, saved ${savedCount} new ones`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          count: savedCount,
          deals: deals.slice(0, 5), // Return first 5 deals
          message: `Deal discovery completed. Found ${deals.length} deals, saved ${savedCount} new ones`
        }));
        
      } catch (error) {
        console.error('🚨 Deal discovery error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Deal discovery failed: ' + error.message }));
      }
      return;
    }
    
    // Validate deal endpoint
    if (req.url.startsWith('/api/validate-deal/') && req.method === 'GET') {
      try {
        const productId = req.url.split('/').pop();
        const db = getDatabaseService();
        
        if (!db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Database service not available' }));
          return;
        }
        
        // Get product from database
        const product = await db.getSponsoredProductById(productId);
        if (!product) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Product not found' }));
          return;
        }
        
        // Validate the deal
        const RealAmazonScraper = require('./services/scrapers/real-amazon-scraper');
        const scraper = new RealAmazonScraper();
        const validation = await scraper.validateDeal(product);
        
        // Update product status based on validation
        if (!validation.isValid) {
          // Mark as expired but keep for 7 days
          await db.updateSponsoredProduct(productId, {
            isExpired: true,
            expiredAt: new Date().toISOString(),
            lastValidated: new Date().toISOString()
          });
        } else {
          // Update validation timestamp
          await db.updateSponsoredProduct(productId, {
            lastValidated: new Date().toISOString()
          });
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          product: product,
          validation: validation
        }));
        
      } catch (error) {
        console.error('🚨 Deal validation error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Failed to validate deal' }));
      }
      return;
    }
    
    // Update product images endpoint
    if (req.url === '/api/admin/update-product-images' && req.method === 'POST') {
      try {
        const ImageScraper = require('./services/scrapers/image-scraper');
        const scraper = new ImageScraper();
        const db = getDatabaseService();
        
        if (!db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Database service not available' }));
          return;
        }
        
        console.log('🖼️ Starting product image update...');
        
        // Get all products that need image updates
        const products = await db.getAllSponsoredProducts();
        const productsNeedingImages = products.filter(p => 
          !p.image || p.image.includes('placeholder') || p.image.includes('via.placeholder')
        );
        
        console.log(`📊 Found ${productsNeedingImages.length} products needing image updates`);
        
        // Scrape images in batches
        const updatedProducts = await scraper.scrapeImagesForProducts(productsNeedingImages, 3);
        
        // Update database with new images
        let updatedCount = 0;
        for (const product of updatedProducts) {
          try {
            await db.updateSponsoredProduct(product.id, { 
              image: product.image,
              imageScrapedAt: product.imageScrapedAt
            });
            updatedCount++;
          } catch (error) {
            console.error(`❌ Failed to update image for product ${product.id}:`, error);
          }
        }
        
        console.log(`✅ Updated ${updatedCount} product images`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: `Updated ${updatedCount} product images`,
          updatedCount,
          totalProducts: productsNeedingImages.length
        }));
        
      } catch (error) {
        console.error('🚨 Update product images error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Failed to update product images' }));
      }
      return;
    }
    
    // System status endpoint for admin panel
    if (req.url === '/api/weekly-automation/status' && req.method === 'GET') {
      try {
        const mailchimpService = getMailchimp();
        const db = getDatabaseService();
        
        if (!mailchimpService || !db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Services not available' }));
          return;
        }
        
        // Get user counts
        const users = await db.getAllUsers();
        const userCount = users.length;
        
        // Get Mailchimp stats
        let listMembers = 0;
        let recentCampaigns = 0;
        
        try {
          const listInfo = await mailchimpService.lists.getList(process.env.MAILCHIMP_AUDIENCE_ID);
          listMembers = listInfo.stats.member_count;
          
          const campaigns = await mailchimpService.campaigns.list({ count: 10 });
          recentCampaigns = campaigns.campaigns.length;
        } catch (mailchimpError) {
          console.log('⚠️ Mailchimp stats unavailable:', mailchimpError.message);
        }
        
        const status = {
          userCount,
          listMembers,
          recentCampaigns,
          lastUpdated: new Date().toISOString()
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, status }));
        
      } catch (error) {
        console.error('🚨 System status error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Failed to get system status' }));
      }
      return;
    }
    
    // Mailchimp users endpoint
    if (req.url === '/api/mailchimp/users' && req.method === 'GET') {
      try {
        const mailchimpService = getMailchimp();
        
        if (!mailchimpService) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            totalSubscribers: 0, 
            message: 'Mailchimp not configured' 
          }));
          return;
        }
        
        try {
          const listInfo = await mailchimpService.lists.getList(process.env.MAILCHIMP_AUDIENCE_ID);
          const totalSubscribers = listInfo.stats.member_count;
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            totalSubscribers,
            listName: listInfo.name
          }));
        } catch (mailchimpError) {
          console.log('⚠️ Mailchimp API error:', mailchimpError.message);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            totalSubscribers: 0, 
            message: 'Mailchimp API error: ' + mailchimpError.message 
          }));
        }
        
      } catch (error) {
        console.error('🚨 Mailchimp users endpoint error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Failed to get Mailchimp users' }));
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
        
        // Step 1: Add database users to Mailchimp
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
        
        // Step 2: Get Mailchimp users and add any missing ones to database
        try {
          const mailchimpMembers = await mailchimpService.lists.getAllListMembers(
            process.env.MAILCHIMP_AUDIENCE_ID,
            { count: 1000 }
          );
          
          console.log(`📊 Found ${mailchimpMembers.members.length} users in Mailchimp`);
          
          for (const member of mailchimpMembers.members) {
            try {
              const existingUser = await db.getUserByEmail(member.email_address);
              
              if (!existingUser) {
                // Add Mailchimp user to database
                await db.createUser(
                  member.email_address,
                  member.merge_fields?.FNAME || null,
                  JSON.stringify(['tech-electronics', 'home-garden']) // Default categories
                );
                console.log(`✅ Added Mailchimp user ${member.email_address} to database`);
                syncedCount++;
              }
            } catch (dbError) {
              console.error(`❌ Failed to add Mailchimp user ${member.email_address} to database:`, dbError.message);
              errors.push(`DB: ${member.email_address}: ${dbError.message}`);
            }
          }
        } catch (mailchimpError) {
          console.error(`❌ Failed to get Mailchimp members:`, mailchimpError.message);
          errors.push(`Mailchimp API: ${mailchimpError.message}`);
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
        res.end(JSON.stringify({ error: 'Internal server error' }));
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
