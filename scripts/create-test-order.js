const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestOrder() {
  try {
    console.log('🔄 Creating test completed order...\n');
    
    // Get user ID
    const user = await prisma.user.findFirst({
      where: {
        role: 'user'
      }
    });

    if (!user) {
      console.log('❌ No user found');
      return;
    }

    // Get service with refill enabled
    const service = await prisma.service.findFirst({
      where: {
        refill: true,
        cancel: true
      },
      include: {
        category: true
      }
    });

    if (!service) {
      console.log('❌ No service with refill found');
      return;
    }

    // Create completed order
    const order = await prisma.newOrder.create({
      data: {
        userId: user.id,
        serviceId: service.id,
        categoryId: service.categoryId,
        link: 'https://instagram.com/test_account',
        qty: 1000,
        price: 2.50,
        charge: 2.50,
        profit: 0,
        avg_time: service.avg_time,
        status: 'completed',
        remains: 1000,
        startCount: 0,
        bdtPrice: 303.625,
        currency: 'BDT',
        usdPrice: 2.50
      }
    });

    console.log(`✅ Created completed order #${order.id}`);
    console.log(`Service: ${service.name}`);
    console.log(`Service Refill: ${service.refill}`);
    console.log(`Service Cancel: ${service.cancel}`);
    console.log(`Order Status: ${order.status}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrder();
