const BaseScraper = require('./base-scraper');

class FreshTestScraper extends BaseScraper {
  constructor() {
    super('Fresh Test Retailer', 'https://fresh-test-retailer.com');
  }

  async scrapeDeals() {
    console.log('🧪 Running fresh test scraper...');
    
    // Return different mock deals to avoid duplicates
    const mockDeals = [
      {
        title: 'Fresh iPhone 15 Pro Max',
        description: 'Fresh Deal - 50% off latest iPhone with Pro camera system',
        salePrice: 624.99,
        originalPrice: 1249.99,
        discountPercentage: 50,
        imageUrl: 'https://example.com/iphone15.jpg',
        dealUrl: 'https://fresh-test-retailer.com/iphone15',
        retailer: 'Fresh Test Retailer',
        category: 'tech-electronics',
        inStock: true,
        limitedStock: true,
        foundAt: Date.now(),
        source: 'fresh_test_scraper'
      },
      {
        title: 'Fresh Dyson V15 Vacuum',
        description: 'Fresh Deal - 50% off cordless vacuum with laser detection',
        salePrice: 399.99,
        originalPrice: 799.99,
        discountPercentage: 50,
        imageUrl: 'https://example.com/dyson-v15.jpg',
        dealUrl: 'https://fresh-test-retailer.com/dyson-v15',
        retailer: 'Fresh Test Retailer',
        category: 'home-garden',
        inStock: true,
        limitedStock: false,
        foundAt: Date.now(),
        source: 'fresh_test_scraper'
      },
      {
        title: 'Fresh Patagonia Jacket',
        description: 'Fresh Deal - 50% off sustainable outdoor jacket',
        salePrice: 99.99,
        originalPrice: 199.99,
        discountPercentage: 50,
        imageUrl: 'https://example.com/patagonia-jacket.jpg',
        dealUrl: 'https://fresh-test-retailer.com/patagonia-jacket',
        retailer: 'Fresh Test Retailer',
        category: 'sports-outdoors',
        inStock: true,
        limitedStock: true,
        foundAt: Date.now(),
        source: 'fresh_test_scraper'
      }
    ];

    console.log(`✅ Fresh test scraper found ${mockDeals.length} new deals`);
    return mockDeals;
  }
}

module.exports = FreshTestScraper;
