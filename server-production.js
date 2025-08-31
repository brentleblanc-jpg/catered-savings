const express = require('express');
const cors = require('cors');
const mailchimp = require('@mailchimp/mailchimp_marketing');
const path = require('path');
const db = require('./services/database');
require('dotenv').config();

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
    message: 'Catered Savers API is running'
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
    const products = await db.getSponsoredProducts();
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
