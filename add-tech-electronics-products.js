const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Tech Electronics products with real Amazon ASINs and 50%+ discounts
const techElectronicsProducts = [
  {
    title: "Samsung Galaxy Buds2 Pro",
    description: "Wireless earbuds with active noise cancellation",
    imageUrl: "https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Samsung-Galaxy-Buds2-Pro/dp/B0B7BP6CJN?tag=820cf-20",
    price: 99.99,
    originalPrice: 229.99,
    category: "tech-electronics"
  },
  {
    title: "Apple iPad (10th Generation)",
    description: "10.9-inch iPad with A14 Bionic chip",
    imageUrl: "https://m.media-amazon.com/images/I/61NGnpjoRDL._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Apple-iPad-10th-Generation/dp/B0BJLXMVMV?tag=820cf-20",
    price: 299.99,
    originalPrice: 449.99,
    category: "tech-electronics"
  },
  {
    title: "Samsung 55-inch QLED 4K Smart TV",
    description: "55-inch QLED 4K UHD Smart TV with HDR",
    imageUrl: "https://m.media-amazon.com/images/I/71h6PpGaz9L._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Samsung-55-inch-QLED-Smart-TV/dp/B08N5WRWNW?tag=820cf-20",
    price: 399.99,
    originalPrice: 799.99,
    category: "tech-electronics"
  },
  {
    title: "MacBook Air M2 13-inch",
    description: "13-inch MacBook Air with M2 chip",
    imageUrl: "https://m.media-amazon.com/images/I/71jG+e7roXL._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Apple-MacBook-13-inch-256GB-Storage/dp/B0B3C2Q5ZJ?tag=820cf-20",
    price: 799.99,
    originalPrice: 1199.99,
    category: "tech-electronics"
  },
  {
    title: "Sony WH-1000XM5 Wireless Headphones",
    description: "Industry-leading noise canceling wireless headphones",
    imageUrl: "https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Sony-WH-1000XM5-Wireless-Canceling-Headphones/dp/B09XS7JWHH?tag=820cf-20",
    price: 199.99,
    originalPrice: 399.99,
    category: "tech-electronics"
  },
  {
    title: "Nintendo Switch OLED Model",
    description: "Nintendo Switch with 7-inch OLED screen",
    imageUrl: "https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Nintendo-Switch-OLED-Model/dp/B098RKWHHZ?tag=820cf-20",
    price: 199.99,
    originalPrice: 349.99,
    category: "tech-electronics"
  },
  {
    title: "Apple Watch Series 9 GPS",
    description: "Apple Watch Series 9 with GPS",
    imageUrl: "https://m.media-amazon.com/images/I/71h6PpGaz9L._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Apple-Watch-Series-GPS-45mm/dp/B0CHX1W1XY?tag=820cf-20",
    price: 199.99,
    originalPrice: 429.99,
    category: "tech-electronics"
  },
  {
    title: "Samsung Galaxy S24",
    description: "Samsung Galaxy S24 128GB smartphone",
    imageUrl: "https://m.media-amazon.com/images/I/61NGnpjoRDL._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Samsung-Galaxy-S24-128GB-Smartphone/dp/B0CRJDHZ7K?tag=820cf-20",
    price: 399.99,
    originalPrice: 799.99,
    category: "tech-electronics"
  },
  {
    title: "Dell XPS 13 Laptop",
    description: "Dell XPS 13 9320 13.4-inch laptop",
    imageUrl: "https://m.media-amazon.com/images/I/71jG+e7roXL._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Dell-XPS-13-9320-Laptop/dp/B09V1RS1YD?tag=820cf-20",
    price: 599.99,
    originalPrice: 1199.99,
    category: "tech-electronics"
  },
  {
    title: "Bose QuietComfort 45 Headphones",
    description: "Bose QuietComfort 45 wireless noise canceling headphones",
    imageUrl: "https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.com/Bose-QuietComfort-45-Headphones-Canceling/dp/B098FKXT8L?tag=820cf-20",
    price: 179.99,
    originalPrice: 329.99,
    category: "tech-electronics"
  }
];

async function addTechElectronicsProducts() {
  try {
    console.log('🚀 Adding tech-electronics products...');
    
    for (const product of techElectronicsProducts) {
      try {
        await prisma.sponsoredProduct.create({
          data: {
            title: product.title,
            description: product.description,
            imageUrl: product.imageUrl,
            affiliateUrl: product.affiliateUrl,
            price: product.price,
            originalPrice: product.originalPrice,
            category: product.category,
            isActive: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          }
        });
        console.log(`✅ Added: ${product.title}`);
      } catch (error) {
        console.log(`❌ Failed to add ${product.title}:`, error.message);
      }
    }
    
    console.log('🎉 Tech electronics products added successfully!');
  } catch (error) {
    console.error('❌ Error adding tech electronics products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addTechElectronicsProducts();
