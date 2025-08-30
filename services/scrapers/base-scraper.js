const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

/**
 * Base scraper class for all retailer scrapers
 * Provides common functionality for web scraping and deal extraction
 */
class BaseScraper {
  constructor(retailerName, baseUrl) {
    this.retailerName = retailerName;
    this.baseUrl = baseUrl;
    this.browser = null;
    this.page = null;
  }

  /**
   * Initialize browser and page
   */
  async init() {
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    this.page = await this.browser.newPage();
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  /**
   * Close browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Navigate to URL with error handling
   */
  async navigateTo(url, options = {}) {
    try {
      await this.page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000,
        ...options 
      });
      return true;
    } catch (error) {
      console.error(`Failed to navigate to ${url}:`, error.message);
      return false;
    }
  }

  /**
   * Wait for element to appear
   */
  async waitForElement(selector, timeout = 10000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      console.error(`Element ${selector} not found within ${timeout}ms`);
      return false;
    }
  }

  /**
   * Wait for specified time
   */
  async waitForTimeout(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Extract text content from element
   */
  async getText(selector) {
    try {
      const element = await this.page.$(selector);
      if (element) {
        return await this.page.evaluate(el => el.textContent?.trim(), element);
      }
      return null;
    } catch (error) {
      console.error(`Error getting text from ${selector}:`, error.message);
      return null;
    }
  }

  /**
   * Extract attribute value from element
   */
  async getAttribute(selector, attribute) {
    try {
      const element = await this.page.$(selector);
      if (element) {
        return await this.page.evaluate((el, attr) => el.getAttribute(attr), element, attribute);
      }
      return null;
    } catch (error) {
      console.error(`Error getting attribute ${attribute} from ${selector}:`, error.message);
      return null;
    }
  }

  /**
   * Extract multiple elements
   */
  async getElements(selector) {
    try {
      return await this.page.$$(selector);
    } catch (error) {
      console.error(`Error getting elements ${selector}:`, error.message);
      return [];
    }
  }

  /**
   * Extract text from multiple elements
   */
  async getTexts(selector) {
    try {
      return await this.page.$$eval(selector, elements => 
        elements.map(el => el.textContent?.trim()).filter(text => text)
      );
    } catch (error) {
      console.error(`Error getting texts from ${selector}:`, error.message);
      return [];
    }
  }

  /**
   * Extract HTML content for Cheerio parsing
   */
  async getHTML() {
    try {
      return await this.page.content();
    } catch (error) {
      console.error('Error getting page HTML:', error.message);
      return null;
    }
  }

  /**
   * Parse HTML with Cheerio
   */
  parseHTML(html) {
    return cheerio.load(html);
  }

  /**
   * Extract price from text (handles various formats)
   */
  extractPrice(priceText) {
    if (!priceText) return null;
    
    // Remove common currency symbols and text
    const cleanPrice = priceText
      .replace(/[^\d.,]/g, '')
      .replace(/,/g, '');
    
    const price = parseFloat(cleanPrice);
    return isNaN(price) ? null : price;
  }

  /**
   * Calculate discount percentage
   */
  calculateDiscount(originalPrice, salePrice) {
    if (!originalPrice || !salePrice || originalPrice <= salePrice) {
      return 0;
    }
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  }

  /**
   * Score deal quality (0-100)
   */
  scoreDeal(deal) {
    let score = 0;
    
    // Discount percentage (40 points max)
    if (deal.discountPercentage >= 50) score += 40;
    else if (deal.discountPercentage >= 30) score += 30;
    else if (deal.discountPercentage >= 20) score += 20;
    else if (deal.discountPercentage >= 10) score += 10;
    
    // Price range (20 points max)
    if (deal.salePrice >= 100) score += 20;
    else if (deal.salePrice >= 50) score += 15;
    else if (deal.salePrice >= 20) score += 10;
    else if (deal.salePrice >= 10) score += 5;
    
    // Retailer reputation (20 points max)
    const reputableRetailers = ['amazon', 'best buy', 'target', 'walmart', 'costco'];
    if (reputableRetailers.some(retailer => 
      this.retailerName.toLowerCase().includes(retailer)
    )) {
      score += 20;
    } else {
      score += 10; // Default for other retailers
    }
    
    // Deal freshness (10 points max)
    const hoursSinceFound = (Date.now() - deal.foundAt) / (1000 * 60 * 60);
    if (hoursSinceFound < 24) score += 10;
    else if (hoursSinceFound < 72) score += 5;
    
    // Availability (10 points max)
    if (deal.inStock) score += 10;
    else if (deal.limitedStock) score += 5;
    
    return Math.min(score, 100);
  }

  /**
   * Abstract method - must be implemented by subclasses
   */
  async scrapeDeals() {
    throw new Error('scrapeDeals method must be implemented by subclass');
  }

  /**
   * Abstract method - must be implemented by subclasses
   */
  getDealUrls() {
    throw new Error('getDealUrls method must be implemented by subclass');
  }
}

module.exports = BaseScraper;
