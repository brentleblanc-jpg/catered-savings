const express = require('express');
const cors = require('cors');
const mailchimp = require('@mailchimp/mailchimp_marketing');
const path = require('path');
const categoriesData = require('./data/categories');
const { getActiveSponsoredProducts, trackSponsoredClick } = require('./data/sponsored-products');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store questionnaire responses (in production, use a database)
let questionnaireResponses = [];

// Configure Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX
});

// Function to send personalized welcome email with company data
async function sendPersonalizedWelcomeEmail(email, firstName, categories) {
  try {
    // Generate personalized email content based on selected categories
    let emailContent = `
      <h2>Welcome to Catered Savings! 🎉</h2>
      <p>Hi ${firstName},</p>
      <p>Thank you for signing up for Catered Savings! Here are your personalized deal sources with 50%+ savings:</p>
    `;

    // Add company data for each selected category
    categories.forEach(category => {
      if (categoriesData[category]) {
        const categoryInfo = categoriesData[category];
        emailContent += `
          <h3>${categoryInfo.name}</h3>
          <p>${categoryInfo.description}</p>
        `;
        
        categoryInfo.companies.forEach(company => {
          const affiliateBadge = company.affiliate ? ' <span style="background: #ffd700; color: #1a1a1a; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem;">Affiliate</span>' : '';
          emailContent += `
            <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
              <h4 style="margin: 0 0 8px 0;">
                <a href="${company.url}" style="color: #667eea; text-decoration: none;">${company.name}</a>${affiliateBadge}
              </h4>
              <p style="margin: 0; color: #6b7280;">${company.description}</p>
            </div>
          `;
        });
      }
    });

    emailContent += `
      <p><strong>Coming Next Week:</strong> Your first curated deal digest featuring 50%+ off deals from these sources!</p>
      <p>Happy saving! 💰</p>
      <p>Best regards,<br>The Catered Savings Team</p>
    `;

    // Log personalized email content for manual sending through Mailchimp
    console.log('Personalized email content generated for:', email);
    console.log('Email content:', emailContent);
    console.log('📧 Copy this content and send through Mailchimp campaigns!');
    
      } catch (error) {
      console.error('Error generating personalized email:', error);
    }
}







// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Submit savings preferences
app.post('/api/submit-savings', async (req, res) => {
  try {
    const response = req.body;
    const timestamp = new Date().toISOString();
    
    // Validate required fields
    if (!response.email || !response.email.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email address is required' 
      });
    }
    
    if (!response.firstName || !response.firstName.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'First name is required' 
      });
    }
    
    if (!response.categories || response.categories.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please select at least one category' 
      });
    }
    
    // Store the response
    const savingsResponse = {
      ...response,
      timestamp,
      id: Date.now().toString()
    };
    
    // Store in memory (in production, use a database)
    if (!global.savingsResponses) {
      global.savingsResponses = [];
    }
    global.savingsResponses.push(savingsResponse);

        // Add subscriber to Mailchimp audience
    if (response.email) {
      try {
        const mailchimpResult = await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
          email_address: response.email,
          status: 'subscribed',
          merge_fields: {
            FNAME: response.firstName.trim(),
            CATEGORIES: response.categories.join(', '),
            EXCLUSIVE_DEALS: response.exclusiveDeals ? 'Yes' : 'No'
          },
          tags: response.categories
        });

        console.log('✅ Mailchimp Success! User added to audience:', response.email);
        console.log('Mailchimp response:', mailchimpResult);

        // Send personalized welcome email with company data
        await sendPersonalizedWelcomeEmail(response.email, response.firstName.trim(), response.categories);
        
      } catch (mailchimpError) {
        console.error('❌ Mailchimp Error:', mailchimpError.message);
        console.error('Full error details:', mailchimpError);
        console.log('⚠️  User signup saved locally, but Mailchimp sync failed for:', response.email);
      }
    }

    // Log the signup for your team (you can view this in Mailchimp dashboard)
    console.log('New Catered Savings Signup! 🎯');
    console.log('Email:', response.email);
    console.log('First Name:', response.firstName.trim());
    console.log('Selected Categories:', response.categories.join(', '));
    console.log('Exclusive Deals:', response.exclusiveDeals ? 'Yes' : 'No');
    console.log('Submitted:', timestamp);

    res.json({ 
      success: true, 
      message: 'Welcome to Catered Savings!',
      id: timestamp
    });

  } catch (error) {
    console.error('Error submitting questionnaire:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting savings preferences' 
    });
  }
});

// Get all savings responses (for admin purposes)
app.get('/api/savings-responses', (req, res) => {
  res.json(global.savingsResponses || []);
});

// Get savings response by ID
app.get('/api/savings-responses/:id', (req, res) => {
  const response = (global.savingsResponses || []).find(r => r.id === req.params.id);
  if (response) {
    res.json(response);
  } else {
    res.status(404).json({ message: 'Response not found' });
  }
});

// Get all categories data
app.get('/api/categories', (req, res) => {
  res.json(categoriesData);
});

// Get sponsored products
app.get('/api/sponsored-products', (req, res) => {
  try {
            const products = getActiveSponsoredProducts(4); // Get top 4 sponsored products
    res.json({
      success: true,
      products: products
    });
  } catch (error) {
    console.error('Error fetching sponsored products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sponsored products'
    });
  }
});

// Track sponsored product clicks
app.post('/api/track-sponsored-click', (req, res) => {
  try {
    const { productId } = req.body;
    const clickData = trackSponsoredClick(productId);
    
    // In production, save this to analytics database
    console.log('Sponsored click tracked:', clickData);
    
    res.json({
      success: true,
      message: 'Click tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking sponsored click:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking click'
    });
  }
});





// Add new company to a category
app.post('/api/add-company', (req, res) => {
  try {
    const { category, name, url, affiliate, description } = req.body;
    
    if (!categoriesData[category]) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }
    
    const newCompany = {
      name,
      url,
      affiliate,
      description
    };
    
    categoriesData[category].companies.push(newCompany);
    
    res.json({ success: true, message: 'Company added successfully' });
  } catch (error) {
    console.error('Error adding company:', error);
    res.status(500).json({ success: false, message: 'Error adding company' });
  }
});

// Get sponsored products for admin
app.get('/api/admin/sponsored-products', (req, res) => {
  try {
    const { sponsoredProducts } = require('./data/sponsored-products');
    const totalRevenue = sponsoredProducts.reduce((sum, product) => {
      return product.active ? sum + product.monthlyFee : sum;
    }, 0);
    
    res.json({
      success: true,
      products: sponsoredProducts,
      totalRevenue: totalRevenue,
      activeCount: sponsoredProducts.filter(p => p.active).length
    });
  } catch (error) {
    console.error('Error fetching admin sponsored products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sponsored products'
    });
  }
});

// Admin panel route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
