const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Manual data recovery since backup tables were dropped
const PROVIDER_DATA = [
  {
    id: 'provider_1',
    name: 'SMMCoder',
    apiUrl: 'https://smmcoder.com/api/v2',
    apiKey: 'your_api_key_here',
    isActive: true
  },
  {
    id: 'provider_2', 
    name: 'Provider 2',
    apiUrl: 'https://provider2.com/api',
    apiKey: 'provider2_key',
    isActive: true
  },
  {
    id: 'provider_3',
    name: 'Provider 3', 
    apiUrl: 'https://provider3.com/api',
    apiKey: 'provider3_key',
    isActive: true
  },
  {
    id: 'provider_4',
    name: 'Provider 4',
    apiUrl: 'https://provider4.com/api', 
    apiKey: 'provider4_key',
    isActive: true
  },
  {
    id: 'provider_5',
    name: 'Provider 5',
    apiUrl: 'https://provider5.com/api',
    apiKey: 'provider5_key',
    isActive: true
  },
  {
    id: 'provider_6',
    name: 'Provider 6',
    apiUrl: 'https://provider6.com/api',
    apiKey: 'provider6_key', 
    isActive: true
  }
];

// Service provider mapping (based on previous data)
const SERVICE_PROVIDER_MAPPING = [
  {
    serviceId: 1, // Replace with actual service ID
    providerId: 'provider_1'
  },
  {
    serviceId: 2, // Replace with actual service ID  
    providerId: 'provider_2'
  }
];

async function manualDataRecovery() {
  console.log('🔄 Starting manual data recovery...');
  
  try {
    // Step 1: Create providers
    console.log('📦 Step 1: Creating providers...');
    
    for (const provider of PROVIDER_DATA) {
      try {
        await prisma.providers.upsert({
          where: { id: provider.id },
          update: {
            name: provider.name,
            apiUrl: provider.apiUrl,
            apiKey: provider.apiKey,
            isActive: provider.isActive
          },
          create: {
            id: provider.id,
            name: provider.name,
            apiUrl: provider.apiUrl,
            apiKey: provider.apiKey,
            isActive: provider.isActive
          }
        });
        console.log(`   ✅ Created/Updated provider: ${provider.name}`);
      } catch (error) {
        console.error(`   ❌ Failed to create provider ${provider.name}:`, error.message);
      }
    }
    
    // Step 2: Update service provider relationships
    console.log('\n🔗 Step 2: Updating service provider relationships...');
    
    for (const mapping of SERVICE_PROVIDER_MAPPING) {
      try {
        await prisma.service.update({
          where: { id: mapping.serviceId },
          data: {
            providerId: mapping.providerId
          }
        });
        console.log(`   ✅ Updated service ${mapping.serviceId} with provider ${mapping.providerId}`);
      } catch (error) {
        console.error(`   ❌ Failed to update service ${mapping.serviceId}:`, error.message);
      }
    }
    
    // Step 3: Verify data
    console.log('\n🔍 Step 3: Verifying recovered data...');
    
    const providersCount = await prisma.providers.count();
    console.log(`   Providers created: ${providersCount}`);
    
    const servicesWithProviders = await prisma.service.count({
      where: {
        providerId: {
          not: null
        }
      }
    });
    console.log(`   Services with providers: ${servicesWithProviders}`);
    
    // Step 4: Show sample data
    console.log('\n📋 Sample recovered data:');
    
    const sampleProviders = await prisma.providers.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        apiUrl: true,
        isActive: true
      }
    });
    
    sampleProviders.forEach((provider, index) => {
      console.log(`   ${index + 1}. ${provider.name} (${provider.id}) - Active: ${provider.isActive}`);
    });
    
    const sampleServices = await prisma.service.findMany({
      where: {
        providerId: {
          not: null
        }
      },
      take: 3,
      select: {
        id: true,
        name: true,
        providerId: true
      }
    });
    
    console.log('\n🔗 Services with providers:');
    sampleServices.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.name} (ID: ${service.id}) -> Provider: ${service.providerId}`);
    });
    
    console.log('\n🎉 Manual data recovery completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Verify data in Prisma Studio (http://localhost:5555)');
    console.log('   2. Update provider API keys if needed');
    console.log('   3. Test provider order functionality');
    console.log('   4. Update service provider mappings if needed');
    
  } catch (error) {
    console.error('❌ Manual data recovery failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run manual data recovery
manualDataRecovery()
  .then(() => {
    console.log('\n✅ Manual data recovery process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Manual data recovery process failed:', error);
    process.exit(1);
  });