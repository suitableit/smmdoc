const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateServiceProviders() {
  try {
    console.log('🔗 Updating service provider relationships...');
    
    // Get all providers
    const providers = await prisma.api_providers.findMany({
      where: { status: 'active' },
      select: { id: true, name: true }
    });
    
    console.log(`📦 Found ${providers.length} active providers`);
    
    if (providers.length === 0) {
      console.log('❌ No active providers found. Please create providers first.');
      return;
    }
    
    // Get all services
    const services = await prisma.service.findMany({
      select: { id: true, name: true, providerId: true, providerName: true }
    });
    
    console.log(`🔗 Found ${services.length} services to update`);
    
    // Update services with provider relationships
    let updatedCount = 0;
    const batchSize = 100;
    
    for (let i = 0; i < services.length; i += batchSize) {
      const batch = services.slice(i, i + batchSize);
      
      for (const service of batch) {
        // Assign provider based on service category or randomly
        const providerIndex = service.id % providers.length;
        const selectedProvider = providers[providerIndex];
        
        // Update service with provider info
        await prisma.service.update({
          where: { id: service.id },
          data: {
            providerId: selectedProvider.id,
            providerName: selectedProvider.name
          }
        });
        
        updatedCount++;
        
        if (updatedCount % 500 === 0) {
          console.log(`   Updated ${updatedCount} services...`);
        }
      }
    }
    
    console.log(`\n✅ Updated ${updatedCount} services with provider relationships`);
    
    // Verify updates
    const servicesWithProvider = await prisma.service.count({
      where: {
        AND: [
          { providerId: { not: null } },
          { providerName: { not: null } }
        ]
      }
    });
    
    console.log(`\n📊 Verification:`);
    console.log(`   Services with provider info: ${servicesWithProvider}`);
    console.log(`   Total services: ${services.length}`);
    console.log(`   Success rate: ${((servicesWithProvider / services.length) * 100).toFixed(2)}%`);
    
    // Show sample updated services
    const sampleUpdated = await prisma.service.findMany({
      where: {
        AND: [
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
      take: 5
    });
    
    console.log('\n🔍 Sample updated services:');
    sampleUpdated.forEach(s => {
      console.log(`   ${s.id}: ${s.name.substring(0, 40)}... - Provider: ${s.providerName} (ID: ${s.providerId})`);
    });
    
    console.log('\n✅ Service provider update completed!');
    
  } catch (error) {
    console.error('❌ Error updating service providers:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  updateServiceProviders();
}

module.exports = { updateServiceProviders };