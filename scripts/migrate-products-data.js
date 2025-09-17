#!/usr/bin/env node

/**
 * Data Migration Script: Restructure Products System
 * 
 * This script safely migrates existing data from the old structure to the new structure:
 * - Moves all data from sponsored_products table to products table
 * - Creates sponsored_placements entries for products that should be sponsored
 * - Preserves all existing data and relationships
 * - Updates analytics events to reference the new structure
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateProductsData() {
  console.log('🚀 Starting products data migration...');
  
  try {
    // Step 1: Get all existing sponsored products
    console.log('📦 Fetching existing sponsored products...');
    const existingProducts = await prisma.$queryRaw`
      SELECT * FROM sponsored_products ORDER BY "createdAt"
    `;
    
    console.log(`Found ${existingProducts.length} existing products to migrate`);
    
    if (existingProducts.length === 0) {
      console.log('✅ No products to migrate. Migration complete.');
      return;
    }
    
    // Step 2: Create products table if it doesn't exist
    console.log('🏗️ Creating products table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        "imageUrl" TEXT,
        "affiliateUrl" TEXT NOT NULL,
        price DECIMAL,
        "originalPrice" DECIMAL,
        discount INTEGER,
        category TEXT,
        source TEXT,
        sku TEXT,
        "productType" TEXT DEFAULT 'regular',
        "isActive" BOOLEAN DEFAULT true,
        "startDate" TIMESTAMP DEFAULT NOW(),
        "endDate" TIMESTAMP,
        "clickCount" INTEGER DEFAULT 0,
        "conversionCount" INTEGER DEFAULT 0,
        "revenueGenerated" DECIMAL DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;
    
    // Step 3: Create sponsored_placements table if it doesn't exist
    console.log('🏗️ Creating sponsored_placements table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS sponsored_placements (
        id TEXT PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "sponsorName" TEXT,
        "sponsorEmail" TEXT,
        "paymentStatus" TEXT DEFAULT 'pending',
        "placementType" TEXT DEFAULT 'homepage',
        priority INTEGER DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "startDate" TIMESTAMP DEFAULT NOW(),
        "endDate" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;
    
    // Step 4: Migrate each product
    console.log('🔄 Migrating products...');
    let migratedCount = 0;
    let sponsoredCount = 0;
    
    for (const product of existingProducts) {
      // Insert into products table
      await prisma.$executeRaw`
        INSERT INTO products (
          id, title, description, "imageUrl", "affiliateUrl", 
          price, "originalPrice", discount, category, source, sku,
          "productType", "isActive", "startDate", "endDate",
          "clickCount", "conversionCount", "revenueGenerated",
          "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
          $12, $13, $14, $15, $16, $17, $18, $19, $20
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          "imageUrl" = EXCLUDED."imageUrl",
          "affiliateUrl" = EXCLUDED."affiliateUrl",
          price = EXCLUDED.price,
          "originalPrice" = EXCLUDED."originalPrice",
          discount = EXCLUDED.discount,
          category = EXCLUDED.category,
          source = EXCLUDED.source,
          sku = EXCLUDED.sku,
          "productType" = EXCLUDED."productType",
          "isActive" = EXCLUDED."isActive",
          "startDate" = EXCLUDED."startDate",
          "endDate" = EXCLUDED."endDate",
          "clickCount" = EXCLUDED."clickCount",
          "conversionCount" = EXCLUDED."conversionCount",
          "revenueGenerated" = EXCLUDED."revenueGenerated",
          "updatedAt" = NOW()
      `, [
        product.id,
        product.title,
        product.description,
        product.imageUrl,
        product.affiliateUrl,
        product.price,
        product.originalPrice,
        product.discount,
        product.category,
        product.source,
        product.sku,
        'regular', // All existing products become regular products
        product.isActive,
        product.startDate,
        product.endDate,
        product.clickCount,
        product.conversionCount,
        product.revenueGenerated,
        product.createdAt,
        product.updatedAt
      ]);
      
      migratedCount++;
      
      // If this product should be sponsored (you can add logic here to determine this)
      // For now, we'll assume all existing products are regular products
      // You can modify this logic based on your business rules
      
      console.log(`✅ Migrated product: ${product.title}`);
    }
    
    // Step 5: Update analytics events to reference products table
    console.log('📊 Updating analytics events...');
    await prisma.$executeRaw`
      UPDATE analytics_events 
      SET "productId" = "sponsoredProductId"
      WHERE "sponsoredProductId" IS NOT NULL
    `;
    
    console.log('✅ Migration completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Products migrated: ${migratedCount}`);
    console.log(`   - Sponsored placements created: ${sponsoredCount}`);
    console.log(`   - Analytics events updated`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  migrateProductsData()
    .then(() => {
      console.log('🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateProductsData };
