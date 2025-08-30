const AmazonScraper = require('./scrapers/amazon-scraper');
const BestBuyScraper = require('./scrapers/bestbuy-scraper');
const TestScraper = require('./scrapers/test-scraper');
const FreshTestScraper = require('./scrapers/fresh-test-scraper');
const DealAnalyzer = require('./analyzers/deal-analyzer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Deal Discovery Manager
 * Orchestrates the entire deal discovery process
 */
class DealDiscoveryManager {
  constructor() {
    this.scrapers = [
      new TestScraper(),
      new FreshTestScraper(),
      new AmazonScraper(),
      new BestBuyScraper()
    ];
    
    this.isRunning = false;
    this.lastRun = null;
    this.stats = {
      totalDealsFound: 0,
      totalDealsProcessed: 0,
      totalDealsSaved: 0,
      errors: 0,
      runTime: 0
    };
  }

  /**
   * Run the complete deal discovery process
   */
  async runDiscovery() {
    if (this.isRunning) {
      console.log('Deal discovery already running, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    
    console.log('🚀 Starting deal discovery process...');
    
    try {
      // Reset stats
      this.stats = {
        totalDealsFound: 0,
        totalDealsProcessed: 0,
        totalDealsSaved: 0,
        errors: 0,
        runTime: 0
      };

      // Run all scrapers
      const allDeals = [];
      
      for (const scraper of this.scrapers) {
        try {
          console.log(`📡 Scraping deals from ${scraper.retailerName}...`);
          const deals = await scraper.scrapeDeals();
          allDeals.push(...deals);
          this.stats.totalDealsFound += deals.length;
          console.log(`✅ Found ${deals.length} deals from ${scraper.retailerName}`);
        } catch (error) {
          console.error(`❌ Error scraping ${scraper.retailerName}:`, error);
          this.stats.errors++;
        }
      }

      console.log(`📊 Total deals found: ${allDeals.length}`);

      // Analyze and process deals
      if (allDeals.length > 0) {
        console.log('🔍 Analyzing and validating deals...');
        const processedDeals = await DealAnalyzer.processDeals(allDeals);
        this.stats.totalDealsProcessed = processedDeals.length;
        
        console.log(`✅ Processed ${processedDeals.length} valid deals`);

        // Save deals to database
        if (processedDeals.length > 0) {
          console.log('💾 Saving deals to database...');
          const savedCount = await this.saveDeals(processedDeals);
          this.stats.totalDealsSaved = savedCount;
          console.log(`✅ Saved ${savedCount} deals to database`);
        }
      }

      // Update last run time
      this.lastRun = new Date();
      this.stats.runTime = Date.now() - startTime;

      console.log('🎉 Deal discovery process completed!');
      console.log('📈 Stats:', this.stats);

    } catch (error) {
      console.error('❌ Error in deal discovery process:', error);
      this.stats.errors++;
    } finally {
      this.isRunning = false;
    }

    return this.stats;
  }

  /**
   * Save deals to database
   */
  async saveDeals(deals) {
    let savedCount = 0;
    
    for (const deal of deals) {
      try {
        // Find or create category
        let category = await prisma.category.findFirst({
          where: { slug: deal.category }
        });

        if (!category) {
          category = await prisma.category.create({
            data: {
              name: this.formatCategoryName(deal.category),
              slug: deal.category,
              description: `Deals in ${this.formatCategoryName(deal.category)}`,
              isActive: true
            }
          });
        }

        // Create retailer record
        await prisma.retailer.create({
          data: {
            name: deal.title,
            url: deal.dealUrl,
            description: deal.description,
            categoryId: category.id,
            isVerified: true,
            hasActiveSale: deal.discountPercentage >= 30,
            salePercentage: deal.discountPercentage,
            saleEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            isActive: true
          }
        });

        savedCount++;
        
      } catch (error) {
        console.error('Error saving deal:', error);
        this.stats.errors++;
      }
    }
    
    return savedCount;
  }

  /**
   * Format category name for display
   */
  formatCategoryName(categorySlug) {
    return categorySlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get discovery status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      stats: this.stats,
      scrapers: this.scrapers.map(scraper => ({
        name: scraper.retailerName,
        baseUrl: scraper.baseUrl
      }))
    };
  }

  /**
   * Get recent deals from database
   */
  async getRecentDeals(limit = 20) {
    try {
      const deals = await prisma.retailer.findMany({
        where: { 
          isActive: true,
          hasActiveSale: true
        },
        include: {
          category: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return deals;
      
    } catch (error) {
      console.error('Error getting recent deals:', error);
      return [];
    }
  }

  /**
   * Get deal statistics
   */
  async getDealStatistics() {
    try {
      const stats = await prisma.retailer.aggregate({
        where: { isActive: true },
        _count: { id: true },
        _avg: { salePercentage: true },
        _max: { salePercentage: true }
      });

      const categoryStats = await prisma.category.findMany({
        include: {
          _count: {
            select: { retailers: true }
          }
        }
      });

      return {
        totalDeals: stats._count.id,
        averageDiscount: Math.round(stats._avg.salePercentage || 0),
        maxDiscount: stats._max.salePercentage || 0,
        categories: categoryStats.map(cat => ({
          name: cat.name,
          count: cat._count.retailers
        })),
        lastDiscoveryRun: this.lastRun,
        discoveryStats: this.stats
      };
      
    } catch (error) {
      console.error('Error getting deal statistics:', error);
      return null;
    }
  }

  /**
   * Test a single scraper
   */
  async testScraper(scraperName) {
    const scraper = this.scrapers.find(s => 
      s.retailerName.toLowerCase().includes(scraperName.toLowerCase())
    );
    
    if (!scraper) {
      throw new Error(`Scraper not found: ${scraperName}`);
    }

    console.log(`🧪 Testing ${scraper.retailerName} scraper...`);
    
    try {
      const deals = await scraper.scrapeDeals();
      console.log(`✅ Test successful: Found ${deals.length} deals`);
      return deals;
    } catch (error) {
      console.error(`❌ Test failed:`, error);
      throw error;
    }
  }
}

module.exports = new DealDiscoveryManager();
