const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SAMPLE_SERVICES = [
  {
    id: 1,
    name: 'Instagram Followers',
    category: 'Instagram',
    rate: '0.50',
    min: 100,
    max: 10000,
    description: 'High quality Instagram followers',
    providerId: 'provider_1'
  },
  {
    id: 2,
    name: 'Facebook Page Likes',
    category: 'Facebook',
    rate: '0.75',
    min: 50,
    max: 5000,
    description: 'Real Facebook page likes',
    providerId: 'provider_1'
  },
  {
    id: 3,
    name: 'YouTube Views',
    category: 'YouTube',
    rate: '0.25',
    min: 1000,
    max: 100000,
    description: 'High retention YouTube views',
    providerId: 'provider_2'
  },
  {
    id: 4,
    name: 'TikTok Followers',
    category: 'TikTok',
    rate: '1.00',
    min: 100,
    max: 20000,
    description: 'Real TikTok followers',
    providerId: 'provider_2'
  },
  {
    id: 5,
    name: 'Twitter Followers',
    category: 'Twitter',
    rate: '2.00',
    min: 50,
    max: 10000,
    description: 'Active Twitter followers',
    providerId: 'provider_3'
  }
];

async function createServices() {
  try {
    console.log('🔧 Creating sample services...');
    
    for (const serviceData of SAMPLE_SERVICES) {
      try {
        const service = await prisma.service.upsert({
          where: { id: serviceData.id },
          update: serviceData,
          create: serviceData
        });
        console.log(`   ✅ Created/Updated service: ${service.name}`);
      } catch (error) {
        console.log(`   ❌ Failed to create service ${serviceData.name}: ${error.message}`);
      }
    }
    
    // Verify created services
    const services = await prisma.service.findMany({
      include: {
        provider: true
      }
    });
    
    console.log(`\n📊 Total services: ${services.length}`);
    console.log(`   Services with providers: ${services.filter(s => s.provider).length}`);
    
    console.log('\n✅ Service creation completed!');
    
  } catch (error) {
    console.error('❌ Error creating services:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createServices();