const BaseScraper = require('./base-scraper');

/**
 * Test scraper for development and testing
 * Returns mock deals to verify the system works
 */
class TestScraper extends BaseScraper {
  constructor() {
    super('Test Retailer', 'https://test-retailer.com');
  }

  /**
   * Get URLs to scrape for deals
   */
  getDealUrls() {
    return ['https://test-retailer.com/deals'];
  }

  /**
   * Scrape deals from test retailer
   */
  async scrapeDeals() {
    console.log('🧪 Running test scraper...');
    
    // Return mock deals for testing
    const mockDeals = [
      {
        title: "Test MacBook Pro 16-inch M2 Max",
        description: "Test Deal - 50% off MacBook Pro with M2 Max chip",
        salePrice: 1599.99,
        originalPrice: 3199.99,
        discountPercentage: 50,
        imageUrl: "https://example.com/macbook.jpg",
        dealUrl: "https://test-retailer.com/macbook-pro",
        retailer: this.retailerName,
        category: "tech-electronics",
        inStock: true,
        limitedStock: false,
        foundAt: Date.now(),
        source: "test_scraper"
      },
      {
        title: "Test Sony WH-1000XM5 Headphones",
        description: "Test Deal - 55% off premium noise-canceling headphones",
        salePrice: 179.99,
        originalPrice: 399.99,
        discountPercentage: 55,
        imageUrl: "https://example.com/sony-headphones.jpg",
        dealUrl: "https://test-retailer.com/sony-headphones",
        retailer: this.retailerName,
        category: "tech-electronics",
        inStock: true,
        limitedStock: true,
        foundAt: Date.now(),
        source: "test_scraper"
      },
      {
        title: "Test KitchenAid Stand Mixer",
        description: "Test Deal - 60% off 5-quart stand mixer",
        salePrice: 171.99,
        originalPrice: 429.99,
        discountPercentage: 60,
        imageUrl: "https://example.com/kitchenaid.jpg",
        dealUrl: "https://test-retailer.com/kitchenaid-mixer",
        retailer: this.retailerName,
        category: "home-garden",
        inStock: true,
        limitedStock: false,
        foundAt: Date.now(),
        source: "test_scraper"
      },
      {
        title: "Test Nike Air Max 270",
        description: "Test Deal - 50% off running shoes",
        salePrice: 74.99,
        originalPrice: 149.99,
        discountPercentage: 50,
        imageUrl: "https://example.com/nike-shoes.jpg",
        dealUrl: "https://test-retailer.com/nike-air-max",
        retailer: this.retailerName,
        category: "sports-outdoors",
        inStock: true,
        limitedStock: true,
        foundAt: Date.now(),
        source: "test_scraper"
      },
      {
        title: "Test Samsung 65\" QLED 4K TV",
        description: "Test Deal - 50% off 65-inch QLED Smart TV",
        salePrice: 799.99,
        originalPrice: 1599.99,
        discountPercentage: 50,
        imageUrl: "https://example.com/samsung-tv.jpg",
        dealUrl: "https://test-retailer.com/samsung-tv",
        retailer: this.retailerName,
        category: "tech-electronics",
        inStock: true,
        limitedStock: false,
        foundAt: Date.now(),
        source: "test_scraper"
      }
    ];

    console.log(`✅ Test scraper found ${mockDeals.length} mock deals`);
    return mockDeals;
  }
}

module.exports = TestScraper;
