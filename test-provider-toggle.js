const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function testProviderToggle() {
  try {
    console.log('🔍 Testing Provider Status Toggle...\n');

    // Get all providers
    const providers = await db.api_providers.findMany({
      where: {
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        status: true,
        api_url: true,
        api_key: true
      }
    });

    console.log('📋 Current Providers:');
    providers.forEach(provider => {
      console.log(`  ID: ${provider.id}, Name: ${provider.name}, Status: ${provider.status}`);
      console.log(`  API URL: ${provider.api_url || 'Not set'}`);
      console.log(`  API Key: ${provider.api_key ? 'Set' : 'Not set'}`);
      console.log('  ---');
    });

    // Test toggle for each provider
    for (const provider of providers) {
      console.log(`\n🔄 Testing toggle for Provider: ${provider.name} (ID: ${provider.id})`);
      console.log(`Current status: ${provider.status}`);
      
      const newStatus = provider.status === 'active' ? 'inactive' : 'active';
      console.log(`Attempting to change to: ${newStatus}`);

      // Check if provider can be activated
      if (newStatus === 'active') {
        if (!provider.api_url || provider.api_url.trim() === '') {
          console.log('❌ Cannot activate: API URL is missing');
          continue;
        }
        if (!provider.api_key || provider.api_key.trim() === '') {
          console.log('❌ Cannot activate: API Key is missing');
          continue;
        }
        
        // Validate URL format
        try {
          new URL(provider.api_url);
          console.log('✅ API URL format is valid');
        } catch (error) {
          console.log('❌ Cannot activate: Invalid API URL format');
          continue;
        }
      }

      try {
        // Update provider status
        const updatedProvider = await db.api_providers.update({
          where: { id: provider.id },
          data: { status: newStatus }
        });

        console.log(`✅ Successfully updated to: ${updatedProvider.status}`);

        // Revert back to original status
        await db.api_providers.update({
          where: { id: provider.id },
          data: { status: provider.status }
        });

        console.log(`🔄 Reverted back to: ${provider.status}`);

      } catch (error) {
        console.log(`❌ Error updating provider: ${error.message}`);
      }
    }

    console.log('\n🎯 Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await db.$disconnect();
  }
}

testProviderToggle();