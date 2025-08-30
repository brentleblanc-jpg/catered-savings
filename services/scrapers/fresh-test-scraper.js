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
        description: 'Fresh Deal - 20% off latest iPhone with Pro camera system',
        salePrice: 999.99,
        originalPrice: 1249.99,
        discountPercentage: 20,
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
        description: 'Fresh Deal - 25% off cordless vacuum with laser detection',
        salePrice: 599.99,
        originalPrice: 799.99,
        discountPercentage: 25,
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
        description: 'Fresh Deal - 30% off sustainable outdoor jacket',
        salePrice: 139.99,
        originalPrice: 199.99,
        discountPercentage: 30,
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
