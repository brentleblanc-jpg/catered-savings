const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting simple database seed...');

  // Check what tables exist
  console.log('📊 Checking existing data...');
  
  const userCount = await prisma.user.count();
  const productCount = await prisma.sponsoredProduct.count();
  
  console.log(`👥 Users: ${userCount}`);
  console.log(`💰 Products: ${productCount}`);

  // Create some sample sponsored products if none exist
  if (productCount === 0) {
    console.log('💰 Creating sample sponsored products...');
    
    const sampleProducts = [
      {
        title: "Apple MacBook Air M2",
        description: "13-inch laptop with M2 chip, 8GB RAM, 256GB SSD",
        imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
        affiliateUrl: "https://amazon.com/s?k=macbook+air+m2&tag=820cf-20",
        price: 999.99,
        originalPrice: 1199.99,
        discount: 17,
        category: "tech-electronics",
        source: "amazon",
        isActive: true
      },
      {
        title: "Sony WH-1000XM4 Headphones",
        description: "Industry-leading noise canceling wireless headphones",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        affiliateUrl: "https://amazon.com/s?k=sony+wh1000xm4&tag=820cf-20",
        price: 249.99,
        originalPrice: 349.99,
        discount: 29,
        category: "tech-electronics",
        source: "amazon",
        isActive: true
      },
      {
        title: "KitchenAid Stand Mixer",
        description: "5-quart tilt-head stand mixer in multiple colors",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
        affiliateUrl: "https://amazon.com/s?k=kitchenaid+stand+mixer&tag=820cf-20",
        price: 279.99,
        originalPrice: 379.99,
        discount: 26,
        category: "home-garden",
        source: "amazon",
        isActive: true
      },
      {
        title: "Samsung 65\" QLED 4K TV",
        description: "65-inch QLED 4K Smart TV with HDR",
        imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400",
        affiliateUrl: "https://amazon.com/s?k=samsung+65+qled+tv&tag=820cf-20",
        price: 1299.99,
        originalPrice: 1599.99,
        discount: 19,
        category: "tech-electronics",
        source: "amazon",
        isActive: true
      }
    ];

    for (const product of sampleProducts) {
      await prisma.sponsoredProduct.create({
        data: product
      });
    }

    console.log(`✅ Created ${sampleProducts.length} sample products`);
  } else {
    console.log('✅ Products already exist, skipping creation');
  }

  console.log('🎉 Simple seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
