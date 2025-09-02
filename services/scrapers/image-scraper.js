// Image Scraper Service
// This service scrapes product images from retailer websites

class ImageScraper {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  // Scrape image from Amazon product page
  async scrapeAmazonImage(productUrl) {
    try {
      const productId = this.extractAmazonProductId(productUrl);
      if (productId) {
        // Try multiple Amazon image formats
        const imageFormats = [
          `https://m.media-amazon.com/images/I/${productId}.jpg`,
          `https://m.media-amazon.com/images/I/${productId}._AC_SL1000_.jpg`,
          `https://m.media-amazon.com/images/I/${productId}._AC_SL1500_.jpg`,
          `https://m.media-amazon.com/images/I/${productId}._AC_SX679_.jpg`
        ];
        
        // Return the first format (in production, you'd test which one works)
        return imageFormats[0];
      }
      return null;
    } catch (error) {
      console.error('Amazon image scraping error:', error);
      return null;
    }
  }

  // Scrape image from Best Buy product page
  async scrapeBestBuyImage(productUrl) {
    try {
      // For now, return a placeholder that looks like Best Buy
      const productId = this.extractBestBuyProductId(productUrl);
      if (productId) {
        return `https://pisces.bbystatic.com/image2/BestBuy_US/images/products/${productId}/${productId}_sd.jpg`;
      }
      return null;
    } catch (error) {
      console.error('Best Buy image scraping error:', error);
      return null;
    }
  }

  // Scrape image from Nike product page
  async scrapeNikeImage(productUrl) {
    try {
      // For now, return a placeholder that looks like Nike
      return `https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/placeholder.jpg`;
    } catch (error) {
      console.error('Nike image scraping error:', error);
      return null;
    }
  }

  // Generic image scraper
  async scrapeProductImage(product) {
    try {
      let imageUrl = null;

      switch (product.retailer.toLowerCase()) {
        case 'amazon':
          // Prioritize Amazon - most products are Amazon now
          imageUrl = await this.scrapeAmazonImage(product.url);
          break;
        case 'best buy':
          imageUrl = await this.scrapeBestBuyImage(product.url);
          break;
        case 'nike':
          imageUrl = await this.scrapeNikeImage(product.url);
          break;
        default:
          // For other retailers (future expansion), use placeholder for now
          imageUrl = this.generatePlaceholderImage(product);
      }

      return imageUrl || this.generatePlaceholderImage(product);
    } catch (error) {
      console.error('Image scraping error for product:', product.title, error);
      return this.generatePlaceholderImage(product);
    }
  }

  // Generate a placeholder image with product info
  generatePlaceholderImage(product) {
    const colors = ['667eea', '764ba2', 'f093fb', 'f5576c', '4facfe', '00f2fe'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const text = encodeURIComponent(product.title.substring(0, 20));
    return `https://via.placeholder.com/300x300/${color}/ffffff?text=${text}`;
  }

  // Extract Amazon product ID from URL
  extractAmazonProductId(url) {
    const match = url.match(/\/dp\/([A-Z0-9]+)/);
    return match ? match[1] : null;
  }

  // Extract Best Buy product ID from URL
  extractBestBuyProductId(url) {
    const match = url.match(/\/site\/[^\/]+\/([0-9]+)\.p/);
    return match ? match[1] : null;
  }

  // Batch scrape images for multiple products
  async scrapeImagesForProducts(products, batchSize = 5) {
    const results = [];
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const batchPromises = batch.map(async (product) => {
        const imageUrl = await this.scrapeProductImage(product);
        return {
          ...product,
          image: imageUrl,
          imageScrapedAt: new Date().toISOString()
        };
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}

module.exports = ImageScraper;
