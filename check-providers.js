const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProviders() {
  try {
    console.log('🔍 Checking providers in database...\n');
    
    const providers = await prisma.api_providers.findMany({
      select: {
        id: true,
        name: true,
        api_url: true,
        api_key: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    if (providers.length === 0) {
      console.log('❌ No providers found in database');
      return;
    }

    console.log(`✅ Found ${providers.length} providers:\n`);
    
    providers.forEach((provider, index) => {
      console.log(`${index + 1}. Provider ID: ${provider.id}`);
      console.log(`   Name: ${provider.name}`);
      console.log(`   API URL: ${provider.api_url || 'Not set'}`);
      console.log(`   API Key: ${provider.api_key ? '[SET]' : '[NOT SET]'}`);
      console.log(`   Status: ${provider.status}`);
      console.log(`   Created: ${provider.createdAt}`);
      console.log(`   Updated: ${provider.updatedAt}`);
      console.log(`   Deleted: ${provider.deletedAt || 'Not deleted'}`);
      console.log('   ---');
    });

    // Check for providers with missing API URL or Key
    const incompleteProviders = providers.filter(p => 
      !p.api_url || p.api_url.trim() === '' || 
      !p.api_key || p.api_key.trim() === ''
    );

    if (incompleteProviders.length > 0) {
      console.log('\n⚠️  Providers with missing API URL or Key:');
      incompleteProviders.forEach(p => {
        console.log(`   - ${p.name} (ID: ${p.id})`);
        if (!p.api_url || p.api_url.trim() === '') console.log(`     Missing API URL`);
        if (!p.api_key || p.api_key.trim() === '') console.log(`     Missing API Key`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking providers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProviders();