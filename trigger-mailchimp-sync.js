// Simple script to trigger Mailchimp sync via Railway API
const https = require('https');

async function triggerMailchimpSync() {
  try {
    console.log('🔄 Triggering Mailchimp sync via Railway...');
    
    // Make a request to trigger sync for pending users
    const response = await fetch('https://cateredsavers.com/api/admin/sync-mailchimp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Sync triggered successfully:', result);
    } else {
      console.log('❌ Sync failed:', response.status, response.statusText);
    }
    
  } catch (error) {
    console.error('❌ Error triggering sync:', error.message);
  }
}

triggerMailchimpSync();
