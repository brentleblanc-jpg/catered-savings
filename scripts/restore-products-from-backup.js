#!/usr/bin/env node

/**
 * Restore Products from Backup
 * 
 * This script restores products from the data/sponsored-products.js backup file
 * to the new products table structure.
 */

const { PrismaClient } = require('@prisma/client');
const sponsoredProductsData = require('../data/sponsored-products.js');

const prisma = new PrismaClient();

async function restoreProductsFromBackup() {
  console.log('🚀 Starting product restoration from backup...');
  
  try {
    const products = sponsoredProductsData.sponsoredProducts || [];
    console.log(`📦 Found ${products.length} products in backup`);
    
    if (products.length === 0) {
      console.log('⚠️ No products found in backup file');
      return;
    }
    
    let restoredCount = 0;
    let errorCount = 0;
    
    for (const product of products) {
      try {
        // Convert the old format to new format
        const newProduct = {
          id: `restored_${product.id}`,
          title: product.title,
          description: product.description || '',
          imageUrl: product.image,
          affiliateUrl: product.url,
          price: product.salePrice,
          originalPrice: product.originalPrice,
          discount: product.discount,
          category: product.category,
          source: product.retailer || 'Amazon',
          sku: `SKU_${product.id}`,
          productType: product.isSponsored ? 'sponsored' : 'regular',
          isActive: product.active !== false,
          startDate: new Date(product.startDate || '2025-01-01'),
          endDate: product.endDate ? new Date(product.endDate) : null,
          clickCount: 0,
          conversionCount: 0,
          revenueGenerated: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Insert the product
        await prisma.product.create({
          data: newProduct
        });
        
        restoredCount++;
        console.log(`✅ Restored: ${product.title}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error restoring product ${product.title}:`, error.message);
      }
    }
    
    console.log('🎉 Product restoration completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Products restored: ${restoredCount}`);
    console.log(`   - Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('💥 Restoration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the restoration
if (require.main === module) {
  restoreProductsFromBackup()
    .then(() => {
      console.log('🎉 Product restoration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Product restoration failed:', error);
      process.exit(1);
    });
}

module.exports = { restoreProductsFromBackup };
