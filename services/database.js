const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Database service for Catered Savers
class DatabaseService {
  
  // Categories
  async getAllCategories() {
    return await prisma.category.findMany({
      where: { isActive: true },
      include: {
        retailers: {
          where: { isActive: true },
          orderBy: { hasActiveSale: 'desc' }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async getCategoryBySlug(slug) {
    return await prisma.category.findUnique({
      where: { slug },
      include: {
        retailers: {
          where: { isActive: true },
          orderBy: { hasActiveSale: 'desc' }
        }
      }
    });
  }

  // Retailers
  async getAllRetailers() {
    return await prisma.retailer.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { hasActiveSale: 'desc' }
    });
  }

  async getRetailersByCategory(categoryId) {
    return await prisma.retailer.findMany({
      where: { 
        categoryId,
        isActive: true 
      },
      include: { category: true },
      orderBy: { hasActiveSale: 'desc' }
    });
  }

  async createRetailer(data) {
    return await prisma.retailer.create({ data });
  }

  async updateRetailer(id, data) {
    return await prisma.retailer.update({
      where: { id },
      data: { ...data, updatedAt: new Date() }
    });
  }

  async deleteRetailer(id) {
    return await prisma.retailer.update({
      where: { id },
      data: { isActive: false }
    });
  }

  async trackRetailerClick(retailerId, metadata = {}) {
    await prisma.retailer.update({
      where: { id: retailerId },
      data: { clickCount: { increment: 1 } }
    });

    return await prisma.analyticsEvent.create({
      data: {
        eventType: 'retailer_click',
        retailerId,
        metadata,
        ipAddress: metadata.ip,
        userAgent: metadata.userAgent
      }
    });
  }

  // Users
  async createUser(email, name, preferences = {}) {
    // Generate secure access token
    const accessToken = this.generateAccessToken();
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 7); // 7 days from now
    
    return await prisma.user.create({
      data: {
        email,
        name,
        preferences: JSON.stringify(preferences),
        mailchimpStatus: 'pending',
        accessToken,
        tokenExpiresAt
      }
    });
  }

  generateAccessToken() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  async getUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  async updateUserPreferences(userId, preferences) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        preferences: JSON.stringify(preferences)
      }
    });
  }

  async updateUserToken(email, accessToken, tokenExpiresAt) {
    return await prisma.user.update({
      where: { email },
      data: { accessToken, tokenExpiresAt }
    });
  }

  async getUserByToken(token) {
    const user = await prisma.user.findUnique({
      where: { 
        accessToken: token,
        tokenExpiresAt: {
          gt: new Date() // Token not expired
        }
      }
    });
    
    // Parse preferences JSON string if it exists
    if (user && user.preferences) {
      try {
        user.preferences = JSON.parse(user.preferences);
      } catch (e) {
        console.error('Error parsing user preferences:', e);
        user.preferences = {};
      }
    }
    
    return user;
  }

  async getUserById(userId) {
    return await prisma.user.findUnique({
      where: { id: userId }
    });
  }

  async getPersonalizedDeals(userToken) {
    const user = await this.getUserByToken(userToken);
    if (!user) {
      throw new Error('Invalid or expired token');
    }

    const userCategories = user.preferences?.categories || [];
    
    // Get sponsored products (filtered by user's preferred categories if they have any)
    let sponsoredProducts;
    if (userCategories && userCategories.length > 0) {
      // Filter by user's preferred categories
      sponsoredProducts = await prisma.sponsoredProduct.findMany({
        where: {
          isActive: true,
          category: {
            in: userCategories
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    } else {
      // If no categories specified, return all active products
      sponsoredProducts = await prisma.sponsoredProduct.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    }

    return {
      user: {
        name: user.name,
        email: user.email,
        categories: userCategories
      },
      retailers: [], // Empty array since retailers table doesn't exist
      sponsoredProducts
    };
  }

  async updateUserMailchimpStatus(userId, status, mailchimpId = null) {
    const updateData = { 
      mailchimpStatus: status,
      lastActiveAt: new Date()
    };
    
    if (mailchimpId) {
      updateData.mailchimpId = mailchimpId;
    }
    
    return await prisma.user.update({
      where: { id: userId },
      data: updateData
    });
  }

  async getUsersByMailchimpStatus(status) {
    return await prisma.user.findMany({
      where: { mailchimpStatus: status },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAllUsers() {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Parse preferences JSON and extract categories
    return users.map(user => {
      let categories = [];
      if (user.preferences) {
        try {
          const parsed = JSON.parse(user.preferences);
          categories = parsed.categories || [];
        } catch (error) {
          console.error('Error parsing user preferences for user:', user.email, error);
          categories = [];
        }
      }
      
      return {
        ...user,
        categories
      };
    });
  }

  // Products (Regular and Sponsored)
  async getActiveProducts(limit = 4, productType = 'regular') {
    const now = new Date();
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        productType: productType,
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    
    // Add affiliate URLs to products that don't have them
    return products.map(product => {
      // If product already has affiliateUrl, use it
      if (product.affiliateUrl) {
        return product;
      }
      
      // Build affiliate URL based on product title and category
      let affiliateUrl = '#';
      
      // For Amazon-style products, create Amazon affiliate URL
      if (product.title && (
        product.title.toLowerCase().includes('samsung') ||
        product.title.toLowerCase().includes('sony') ||
        product.title.toLowerCase().includes('apple') ||
        product.title.toLowerCase().includes('echo') ||
        product.title.toLowerCase().includes('fire') ||
        product.title.toLowerCase().includes('kindle') ||
        product.title.toLowerCase().includes('ring') ||
        product.title.toLowerCase().includes('airpods') ||
        product.title.toLowerCase().includes('ninja') ||
        product.title.toLowerCase().includes('instant pot')
      )) {
        // Create Amazon search URL with affiliate ID
        affiliateUrl = `https://www.amazon.com/s?k=${encodeURIComponent(product.title)}&tag=820cf-20`;
      }
      
      return {
        ...product,
        affiliateUrl: affiliateUrl
      };
    });
  }

  // Legacy method for backward compatibility
  async getActiveSponsoredProducts(limit = 4) {
    return await this.getActiveProducts(limit, 'sponsored');
  }

  // Get products by categories from database
  async getProductsByCategories(categories, limit = 50) {
    const now = new Date();
    const products = await prisma.sponsoredProduct.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ],
        category: {
          in: categories
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    
    // Add affiliate URLs to products that don't have them
    return products.map(product => {
      // If product already has affiliateUrl, use it
      if (product.affiliateUrl) {
        return product;
      }
      
      // Build affiliate URL based on product title and category
      let affiliateUrl = '#';
      
      // For Amazon-style products, create Amazon affiliate URL
      if (product.title && (
        product.title.toLowerCase().includes('samsung') ||
        product.title.toLowerCase().includes('sony') ||
        product.title.toLowerCase().includes('apple') ||
        product.title.toLowerCase().includes('echo') ||
        product.title.toLowerCase().includes('fire') ||
        product.title.toLowerCase().includes('kindle') ||
        product.title.toLowerCase().includes('ring') ||
        product.title.toLowerCase().includes('airpods') ||
        product.title.toLowerCase().includes('ninja') ||
        product.title.toLowerCase().includes('instant pot')
      )) {
        // Create Amazon search URL with affiliate ID
        affiliateUrl = `https://www.amazon.com/s?k=${encodeURIComponent(product.title)}&tag=820cf-20`;
      }
      
      return {
        ...product,
        affiliateUrl: affiliateUrl
      };
    });
  }

  async getAllSponsoredProducts() {
    return await prisma.sponsoredProduct.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createSponsoredProduct(data) {
    return await prisma.sponsoredProduct.create({ data });
  }

  async addMultipleSponsoredProducts(products) {
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const product of products) {
      try {
        // Check if product already exists (only active products)
        const existingActive = await prisma.sponsoredProduct.findFirst({
          where: { 
            title: product.title,
            isActive: true
          }
        });
        
        if (existingActive) {
          skippedCount++;
          continue;
        }
        
        // Check if product exists but is inactive (reactivate and update)
        const existingInactive = await prisma.sponsoredProduct.findFirst({
          where: { 
            title: product.title,
            isActive: false
          }
        });
        
        if (existingInactive) {
          // Reactivate and update the existing product
          await prisma.sponsoredProduct.update({
            where: { id: existingInactive.id },
            data: {
              description: product.description || existingInactive.description,
              imageUrl: product.imageUrl || existingInactive.imageUrl,
              affiliateUrl: product.affiliateUrl,
              price: parseFloat(product.price),
              originalPrice: parseFloat(product.originalPrice),
              category: product.category,
              source: product.source || existingInactive.source,
              sku: product.sku || existingInactive.sku,
              isActive: true,
              updatedAt: new Date()
            }
          });
          addedCount++;
          continue;
        }
        
        // Validate required fields
        if (!product.title || !product.price || !product.originalPrice || !product.affiliateUrl || !product.category) {
          skippedCount++;
          continue;
        }
        
        // Add affiliate ID to Amazon URLs
        let affiliateUrl = product.affiliateUrl;
        if (affiliateUrl.includes('amazon.com') && !affiliateUrl.includes('tag=')) {
          affiliateUrl += (affiliateUrl.includes('?') ? '&' : '?') + 'tag=820cf-20';
        }
        
        await prisma.sponsoredProduct.create({
          data: {
            title: product.title,
            description: product.description || '',
            imageUrl: product.imageUrl || '',
            affiliateUrl: affiliateUrl,
            price: parseFloat(product.price),
            originalPrice: parseFloat(product.originalPrice),
            category: product.category,
            source: product.source || 'manual',
            sku: product.sku || null,
            isActive: true
          }
        });
        
        addedCount++;
      } catch (error) {
        console.error('Error adding product:', product.title, error);
        skippedCount++;
      }
    }
    
    return { addedCount, skippedCount, totalProcessed: products.length };
  }

  async clearSponsoredProducts() {
    return await prisma.sponsoredProduct.deleteMany({});
  }

  async updateSponsoredProduct(id, data) {
    return await prisma.sponsoredProduct.update({
      where: { id },
      data: { ...data, updatedAt: new Date() }
    });
  }

  async deleteSponsoredProduct(id) {
    return await prisma.sponsoredProduct.update({
      where: { id },
      data: { isActive: false }
    });
  }

  async trackSponsoredClick(productId, metadata = {}) {
    await prisma.sponsoredProduct.update({
      where: { id: productId },
      data: { clickCount: { increment: 1 } }
    });

    return await prisma.analyticsEvent.create({
      data: {
        eventType: 'product_click',
        sponsoredProductId: productId,
        metadata,
        ipAddress: metadata.ip,
        userAgent: metadata.userAgent
      }
    });
  }

  // Analytics
  async getAnalyticsSummary() {
    const [
      totalUsers,
      totalRetailers,
      totalProducts,
      totalClicks,
      recentSignups,
      topRetailers,
      topProducts
    ] = await Promise.all([
      prisma.user.count(),
      prisma.retailer.count({ where: { isActive: true } }),
      prisma.sponsoredProduct.count({ where: { isActive: true } }),
      prisma.analyticsEvent.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      prisma.retailer.findMany({
        where: { isActive: true },
        orderBy: { clickCount: 'desc' },
        take: 5,
        include: { category: true }
      }),
      prisma.sponsoredProduct.findMany({
        where: { isActive: true },
        orderBy: { clickCount: 'desc' },
        take: 5
      })
    ]);

    return {
      totalUsers,
      totalRetailers,
      totalProducts,
      totalClicks,
      recentSignups,
      topRetailers,
      topProducts
    };
  }

  async getClickAnalytics(days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return await prisma.analyticsEvent.findMany({
      where: {
        createdAt: { gte: startDate },
        eventType: { in: ['retailer_click', 'product_click'] }
      },
      include: {
        retailer: true,
        sponsoredProduct: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Email Campaigns
  async getEmailCampaigns() {
    return await prisma.emailCampaign.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async createEmailCampaign(data) {
    return await prisma.emailCampaign.create({ data });
  }

  // Admin Users
  async getAdminByEmail(email) {
    return await prisma.adminUser.findUnique({
      where: { email }
    });
  }

  async updateAdminLastLogin(email) {
    return await prisma.adminUser.update({
      where: { email },
      data: { lastLoginAt: new Date() }
    });
  }

  // User Management
  async deleteUser(userId) {
    return await prisma.user.delete({
      where: { id: userId }
    });
  }

  // Utility
  async healthCheck() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }

  async getAnalyticsEvents() {
    return await prisma.analyticsEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  }

  async updateSponsoredProductAffiliate(productId, affiliateId) {
    return await prisma.sponsoredProduct.update({
      where: { id: productId },
      data: { 
        affiliateId,
        updatedAt: new Date()
      }
    });
  }

  async deleteUser(userId) {
    return await prisma.user.delete({
      where: { id: parseInt(userId) }
    });
  }

  async getSponsoredProductById(id) {
    return await prisma.sponsoredProduct.findUnique({
      where: { id: parseInt(id) }
    });
  }

  // Featured Deals Management
  async getAllFeaturedDeals() {
    return await prisma.featuredDeal.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    });
  }

  async getFeaturedDealsForHomepage(limit = 4) {
    return await prisma.featuredDeal.findMany({
      where: { 
        isActive: true,
        startDate: { lte: new Date() },
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      },
      orderBy: { displayOrder: 'asc' },
      take: limit
    });
  }

  async createFeaturedDeal(dealData) {
    return await prisma.featuredDeal.create({
      data: {
        title: dealData.title,
        description: dealData.description,
        imageUrl: dealData.imageUrl,
        affiliateUrl: dealData.affiliateUrl,
        price: dealData.price,
        originalPrice: dealData.originalPrice,
        discount: dealData.discount,
        category: dealData.category,
        retailer: dealData.retailer,
        displayOrder: dealData.displayOrder || 0,
        startDate: dealData.startDate || new Date(),
        endDate: dealData.endDate,
        isActive: dealData.isActive !== undefined ? dealData.isActive : true
      }
    });
  }

  async updateFeaturedDeal(id, dealData) {
    return await prisma.featuredDeal.update({
      where: { id },
      data: {
        ...dealData,
        updatedAt: new Date()
      }
    });
  }

  async deleteFeaturedDeal(id) {
    return await prisma.featuredDeal.delete({
      where: { id }
    });
  }

  async getFeaturedDealById(id) {
    return await prisma.featuredDeal.findUnique({
      where: { id }
    });
  }

  async updateFeaturedDealOrder(deals) {
    const updatePromises = deals.map(deal => 
      prisma.featuredDeal.update({
        where: { id: deal.id },
        data: { displayOrder: deal.displayOrder }
      })
    );
    return await Promise.all(updatePromises);
  }

  async trackFeaturedDealClick(dealId, metadata = {}) {
    // Track the click event
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'featured_deal_click',
        featuredDealId: dealId,
        metadata: JSON.stringify(metadata)
      }
    });

    // Update click count
    return await prisma.featuredDeal.update({
      where: { id: dealId },
      data: { 
        clickCount: { increment: 1 },
        updatedAt: new Date()
      }
    });
  }

  async disconnect() {
    await prisma.$disconnect();
  }
}

module.exports = new DatabaseService();
