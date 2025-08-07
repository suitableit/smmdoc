const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAdminCancelAPI() {
  try {
    console.log('🔍 Testing Admin Cancel Requests API Logic...');
    
    // Test the same logic as admin API
    const page = 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    console.log('\n📊 Fetching cancel requests from database...');
    const cancelRequests = await prisma.cancelRequest.findMany({
      skip,
      take: limit,
      include: {
        order: {
          include: {
            service: true,
            user: true
          }
        },
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`✅ Found ${cancelRequests.length} cancel requests`);
    
    if (cancelRequests.length > 0) {
      console.log('\n📋 Sample cancel request:');
      console.log(JSON.stringify(cancelRequests[0], null, 2));
    }
    
    // Get total count
    const totalCount = await prisma.cancelRequest.count();
    console.log(`\n📈 Total cancel requests in database: ${totalCount}`);
    
    // Test with filters
    console.log('\n🔍 Testing with status filter (pending)...');
    const pendingRequests = await prisma.cancelRequest.findMany({
      where: {
        status: 'pending'
      },
      include: {
        order: {
          include: {
            service: true,
            user: true
          }
        },
        user: true
      }
    });
    
    console.log(`✅ Found ${pendingRequests.length} pending cancel requests`);
    
    // Check if there are any orders that could be cancelled
    console.log('\n🛒 Checking orders that could be cancelled...');
    const eligibleOrders = await prisma.newOrder.findMany({
      where: {
        status: {
          in: ['pending', 'processing', 'in_progress']
        }
      },
      take: 5,
      include: {
        user: true,
        service: true
      }
    });
    
    console.log(`✅ Found ${eligibleOrders.length} orders eligible for cancellation`);
    
    if (eligibleOrders.length > 0) {
      console.log('\n📋 Sample eligible order:');
      console.log(`Order ID: ${eligibleOrders[0].id}, Status: ${eligibleOrders[0].status}, User: ${eligibleOrders[0].user?.email}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing admin cancel API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminCancelAPI();