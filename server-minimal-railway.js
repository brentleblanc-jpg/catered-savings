const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

console.log('🚀 Starting MINIMAL Railway test server...');
console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 Port: ${PORT}`);

// Basic health check
app.get('/health', (req, res) => {
  console.log('🔍 Health check received!');
  res.json({ status: 'healthy', message: 'Minimal server working!' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Minimal Railway server is running!' });
});

// Start server with explicit binding
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on 0.0.0.0:${PORT}`);
  console.log(`🔍 Health endpoint: http://0.0.0.0:${PORT}/health`);
  console.log(`🌐 Ready for Railway healthcheck!`);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection:', reason);
});
