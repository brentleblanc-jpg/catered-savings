const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Deal Analyzer Service
 * Analyzes, validates, and processes discovered deals
 */
class DealAnalyzer {
  constructor() {
    this.minDiscountPercentage = 20; // Minimum discount to consider
    this.maxPrice = 10000; // Maximum price to consider
    this.minPrice = 5; // Minimum price to consider
  }

  /**
   * Analyze and validate a deal
   */
  async analyzeDeal(deal) {
    try {
      // Basic validation
      if (!this.isValidDeal(deal)) {
        return null;
      }

      // Score the deal
      const score = this.scoreDeal(deal);
      
      // Check for duplicates
      const isDuplicate = await this.isDuplicateDeal(deal);
      if (isDuplicate) {
        console.log(`Duplicate deal found: ${deal.title}`);
        return null;
      }

      // Categorize the deal
      const category = await this.categorizeDeal(deal);
      
      // Enhance deal data
      const enhancedDeal = {
        ...deal,
        score,
        category,
        analyzedAt: new Date(),
        isActive: true,
        quality: this.getQualityLevel(score)
      };

      return enhancedDeal;
      
    } catch (error) {
      console.error('Error analyzing deal:', error);
      return null;
    }
  }

  /**
   * Validate if deal meets basic criteria
   */
  isValidDeal(deal) {
    // Check required fields
    if (!deal.title || !deal.salePrice || !deal.retailer) {
      return false;
    }

    // Check price range
    if (deal.salePrice < this.minPrice || deal.salePrice > this.maxPrice) {
      return false;
    }

    // Check discount percentage
    if (deal.discountPercentage < this.minDiscountPercentage) {
      return false;
    }

    // Check title length
    if (deal.title.length < 10 || deal.title.length > 300) {
      return false;
    }

    // Check for suspicious patterns
    if (this.hasSuspiciousPatterns(deal)) {
      return false;
    }

    return true;
  }

  /**
   * Check for suspicious patterns that might indicate fake deals
   */
  hasSuspiciousPatterns(deal) {
    const title = deal.title.toLowerCase();
    
    // Check for common spam patterns
    const spamPatterns = [
      'click here',
      'free money',
      'make money',
      'work from home',
      'get rich',
      'bitcoin',
      'crypto',
      'investment opportunity'
    ];

    return spamPatterns.some(pattern => title.includes(pattern));
  }

  /**
   * Score deal quality (0-100)
   */
  scoreDeal(deal) {
    let score = 0;
    
    // Discount percentage (40 points max)
    if (deal.discountPercentage >= 70) score += 40;
    else if (deal.discountPercentage >= 50) score += 35;
    else if (deal.discountPercentage >= 40) score += 30;
    else if (deal.discountPercentage >= 30) score += 25;
    else if (deal.discountPercentage >= 20) score += 20;
    
    // Price range (20 points max)
    if (deal.salePrice >= 500) score += 20;
    else if (deal.salePrice >= 200) score += 15;
    else if (deal.salePrice >= 100) score += 10;
    else if (deal.salePrice >= 50) score += 5;
    
    // Retailer reputation (20 points max)
    const reputableRetailers = {
      'amazon': 20,
      'best buy': 20,
      'target': 18,
      'walmart': 18,
      'costco': 20,
      'newegg': 16,
      'bh photo': 16,
      'adobe': 15
    };
    
    const retailerScore = Object.entries(reputableRetailers).find(([retailer]) => 
      deal.retailer.toLowerCase().includes(retailer)
    );
    
    score += retailerScore ? retailerScore[1] : 10;
    
    // Deal freshness (10 points max)
    const hoursSinceFound = (Date.now() - deal.foundAt) / (1000 * 60 * 60);
    if (hoursSinceFound < 6) score += 10;
    else if (hoursSinceFound < 24) score += 8;
    else if (hoursSinceFound < 72) score += 5;
    
    // Availability (10 points max)
    if (deal.inStock) score += 10;
    else if (deal.limitedStock) score += 5;
    
    return Math.min(score, 100);
  }

  /**
   * Get quality level based on score
   */
  getQualityLevel(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  /**
   * Check if deal is a duplicate
   */
  async isDuplicateDeal(deal) {
    try {
      // Check for similar titles (fuzzy matching)
      const similarDeals = await prisma.retailer.findMany({
        where: {
          name: {
            contains: deal.title.substring(0, 50) // First 50 chars
          },
          isActive: true
        }
      });

      // Check for exact URL matches
      const urlMatches = await prisma.retailer.findMany({
        where: {
          url: deal.dealUrl,
          isActive: true
        }
      });

      return similarDeals.length > 0 || urlMatches.length > 0;
      
    } catch (error) {
      console.error('Error checking for duplicate deals:', error);
      return false;
    }
  }

  /**
   * Categorize deal based on title and description
   */
  async categorizeDeal(deal) {
    const title = deal.title.toLowerCase();
    const description = (deal.description || '').toLowerCase();
    const text = `${title} ${description}`;

    // Category keywords mapping
    const categoryKeywords = {
      'tech-electronics': [
        'laptop', 'computer', 'phone', 'tablet', 'tv', 'television', 'headphone',
        'speaker', 'camera', 'drone', 'gaming', 'console', 'monitor', 'keyboard',
        'mouse', 'router', 'modem', 'smartphone', 'iphone', 'android', 'macbook',
        'ipad', 'kindle', 'echo', 'alexa', 'chromecast', 'roku', 'nintendo',
        'playstation', 'xbox', 'graphics card', 'cpu', 'ram', 'ssd', 'hard drive'
      ],
      'fashion': [
        'shirt', 'dress', 'shoes', 'clothing', 'jacket', 'pants', 'jeans',
        'sweater', 'hoodie', 'sneakers', 'boots', 'hat', 'bag', 'purse',
        'watch', 'jewelry', 'sunglasses', 'belt', 'tie', 'suit', 'blouse',
        'skirt', 'shorts', 'underwear', 'lingerie', 'swimwear', 'coat'
      ],
      'home-garden': [
        'furniture', 'sofa', 'chair', 'table', 'bed', 'mattress', 'lamp',
        'decor', 'kitchen', 'appliance', 'refrigerator', 'washer', 'dryer',
        'dishwasher', 'stove', 'microwave', 'vacuum', 'garden', 'outdoor',
        'patio', 'grill', 'tool', 'paint', 'carpet', 'curtain', 'mirror'
      ],
      'health-beauty': [
        'skincare', 'makeup', 'cosmetic', 'shampoo', 'conditioner', 'soap',
        'lotion', 'cream', 'serum', 'vitamin', 'supplement', 'fitness',
        'exercise', 'yoga', 'protein', 'health', 'beauty', 'perfume',
        'cologne', 'razor', 'toothbrush', 'toothpaste', 'deodorant'
      ],
      'sports-outdoors': [
        'sports', 'fitness', 'exercise', 'gym', 'running', 'biking', 'hiking',
        'camping', 'fishing', 'hunting', 'golf', 'tennis', 'basketball',
        'football', 'soccer', 'baseball', 'hockey', 'swimming', 'yoga',
        'pilates', 'weight', 'dumbbell', 'treadmill', 'bike', 'tent',
        'backpack', 'hiking boots', 'outdoor gear'
      ],
      'entertainment': [
        'book', 'movie', 'music', 'game', 'dvd', 'blu-ray', 'cd', 'vinyl',
        'streaming', 'netflix', 'hulu', 'disney', 'amazon prime', 'spotify',
        'apple music', 'video game', 'board game', 'puzzle', 'toy',
        'magazine', 'newspaper', 'podcast', 'audiobook'
      ],
      'food-dining': [
        'food', 'restaurant', 'grocery', 'meal', 'snack', 'beverage',
        'coffee', 'tea', 'wine', 'beer', 'spirits', 'cooking', 'recipe',
        'kitchen', 'dining', 'catering', 'delivery', 'takeout'
      ],
      'travel': [
        'travel', 'vacation', 'hotel', 'flight', 'airline', 'cruise',
        'rental car', 'booking', 'trip', 'destination', 'resort',
        'airbnb', 'expedia', 'booking.com', 'tripadvisor'
      ],
      'automotive': [
        'car', 'auto', 'vehicle', 'tire', 'oil', 'battery', 'brake',
        'engine', 'transmission', 'part', 'accessory', 'gps', 'dash cam',
        'floor mat', 'seat cover', 'car wash', 'maintenance'
      ],
      'kids-family': [
        'baby', 'toddler', 'child', 'kids', 'toy', 'stroller', 'car seat',
        'crib', 'high chair', 'diaper', 'formula', 'clothing', 'shoes',
        'book', 'educational', 'learning', 'play', 'game'
      ],
      'pets': [
        'pet', 'dog', 'cat', 'fish', 'bird', 'food', 'toy', 'collar',
        'leash', 'bed', 'crate', 'litter', 'grooming', 'health',
        'supplement', 'treat', 'bowl', 'cage', 'aquarium'
      ]
    };

    // Score each category
    const categoryScores = {};
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          score += 1;
        }
      }
      categoryScores[category] = score;
    }

    // Find the category with the highest score
    const bestCategory = Object.entries(categoryScores)
      .sort(([,a], [,b]) => b - a)[0];

    return bestCategory && bestCategory[1] > 0 ? bestCategory[0] : 'other';
  }

  /**
   * Process multiple deals
   */
  async processDeals(deals) {
    const processedDeals = [];
    
    for (const deal of deals) {
      const analyzedDeal = await this.analyzeDeal(deal);
      if (analyzedDeal) {
        processedDeals.push(analyzedDeal);
      }
    }
    
    return processedDeals;
  }

  /**
   * Get deal statistics
   */
  async getDealStats() {
    try {
      const stats = await prisma.retailer.aggregate({
        where: { isActive: true },
        _count: { id: true },
        _avg: { salePercentage: true },
        _max: { salePercentage: true },
        _min: { salePercentage: true }
      });

      return {
        totalDeals: stats._count.id,
        averageDiscount: Math.round(stats._avg.salePercentage || 0),
        maxDiscount: stats._max.salePercentage || 0,
        minDiscount: stats._min.salePercentage || 0
      };
      
    } catch (error) {
      console.error('Error getting deal stats:', error);
      return null;
    }
  }
}

module.exports = new DealAnalyzer();
