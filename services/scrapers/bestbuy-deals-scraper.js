// Best Buy Deals Scraper - API-friendly alternative to Amazon
const axios = require('axios');

class BestBuyDealsScraper {
  constructor() {
    this.baseUrl = 'https://api.bestbuy.com/v1';
    this.apiKey = process.env.BESTBUY_API_KEY || 'demo'; // You'll need to get a free API key
    this.affiliateId = 'bestbuy-affiliate-id'; // You'll get this when you join their affiliate program
  }

  async getDeals(category = 'all', limit = 50) {
    try {
      console.log('🛒 Fetching Best Buy deals...');
      
      // Best Buy API endpoint for deals/clearance items
      const url = `${this.baseUrl}/products(onSale=true&salePrice<regularPrice)`;
      const params = {
        apiKey: this.apiKey,
        format: 'json',
        show: 'sku,name,salePrice,regularPrice,image,shortDescription,url,categoryPath',
        pageSize: limit,
        sort: 'salePrice.asc'
      };

      const response = await axios.get(url, { params });
      
      if (response.data && response.data.products) {
        const deals = response.data.products.map(product => this.formatProduct(product));
        console.log(`✅ Found ${deals.length} Best Buy deals`);
        return deals;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Best Buy API error:', error.message);
      return [];
    }
  }

  formatProduct(product) {
    const discount = product.regularPrice > 0 
      ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
      : 0;

    return {
      title: product.name,
      description: product.shortDescription || product.name,
      imageUrl: product.image || 'https://via.placeholder.com/300x300?text=Best+Buy+Product',
      affiliateUrl: `${product.url}?ref=${this.affiliateId}`,
      price: product.salePrice,
      originalPrice: product.regularPrice,
      discount: discount,
      category: this.mapCategory(product.categoryPath),
      source: 'bestbuy',
      sku: product.sku
    };
  }

  mapCategory(categoryPath) {
    if (!categoryPath) return 'other';
    
    const path = categoryPath.toLowerCase();
    
    if (path.includes('computer') || path.includes('laptop') || path.includes('tablet')) {
      return 'tech-electronics';
    } else if (path.includes('phone') || path.includes('mobile')) {
      return 'tech-electronics';
    } else if (path.includes('tv') || path.includes('television')) {
      return 'entertainment';
    } else if (path.includes('appliance') || path.includes('kitchen')) {
      return 'home-garden';
    } else if (path.includes('gaming') || path.includes('game')) {
      return 'entertainment';
    } else if (path.includes('audio') || path.includes('headphone') || path.includes('speaker')) {
      return 'tech-electronics';
    } else if (path.includes('camera') || path.includes('photo')) {
      return 'tech-electronics';
    } else if (path.includes('fitness') || path.includes('sport')) {
      return 'sports-outdoors';
    } else if (path.includes('home') || path.includes('furniture')) {
      return 'home-garden';
    } else if (path.includes('automotive') || path.includes('car')) {
      return 'automotive';
    } else {
      return 'other';
    }
  }

  // Fallback method using web scraping if API fails
  async scrapeDealsPage() {
    try {
      console.log('🌐 Scraping Best Buy deals page as fallback...');
      
      // This would be a more complex implementation
      // For now, return some sample deals to test the system
      return this.getSampleDeals();
    } catch (error) {
      console.error('❌ Best Buy scraping error:', error.message);
      return this.getSampleDeals();
    }
  }

  getSampleDeals() {
    return [
      {
        title: "Samsung 55\" 4K Smart TV",
        description: "Samsung 55-inch 4K UHD Smart TV with HDR",
        imageUrl: "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6428/6428322_sd.jpg",
        affiliateUrl: "https://www.bestbuy.com/site/samsung-55-class-4k-uhd-smart-tv/6428322.p?skuId=6428322",
        price: 399.99,
        originalPrice: 799.99,
        discount: 50,
        category: "entertainment",
        source: "bestbuy",
        sku: "6428322"
      },
      {
        title: "Apple MacBook Air M2",
        description: "Apple MacBook Air 13-inch with M2 chip, 8GB RAM, 256GB SSD",
        imageUrl: "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6509/6509650_sd.jpg",
        affiliateUrl: "https://www.bestbuy.com/site/apple-macbook-air-13-inch-laptop/6509650.p?skuId=6509650",
        price: 899.99,
        originalPrice: 1199.99,
        discount: 25,
        category: "tech-electronics",
        source: "bestbuy",
        sku: "6509650"
      },
      {
        title: "Sony WH-1000XM4 Headphones",
        description: "Sony WH-1000XM4 Wireless Noise Canceling Headphones",
        imageUrl: "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6409/6409100_sd.jpg",
        affiliateUrl: "https://www.bestbuy.com/site/sony-wh-1000xm4-wireless-noise-canceling-headphones/6409100.p?skuId=6409100",
        price: 199.99,
        originalPrice: 349.99,
        discount: 43,
        category: "tech-electronics",
        source: "bestbuy",
        sku: "6409100"
      },
      {
        title: "KitchenAid Stand Mixer",
        description: "KitchenAid Artisan Series 5-Qt Stand Mixer",
        imageUrl: "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6409/6409100_sd.jpg",
        affiliateUrl: "https://www.bestbuy.com/site/kitchenaid-artisan-series-5-qt-stand-mixer/6409100.p?skuId=6409100",
        price: 199.99,
        originalPrice: 399.99,
        discount: 50,
        category: "home-garden",
        source: "bestbuy",
        sku: "6409100"
      },
      {
        title: "Nintendo Switch OLED",
        description: "Nintendo Switch OLED Model with White Joy-Con Controllers",
        imageUrl: "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6479/6479215_sd.jpg",
        affiliateUrl: "https://www.bestbuy.com/site/nintendo-switch-oled-model-with-white-joy-con-controllers/6479215.p?skuId=6479215",
        price: 299.99,
        originalPrice: 349.99,
        discount: 14,
        category: "entertainment",
        source: "bestbuy",
        sku: "6479215"
      }
    ];
  }
}

module.exports = BestBuyDealsScraper;
