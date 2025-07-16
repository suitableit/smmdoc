const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateServiceTypes() {
  try {
    console.log('🔄 Starting service type update...');

    // Get all service types
    const serviceTypes = await prisma.serviceType.findMany();
    console.log(`📋 Found ${serviceTypes.length} service types:`, serviceTypes.map(st => st.name));

    // Get all services without serviceTypeId
    const servicesWithoutType = await prisma.service.findMany({
      where: {
        OR: [
          { serviceTypeId: null },
          { serviceTypeId: '' }
        ]
      },
      include: {
        category: true
      }
    });

    console.log(`📋 Found ${servicesWithoutType.length} services without service type`);

    // Find or create default service type
    let defaultServiceType = serviceTypes.find(st => st.name === 'Social Media Marketing');
    
    if (!defaultServiceType) {
      defaultServiceType = await prisma.serviceType.create({
        data: {
          name: 'Social Media Marketing',
          description: 'Services related to social media promotion, engagement, and growth',
          status: 'active'
        }
      });
      console.log('✅ Created default service type: Social Media Marketing');
    }

    // Update services without serviceTypeId
    for (const service of servicesWithoutType) {
      await prisma.service.update({
        where: { id: service.id },
        data: { serviceTypeId: defaultServiceType.id }
      });
      console.log(`✅ Updated service "${service.name}" with service type "${defaultServiceType.name}"`);
    }

    console.log('🎉 Service type update completed!');

  } catch (error) {
    console.error('❌ Error updating service types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateServiceTypes();
