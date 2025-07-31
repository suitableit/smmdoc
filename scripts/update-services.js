const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateServices() {
  try {
    console.log('🔄 Updating services to enable refill/cancel options...\n');
    
    // Enable refill for Instagram Followers - High Quality (which has completed orders)
    const service1 = await prisma.service.update({
      where: {
        id: 'cmb8bl2qz000vwgxcegt3oxwh' // Instagram Followers - High Quality
      },
      data: {
        refill: true,
        cancel: true
      }
    });
    console.log(`✅ Updated ${service1.name} - Refill: ${service1.refill}, Cancel: ${service1.cancel}`);

    // Enable refill for Instagram Followers - Premium
    const service2 = await prisma.service.update({
      where: {
        id: 'cmb8bl35c000xwgxcs41zqeg3' // Instagram Followers - Premium
      },
      data: {
        refill: true,
        cancel: true
      }
    });
    console.log(`✅ Updated ${service2.name} - Refill: ${service2.refill}, Cancel: ${service2.cancel}`);

    // Enable cancel for Instagram Likes - Fast Delivery
    const service3 = await prisma.service.update({
      where: {
        id: 'cmb8bl3iq000zwgxcoun1kdbw' // Instagram Likes - Fast Delivery
      },
      data: {
        cancel: true
      }
    });
    console.log(`✅ Updated ${service3.name} - Refill: ${service3.refill}, Cancel: ${service3.cancel}`);

    console.log('\n🎉 Services updated successfully!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateServices();
