// Simple test to check environment variables
console.log('Environment Variables Test:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('MAILCHIMP_API_KEY exists:', !!process.env.MAILCHIMP_API_KEY);
console.log('MAILCHIMP_SERVER exists:', !!process.env.MAILCHIMP_SERVER);
console.log('MAILCHIMP_LIST_ID exists:', !!process.env.MAILCHIMP_LIST_ID);

// Test basic Express server
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.send(`
    <h1>Environment Test</h1>
    <p>NODE_ENV: ${process.env.NODE_ENV || 'development'}</p>
    <p>PORT: ${PORT}</p>
    <p>DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}</p>
    <p>MAILCHIMP_API_KEY: ${process.env.MAILCHIMP_API_KEY ? 'Set' : 'Not set'}</p>
    <p>MAILCHIMP_SERVER: ${process.env.MAILCHIMP_SERVER || 'Not set'}</p>
    <p>MAILCHIMP_LIST_ID: ${process.env.MAILCHIMP_LIST_ID || 'Not set'}</p>
  `);
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
