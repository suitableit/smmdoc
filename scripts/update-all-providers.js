const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAllProviders() {
  try {
    console.log('🔧 Updating all provider API keys...');
    
    // Update GrowFollows
    await prisma.apiProvider.upsert({
      where: { name: 'growfollows' },
      update: {
        api_key: 'c5acb7dcf2cf56294633836160f2ef3a',
        api_url: 'https://growfollows.com/api/v2',
        status: 'active'
      },
      create: {
        name: 'growfollows',
        api_key: 'c5acb7dcf2cf56294633836160f2ef3a',
        api_url: 'https://growfollows.com/api/v2',
        status: 'active'
      }
    });
    console.log('✅ Updated GrowFollows');

    // Update SMMGen
    await prisma.apiProvider.upsert({
      where: { name: 'smmgen' },
      update: {
        api_key: 'af86d6b5cdd86703c1d269c3af8193ec',
        api_url: 'https://smmgen.com/api/v2',
        status: 'active'
      },
      create: {
        name: 'smmgen',
        api_key: 'af86d6b5cdd86703c1d269c3af8193ec',
        api_url: 'https://smmgen.com/api/v2',
        status: 'active'
      }
    });
    console.log('✅ Updated SMMGen');

    // Verify updates
    const providers = await prisma.apiProvider.findMany({
      where: {
        name: {
          in: ['growfollows', 'smmgen', 'attpanel']
        }
      }
    });

    console.log('\n📊 Updated Providers:');
    providers.forEach(provider => {
      console.log(`  - ${provider.name}: ${provider.api_key.substring(0, 8)}... (${provider.status})`);
      console.log(`    URL: ${provider.api_url}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllProviders();
