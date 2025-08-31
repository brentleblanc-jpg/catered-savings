const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    message: 'Catered Savers API is running'
  });
});

// Serve static files
app.use(express.static('public'));

// Routes (must be before static middleware)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index-modern.html'));
});

// Simple API endpoints that don't require database
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Catered Savers API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Production server is live!`);
  console.log(`📧 Ready for configuration`);
});
