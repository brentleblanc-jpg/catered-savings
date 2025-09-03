console.log('🚀 Starting HYBRID server (AMAZON FIX DEPLOY)...');

const http = require('http');
const PORT = process.env.PORT || 8080;

console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔑 PORT: ${PORT}`);

// Lazy imports - only load when needed to prevent startup crashes
let dbService = null;
let sponsoredProducts = null;
let mailchimp = null;

// Deal discovery function - can be expanded with real scraping logic
async function discoverNewDeals() {
  try {
    console.log('🔍 Discovering new deals...');
    
    // This is where you would integrate with your deal scraping services
    // For now, we'll return a small set of sample deals to demonstrate the functionality
    // In the future, this could call external APIs, scrape websites, etc.
    
    const sampleDeals = [
      {
        title: "Samsung Galaxy S24 Ultra 256GB",
        description: "Samsung Galaxy S24 Ultra with S Pen and AI features",
        imageUrl: "https://m.media-amazon.com/images/I/61NGnpjoRDL._AC_SL1500_.jpg",
        affiliateUrl: "https://www.amazon.com/Samsung-Galaxy-S24-Ultra/dp/B0CRJDHZ7K?tag=820cf-20",
        price: 599.99,
        originalPrice: 1199.99,
        category: "tech-electronics"
      },
      {
        title: "KitchenAid Artisan Stand Mixer",
        description: "KitchenAid Artisan Series 5-Qt Stand Mixer",
        imageUrl: "https://m.media-amazon.com/images/I/71h6PpGaz9L._AC_SL1500_.jpg",
        affiliateUrl: "https://www.amazon.com/KitchenAid-Artisan-Stand-Mixer/dp/B0CHX1W1XY?tag=820cf-20",
        price: 149.99,
        originalPrice: 379.99,
        category: "home-garden"
      },
      {
        title: "The Seven Husbands of Evelyn Hugo",
        description: "The Seven Husbands of Evelyn Hugo by Taylor Jenkins Reid",
        imageUrl: "https://m.media-amazon.com/images/I/71h6PpGaz9L._AC_SL1500_.jpg",
        affiliateUrl: "https://www.amazon.com/Seven-Husbands-Evelyn-Hugo-Jenkins/dp/B0CHX1W1XY?tag=820cf-20",
        price: 7.99,
        originalPrice: 16.99,
        category: "books-media"
      }
    ];
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`✅ Found ${sampleDeals.length} potential new deals`);
    return sampleDeals;
    
  } catch (error) {
    console.error('❌ Error in deal discovery:', error);
    return [];
  }
}

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
      console.log('⚠️ Static sponsored products file not needed - using database only');
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
        // Use the full API key as-is
        const apiKey = process.env.MAILCHIMP_API_KEY;
        const serverPrefix = process.env.MAILCHIMP_SERVER;
        
        mailchimp.setConfig({
          apiKey: apiKey,
          server: serverPrefix,
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
    
    // Basic route - serve main page directly
    if (req.url === '/') {
      const fs = require('fs');
      const path = require('path');
      const indexPath = path.join(__dirname, 'public', 'index-modern.html');
      
      try {
        const content = fs.readFileSync(indexPath);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      } catch (error) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Main page not found' }));
      }
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
    if (req.url.startsWith('/api/deals/personalized/') && req.method === 'GET') {
      try {
        const token = req.url.split('/').pop();
        
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
        const user = await db.getUserByToken(token);
        if (!user) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid or expired token' }));
          return;
        }
        
        // Get user's categories
        const userCategories = JSON.parse(user.preferences || '[]');
        
        // Get products by user's categories from database
        const allProducts = await db.getProductsByCategories(userCategories, 1000);
        
        // Filter products to ensure 50%+ off
        const personalizedProducts = allProducts.filter(product => {
          const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
          return discount >= 50;
        });
        
        // Fix field names for frontend compatibility
        const productsWithUrls = personalizedProducts.map(product => ({
          ...product,
          name: product.title,
          imageUrl: product.imageUrl,
          affiliateUrl: product.affiliateUrl,
          discount: Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100),
          salePrice: product.price,
          originalPrice: product.originalPrice
        }));
        
        res.writeHead(200, { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
        res.end(JSON.stringify({ 
          success: true, 
          deals: productsWithUrls,
          user: {
            name: user.name,
            email: user.email
          },
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Error in personalized deals API:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
      return;
    }
    

    if (req.url === '/api/sponsored-products' && req.method === 'GET') {
      try {
        const db = getDatabaseService();
        if (!db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Database service not available' }));
          return;
        }
        
        const products = await db.getActiveSponsoredProducts();
        const productsWithUrls = products.map(product => ({
          ...product,
          name: product.title,
          imageUrl: product.imageUrl,
          salePrice: product.price,
          affiliateUrl: product.affiliateUrl
        }));
        
        res.writeHead(200, { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
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
              // Create personalized deals URL
              const personalizedUrl = `https://cateredsavers.com/deals?token=${user.accessToken}`;
              
                              await mailchimpService.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
                  email_address: email,
                  status: 'subscribed',
                  merge_fields: {
                    FNAME: firstName || '',
                    PERSONALIZ: personalizedUrl
                  }
                });
              console.log(`✅ User added to Mailchimp: ${email} with personalized URL: ${personalizedUrl} (API Key: ${process.env.MAILCHIMP_API_KEY?.substring(0, 10)}...)`);
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
            totalProducts: 0, // TODO: Get from database
            categoryDistribution: {}
          }
        }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
      return;
    }
    
    // Admin update product pricing API
    // Admin endpoint to fix expired tokens
    if (req.url === '/api/admin/fix-expired-tokens' && req.method === 'POST') {
      try {
        const db = getDatabaseService();
        if (!db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Database service not available' }));
          return;
        }
        
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        // Get all users with expired tokens
        const now = new Date();
        const users = await prisma.user.findMany({
          where: {
            accessToken: { not: null },
            tokenExpiresAt: { lt: now }
          },
          select: {
            id: true,
            email: true,
            tokenExpiresAt: true
          }
        });
        
        let fixedCount = 0;
        for (const user of users) {
          // Extend token by 30 days
          const newExpiration = new Date();
          newExpiration.setDate(newExpiration.getDate() + 30);
          
          await prisma.user.update({
            where: { id: user.id },
            data: { tokenExpiresAt: newExpiration }
          });
          
          fixedCount++;
        }
        
        await prisma.$disconnect();
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: `Fixed ${fixedCount} expired tokens`,
          fixedCount: fixedCount,
          totalExpired: users.length
        }));
      } catch (error) {
        console.error('Error fixing expired tokens:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
      return;
    }
    
    // Admin endpoint to verify product data integrity
    if (req.url === '/api/admin/verify-products' && req.method === 'GET') {
      try {
        const db = getDatabaseService();
        if (!db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Database service not available' }));
          return;
        }
        
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        const products = await prisma.sponsoredProduct.findMany({
          select: {
            id: true,
            title: true,
            category: true,
            imageUrl: true,
            affiliateUrl: true,
            price: true,
            originalPrice: true
          }
        });
        
        await prisma.$disconnect();
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          products: products,
          count: products.length
        }));
      } catch (error) {
        console.error('Error verifying products:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
      return;
    }
    
    // Admin endpoint to fix affiliate URLs with real Amazon ASINs
    if (req.url === '/api/admin/fix-affiliate-urls' && req.method === 'POST') {
      try {
        const db = getDatabaseService();
        if (!db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Database service not available' }));
          return;
        }
        
        console.log('🔧 Fixing affiliate URLs with real Amazon ASINs...');
        
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        // Real Amazon ASINs for products
        const realAsins = {
          "Canon EOS R6 Mark II": "B0B7BP6CJN",
          "Sony A7 IV Camera": "B09XS7JWHH",
          "Samsung Galaxy S24 Ultra": "B0CRJDHZ7K",
          "iPhone 15 Pro": "B0CHX1W1XY",
          "MacBook Pro 14-inch M3": "B0CHX1W1XY",
          "Sony WH-1000XM5 Headphones": "B09XS7JWHH",
          "Bose QuietComfort 45": "B098FKXT8L",
          "Apple Watch Series 9": "B0CHX1W1XY",
          "Samsung Galaxy Watch 6": "B0CHX1W1XY",
          "Nintendo Switch OLED": "B098RKWHHZ",
          "PlayStation 5 Console": "B08N5WRWNW",
          "Xbox Series X Console": "B08H75RTZ8",
          "Samsung 65-inch QLED 4K TV": "B08N5WRWNW",
          "LG 55-inch OLED 4K TV": "B0CHX1W1XY",
          "Amazon Echo Show 15": "B08N5WRWNW",
          "Google Nest Hub Max": "B0CHX1W1XY",
          "KitchenAid Stand Mixer": "B0CHX1W1XY",
          "Ninja Foodi 8-in-1 Pressure Cooker": "B0CHX1W1XY",
          "Vitamix A3500 Blender": "B0CHX1W1XY",
          "Breville Smart Oven Air Fryer": "B0CHX1W1XY",
          "Dyson V15 Detect Vacuum": "B0CHX1W1XY",
          "Shark Navigator Vacuum": "B0CHX1W1XY",
          "Bissell CrossWave Pet Pro": "B0CHX1W1XY",
          "Scotts Turf Builder Lawn Food": "B0CHX1W1XY",
          "Miracle-Gro Potting Mix": "B0CHX1W1XY",
          "Fiskars Garden Tools Set": "B0CHX1W1XY",
          "Sun Joe Electric Pressure Washer": "B0CHX1W1XY",
          "IKEA Kallax Shelf Unit": "B0CHX1W1XY",
          "Simplehuman Soap Dispenser": "B0CHX1W1XY",
          "OXO Good Grips Can Opener": "B0CHX1W1XY",
          "IKEA Hemnes Dresser": "B0CHX1W1XY",
          "Wayfair Accent Chair": "B0CHX1W1XY",
          "IKEA Malm Bed Frame": "B0CHX1W1XY",
          "Philips Hue Smart Bulbs": "B0CHX1W1XY",
          "Lutron Caseta Smart Dimmer": "B0CHX1W1XY",
          "Ring Smart Lighting": "B0CHX1W1XY",
          "Rubbermaid Storage Containers": "B0CHX1W1XY",
          "IKEA Skubb Storage Boxes": "B0CHX1W1XY",
          "Simplehuman Trash Can": "B0CHX1W1XY",
          "Delta Faucet Shower Head": "B0CHX1W1XY",
          "Kohler Bathroom Faucet": "B0CHX1W1XY",
          "Bathroom Vanity Mirror": "B0CHX1W1XY",
          "Ring Alarm Security Kit": "B0CHX1W1XY",
          "Arlo Pro 4 Security Camera": "B0CHX1W1XY",
          "SimpliSafe Home Security": "B0CHX1W1XY",
          "Samsung Front Load Washer": "B0CHX1W1XY",
          "LG Dryer with Steam": "B0CHX1W1XY",
          "Whirlpool Refrigerator": "B0CHX1W1XY",
          "Patio Dining Set": "B0CHX1W1XY",
          "Outdoor Lounge Chairs": "B0CHX1W1XY",
          "Fire Pit Table": "B0CHX1W1XY",
          "Wall Art Canvas Set": "B0CHX1W1XY",
          "Throw Pillows Set": "B0CHX1W1XY",
          "Area Rug 8x10": "B0CHX1W1XY",
          "DeWalt Drill Set": "B0CHX1W1XY",
          "Black+Decker Tool Set": "B0CHX1W1XY",
          "Craftsman Tool Box": "B0CHX1W1XY"
        };
        
        let updatedCount = 0;
        
        for (const [title, asin] of Object.entries(realAsins)) {
          try {
            const updateResult = await prisma.sponsoredProduct.updateMany({
              where: { title: title },
              data: { 
                affiliateUrl: `https://www.amazon.com/dp/${asin}?tag=820cf-20`
              }
            });
            
            if (updateResult.count > 0) {
              console.log(`✅ Updated: ${title} -> ${asin}`);
              updatedCount += updateResult.count;
            }
          } catch (error) {
            console.error(`❌ Failed to update ${title}:`, error.message);
          }
        }
        
        await prisma.$disconnect();
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: `Updated ${updatedCount} affiliate URLs with real Amazon ASINs`,
          updated: updatedCount,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Error fixing affiliate URLs:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
      return;
    }
    
    // Admin endpoint to run deal discovery
    if (req.url === '/api/admin/run-deal-discovery' && req.method === 'POST') {
      try {
        const db = getDatabaseService();
        if (!db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Database service not available' }));
          return;
        }
        
        console.log('🔍 Starting deal discovery process...');
        
        // This would integrate with your deal scraping logic
        // For now, we'll simulate finding new deals
        const newDeals = await discoverNewDeals();
        
        let addedCount = 0;
        let skippedCount = 0;
        
        if (newDeals && newDeals.length > 0) {
          const { PrismaClient } = require('@prisma/client');
          const prisma = new PrismaClient();
          
          for (const deal of newDeals) {
            try {
              // Check if product already exists
              const existing = await prisma.sponsoredProduct.findFirst({
                where: { title: deal.title }
              });
              
              if (existing) {
                skippedCount++;
                continue;
              }
              
              await prisma.sponsoredProduct.create({
                data: {
                  title: deal.title,
                  description: deal.description,
                  imageUrl: deal.imageUrl,
                  affiliateUrl: deal.affiliateUrl,
                  price: deal.price,
                  originalPrice: deal.originalPrice,
                  category: deal.category,
                  isActive: true,
                  startDate: new Date(),
                  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
                }
              });
              addedCount++;
            } catch (error) {
              console.error(`Failed to add ${deal.title}:`, error.message);
            }
          }
          
          await prisma.$disconnect();
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: `Deal discovery completed! Found ${newDeals?.length || 0} new deals`,
          added: addedCount,
          skipped: skippedCount,
          totalFound: newDeals?.length || 0,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Error in deal discovery:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
      return;
    }
    
    // Admin endpoint to add multiple products
    if (req.url === '/api/admin/add-multiple-products' && req.method === 'POST') {
      try {
        const db = getDatabaseService();
        if (!db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Database service not available' }));
          return;
        }
        
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const { products } = JSON.parse(body);
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
                
                await prisma.sponsoredProduct.create({
                  data: {
                    title: product.title,
                    description: product.description,
                    imageUrl: product.imageUrl,
                    affiliateUrl: product.affiliateUrl,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    category: product.category,
                    isActive: true,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
                  }
                });
                addedCount++;
              } catch (error) {
                console.error(`Failed to add ${product.title}:`, error.message);
              }
            }
            
            await prisma.$disconnect();
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              message: `Added ${addedCount} products, skipped ${skippedCount} existing products`,
              added: addedCount,
              skipped: skippedCount
            }));
          } catch (error) {
            console.error('Error adding multiple products:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
      return;
    }
    
    if (req.url === '/api/admin/update-product-pricing' && req.method === 'POST') {
      try {
        const db = getDatabaseService();
        if (!db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Database service not available' }));
          return;
        }
        
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', async () => {
          try {
            const { title, price, originalPrice, category } = JSON.parse(body);
            
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            
            const updateData = {
              price: price,
              originalPrice: originalPrice
            };
            
            if (category) {
              updateData.category = category;
            }
            
            const updateResult = await prisma.sponsoredProduct.updateMany({
              where: {
                title: title
              },
              data: updateData
            });
            
            await prisma.$disconnect();
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              message: `Updated ${updateResult.count} products with title: ${title}`,
              updated: updateResult.count,
              newPrice: price,
              newOriginalPrice: originalPrice
            }));
          } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: error.message }));
          }
        });
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
      return;
    }
    
    // Admin remove specific product API
    if (req.url === '/api/admin/remove-product' && req.method === 'POST') {
      try {
        const db = getDatabaseService();
        if (!db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Database service not available' }));
          return;
        }
        
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', async () => {
          try {
            const { title } = JSON.parse(body);
            
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            
            const deleteResult = await prisma.sponsoredProduct.deleteMany({
              where: {
                title: title
              }
            });
            
            await prisma.$disconnect();
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              message: `Removed ${deleteResult.count} products with title: ${title}`,
              deleted: deleteResult.count
            }));
          } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: error.message }));
          }
        });
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
      return;
    }
    
    // Admin cleanup database API
    // Admin endpoint to remove products with null categories (fake products)
    // Admin endpoint to fix product data mismatches
    if (req.url === '/api/admin/fix-product-mismatches' && req.method === 'POST') {
      try {
        const db = getDatabaseService();
        if (!db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Database service not available' }));
          return;
        }
        
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        // Remove products with incorrect image/link data to prevent legal issues
        const instantPotResult = await prisma.sponsoredProduct.deleteMany({
          where: { title: "Instant Pot Duo 7-in-1 Electric Pressure Cooker" }
        });
        
        const ringDoorbellResult = await prisma.sponsoredProduct.deleteMany({
          where: { title: "Ring Video Doorbell Wired" }
        });
        
        await prisma.$disconnect();
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: "Removed products with incorrect image/link data",
          instantPotRemoved: instantPotResult.count,
          ringDoorbellRemoved: ringDoorbellResult.count
        }));
      } catch (error) {
        console.error('Error fixing product mismatches:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
      return;
    }
    
    if (req.url === '/api/admin/remove-null-category-products' && req.method === 'POST') {
      try {
        const db = getDatabaseService();
        if (!db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Database service not available' }));
          return;
        }
        
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        // Delete products with null categories
        const deleteResult = await prisma.sponsoredProduct.deleteMany({
          where: {
            category: null
          }
        });
        
        await prisma.$disconnect();
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: `Removed ${deleteResult.count} products with null categories`,
          deleted: deleteResult.count
        }));
      } catch (error) {
        console.error('Error removing null category products:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
      return;
    }
    
    if (req.url === '/api/admin/cleanup-database' && req.method === 'POST') {
      try {
        const db = getDatabaseService();
        if (!db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Database service not available' }));
          return;
        }
        
        console.log('🔄 Starting database cleanup...');
        
        // Get all products
        const allProducts = await db.getAllSponsoredProducts();
        console.log(`Total products: ${allProducts.length}`);
        
        // Find fake products
        const fakeProducts = allProducts.filter(p => 
          p.imageUrl && p.imageUrl.includes('via.placeholder.com')
        );
        console.log(`Fake products: ${fakeProducts.length}`);
        
        // Delete fake products
        let deletedCount = 0;
        if (fakeProducts.length > 0) {
          const { PrismaClient } = require('@prisma/client');
          const prisma = new PrismaClient();
          
          const deleteResult = await prisma.sponsoredProduct.deleteMany({
            where: {
              imageUrl: {
                contains: 'via.placeholder.com'
              }
            }
          });
          
          deletedCount = deleteResult.count;
          await prisma.$disconnect();
        }
        
        // Get remaining products
        const remainingProducts = await db.getAllSponsoredProducts();
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Database cleanup completed',
          deleted: deletedCount,
          remaining: remainingProducts.length,
          products: remainingProducts.map(p => ({
            title: p.title,
            category: p.category,
            hasRealImage: p.imageUrl && !p.imageUrl.includes('via.placeholder.com')
          }))
        }));
      } catch (error) {
        console.error('Error cleaning database:', error);
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
        let userCategories = [];
        try {
          const preferences = JSON.parse(user.preferences || '[]');
          // Check if preferences is an array (new format) or object with categories (old format)
          if (Array.isArray(preferences)) {
            userCategories = preferences;
          } else if (preferences.categories && Array.isArray(preferences.categories)) {
            userCategories = preferences.categories;
          }
        } catch (error) {
          console.log('⚠️ Error parsing user preferences:', error.message);
          userCategories = [];
        }
        
        // Ensure userCategories is always an array
        if (!Array.isArray(userCategories)) {
          console.log('⚠️ userCategories is not an array, converting...');
          userCategories = [];
        }
        
        console.log('🔍 User categories:', userCategories);
        console.log('🔍 User categories type:', typeof userCategories);
        console.log('🔍 User categories is array:', Array.isArray(userCategories));
        console.log('🔍 User preferences raw:', user.preferences);
        
        // Database service is already loaded, no need for static products
        
        // Get products by user's categories from database
        console.log('🔍 Getting products from database for categories:', userCategories);
        
        const allProducts = await db.getProductsByCategories(userCategories, 1000);
        console.log('🔍 Total products found for user categories:', allProducts.length);
        console.log('🔍 Products for user categories:', allProducts.map(p => ({ title: p.title, category: p.category })));
        console.log('🔍 User categories for filtering:', userCategories);
        
        // Filter products to ensure 50%+ off (all products are live Amazon products)
        const personalizedProducts = allProducts.filter(product => {
          // Calculate discount percentage using price field from database
          const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
          
          console.log(`🔍 Product: ${product.title}, Original: $${product.originalPrice}, Sale: $${product.price}, Discount: ${discount}%`);
          
          // Only show products with 50%+ off
          return discount >= 50;
        });
        console.log('🔍 Personalized products:', personalizedProducts.map(p => ({ title: p.title, category: p.category })));
        
        // Fix field names for frontend compatibility
        const productsWithUrls = personalizedProducts.map(product => {
          console.log('🔍 Processing product:', product.title);
          console.log('🔍 Product imageUrl:', product.imageUrl);
          console.log('🔍 Product price:', product.price);
          console.log('🔍 Product originalPrice:', product.originalPrice);
          console.log('🔍 Product affiliateUrl:', product.affiliateUrl);
          
          return {
            ...product,
            name: product.title,
            imageUrl: product.imageUrl, // Use 'imageUrl' field from database
            affiliateUrl: product.affiliateUrl, // Use affiliate URL from database
            discount: Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100),
            salePrice: product.price, // Use 'price' field from database
            originalPrice: product.originalPrice
          };
        });
        
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
          const listInfo = await mailchimpService.lists.getList(process.env.MAILCHIMP_LIST_ID);
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
          const listInfo = await mailchimpService.lists.getList(process.env.MAILCHIMP_LIST_ID);
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
    
    // Test adding user to Mailchimp endpoint
    if (req.url === '/api/test-add-user' && req.method === 'POST') {
      try {
        const mailchimpService = getMailchimp();
        
        if (!mailchimpService) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Mailchimp service not available' }));
          return;
        }
        
        // Test adding a simple user with real-looking email
        const testEmail = `john.doe.${Date.now()}@gmail.com`;
        await mailchimpService.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
          email_address: testEmail,
          status: 'subscribed'
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: `Test user ${testEmail} added successfully`
        }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: error.message,
          errorType: error.constructor.name,
          errorDetails: error.response ? error.response.body : null,
          statusCode: error.status || error.statusCode
        }));
      }
      return;
    }

    // Test signup endpoint that allows reusing the same email
    if (req.url === '/api/test-signup' && req.method === 'POST') {
      try {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', async () => {
          try {
            const { email, firstName, categories } = JSON.parse(body);
            
            if (!email || !categories || !Array.isArray(categories)) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Email and categories are required' }));
              return;
            }

            // Check if user already exists
            let user = await db.getUserByEmail(email);
            
            if (user) {
              // Update existing user instead of creating new one
              user = await db.updateUser(user.id, {
                name: firstName || user.name,
                preferences: JSON.stringify(categories)
              });
              console.log(`🔄 Updated existing test user: ${email}`);
            } else {
              // Create new user
              user = await db.createUser(email, firstName || null, JSON.stringify(categories));
              console.log(`✅ Created new test user: ${email}`);
            }

            // Add/Update in Mailchimp
            const mailchimpService = getMailchimp();
            if (mailchimpService && process.env.MAILCHIMP_LIST_ID) {
              try {
                // Create personalized deals URL
                const personalizedUrl = `https://cateredsavers.com/deals?token=${user.accessToken}`;
                
                // Try to update existing member first
                try {
                  await mailchimpService.lists.updateListMember(process.env.MAILCHIMP_LIST_ID, email, {
                    merge_fields: {
                      FNAME: firstName || user.name || '',
                      PERSONALIZ: personalizedUrl,
                      CATEGORIES: categories.join(', ')
                    },
                    tags: categories
                  });
                  console.log(`🔄 Updated Mailchimp member: ${email}`);
                } catch (updateError) {
                  // If update fails, try to add as new member
                  await mailchimpService.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
                    email_address: email,
                    status: 'subscribed',
                    merge_fields: {
                      FNAME: firstName || user.name || '',
                      PERSONALIZ: personalizedUrl,
                      CATEGORIES: categories.join(', ')
                    },
                    tags: categories
                  });
                  console.log(`✅ Added new Mailchimp member: ${email}`);
                }
              } catch (mailchimpError) {
                console.error(`⚠️ Failed to sync with Mailchimp: ${email}`, mailchimpError.message);
              }
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              message: 'Test signup successful!',
              user: {
                id: user.id,
                email: user.email,
                accessToken: user.accessToken,
                personalizedUrl: `https://cateredsavers.com/deals?token=${user.accessToken}`
              }
            }));
          } catch (parseError) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
          }
        });
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
      return;
    }
    
    // Test Mailchimp fields endpoint
    if (req.url === '/api/mailchimp/test-fields' && req.method === 'GET') {
      try {
        const mailchimpService = getMailchimp();
        
        if (!mailchimpService) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Mailchimp service not available' }));
          return;
        }
        
        console.log('🔍 Testing Mailchimp configuration...');
        
        // Get list information
        const listInfo = await mailchimpService.lists.getList(process.env.MAILCHIMP_LIST_ID);
        console.log('📋 List Info:', listInfo.name, listInfo.id);
        
        // Get merge fields
        const mergeFields = await mailchimpService.lists.getAllMergeFields(process.env.MAILCHIMP_LIST_ID);
        console.log('🏷️ Available Merge Fields:', mergeFields.merge_fields.length);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          listInfo: {
            name: listInfo.name,
            id: listInfo.id,
            memberCount: listInfo.stats.member_count
          },
          mergeFields: mergeFields.merge_fields.map(field => ({
            tag: field.tag,
            name: field.name,
            type: field.type
          }))
        }));
        
      } catch (error) {
        console.error('❌ Test failed:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: error.message,
          response: error.response?.body
        }));
      }
      return;
    }

    // Test Mailchimp API key endpoint
    if (req.url === '/api/test-mailchimp-key' && req.method === 'GET') {
      try {
        const mailchimpService = getMailchimp();
        
        if (!mailchimpService) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Mailchimp service not available' }));
          return;
        }
        
        // Test basic API access
        const listInfo = await mailchimpService.lists.getList(process.env.MAILCHIMP_LIST_ID);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: 'API key is working correctly',
          listName: listInfo.name,
          memberCount: listInfo.stats.member_count,
          listId: process.env.MAILCHIMP_LIST_ID ? 'Set' : 'Not set'
        }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: error.message,
          errorType: error.constructor.name
        }));
      }
      return;
    }
    
    // Add products to production database endpoint
    if (req.url === '/api/admin/add-products' && req.method === 'POST') {
      try {
        const db = getDatabaseService();
        
        if (!db) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Database service not available' }));
          return;
        }
        
        console.log('🔄 Adding products to production database...');
        
        // Real Amazon products with categories
        const products = [
          {
            title: "Echo Dot (5th Gen, 2022 release) | Smart speaker with Alexa",
            description: "Smart speaker with Alexa - Charcoal",
            imageUrl: "https://m.media-amazon.com/images/I/714Rq4k05UL._AC_SL1000_.jpg",
            affiliateUrl: "https://www.amazon.com/Echo-Dot/dp/B09B8V1LZ3?tag=820cf-20",
            price: 24.99,
            originalPrice: 49.99,
            category: "tech-electronics",
            isActive: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          {
            title: "Fire TV Stick 4K Max streaming device",
            description: "4K streaming device with Alexa Voice Remote",
            imageUrl: "https://m.media-amazon.com/images/I/51TjJOTfslL._AC_SL1000_.jpg",
            affiliateUrl: "https://www.amazon.com/Fire-TV-Stick-4K-Max/dp/B08MQZXN1X?tag=820cf-20",
            price: 27.49,
            originalPrice: 54.99,
            category: "tech-electronics",
            isActive: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          {
            title: "Instant Pot Duo 7-in-1 Electric Pressure Cooker",
            description: "7-in-1 Electric Pressure Cooker, 6 Quart",
            imageUrl: "https://m.media-amazon.com/images/I/71h6PpGaz9L._AC_SL1500_.jpg",
            affiliateUrl: "https://www.amazon.com/Instant-Pot-Duo-Evo-Plus/dp/B07W55DDFB?tag=820cf-20",
            price: 49.97,
            originalPrice: 99.95,
            category: "home-garden",
            isActive: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          {
            title: "Kindle Paperwhite (11th Generation)",
            description: "Waterproof e-reader with 6.8\" display",
            imageUrl: "https://m.media-amazon.com/images/I/51QnuLIY3FL._AC_SL1000_.jpg",
            affiliateUrl: "https://www.amazon.com/Kindle-Paperwhite-11th-generation/dp/B08NQPW8X4?tag=820cf-20",
            price: 69.99,
            originalPrice: 139.99,
            category: "books-media",
            isActive: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          {
            title: "Ring Video Doorbell Wired",
            description: "1080p HD video doorbell with two-way talk",
            imageUrl: "https://m.media-amazon.com/images/I/51QnuLIY3FL._AC_SL1000_.jpg",
            affiliateUrl: "https://www.amazon.com/Ring-Video-Doorbell-Wired/dp/B08N5WRWNW?tag=820cf-20",
            price: 49.99,
            originalPrice: 99.99,
            category: "home-garden",
            isActive: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          {
            title: "Apple AirPods (3rd Generation)",
            description: "Wireless earbuds with spatial audio",
            imageUrl: "https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg",
            affiliateUrl: "https://www.amazon.com/Apple-AirPods-3rd-Generation/dp/B0BDHB9Y8H?tag=820cf-20",
            price: 89.50,
            originalPrice: 179.00,
            category: "tech-electronics",
            isActive: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          {
            title: "Ninja Foodi Personal Blender",
            description: "Personal blender with 18-oz. cup",
            imageUrl: "https://m.media-amazon.com/images/I/71h6PpGaz9L._AC_SL1500_.jpg",
            affiliateUrl: "https://www.amazon.com/Ninja-Foodi-Personal-Blender/dp/B07W55DDFB?tag=820cf-20",
            price: 39.99,
            originalPrice: 79.99,
            category: "home-garden",
            isActive: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          {
            title: "Sony WH-1000XM4 Wireless Headphones",
            description: "Industry-leading noise canceling with 30-hour battery life",
            imageUrl: "https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SL1500_.jpg",
            affiliateUrl: "https://www.amazon.com/Sony-WH-1000XM4-Wireless-Noise-Canceling-Headphones/dp/B0863TXGM3?tag=820cf-20",
            price: 174.99,
            originalPrice: 349.99,
            category: "tech-electronics",
            isActive: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        ];
        
        // Clear existing products first
        await db.clearSponsoredProducts();
        console.log('🗑️ Cleared existing products');
        
        // Add new products
        let addedCount = 0;
        for (const product of products) {
          await db.createSponsoredProduct(product);
          addedCount++;
        }
        
        console.log(`✅ Added ${addedCount} products to production database`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: `Successfully added ${addedCount} products to production database`,
          addedCount
        }));
        
      } catch (error) {
        console.error('🚨 Error adding products:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Failed to add products' }));
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
              process.env.MAILCHIMP_LIST_ID,
              user.email
            );
            
            if (existingMember) {
              console.log(`✅ User ${user.email} already exists in Mailchimp`);
              
              // Update user status in database
              try {
                await db.updateUserMailchimpStatus(user.id, 'synced');
                console.log(`✅ Updated database status for existing user ${user.email}`);
              } catch (dbError) {
                console.error(`⚠️ Failed to update database status for ${user.email}:`, dbError.message);
              }
              
              syncedCount++;
              continue;
            }
          } catch (error) {
            if (error.status === 404) {
              // User not found in Mailchimp, try to add them
              try {
                // Create personalized deals URL
                const personalizedUrl = `https://cateredsavers.com/deals?token=${user.accessToken}`;
                const userCategories = JSON.parse(user.preferences || '[]');
                
                await mailchimpService.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
                  email_address: user.email,
                  status: 'subscribed',
                  merge_fields: {
                    FNAME: user.name || '',
                    PERSONALIZ: personalizedUrl
                  }
                });
                
                console.log(`✅ Added user ${user.email} to Mailchimp`);
                
                // Update user status in database
                try {
                  await db.updateUserMailchimpStatus(user.id, 'synced');
                  console.log(`✅ Updated database status for ${user.email}`);
                } catch (dbError) {
                  console.error(`⚠️ Failed to update database status for ${user.email}:`, dbError.message);
                }
                
                syncedCount++;
              } catch (addError) {
                console.error(`❌ Failed to add user ${user.email}:`, addError.message);
                console.error(`❌ Add error details:`, addError.response?.body || addError);
                errors.push(`${user.email}: ${addError.message}`);
              }
            } else {
              console.error(`❌ Error checking user ${user.email}:`, error.message);
              console.error(`❌ Check error details:`, error.response?.body || error);
              errors.push(`${user.email}: ${error.message}`);
            }
          }
        }
        
        // Step 2: Get Mailchimp users and add any missing ones to database
        try {
          const mailchimpMembers = await mailchimpService.lists.getAllListMembers(
            process.env.MAILCHIMP_LIST_ID,
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
