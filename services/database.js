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
    return await prisma.user.create({
      data: {
        email,
        name,
        preferences,
        mailchimpStatus: 'pending'
      }
    });
  }

  async getUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  async updateUserMailchimpStatus(email, status) {
    return await prisma.user.update({
      where: { email },
      data: { 
        mailchimpStatus: status,
        lastActiveAt: new Date()
      }
    });
  }

  async getAllUsers() {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  // Sponsored Products
  async getActiveSponsoredProducts(limit = 4) {
    const now = new Date();
    return await prisma.sponsoredProduct.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async getAllSponsoredProducts() {
    return await prisma.sponsoredProduct.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async createSponsoredProduct(data) {
    return await prisma.sponsoredProduct.create({ data });
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

  async disconnect() {
    await prisma.$disconnect();
  }
}

module.exports = new DatabaseService();
