// Script to add products from alternative retailers (Best Buy, Woot, etc.)
// This replaces Amazon scraping with legitimate, affiliate-friendly sources

const { PrismaClient } = require('@prisma/client');
const BestBuyDealsScraper = require('./services/scrapers/bestbuy-deals-scraper');
const WootDealsScraper = require('./services/scrapers/woot-deals-scraper');

const prisma = new PrismaClient();

async function addAlternativeRetailerProducts() {
  try {
    console.log('🚀 Adding products from alternative retailers...');
    console.log('📋 Sources: Best Buy, Woot.com, and other affiliate-friendly retailers');
    
    // First, clear existing products
    const deleted = await prisma.sponsoredProduct.deleteMany({});
    console.log(`🗑️ Deleted ${deleted.count} existing products`);
    
    const allProducts = [];
    
    // Get Best Buy deals (using sample data for now)
    console.log('\n🛒 Fetching Best Buy deals...');
    const bestBuyScraper = new BestBuyDealsScraper();
    const bestBuyDeals = await bestBuyScraper.getSampleDeals();
    allProducts.push(...bestBuyDeals);
    console.log(`✅ Added ${bestBuyDeals.length} Best Buy deals`);
    
    // Get Woot deals (using sample data for now)
    console.log('\n🎯 Fetching Woot deals...');
    const wootScraper = new WootDealsScraper();
    const wootDeals = await wootScraper.getSampleDeals();
    allProducts.push(...wootDeals);
    console.log(`✅ Added ${wootDeals.length} Woot deals`);
    
    // Filter for deals with 30%+ discount
    const goodDeals = allProducts.filter(product => product.discount >= 30);
    console.log(`\n🎯 Found ${goodDeals.length} deals with 30%+ discount out of ${allProducts.length} total products`);
    
    // Add products to database
    if (goodDeals.length > 0) {
      const result = await prisma.sponsoredProduct.createMany({
        data: goodDeals
      });
      
      console.log(`✅ Successfully added ${result.count} products from alternative retailers`);
    } else {
      console.log('⚠️ No qualifying deals found (30%+ discount)');
    }
    
    // Verify the count
    const totalProducts = await prisma.sponsoredProduct.count();
    console.log(`📊 Total products in database: ${totalProducts}`);
    
    // Show sample products by source
    const bestBuyProducts = await prisma.sponsoredProduct.findMany({
      where: { source: 'bestbuy' },
      take: 3,
      select: {
        title: true,
        price: true,
        originalPrice: true,
        discount: true,
        category: true,
        source: true
      }
    });
    
    const wootProducts = await prisma.sponsoredProduct.findMany({
      where: { source: 'woot' },
      take: 3,
      select: {
        title: true,
        price: true,
        originalPrice: true,
        discount: true,
        category: true,
        source: true
      }
    });
    
    console.log(`\n📋 Sample Best Buy products:`);
    bestBuyProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
      console.log(`   Price: $${product.price} (was $${product.originalPrice}) - ${product.discount}% off`);
      console.log(`   Category: ${product.category}`);
      console.log('');
    });
    
    console.log(`\n📋 Sample Woot products:`);
    wootProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
      console.log(`   Price: $${product.price} (was $${product.originalPrice}) - ${product.discount}% off`);
      console.log(`   Category: ${product.category}`);
      console.log('');
    });
    
    // Show category breakdown
    const categoryBreakdown = await prisma.sponsoredProduct.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    });
    
    console.log(`\n📊 Products by category:`);
    categoryBreakdown.forEach(cat => {
      console.log(`   ${cat.category}: ${cat._count.category} products`);
    });
    
    console.log(`\n🎉 Successfully populated database with ${totalProducts} products from alternative retailers!`);
    console.log('💡 These retailers are scraping-friendly and have legitimate affiliate programs');
    console.log('🔗 Next step: Join their affiliate programs to monetize your platform');
    
  } catch (error) {
    console.error('❌ Error adding alternative retailer products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addAlternativeRetailerProducts();
