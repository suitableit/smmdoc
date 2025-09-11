const { PrismaClient } = require('@prisma/client');

async function checkProviders() {
  const prisma = new PrismaClient();
  
  try {
    console.log('\n=== API Providers Table Data ===\n');
    
    const providers = await prisma.api_providers.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    if (providers.length === 0) {
      console.log('No providers found in the database.');
    } else {
      console.log(`Found ${providers.length} providers:\n`);
      
      providers.forEach((provider, index) => {
        console.log(`${index + 1}. Provider: ${provider.name}`);
        console.log(`   ID: ${provider.id}`);
        console.log(`   Type: ${provider.type}`);
        console.log(`   Status: ${provider.status}`);
        console.log(`   API Key: ${provider.api_key ? 'Set' : 'Not set'}`);
        console.log(`   API URL: ${provider.api_url || 'Not set'}`);
        console.log(`   Balance: ${provider.balance}`);
        console.log(`   Auto Sync: ${provider.auto_sync}`);
        console.log(`   Created: ${provider.createdAt}`);
        console.log(`   Updated: ${provider.updatedAt}`);
        console.log('   ---');
      });
    }
    
    // Also check the count by status
    const activeCount = await prisma.api_providers.count({
      where: { status: 'active' }
    });
    
    const inactiveCount = await prisma.api_providers.count({
      where: { status: 'inactive' }
    });
    
    console.log(`\nSummary:`);
    console.log(`- Total providers: ${providers.length}`);
    console.log(`- Active providers: ${activeCount}`);
    console.log(`- Inactive providers: ${inactiveCount}`);
    
  } catch (error) {
    console.error('Error checking providers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProviders();