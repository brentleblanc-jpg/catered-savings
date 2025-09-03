// API endpoint to clean production database placeholders

const { Client } = require('pg');

async function cleanProductionDatabase() {
  try {
    console.log('🧹 Cleaning production database via API...');
    
    const response = await fetch('https://cateredsavers.com/api/admin/clean-placeholders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Success:', result.message);
      console.log(`📊 Remaining products: ${result.remainingProducts}`);
      console.log(`🗑️ Total deleted: ${result.deletedCount}`);
    } else {
      console.error('❌ Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

// Run the cleanup
cleanProductionDatabase();
