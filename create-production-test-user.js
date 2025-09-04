// Create a test user in production for personalized deals access
const { PrismaClient } = require('@prisma/client');

// Use production database URL
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/catered_sales";

const prisma = new PrismaClient();

async function createProductionTestUser() {
  try {
    console.log('👤 Creating production test user for personalized deals...');
    
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
        accessToken: 'prod-test-token-12345',
        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true,
        lastActiveAt: new Date()
      }
    });
    
    console.log('✅ Production test user created successfully!');
    console.log(`📧 Email: ${testUser.email}`);
    console.log(`🔑 Access Token: ${testUser.accessToken}`);
    console.log(`⏰ Token Expires: ${testUser.tokenExpiresAt}`);
    
    // Show production personalized deals URLs
    console.log('\n🔗 Production Personalized Deals URLs:');
    console.log(`📱 Deals Page: https://cateredsavers.com/deals/${testUser.accessToken}`);
    console.log(`🔌 API Endpoint: https://cateredsavers.com/api/deals/personalized/${testUser.accessToken}`);
    
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
    
    console.log('\n📊 Production Products:');
    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
      console.log(`   $${product.price} (was $${product.originalPrice}) - ${product.discount}% off`);
      console.log(`   Category: ${product.category} | Source: ${product.source}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error creating production test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createProductionTestUser();
