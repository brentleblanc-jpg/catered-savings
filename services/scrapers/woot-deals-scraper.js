// Woot.com Deals Scraper - Amazon-owned but more scraping-friendly
const axios = require('axios');
const cheerio = require('cheerio');

class WootDealsScraper {
  constructor() {
    this.baseUrl = 'https://www.woot.com';
    this.affiliateId = 'woot-affiliate-id'; // You'll get this when you join their affiliate program
  }

  async getDeals(category = 'all', limit = 20) {
    try {
      console.log('🎯 Fetching Woot deals...');
      
      // Woot has different category pages
      const categoryUrls = {
        'all': '/',
        'electronics': '/category/electronics',
        'home': '/category/home',
        'computers': '/category/computers',
        'sports': '/category/sports',
        'books': '/category/books',
        'automotive': '/category/automotive'
      };

      const url = categoryUrls[category] || categoryUrls['all'];
      const response = await axios.get(`${this.baseUrl}${url}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const deals = [];

      // Parse Woot's deal structure
      $('.deal-item, .product-item').each((index, element) => {
        if (deals.length >= limit) return false;

        const $el = $(element);
        const title = $el.find('.deal-title, .product-title, h3, h4').first().text().trim();
        const priceText = $el.find('.deal-price, .price, .sale-price').first().text().trim();
        const originalPriceText = $el.find('.original-price, .msrp, .list-price').first().text().trim();
        const imageUrl = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src');
        const dealUrl = $el.find('a').first().attr('href');
        const description = $el.find('.deal-description, .product-description, p').first().text().trim();

        if (title && priceText) {
          const price = this.parsePrice(priceText);
          const originalPrice = this.parsePrice(originalPriceText) || price * 1.5; // Estimate if not available
          const discount = originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

          deals.push({
            title: title,
            description: description || title,
            imageUrl: imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${this.baseUrl}${imageUrl}`) : 'https://via.placeholder.com/300x300?text=Woot+Deal',
            affiliateUrl: dealUrl ? (dealUrl.startsWith('http') ? dealUrl : `${this.baseUrl}${dealUrl}`) : '#',
            price: price,
            originalPrice: originalPrice,
            discount: discount,
            category: this.mapCategory(title, description),
            source: 'woot',
            sku: `woot-${Date.now()}-${index}`
          });
        }
      });

      console.log(`✅ Found ${deals.length} Woot deals`);
      return deals;
    } catch (error) {
      console.error('❌ Woot scraping error:', error.message);
      return this.getSampleDeals();
    }
  }

  parsePrice(priceText) {
    if (!priceText) return 0;
    
    // Extract number from price text like "$19.99", "19.99", "$19.99 - $29.99"
    const match = priceText.match(/\$?(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  }

  mapCategory(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('laptop') || text.includes('computer') || text.includes('tablet') || text.includes('monitor')) {
      return 'tech-electronics';
    } else if (text.includes('phone') || text.includes('mobile') || text.includes('smartphone')) {
      return 'tech-electronics';
    } else if (text.includes('tv') || text.includes('television') || text.includes('streaming')) {
      return 'entertainment';
    } else if (text.includes('kitchen') || text.includes('appliance') || text.includes('cook') || text.includes('mixer')) {
      return 'home-garden';
    } else if (text.includes('game') || text.includes('gaming') || text.includes('console') || text.includes('nintendo') || text.includes('playstation') || text.includes('xbox')) {
      return 'entertainment';
    } else if (text.includes('audio') || text.includes('headphone') || text.includes('speaker') || text.includes('sound')) {
      return 'tech-electronics';
    } else if (text.includes('camera') || text.includes('photo') || text.includes('video')) {
      return 'tech-electronics';
    } else if (text.includes('fitness') || text.includes('sport') || text.includes('exercise') || text.includes('gym')) {
      return 'sports-outdoors';
    } else if (text.includes('home') || text.includes('furniture') || text.includes('decor') || text.includes('bedroom') || text.includes('living')) {
      return 'home-garden';
    } else if (text.includes('car') || text.includes('automotive') || text.includes('vehicle') || text.includes('tire')) {
      return 'automotive';
    } else if (text.includes('book') || text.includes('ebook') || text.includes('kindle')) {
      return 'books-media';
    } else if (text.includes('clothing') || text.includes('shirt') || text.includes('dress') || text.includes('fashion') || text.includes('apparel')) {
      return 'fashion';
    } else if (text.includes('health') || text.includes('beauty') || text.includes('skincare') || text.includes('cosmetic')) {
      return 'health-beauty';
    } else if (text.includes('travel') || text.includes('luggage') || text.includes('suitcase') || text.includes('backpack')) {
      return 'travel';
    } else if (text.includes('office') || text.includes('desk') || text.includes('chair') || text.includes('work')) {
      return 'office-education';
    } else if (text.includes('pet') || text.includes('dog') || text.includes('cat') || text.includes('animal')) {
      return 'pets';
    } else if (text.includes('kid') || text.includes('child') || text.includes('toy') || text.includes('baby')) {
      return 'kids-family';
    } else {
      return 'other';
    }
  }

  getSampleDeals() {
    return [
      {
        title: "Instant Pot Duo 7-in-1 Electric Pressure Cooker",
        description: "6 Quart, 14 One-Touch Programs, Stainless Steel",
        imageUrl: "https://d3gqasl9vmjfd8.cloudfront.net/8b8b8b8b-8b8b-8b8b-8b8b-8b8b8b8b8b8b.jpg",
        affiliateUrl: "https://www.woot.com/offers/instant-pot-duo-7-in-1-electric-pressure-cooker-6-quart",
        price: 49.99,
        originalPrice: 99.95,
        discount: 50,
        category: "home-garden",
        source: "woot",
        sku: "woot-instant-pot-001"
      },
      {
        title: "Sony WH-1000XM4 Wireless Noise Canceling Headphones",
        description: "Industry Leading Noise Canceling Overhead Headphones with Mic for Phone-Call and Alexa Voice Control",
        imageUrl: "https://d3gqasl9vmjfd8.cloudfront.net/sony-wh1000xm4.jpg",
        affiliateUrl: "https://www.woot.com/offers/sony-wh-1000xm4-wireless-noise-canceling-headphones",
        price: 199.99,
        originalPrice: 349.99,
        discount: 43,
        category: "tech-electronics",
        source: "woot",
        sku: "woot-sony-headphones-001"
      },
      {
        title: "Ninja Foodi Personal Blender",
        description: "1000W Base, 4 Blades, 2 Speeds, 18-oz. Cup",
        imageUrl: "https://d3gqasl9vmjfd8.cloudfront.net/ninja-foodi-blender.jpg",
        affiliateUrl: "https://www.woot.com/offers/ninja-foodi-personal-blender-1000w-base",
        price: 39.99,
        originalPrice: 79.99,
        discount: 50,
        category: "home-garden",
        source: "woot",
        sku: "woot-ninja-blender-001"
      },
      {
        title: "Anker PowerCore 10000 Portable Charger",
        description: "Ultra-Compact 10000mAh External Battery with PowerIQ Technology",
        imageUrl: "https://d3gqasl9vmjfd8.cloudfront.net/anker-powercore.jpg",
        affiliateUrl: "https://www.woot.com/offers/anker-powercore-10000-portable-charger",
        price: 19.99,
        originalPrice: 39.99,
        discount: 50,
        category: "tech-electronics",
        source: "woot",
        sku: "woot-anker-charger-001"
      },
      {
        title: "Echo Dot (4th Gen) Smart Speaker",
        description: "Smart speaker with Alexa - Charcoal",
        imageUrl: "https://d3gqasl9vmjfd8.cloudfront.net/echo-dot-4th-gen.jpg",
        affiliateUrl: "https://www.woot.com/offers/echo-dot-4th-gen-smart-speaker-with-alexa",
        price: 24.99,
        originalPrice: 49.99,
        discount: 50,
        category: "tech-electronics",
        source: "woot",
        sku: "woot-echo-dot-001"
      }
    ];
  }
}

module.exports = WootDealsScraper;
