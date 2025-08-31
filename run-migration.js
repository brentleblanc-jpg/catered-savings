const { PrismaClient } = require('@prisma/client');

async function runMigration() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Running database migration...');
    
    // This will create all tables based on the schema
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "slug" TEXT NOT NULL UNIQUE,
        "description" TEXT,
        "iconUrl" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `;
    
    console.log('✅ Categories table created');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "retailers" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "description" TEXT,
        "logoUrl" TEXT,
        "isVerified" BOOLEAN NOT NULL DEFAULT false,
        "hasActiveSale" BOOLEAN NOT NULL DEFAULT false,
        "salePercentage" INTEGER,
        "saleEndDate" TIMESTAMP(3),
        "clickCount" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "categoryId" TEXT NOT NULL,
        FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `;
    
    console.log('✅ Retailers table created');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT,
        "preferences" TEXT,
        "mailchimpStatus" TEXT NOT NULL DEFAULT 'pending',
        "accessToken" TEXT UNIQUE,
        "tokenExpiresAt" TIMESTAMP(3),
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "lastActiveAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `;
    
    console.log('✅ Users table created');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "sponsored_products" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "imageUrl" TEXT,
        "affiliateUrl" TEXT NOT NULL,
        "price" REAL,
        "originalPrice" REAL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "endDate" TIMESTAMP(3),
        "clickCount" INTEGER NOT NULL DEFAULT 0,
        "conversionCount" INTEGER NOT NULL DEFAULT 0,
        "revenueGenerated" REAL NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `;
    
    console.log('✅ Sponsored products table created');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "analytics_events" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "eventType" TEXT NOT NULL,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "metadata" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "userId" TEXT,
        "retailerId" TEXT,
        "sponsoredProductId" TEXT,
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY ("retailerId") REFERENCES "retailers"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY ("sponsoredProductId") REFERENCES "sponsored_products"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `;
    
    console.log('✅ Analytics events table created');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "email_campaigns" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "subject" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "campaignType" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "sentCount" INTEGER NOT NULL DEFAULT 0,
        "openCount" INTEGER NOT NULL DEFAULT 0,
        "clickCount" INTEGER NOT NULL DEFAULT 0,
        "scheduledFor" TIMESTAMP(3),
        "sentAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `;
    
    console.log('✅ Email campaigns table created');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "admin_users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'admin',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "lastLoginAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `;
    
    console.log('✅ Admin users table created');
    
    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
