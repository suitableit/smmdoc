const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProviderBalanceConfig() {
  try {
    console.log('🔍 Checking provider balance configuration...\n');
    
    // Get ATTPanel and SampleSMM providers
    const providers = await prisma.api_providers.findMany({
      where: {
        OR: [
          { name: 'ATTPanel' },
          { name: 'SampleSMM' }
        ]
      },
      select: {
        id: true,
        name: true,
        api_url: true,
        api_key: true,
        status: true,
        http_method: true,
        balance_endpoint: true,
        balance_action: true,
        current_balance: true,
        balance_last_updated: true
      }
    });

    if (providers.length === 0) {
      console.log('❌ No ATTPanel or SampleSMM providers found in database');
      return;
    }

    providers.forEach(provider => {
      console.log(`📋 Provider: ${provider.name} (ID: ${provider.id})`);
      console.log(`   API URL: ${provider.api_url}`);
      console.log(`   API Key: ${provider.api_key ? provider.api_key.substring(0, 10) + '***' : 'Not set'}`);
      console.log(`   Status: ${provider.status}`);
      console.log(`   HTTP Method: ${provider.http_method}`);
      console.log(`   Balance Endpoint: ${provider.balance_endpoint || 'Not set'}`);
      console.log(`   Balance Action: ${provider.balance_action}`);
      console.log(`   Current Balance: ${provider.current_balance || 'Not cached'}`);
      console.log(`   Last Updated: ${provider.balance_last_updated || 'Never'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error checking provider configuration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProviderBalanceConfig();