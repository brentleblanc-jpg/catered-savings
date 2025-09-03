const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanTestEnvironment() {
  try {
    console.log('🧹 Cleaning test environment...');
    
    // Delete all test users (emails containing 'test' or '+test')
    const testUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'test' } },
          { email: { contains: '+test' } },
          { email: { contains: 'example.com' } }
        ]
      }
    });

    console.log(`📊 Found ${testUsers.length} test users to clean up`);

    for (const user of testUsers) {
      console.log(`🗑️  Deleting test user: ${user.email}`);
      await prisma.user.delete({
        where: { id: user.id }
      });
    }

    // Reset any users with pending Mailchimp status to allow fresh testing
    const pendingUsers = await prisma.user.findMany({
      where: { mailchimpStatus: 'pending' }
    });

    console.log(`📊 Found ${pendingUsers.length} users with pending Mailchimp status`);

    for (const user of pendingUsers) {
      console.log(`🔄 Resetting Mailchimp status for: ${user.email}`);
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          mailchimpStatus: 'pending',
          mailchimpId: null
        }
      });
    }

    console.log('✅ Test environment cleaned!');
    console.log('\n🎯 Ready for fresh testing:');
    console.log('   - All test users removed');
    console.log('   - Pending users reset for fresh sync');
    console.log('   - You can now test with new email addresses');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanTestEnvironment();
