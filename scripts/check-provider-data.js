const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProviderData() {
  try {
    console.log('📊 Checking provider data status...');
    
    // Count api_providers
    const providersCount = await prisma.api_providers.count();
    console.log(`\n📦 api_providers count: ${providersCount}`);
    
    // Count services with provider info
    const servicesWithProviderId = await prisma.service.count({
      where: { providerId: { not: null } }
    });
    
    const servicesWithProviderName = await prisma.service.count({
      where: { providerName: { not: null } }
    });
    
    console.log(`🔗 Services with providerId: ${servicesWithProviderId}`);
    console.log(`🔗 Services with providerName: ${servicesWithProviderName}`);
    
    // Get sample services with provider info
    const sampleServices = await prisma.service.findMany({
      where: {
        OR: [
          { providerId: { not: null } },
          { providerName: { not: null } }
        ]
      },
      select: {
        id: true,
        name: true,
        providerId: true,
        providerName: true
      },
      take: 10
    });
    
    console.log('\n🔍 Sample services with provider info:');
    sampleServices.forEach(s => {
      console.log(`   ${s.id}: ${s.name.substring(0, 50)}... - providerId: ${s.providerId}, providerName: ${s.providerName}`);
    });
    
    // Check if we have any providers in api_providers table
    if (providersCount > 0) {
      const sampleProviders = await prisma.api_providers.findMany({
        select: {
          id: true,
          name: true,
          status: true,
          api_url: true
        },
        take: 5
      });
      
      console.log('\n🏢 Sample providers:');
      sampleProviders.forEach(p => {
        console.log(`   ${p.id}: ${p.name} - Status: ${p.status}`);
      });
    }
    
    console.log('\n✅ Provider data check completed!');
    
  } catch (error) {
    console.error('❌ Error checking provider data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProviderData();