// Script to clean up placeholder products from the database

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanPlaceholderProducts() {
  try {
    console.log('🧹 Starting cleanup of placeholder products...');
    
    // First, let's see what we have
    const totalProducts = await prisma.sponsoredProduct.count();
    console.log(`📊 Total products in database: ${totalProducts}`);
    
    // Remove products with search URLs (amazon.com/s?k=...)
    const searchUrlProducts = await prisma.sponsoredProduct.findMany({
      where: {
        affiliateUrl: {
          contains: 'amazon.com/s?k='
        }
      }
    });
    
    console.log(`🔍 Found ${searchUrlProducts.length} products with search URLs`);
    
    if (searchUrlProducts.length > 0) {
      const deletedSearch = await prisma.sponsoredProduct.deleteMany({
        where: {
          affiliateUrl: {
            contains: 'amazon.com/s?k='
          }
        }
      });
      console.log(`✅ Deleted ${deletedSearch.count} products with search URLs`);
    }
    
    // Remove products with example.com images
    const exampleImageProducts = await prisma.sponsoredProduct.findMany({
      where: {
        imageUrl: {
          contains: 'example.com'
        }
      }
    });
    
    console.log(`🖼️ Found ${exampleImageProducts.length} products with example.com images`);
    
    if (exampleImageProducts.length > 0) {
      const deletedImages = await prisma.sponsoredProduct.deleteMany({
        where: {
          imageUrl: {
            contains: 'example.com'
          }
        }
      });
      console.log(`✅ Deleted ${deletedImages.count} products with example.com images`);
    }
    
    // Remove products with placeholder ASINs (B08N5WRWNW - this is a fake ASIN)
    const placeholderAsinProducts = await prisma.sponsoredProduct.findMany({
      where: {
        affiliateUrl: {
          contains: 'B08N5WRWNW'
        }
      }
    });
    
    console.log(`🎭 Found ${placeholderAsinProducts.length} products with placeholder ASIN B08N5WRWNW`);
    
    if (placeholderAsinProducts.length > 0) {
      const deletedPlaceholders = await prisma.sponsoredProduct.deleteMany({
        where: {
          affiliateUrl: {
            contains: 'B08N5WRWNW'
          }
        }
      });
      console.log(`✅ Deleted ${deletedPlaceholders.count} products with placeholder ASIN`);
    }
    
    // Remove products with "Real Amazon Product" in title (these are our test products)
    const testProducts = await prisma.sponsoredProduct.findMany({
      where: {
        title: {
          contains: 'Real Amazon Product'
        }
      }
    });
    
    console.log(`🧪 Found ${testProducts.length} test products with "Real Amazon Product" in title`);
    
    if (testProducts.length > 0) {
      const deletedTest = await prisma.sponsoredProduct.deleteMany({
        where: {
          title: {
            contains: 'Real Amazon Product'
          }
        }
      });
      console.log(`✅ Deleted ${deletedTest.count} test products`);
    }
    
    // Remove products with "Working ASIN" in title
    const workingAsinProducts = await prisma.sponsoredProduct.findMany({
      where: {
        title: {
          contains: 'Working ASIN'
        }
      }
    });
    
    console.log(`🔧 Found ${workingAsinProducts.length} products with "Working ASIN" in title`);
    
    if (workingAsinProducts.length > 0) {
      const deletedWorking = await prisma.sponsoredProduct.deleteMany({
        where: {
          title: {
            contains: 'Working ASIN'
          }
        }
      });
      console.log(`✅ Deleted ${deletedWorking.count} products with "Working ASIN"`);
    }
    
    // Remove products with "Real ASIN" in title
    const realAsinProducts = await prisma.sponsoredProduct.findMany({
      where: {
        title: {
          contains: 'Real ASIN'
        }
      }
    });
    
    console.log(`🎯 Found ${realAsinProducts.length} products with "Real ASIN" in title`);
    
    if (realAsinProducts.length > 0) {
      const deletedReal = await prisma.sponsoredProduct.deleteMany({
        where: {
          title: {
            contains: 'Real ASIN'
          }
        }
      });
      console.log(`✅ Deleted ${deletedReal.count} products with "Real ASIN"`);
    }
    
    // Final count
    const remainingProducts = await prisma.sponsoredProduct.count();
    console.log(`\n🎉 Cleanup complete!`);
    console.log(`📊 Remaining products: ${remainingProducts}`);
    console.log(`🗑️ Total deleted: ${totalProducts - remainingProducts}`);
    
    // Show what's left
    const remaining = await prisma.sponsoredProduct.findMany({
      take: 5,
      select: {
        title: true,
        affiliateUrl: true,
        imageUrl: true,
        category: true
      }
    });
    
    console.log(`\n📋 Sample of remaining products:`);
    remaining.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   URL: ${product.affiliateUrl}`);
      console.log(`   Image: ${product.imageUrl}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanPlaceholderProducts();
