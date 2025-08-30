const BaseScraper = require('./base-scraper');

/**
 * Best Buy deal scraper
 * Scrapes Best Buy's deals and clearance sections
 */
class BestBuyScraper extends BaseScraper {
  constructor() {
    super('Best Buy', 'https://www.bestbuy.com');
  }

  /**
   * Get URLs to scrape for deals
   */
  getDealUrls() {
    return [
      'https://www.bestbuy.com/site/electronics/clearance/pcmcat748300490025.c?id=pcmcat748300490025',
      'https://www.bestbuy.com/site/home-appliances/major-appliances-sale-event/pcmcat321600050000.c?id=pcmcat321600050000',
      'https://www.bestbuy.com/site/electronics/black-friday/pcmcat748300490025.c?id=pcmcat748300490025'
    ];
  }

  /**
   * Scrape deals from Best Buy
   */
  async scrapeDeals() {
    const deals = [];
    
    try {
      await this.init();
      
      for (const url of this.getDealUrls()) {
        console.log(`Scraping Best Buy deals from: ${url}`);
        
        const success = await this.navigateTo(url);
        if (!success) continue;
        
        // Wait for deals to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        deals.push(...await this.scrapeDealsFromPage());
      }
      
    } catch (error) {
      console.error('Error scraping Best Buy deals:', error);
    } finally {
      await this.close();
    }
    
    return deals;
  }

  /**
   * Scrape deals from current page
   */
  async scrapeDealsFromPage() {
    const deals = [];
    
    try {
      // Wait for products to load
      await this.waitForElement('.product-item', 10000);
      
      const productElements = await this.getElements('.product-item');
      
      for (const element of productElements.slice(0, 20)) { // Limit to first 20
        try {
          const deal = await this.extractBestBuyDeal(element);
          if (deal) {
            deals.push(deal);
          }
        } catch (error) {
          console.error('Error extracting Best Buy deal:', error);
        }
      }
      
    } catch (error) {
      console.error('Error scraping Best Buy deals from page:', error);
    }
    
    return deals;
  }

  /**
   * Extract individual Best Buy deal
   */
  async extractBestBuyDeal(element) {
    try {
      const title = await this.page.evaluate(el => {
        const titleEl = el.querySelector('.product-title a');
        return titleEl ? titleEl.textContent.trim() : null;
      }, element);
      
      const price = await this.page.evaluate(el => {
        const priceEl = el.querySelector('.price-current');
        return priceEl ? priceEl.textContent.trim() : null;
      }, element);
      
      const originalPrice = await this.page.evaluate(el => {
        const origPriceEl = el.querySelector('.price-was');
        return origPriceEl ? origPriceEl.textContent.trim() : null;
      }, element);
      
      const savings = await this.page.evaluate(el => {
        const savingsEl = el.querySelector('.price-savings');
        return savingsEl ? savingsEl.textContent.trim() : null;
      }, element);
      
      const imageUrl = await this.page.evaluate(el => {
        const imgEl = el.querySelector('.product-image img');
        return imgEl ? imgEl.src : null;
      }, element);
      
      const dealUrl = await this.page.evaluate(el => {
        const linkEl = el.querySelector('.product-title a');
        return linkEl ? linkEl.href : null;
      }, element);
      
      const inStock = await this.page.evaluate(el => {
        const stockEl = el.querySelector('.fulfillment-add-to-cart-button');
        return stockEl ? !stockEl.textContent.includes('Sold Out') : false;
      }, element);
      
      if (!title || !price) return null;
      
      const salePrice = this.extractPrice(price);
      const origPrice = this.extractPrice(originalPrice);
      const discountPercentage = this.extractPrice(savings) || 
        this.calculateDiscount(origPrice, salePrice);
      
      // Only include deals with significant discounts
      if (discountPercentage < 15) return null;
      
      return {
        title: title.substring(0, 200),
        description: `Best Buy Deal - ${discountPercentage}% off`,
        salePrice,
        originalPrice: origPrice || salePrice,
        discountPercentage,
        imageUrl,
        dealUrl: dealUrl ? `${this.baseUrl}${dealUrl}` : null,
        retailer: this.retailerName,
        category: this.categorizeDeal(title),
        inStock,
        limitedStock: discountPercentage > 40,
        foundAt: Date.now(),
        source: 'bestbuy_deals'
      };
      
    } catch (error) {
      console.error('Error extracting Best Buy deal:', error);
      return null;
    }
  }

  /**
   * Categorize deal based on title keywords
   */
  categorizeDeal(title) {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('tv') || titleLower.includes('television') || 
        titleLower.includes('laptop') || titleLower.includes('computer') || 
        titleLower.includes('phone') || titleLower.includes('tablet') ||
        titleLower.includes('headphone') || titleLower.includes('speaker')) {
      return 'tech-electronics';
    }
    
    if (titleLower.includes('refrigerator') || titleLower.includes('washer') || 
        titleLower.includes('dryer') || titleLower.includes('dishwasher') ||
        titleLower.includes('stove') || titleLower.includes('microwave')) {
      return 'home-garden';
    }
    
    if (titleLower.includes('camera') || titleLower.includes('drone') || 
        titleLower.includes('gaming') || titleLower.includes('console')) {
      return 'entertainment';
    }
    
    if (titleLower.includes('fitness') || titleLower.includes('exercise') || 
        titleLower.includes('sports') || titleLower.includes('outdoor')) {
      return 'sports-outdoors';
    }
    
    return 'tech-electronics'; // Best Buy is primarily electronics
  }
}

module.exports = BestBuyScraper;
