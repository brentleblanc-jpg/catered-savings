// Create a test user with personalized deals access
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('👤 Creating test user for personalized deals...');
    
    // Create a test user
    const testUser = await prisma.user.upsert({
      where: { email: 'test@cateredsavers.com' },
      update: {},
      create: {
        email: 'test@cateredsavers.com',
        name: 'Test User',
        preferences: JSON.stringify({
          categories: ['tech-electronics', 'home-garden', 'entertainment'],
          maxPrice: 500,
          minDiscount: 30
        }),
        mailchimpStatus: 'subscribed',
        accessToken: 'test-token-12345',
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true,
        lastActiveAt: new Date()
      }
    });
    
    console.log('✅ Test user created successfully!');
    console.log(`📧 Email: ${testUser.email}`);
    console.log(`🔑 Access Token: ${testUser.accessToken}`);
    console.log(`⏰ Token Expires: ${testUser.tokenExpiresAt}`);
    
    // Show personalized deals URLs
    console.log('\n🔗 Personalized Deals URLs:');
    console.log(`📱 Deals Page: http://localhost:3000/deals/${testUser.accessToken}`);
    console.log(`🔌 API Endpoint: http://localhost:3000/api/deals/personalized/${testUser.accessToken}`);
    
    // Show all products for reference
    const allProducts = await prisma.sponsoredProduct.findMany({
      where: { isActive: true },
      select: {
        title: true,
        price: true,
        originalPrice: true,
        discount: true,
        category: true,
        source: true
      }
    });
    
    console.log('\n📊 Available Products:');
    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
      console.log(`   $${product.price} (was $${product.originalPrice}) - ${product.discount}% off`);
      console.log(`   Category: ${product.category} | Source: ${product.source}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTestUser();
