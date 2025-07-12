npm run devconst { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkServices() {
  try {
    console.log('🔍 Checking services with refill/cancel options...\n');
    
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        refill: true,
        cancel: true,
        status: true
      },
      take: 10
    });

    console.log('Services found:');
    console.log('================');
    services.forEach(service => {
      console.log(`ID: ${service.id}`);
      console.log(`Name: ${service.name}`);
      console.log(`Refill: ${service.refill ? '✅' : '❌'}`);
      console.log(`Cancel: ${service.cancel ? '✅' : '❌'}`);
      console.log(`Status: ${service.status}`);
      console.log('---');
    });

    // Check orders with their services
    console.log('\n🔍 Checking recent orders with service details...\n');
    
    const orders = await prisma.newOrder.findMany({
      include: {
        service: {
          select: {
            id: true,
            name: true,
            refill: true,
            cancel: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    console.log('Recent Orders:');
    console.log('==============');
    orders.forEach(order => {
      console.log(`Order ID: ${order.id}`);
      console.log(`Status: ${order.status}`);
      console.log(`Service: ${order.service.name}`);
      console.log(`Service Refill: ${order.service.refill ? '✅' : '❌'}`);
      console.log(`Service Cancel: ${order.service.cancel ? '✅' : '❌'}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkServices();
