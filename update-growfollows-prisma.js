const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateGrowFollowsKey() {
  try {
    console.log('🔧 Updating GrowFollows API key with Prisma...');
    
    // Update GrowFollows API key
    const newApiKey = 'c5acb7dcf2cf56294633836160f2ef3a';
    const apiUrl = 'https://growfollows.com/api/v2';
    
    const updatedProvider = await prisma.apiProvider.update({
      where: {
        name: 'growfollows'
      },
      data: {
        api_key: newApiKey,
        api_url: apiUrl,
        status: 'active'
      }
    });

    console.log('✅ Updated GrowFollows provider:', updatedProvider);

    // Verify the update
    const provider = await prisma.apiProvider.findUnique({
      where: {
        name: 'growfollows'
      }
    });

    if (provider) {
      console.log('\n📊 Updated GrowFollows Provider:');
      console.log(`  - ID: ${provider.id}`);
      console.log(`  - Name: ${provider.name}`);
      console.log(`  - API URL: ${provider.api_url}`);
      console.log(`  - API Key: ${provider.api_key.substring(0, 10)}...`);
      console.log(`  - Status: ${provider.status}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateGrowFollowsKey();
