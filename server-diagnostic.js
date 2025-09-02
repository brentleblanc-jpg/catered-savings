console.log('🚀 Starting diagnostic server...');

try {
  console.log('✅ Step 1: Basic console logging works');
  
  const express = require('express');
  console.log('✅ Step 2: Express import successful');
  
  const cors = require('cors');
  console.log('✅ Step 3: CORS import successful');
  
  require('dotenv').config();
  console.log('✅ Step 4: Dotenv config successful');
  
  const path = require('path');
  console.log('✅ Step 5: Path import successful');
  
  const app = express();
  console.log('✅ Step 6: Express app created');
  
  const PORT = process.env.PORT || 8080;
  console.log('✅ Step 7: Port configured:', PORT);
  
  // Force HTTPS in production
  console.log('🔄 Step 8: Adding HTTPS redirect middleware...');
  app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
  console.log('✅ Step 8: HTTPS redirect middleware added');
  
  // Security headers
  console.log('🔄 Step 9: Adding security headers...');
  app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
  console.log('✅ Step 9: Security headers added');
  
  // Middleware
  console.log('🔄 Step 10: Adding basic middleware...');
  app.use(cors());
  console.log('✅ Step 10a: CORS middleware added');
  
  app.use(express.json());
  console.log('✅ Step 10b: JSON middleware added');
  
  // Health check endpoint
  console.log('🔄 Step 11: Adding health check endpoint...');
  app.get('/health', (req, res) => {
    console.log('🔍 Health check received!');
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Diagnostic server is running'
    });
  });
  console.log('✅ Step 11: Health check endpoint added');
  
  // Basic route
  console.log('🔄 Step 12: Adding basic route...');
  app.get('/', (req, res) => {
    res.json({ message: 'Diagnostic server is running' });
  });
  console.log('✅ Step 12: Basic route added');
  
  // Start server
  console.log('🔄 Step 13: Starting server...');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Step 13: Server running on 0.0.0.0:${PORT}`);
    console.log(`🔍 Health endpoint: http://0.0.0.0:${PORT}/health`);
    console.log(`🌐 Ready for Railway healthcheck!`);
    console.log('🚀 Server startup complete!');
    
    // Test the health endpoint internally to make sure it's working
    setTimeout(() => {
      console.log('🧪 Testing health endpoint internally...');
      const http = require('http');
      const options = {
        hostname: '0.0.0.0',
        port: PORT,
        path: '/health',
        method: 'GET'
      };
      
      const req = http.request(options, (res) => {
        console.log(`✅ Internal health check response: ${res.statusCode}`);
      });
      
      req.on('error', (error) => {
        console.error('❌ Internal health check failed:', error.message);
      });
      
      req.end();
    }, 1000);
  });
  
  // Error handling
  console.log('🔄 Step 14: Adding error handlers...');
  process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection:', reason);
  });
  console.log('✅ Step 14: Error handlers added');
  
  console.log('🎯 All startup steps completed successfully!');
  
} catch (error) {
  console.error('🚨 CRASH DURING STARTUP:', error);
  console.error('Error stack:', error.stack);
  process.exit(1);
}
