const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProviders() {
  try {
    console.log('Checking api_providers table...');
    
    const providers = await prisma.api_providers.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        api_url: true,
        is_custom: true,
        createdAt: true
      },
      orderBy: {
        id: 'asc'
      }
    });
    
    console.log(`\nFound ${providers.length} providers in database:`);
    console.log('=' .repeat(80));
    
    providers.forEach((provider, index) => {
      console.log(`${index + 1}. ${provider.name}`);
      console.log(`   Status: ${provider.status}`);
      console.log(`   API URL: ${provider.api_url || 'Not set'}`);
      console.log(`   Is Custom: ${provider.is_custom}`);
      console.log(`   Created: ${provider.createdAt}`);
      console.log('');
    });
    
    // Count active vs inactive
    const activeCount = providers.filter(p => p.status === 'active').length;
    const inactiveCount = providers.filter(p => p.status !== 'active').length;
    
    console.log('Summary:');
    console.log(`Active providers: ${activeCount}`);
    console.log(`Inactive providers: ${inactiveCount}`);
    console.log(`Total providers: ${providers.length}`);
    
  } catch (error) {
    console.error('Error checking providers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProviders();