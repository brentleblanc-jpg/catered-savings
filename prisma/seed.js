const { PrismaClient } = require('@prisma/client');
const categoriesData = require('../data/categories.js');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.analyticsEvent.deleteMany();
  await prisma.retailer.deleteMany();
  await prisma.sponsoredProduct.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.emailCampaign.deleteMany();
  await prisma.adminUser.deleteMany();

  // Create categories and retailers from existing data
  console.log('📁 Creating categories and retailers...');
  
  for (const [categoryKey, categoryData] of Object.entries(categoriesData)) {
    // Create category
    const category = await prisma.category.create({
      data: {
        name: categoryData.name,
        slug: categoryKey,
        description: categoryData.description,
        isActive: true
      }
    });

    console.log(`✅ Created category: ${category.name}`);

    // Create retailers for this category
    for (const company of categoryData.companies) {
      await prisma.retailer.create({
        data: {
          name: company.name,
          url: company.url,
          description: company.description || `Great deals at ${company.name}`,
          categoryId: category.id,
          isVerified: true,
          hasActiveSale: company.name.includes('✅'),
          salePercentage: company.name.includes('✅') ? 50 : null,
          isActive: true
        }
      });
    }

    console.log(`🏪 Created ${categoryData.companies.length} retailers for ${category.name}`);
  }

  // Create sponsored products from existing data
  console.log('💰 Creating sponsored products...');
  
  const sponsoredProducts = [
    {
      title: "Apple MacBook Air M2",
      description: "13-inch laptop with M2 chip, 8GB RAM, 256GB SSD",
      imageUrl: "https://example.com/macbook.jpg",
      affiliateUrl: "https://amazon.com/macbook-air-m2",
      price: 999.99,
      originalPrice: 1199.99,
      isActive: true,
      endDate: new Date('2025-12-31')
    },
    {
      title: "Sony WH-1000XM4 Headphones",
      description: "Industry-leading noise canceling wireless headphones",
      imageUrl: "https://example.com/sony-headphones.jpg", 
      affiliateUrl: "https://amazon.com/sony-wh1000xm4",
      price: 249.99,
      originalPrice: 349.99,
      isActive: true,
      endDate: new Date('2025-12-31')
    },
    {
      title: "KitchenAid Stand Mixer",
      description: "5-quart tilt-head stand mixer in multiple colors",
      imageUrl: "https://example.com/kitchenaid.jpg",
      affiliateUrl: "https://amazon.com/kitchenaid-mixer",
      price: 279.99,
      originalPrice: 379.99,
      isActive: true,
      endDate: new Date('2025-12-31')
    },
    {
      title: "Samsung 65\" QLED 4K TV",
      description: "65-inch QLED 4K Smart TV with HDR",
      imageUrl: "https://example.com/samsung-tv.jpg",
      affiliateUrl: "https://amazon.com/samsung-qled-tv",
      price: 1299.99,
      originalPrice: 1599.99,
      isActive: true,
      endDate: new Date('2025-12-31')
    }
  ];

  for (const product of sponsoredProducts) {
    await prisma.sponsoredProduct.create({
      data: product
    });
  }

  console.log(`🎯 Created ${sponsoredProducts.length} sponsored products`);

  // Create default admin user
  console.log('👤 Creating admin user...');
  await prisma.adminUser.create({
    data: {
      email: 'admin@cateredsavers.com',
      name: 'Admin User',
      role: 'admin',
      isActive: true
    }
  });

  // Create sample email campaigns
  console.log('📧 Creating email campaigns...');
  const campaigns = [
    {
      name: 'Weekly Digest',
      subject: 'Your Weekly Deals Digest - 50%+ Off Everything!',
      content: '<h1>This Week\'s Best Deals</h1><p>Curated deals just for you...</p>',
      campaignType: 'weekly_digest',
      isActive: true
    },
    {
      name: 'Welcome Series',
      subject: 'Welcome to Catered Savers! 🎉',
      content: '<h1>Welcome!</h1><p>Thanks for joining us...</p>',
      campaignType: 'welcome',
      isActive: true
    }
  ];

  for (const campaign of campaigns) {
    await prisma.emailCampaign.create({
      data: campaign
    });
  }

  console.log('📈 Getting database statistics...');
  
  const stats = {
    categories: await prisma.category.count(),
    retailers: await prisma.retailer.count(),
    sponsoredProducts: await prisma.sponsoredProduct.count(),
    users: await prisma.user.count(),
    adminUsers: await prisma.adminUser.count(),
    emailCampaigns: await prisma.emailCampaign.count()
  };

  console.log('✅ Database seeded successfully!');
  console.log('📊 Final Statistics:');
  console.table(stats);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
