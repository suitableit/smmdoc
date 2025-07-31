const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateATTPanel() {
  try {
    console.log('🔧 Updating ATTPanel...');
    
    // Get current ATTPanel data
    const currentProvider = await prisma.apiProvider.findUnique({
      where: { name: 'attpanel' }
    });

    if (currentProvider) {
      console.log('📊 Current ATTPanel:');
      console.log(`  - API Key: ${currentProvider.api_key.substring(0, 8)}...`);
      console.log(`  - API URL: ${currentProvider.api_url}`);
      console.log(`  - Status: ${currentProvider.status}`);
    }

    // Common ATTPanel API URLs to try
    const possibleUrls = [
      'https://attpanel.com/api/v2',
      'https://api.attpanel.com/v2',
      'https://attpanel.com/api'
    ];

    console.log('\n🔍 Possible ATTPanel URLs:');
    possibleUrls.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });

    // For now, keep the current API key and try the first URL
    if (currentProvider) {
      await prisma.apiProvider.update({
        where: { name: 'attpanel' },
        data: {
          api_url: possibleUrls[0],
          status: 'active'
        }
      });

      console.log(`\n✅ Updated ATTPanel URL to: ${possibleUrls[0]}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateATTPanel();
