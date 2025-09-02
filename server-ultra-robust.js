const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

console.log('🚀 Starting ULTRA ROBUST Catered Savers server (FORCE DEPLOY)...');
console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔑 PORT: ${PORT}`);

// Basic middleware
app.use(express.json());

// Super simple health check that can't fail
app.get('/health', (req, res) => {
  console.log('🔍 Health check received!');
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Ultra robust server is running'
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Ultra robust server is running' });
});

// Start server with explicit binding
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on 0.0.0.0:${PORT}`);
  console.log(`🔍 Health endpoint: http://0.0.0.0:${PORT}/health`);
  console.log(`🌐 Ready for Railway healthcheck!`);
  console.log('🚀 Server startup complete!');
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  // Don't exit - keep the server running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection:', reason);
  // Don't exit - keep the server running
});
