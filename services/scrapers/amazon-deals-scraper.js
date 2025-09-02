// Amazon Deals Scraper for 50%+ Off Products
// This scraper finds Amazon deals with 50% or more discount and adds affiliate tracking

const axios = require('axios');
const cheerio = require('cheerio');

class AmazonDealsScraper {
  constructor(affiliateId = '820cf-20') {
    this.affiliateId = affiliateId;
    this.baseUrl = 'https://www.amazon.com';
    this.dealsUrl = 'https://www.amazon.com/gp/goldbox';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    };
  }

  // Build affiliate URL with tracking
  buildAffiliateUrl(originalUrl) {
    if (!originalUrl || !this.affiliateId) return originalUrl;
    
    const separator = originalUrl.includes('?') ? '&' : '?';
    return `${originalUrl}${separator}tag=${this.affiliateId}`;
  }

  // Scrape Amazon deals page for 50%+ off products
  async scrapeDeals() {
    try {
      console.log('🔄 Scraping Amazon deals for 50%+ off products...');
      
      const response = await axios.get(this.dealsUrl, {
        headers: this.headers,
        timeout: 30000
      });

      const $ = cheerio.load(response.data);
      const deals = [];

      // Look for deal items on the page
      $('[data-testid="deal-card"], .DealCard, .dealTile').each((index, element) => {
        try {
          const $deal = $(element);
          
          // Extract deal information
          const title = $deal.find('h3, .dealTitle, [data-testid="deal-title"]').first().text().trim();
          const originalPriceText = $deal.find('.a-text-strike, .originalPrice, [data-testid="original-price"]').first().text().trim();
          const salePriceText = $deal.find('.a-price-whole, .salePrice, [data-testid="sale-price"]').first().text().trim();
          const discountText = $deal.find('.a-badge-text, .discount, [data-testid="discount"]').first().text().trim();
          const imageUrl = $deal.find('img').first().attr('src') || $deal.find('img').first().attr('data-src');
          const productUrl = $deal.find('a').first().attr('href');
          
          if (!title || !originalPriceText || !salePriceText) return;

          // Parse prices
          const originalPrice = this.parsePrice(originalPriceText);
          const salePrice = this.parsePrice(salePriceText);
          
          if (!originalPrice || !salePrice) return;

          // Calculate discount percentage
          const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
          
          // Only include deals with 50%+ off
          if (discount < 50) return;

          // Build full product URL
          const fullUrl = productUrl ? 
            (productUrl.startsWith('http') ? productUrl : `${this.baseUrl}${productUrl}`) : 
            null;

          if (!fullUrl) return;

          // Determine category based on title keywords
          const category = this.categorizeProduct(title);

          const deal = {
            id: `amazon_${Date.now()}_${index}`,
            title: title,
            retailer: 'Amazon',
            originalPrice: originalPrice,
            salePrice: salePrice,
            discount: discount,
            imageUrl: imageUrl,
            url: fullUrl,
            affiliateUrl: this.buildAffiliateUrl(fullUrl),
            affiliateProgram: 'amazon',
            affiliateId: this.affiliateId,
            trackingId: this.affiliateId,
            description: `Amazon deal: ${discount}% off ${title}`,
            category: category,
            isSponsored: false, // These are organic deals, not sponsored
            priority: 100 - discount, // Higher discount = higher priority
            active: true,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
            source: 'amazon_scraper',
            scrapedAt: new Date().toISOString()
          };

          deals.push(deal);
          console.log(`✅ Found deal: ${title} - ${discount}% off ($${salePrice} from $${originalPrice})`);

        } catch (error) {
          console.error('❌ Error parsing deal:', error.message);
        }
      });

      console.log(`🎯 Scraped ${deals.length} Amazon deals with 50%+ off`);
      return deals;

    } catch (error) {
      console.error('🚨 Amazon scraping error:', error.message);
      return [];
    }
  }

  // Parse price from text (e.g., "$29.99" -> 29.99)
  parsePrice(priceText) {
    if (!priceText) return null;
    
    const match = priceText.match(/\$?(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : null;
  }

  // Categorize product based on title keywords
  categorizeProduct(title) {
    const titleLower = title.toLowerCase();
    
    const categories = {
      'tech-electronics': ['laptop', 'computer', 'phone', 'tablet', 'headphones', 'speaker', 'camera', 'tv', 'monitor', 'keyboard', 'mouse', 'gaming', 'electronics', 'tech'],
      'home-garden': ['kitchen', 'appliance', 'furniture', 'bed', 'sofa', 'chair', 'table', 'lamp', 'decor', 'garden', 'outdoor', 'tool', 'home'],
      'sports-outdoors': ['fitness', 'gym', 'exercise', 'sport', 'outdoor', 'camping', 'hiking', 'running', 'bike', 'yoga', 'workout'],
      'fashion': ['clothing', 'shirt', 'dress', 'pants', 'shoes', 'jacket', 'hat', 'bag', 'jewelry', 'watch', 'fashion'],
      'health-beauty': ['beauty', 'skincare', 'makeup', 'health', 'vitamin', 'supplement', 'cosmetic', 'hair', 'body'],
      'kids-family': ['baby', 'toy', 'kids', 'children', 'child', 'infant', 'toddler', 'family'],
      'books-media': ['book', 'ebook', 'kindle', 'movie', 'music', 'game', 'entertainment', 'media'],
      'automotive': ['car', 'auto', 'vehicle', 'tire', 'battery', 'automotive', 'truck', 'motorcycle'],
      'office-education': ['office', 'desk', 'chair', 'supplies', 'education', 'school', 'work', 'business'],
      'pets': ['pet', 'dog', 'cat', 'animal', 'pet supplies', 'pet food'],
      'food-dining': ['food', 'kitchen', 'cooking', 'dining', 'restaurant', 'grocery'],
      'travel': ['travel', 'luggage', 'suitcase', 'hotel', 'vacation', 'trip'],
      'entertainment': ['game', 'toy', 'entertainment', 'fun', 'party', 'celebration'],
      'other': []
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => titleLower.includes(keyword))) {
        return category;
      }
    }

    return 'other';
  }

  // Get deals by category
  async getDealsByCategory(category) {
    const allDeals = await this.scrapeDeals();
    return allDeals.filter(deal => deal.category === category);
  }

  // Get top deals (highest discounts)
  async getTopDeals(limit = 10) {
    const allDeals = await this.scrapeDeals();
    return allDeals
      .sort((a, b) => b.discount - a.discount)
      .slice(0, limit);
  }
}

module.exports = AmazonDealsScraper;
