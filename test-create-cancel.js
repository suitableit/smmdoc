const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCreateCancelRequest() {
  try {
    console.log('🔍 Testing Cancel Request Creation...');
    
    // First, get an eligible order
    const eligibleOrder = await prisma.newOrder.findFirst({
      where: {
        status: {
          in: ['pending', 'processing', 'in_progress']
        }
      },
      include: {
        user: true,
        service: true
      }
    });
    
    if (!eligibleOrder) {
      console.log('❌ No eligible orders found for cancellation');
      return;
    }
    
    console.log(`✅ Found eligible order: ID ${eligibleOrder.id}, Status: ${eligibleOrder.status}`);
    console.log(`   User: ${eligibleOrder.user.email}`);
    console.log(`   Service: ${eligibleOrder.service.name}`);
    
    // Check if cancel request already exists for this order
    const existingCancel = await prisma.cancelRequest.findFirst({
      where: {
        orderId: eligibleOrder.id,
        status: 'pending'
      }
    });
    
    if (existingCancel) {
      console.log('⚠️ Cancel request already exists for this order');
      console.log(`   Cancel Request ID: ${existingCancel.id}`);
      console.log(`   Reason: ${existingCancel.reason}`);
      console.log(`   Created: ${existingCancel.createdAt}`);
      return;
    }
    
    // Create a test cancel request
    console.log('\n📝 Creating test cancel request...');
    const cancelRequest = await prisma.cancelRequest.create({
      data: {
        orderId: eligibleOrder.id,
        userId: eligibleOrder.userId,
        reason: 'Test cancel request - automated testing',
        status: 'pending',
        refundAmount: eligibleOrder.price
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
    
    console.log('✅ Cancel request created successfully!');
    console.log(`   Cancel Request ID: ${cancelRequest.id}`);
    console.log(`   Order ID: ${cancelRequest.orderId}`);
    console.log(`   User: ${cancelRequest.user.email}`);
    console.log(`   Reason: ${cancelRequest.reason}`);
    console.log(`   Status: ${cancelRequest.status}`);
    console.log(`   Refund Amount: ${cancelRequest.refundAmount}`);
    console.log(`   Created: ${cancelRequest.createdAt}`);
    
    // Now test if admin API can fetch it
    console.log('\n🔍 Testing if admin API can fetch the cancel request...');
    const adminFetch = await prisma.cancelRequest.findMany({
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
    
    console.log(`✅ Admin API can fetch ${adminFetch.length} cancel requests`);
    
    if (adminFetch.length > 0) {
      console.log('\n📋 Latest cancel request from admin perspective:');
      const latest = adminFetch[0];
      console.log(`   ID: ${latest.id}`);
      console.log(`   Order ID: ${latest.orderId}`);
      console.log(`   User: ${latest.user.email}`);
      console.log(`   Service: ${latest.order.service.name}`);
      console.log(`   Status: ${latest.status}`);
      console.log(`   Created: ${latest.createdAt}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing cancel request creation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCreateCancelRequest();