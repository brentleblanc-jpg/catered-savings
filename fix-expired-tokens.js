const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixExpiredTokens() {
  try {
    console.log('🔍 Checking token status for all users...');
    
    // Get all users with their token expiration info
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        accessToken: true,
        tokenExpiresAt: true,
        createdAt: true
      }
    });
    
    console.log(`📊 Found ${users.length} users in database`);
    
    const now = new Date();
    let expiredCount = 0;
    let validCount = 0;
    
    for (const user of users) {
      if (!user.accessToken) {
        console.log(`❌ User ${user.email} has no access token`);
        continue;
      }
      
      if (!user.tokenExpiresAt) {
        console.log(`❌ User ${user.email} has no token expiration date`);
        continue;
      }
      
      if (user.tokenExpiresAt < now) {
        console.log(`⏰ User ${user.email} has expired token (expired: ${user.tokenExpiresAt.toISOString()})`);
        expiredCount++;
        
        // Extend token by 30 days
        const newExpiration = new Date();
        newExpiration.setDate(newExpiration.getDate() + 30);
        
        await prisma.user.update({
          where: { id: user.id },
          data: { tokenExpiresAt: newExpiration }
        });
        
        console.log(`✅ Extended token for ${user.email} until ${newExpiration.toISOString()}`);
      } else {
        console.log(`✅ User ${user.email} has valid token (expires: ${user.tokenExpiresAt.toISOString()})`);
        validCount++;
      }
    }
    
    console.log(`\n📈 Summary:`);
    console.log(`   - Total users: ${users.length}`);
    console.log(`   - Valid tokens: ${validCount}`);
    console.log(`   - Expired tokens (fixed): ${expiredCount}`);
    
  } catch (error) {
    console.error('❌ Error fixing expired tokens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixExpiredTokens();
