const BaseScraper = require('./base-scraper');

/**
 * Amazon deal scraper
 * Scrapes Amazon's Gold Box deals and warehouse deals
 */
class AmazonScraper extends BaseScraper {
  constructor() {
    super('Amazon', 'https://www.amazon.com');
  }

  /**
   * Get URLs to scrape for deals
   */
  getDealUrls() {
    return [
      'https://www.amazon.com/gp/goldbox',
      'https://www.amazon.com/Warehouse-Deals/b?ie=UTF8&node=10158976011',
      'https://www.amazon.com/s?k=deals&i=specialty-aps&ref=sr_pg_1'
    ];
  }

  /**
   * Scrape deals from Amazon
   */
  async scrapeDeals() {
    const deals = [];
    
    try {
      await this.init();
      
      for (const url of this.getDealUrls()) {
        console.log(`Scraping Amazon deals from: ${url}`);
        
        const success = await this.navigateTo(url);
        if (!success) continue;
        
        // Wait for deals to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        if (url.includes('goldbox')) {
          deals.push(...await this.scrapeGoldBoxDeals());
        } else if (url.includes('Warehouse-Deals')) {
          deals.push(...await this.scrapeWarehouseDeals());
        } else {
          deals.push(...await this.scrapeSearchDeals());
        }
      }
      
    } catch (error) {
      console.error('Error scraping Amazon deals:', error);
    } finally {
      await this.close();
    }
    
    return deals;
  }

  /**
   * Scrape Gold Box deals
   */
  async scrapeGoldBoxDeals() {
    const deals = [];
    
    try {
      // Wait for deals container
      await this.waitForElement('[data-testid="deal-card"]', 10000);
      
      const dealElements = await this.getElements('[data-testid="deal-card"]');
      
      for (const element of dealElements.slice(0, 10)) { // Limit to first 10 deals
        try {
          const deal = await this.extractGoldBoxDeal(element);
          if (deal) {
            deals.push(deal);
          }
        } catch (error) {
          console.error('Error extracting Gold Box deal:', error);
        }
      }
      
    } catch (error) {
      console.error('Error scraping Gold Box deals:', error);
    }
    
    return deals;
  }

  /**
   * Extract individual Gold Box deal
   */
  async extractGoldBoxDeal(element) {
    try {
      // Extract deal information
      const title = await this.page.evaluate(el => {
        const titleEl = el.querySelector('[data-testid="deal-title"]');
        return titleEl ? titleEl.textContent.trim() : null;
      }, element);
      
      const price = await this.page.evaluate(el => {
        const priceEl = el.querySelector('[data-testid="deal-price"]');
        return priceEl ? priceEl.textContent.trim() : null;
      }, element);
      
      const originalPrice = await this.page.evaluate(el => {
        const origPriceEl = el.querySelector('[data-testid="deal-original-price"]');
        return origPriceEl ? origPriceEl.textContent.trim() : null;
      }, element);
      
      const discount = await this.page.evaluate(el => {
        const discountEl = el.querySelector('[data-testid="deal-discount"]');
        return discountEl ? discountEl.textContent.trim() : null;
      }, element);
      
      const imageUrl = await this.page.evaluate(el => {
        const imgEl = el.querySelector('img');
        return imgEl ? imgEl.src : null;
      }, element);
      
      const dealUrl = await this.page.evaluate(el => {
        const linkEl = el.querySelector('a');
        return linkEl ? linkEl.href : null;
      }, element);
      
      if (!title || !price) return null;
      
      const salePrice = this.extractPrice(price);
      const origPrice = this.extractPrice(originalPrice);
      const discountPercentage = this.extractPrice(discount) || 
        this.calculateDiscount(origPrice, salePrice);
      
      return {
        title: title.substring(0, 200), // Limit title length
        description: `Amazon Gold Box Deal - ${discountPercentage}% off`,
        salePrice,
        originalPrice: origPrice || salePrice,
        discountPercentage,
        imageUrl,
        dealUrl: dealUrl ? `${this.baseUrl}${dealUrl}` : null,
        retailer: this.retailerName,
        category: this.categorizeDeal(title),
        inStock: true,
        limitedStock: discountPercentage > 50,
        foundAt: Date.now(),
        source: 'amazon_goldbox'
      };
      
    } catch (error) {
      console.error('Error extracting Gold Box deal:', error);
      return null;
    }
  }

  /**
   * Scrape Warehouse deals
   */
  async scrapeWarehouseDeals() {
    const deals = [];
    
    try {
      // Wait for products to load
      await this.waitForElement('[data-component-type="s-search-result"]', 10000);
      
      const productElements = await this.getElements('[data-component-type="s-search-result"]');
      
      for (const element of productElements.slice(0, 15)) { // Limit to first 15
        try {
          const deal = await this.extractWarehouseDeal(element);
          if (deal) {
            deals.push(deal);
          }
        } catch (error) {
          console.error('Error extracting warehouse deal:', error);
        }
      }
      
    } catch (error) {
      console.error('Error scraping warehouse deals:', error);
    }
    
    return deals;
  }

  /**
   * Extract warehouse deal
   */
  async extractWarehouseDeal(element) {
    try {
      const title = await this.page.evaluate(el => {
        const titleEl = el.querySelector('h2 a span');
        return titleEl ? titleEl.textContent.trim() : null;
      }, element);
      
      const price = await this.page.evaluate(el => {
        const priceEl = el.querySelector('.a-price-whole');
        return priceEl ? priceEl.textContent.trim() : null;
      }, element);
      
      const originalPrice = await this.page.evaluate(el => {
        const origPriceEl = el.querySelector('.a-price-when-strikethrough .a-offscreen');
        return origPriceEl ? origPriceEl.textContent.trim() : null;
      }, element);
      
      const imageUrl = await this.page.evaluate(el => {
        const imgEl = el.querySelector('img');
        return imgEl ? imgEl.src : null;
      }, element);
      
      const dealUrl = await this.page.evaluate(el => {
        const linkEl = el.querySelector('h2 a');
        return linkEl ? linkEl.href : null;
      }, element);
      
      if (!title || !price) return null;
      
      const salePrice = this.extractPrice(price);
      const origPrice = this.extractPrice(originalPrice);
      const discountPercentage = this.calculateDiscount(origPrice, salePrice);
      
      // Only include deals with significant discounts
      if (discountPercentage < 20) return null;
      
      return {
        title: title.substring(0, 200),
        description: `Amazon Warehouse Deal - ${discountPercentage}% off`,
        salePrice,
        originalPrice: origPrice || salePrice,
        discountPercentage,
        imageUrl,
        dealUrl: dealUrl ? `${this.baseUrl}${dealUrl}` : null,
        retailer: this.retailerName,
        category: this.categorizeDeal(title),
        inStock: true,
        limitedStock: true,
        foundAt: Date.now(),
        source: 'amazon_warehouse'
      };
      
    } catch (error) {
      console.error('Error extracting warehouse deal:', error);
      return null;
    }
  }

  /**
   * Scrape search deals
   */
  async scrapeSearchDeals() {
    // Similar implementation for search-based deals
    return [];
  }

  /**
   * Categorize deal based on title keywords
   */
  categorizeDeal(title) {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('laptop') || titleLower.includes('computer') || 
        titleLower.includes('phone') || titleLower.includes('tablet')) {
      return 'tech-electronics';
    }
    
    if (titleLower.includes('shirt') || titleLower.includes('dress') || 
        titleLower.includes('shoes') || titleLower.includes('clothing')) {
      return 'fashion';
    }
    
    if (titleLower.includes('kitchen') || titleLower.includes('home') || 
        titleLower.includes('furniture') || titleLower.includes('decor')) {
      return 'home-garden';
    }
    
    if (titleLower.includes('book') || titleLower.includes('movie') || 
        titleLower.includes('game') || titleLower.includes('music')) {
      return 'entertainment';
    }
    
    if (titleLower.includes('sports') || titleLower.includes('fitness') || 
        titleLower.includes('outdoor') || titleLower.includes('exercise')) {
      return 'sports-outdoors';
    }
    
    return 'other';
  }
}

module.exports = AmazonScraper;
