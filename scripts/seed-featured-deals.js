const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedFeaturedDeals() {
  console.log('🌱 Seeding featured deals...');

  const sampleDeals = [
    {
      title: "XIEERDUO Womens 3/4 Sleeve Tops 2025 V-Neck",
      description: "Comfortable and stylish 3/4 sleeve V-neck tops with beautiful patterns. Perfect for casual wear and special occasions.",
      imageUrl: "https://m.media-amazon.com/images/I/81O4QtKB3yL._AC_SX679_.jpg",
      affiliateUrl: "https://amzn.to/41TmRDb",
      price: 9.99,
      originalPrice: 24.99,
      discount: 60,
      category: "fashion",
      retailer: "Amazon",
      displayOrder: 1
    },
    {
      title: "Stuhrling Original Mens Black Watch",
      description: "Elegant black analog wristwatch with white hour markers. Perfect for business and formal occasions.",
      imageUrl: "https://m.media-amazon.com/images/I/71v5j4zQ0wL._AC_SX679_.jpg",
      affiliateUrl: "https://amzn.to/46B87LO",
      price: 43.00,
      originalPrice: 295.00,
      discount: 85,
      category: "fashion",
      retailer: "Amazon",
      displayOrder: 2
    },
    {
      title: "Dash Cam Front and Rear",
      description: "Professional dash cam system with front and rear cameras. Features STARVIS 2 technology and GPS tracking.",
      imageUrl: "https://m.media-amazon.com/images/I/61Yez4-XqyL._AC_SX679_.jpg",
      affiliateUrl: "https://amzn.to/3VObadq",
      price: 119.98,
      originalPrice: 599.99,
      discount: 80,
      category: "automotive",
      retailer: "Amazon",
      displayOrder: 3
    },
    {
      title: "Muslin Cotton Baby Car Seat Cover",
      description: "Soft and breathable muslin cotton cover for baby car seats. Perfect for boys and girls with cute animal patterns.",
      imageUrl: "https://m.media-amazon.com/images/I/81-n7fpfIjL._AC_SX466_.jpg",
      affiliateUrl: "https://amzn.to/4nmEgwi",
      price: 9.99,
      originalPrice: 19.99,
      discount: 50,
      category: "kids-family",
      retailer: "Amazon",
      displayOrder: 4
    }
  ];

  try {
    // Clear existing featured deals
    await prisma.featuredDeal.deleteMany({});
    console.log('🗑️ Cleared existing featured deals');

    // Create new featured deals
    for (const deal of sampleDeals) {
      await prisma.featuredDeal.create({
        data: {
          ...deal,
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
      });
      console.log(`✅ Created featured deal: ${deal.title}`);
    }

    console.log('🎉 Featured deals seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding featured deals:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedFeaturedDeals();
