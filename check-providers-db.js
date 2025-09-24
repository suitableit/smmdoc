const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProviders() {
  try {
    console.log('🔍 Checking providers in database...\n');

    // Get all providers
    const providers = await prisma.api_providers.findMany({
      select: {
        id: true,
        name: true,
        api_url: true,
        api_key: true,
        status: true,
        current_balance: true,
        balance_last_updated: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        balance_action: true,
        balance_endpoint: true,
        api_key_param: true,
        action_param: true
      }
    });

    console.log(`Found ${providers.length} providers:\n`);

    providers.forEach((provider, index) => {
      console.log(`${index + 1}. Provider: ${provider.name || provider.label}`);
      console.log(`   ID: ${provider.id}`);
      console.log(`   Status: ${provider.status}`);
      console.log(`   API URL: ${provider.api_url || 'Not set'}`);
      console.log(`   API Key: ${provider.api_key ? '***' + provider.api_key.slice(-4) : 'Not set'}`);
      console.log(`   Current Balance: ${provider.current_balance || 0}`);
      console.log(`   Balance Last Updated: ${provider.balance_last_updated || 'Never'}`);
      console.log(`   Created: ${provider.createdAt}`);
      console.log(`   Updated: ${provider.updatedAt}`);
      console.log(`   Deleted: ${provider.deletedAt || 'Not deleted'}`);
      console.log('   ---');
    });

    // Check for providers with missing API credentials
    const providersWithoutCredentials = providers.filter(p => 
      p.status === 'active' && (!p.api_url || !p.api_key)
    );

    if (providersWithoutCredentials.length > 0) {
      console.log('\n⚠️  Active providers with missing API credentials:');
      providersWithoutCredentials.forEach(p => {
        console.log(`   - ${p.name || p.label} (ID: ${p.id})`);
        console.log(`     Missing: ${!p.api_url ? 'API URL' : ''} ${!p.api_key ? 'API Key' : ''}`);
      });
    }

    // Check for providers that might have connection issues
    const activeProviders = providers.filter(p => p.status === 'active' && p.api_url && p.api_key);
    console.log(`\n✅ Active providers with complete credentials: ${activeProviders.length}`);
    
    if (activeProviders.length > 0) {
      console.log('\nActive providers ready for testing:');
      activeProviders.forEach(p => {
        console.log(`   - ${p.name || p.label} (ID: ${p.id}) - ${p.api_url}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking providers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProviders();