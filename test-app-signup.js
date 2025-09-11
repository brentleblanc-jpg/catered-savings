/**
 * Test Application Signup Flow
 * This tests the actual signup API endpoint to see if it adds users to Mailchimp
 */

const https = require('https');
const http = require('http');

async function testAppSignup() {
  console.log('🧪 Testing Application Signup Flow...\n');
  
  // Test data
  const testUser = {
    email: `app-test-${Date.now()}@example.com`,
    firstName: 'App',
    lastName: 'Test',
    categories: ['tech-electronics', 'home-garden']
  };
  
  console.log('👤 Test User Data:');
  console.log(`   Email: ${testUser.email}`);
  console.log(`   Name: ${testUser.firstName} ${testUser.lastName}`);
  console.log(`   Categories: ${testUser.categories.join(', ')}\n`);
  
  // Test local development server
  const localUrl = 'http://localhost:3000';
  const productionUrl = 'https://your-railway-app.railway.app'; // Replace with your actual Railway URL
  
  console.log('🌐 Testing local development server...');
  await testSignupEndpoint(localUrl, testUser);
  
  console.log('\n🌐 Testing production server...');
  await testSignupEndpoint(productionUrl, testUser);
}

async function testSignupEndpoint(baseUrl, userData) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      categories: userData.categories
    });
    
    const isHttps = baseUrl.startsWith('https');
    const client = isHttps ? https : http;
    const url = new URL('/api/submit-savings', baseUrl);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📡 Response from ${baseUrl}:`);
        console.log(`   Status: ${res.statusCode}`);
        
        try {
          const response = JSON.parse(data);
          console.log(`   Success: ${response.success}`);
          console.log(`   Message: ${response.message}`);
          
          if (response.token) {
            console.log(`   Token: ${response.token.substring(0, 20)}...`);
            console.log(`   Deals URL: ${baseUrl}/deals/${response.token}`);
          }
        } catch (e) {
          console.log(`   Raw Response: ${data}`);
        }
        
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Error connecting to ${baseUrl}: ${error.message}`);
      resolve();
    });
    
    req.write(postData);
    req.end();
  });
}

// Run the test
testAppSignup().catch(console.error);
