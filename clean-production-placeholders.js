// Script to clean placeholder products from the PRODUCTION PostgreSQL database

const { Client } = require('pg');

async function cleanProductionPlaceholders() {
  let client;
  
  try {
    console.log('🧹 Starting cleanup of placeholder products from PRODUCTION database...');
    
    // Connect to production database
    client = new Client({
      connectionString: process.env.DATABASE_URL
    });
    
    await client.connect();
    console.log('✅ Connected to production database');
    
    // First, let's see what we have
    const totalResult = await client.query('SELECT COUNT(*) FROM sponsored_products');
    const totalProducts = parseInt(totalResult.rows[0].count);
    console.log(`📊 Total products in production database: ${totalProducts}`);
    
    // Remove products with search URLs (amazon.com/s?k=...)
    const searchUrlResult = await client.query(`
      DELETE FROM sponsored_products 
      WHERE "affiliateUrl" LIKE '%amazon.com/s?k=%'
    `);
    console.log(`✅ Deleted ${searchUrlResult.rowCount} products with search URLs`);
    
    // Remove products with example.com images
    const exampleImageResult = await client.query(`
      DELETE FROM sponsored_products 
      WHERE "imageUrl" LIKE '%example.com%'
    `);
    console.log(`✅ Deleted ${exampleImageResult.rowCount} products with example.com images`);
    
    // Remove products with placeholder ASINs (B08N5WRWNW - this is a fake ASIN)
    const placeholderAsinResult = await client.query(`
      DELETE FROM sponsored_products 
      WHERE "affiliateUrl" LIKE '%B08N5WRWNW%'
    `);
    console.log(`✅ Deleted ${placeholderAsinResult.rowCount} products with placeholder ASIN B08N5WRWNW`);
    
    // Remove products with "Real Amazon Product" in title (these are our test products)
    const testProductsResult = await client.query(`
      DELETE FROM sponsored_products 
      WHERE title LIKE '%Real Amazon Product%'
    `);
    console.log(`✅ Deleted ${testProductsResult.rowCount} test products with "Real Amazon Product" in title`);
    
    // Remove products with "Working ASIN" in title
    const workingAsinResult = await client.query(`
      DELETE FROM sponsored_products 
      WHERE title LIKE '%Working ASIN%'
    `);
    console.log(`✅ Deleted ${workingAsinResult.rowCount} products with "Working ASIN" in title`);
    
    // Remove products with "Real ASIN" in title
    const realAsinResult = await client.query(`
      DELETE FROM sponsored_products 
      WHERE title LIKE '%Real ASIN%'
    `);
    console.log(`✅ Deleted ${realAsinResult.rowCount} products with "Real ASIN" in title`);
    
    // Final count
    const remainingResult = await client.query('SELECT COUNT(*) FROM sponsored_products');
    const remainingProducts = parseInt(remainingResult.rows[0].count);
    console.log(`\n🎉 Cleanup complete!`);
    console.log(`📊 Remaining products: ${remainingProducts}`);
    console.log(`🗑️ Total deleted: ${totalProducts - remainingProducts}`);
    
    // Show what's left
    const remaining = await client.query(`
      SELECT title, "affiliateUrl", "imageUrl", category 
      FROM sponsored_products 
      LIMIT 5
    `);
    
    console.log(`\n📋 Sample of remaining products:`);
    remaining.rows.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   URL: ${product.affiliateUrl}`);
      console.log(`   Image: ${product.imageUrl}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    if (error.code === 'ENOTFOUND') {
      console.error('💡 Make sure you have the DATABASE_URL environment variable set');
    }
  } finally {
    if (client) {
      await client.end();
    }
  }
}

// Check if we have DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not set');
  console.error('💡 This script needs to connect to the production PostgreSQL database');
  console.error('💡 Set DATABASE_URL to your PostgreSQL connection string');
  process.exit(1);
}

// Run the cleanup
cleanProductionPlaceholders();
