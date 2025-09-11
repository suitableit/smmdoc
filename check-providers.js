const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProviders() {
  try {
    console.log('Checking api_providers table...');
    
    const providers = await prisma.api_providers.findMany({
      orderBy: { id: 'asc' }
    });
    
    console.log('\nCurrent providers in database:');
    console.log('================================');
    
    providers.forEach((provider, index) => {
      console.log(`${index + 1}. ID: ${provider.id}`);
      console.log(`   Name: ${provider.name}`);
      console.log(`   API URL: ${provider.api_url || 'Not set'}`);
      console.log(`   Status: ${provider.status}`);
      console.log(`   Is Custom: ${provider.is_custom}`);
      console.log(`   Created: ${provider.createdAt}`);
      console.log('   ---');
    });
    
    console.log(`\nTotal providers: ${providers.length}`);
    
  } catch (error) {
    console.error('Error checking providers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProviders();