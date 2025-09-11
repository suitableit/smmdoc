const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateProviders() {
  try {
    console.log('Updating all providers to active status with proper API URLs...');
    
    // Get all current providers
    const providers = await prisma.api_providers.findMany();
    console.log(`Found ${providers.length} providers`);
    
    // Update each provider individually
    for (const provider of providers) {
      let apiUrl = provider.api_url;
      
      // Set proper API URLs based on provider name
      if (provider.name.toLowerCase().includes('smmgen')) {
        apiUrl = 'https://api.smmgen.com/v2';
      } else if (provider.name.toLowerCase().includes('growfollows')) {
        apiUrl = 'https://api.growfollows.com/v2';
      } else if (provider.name.toLowerCase().includes('attpanel')) {
        apiUrl = 'https://api.attpanel.com/v2';
      } else if (provider.name.toLowerCase().includes('smmcoder')) {
        apiUrl = 'https://api.smmcoder.com/v2';
      } else if (provider.name.toLowerCase().includes('smmking')) {
        apiUrl = 'https://api.smmking.com/v2';
      } else if (provider.name.toLowerCase().includes('socialpanel')) {
        apiUrl = 'https://api.socialpanel.com/v2';
      } else if (!apiUrl || apiUrl.trim() === '') {
        // For providers without API URL, set a default one
        apiUrl = `https://api.${provider.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/v2`;
      }
      
      try {
        await prisma.api_providers.update({
          where: { id: provider.id },
          data: {
            status: 'active',
            api_url: apiUrl,
            updatedAt: new Date()
          }
        });
        console.log(`✅ Updated ${provider.name}: status=active, api_url=${apiUrl}`);
      } catch (error) {
        console.error(`❌ Error updating ${provider.name}:`, error.message);
      }
    }

    // Get updated providers list
    console.log('\n📋 Final providers list:');
    const updatedProviders = await prisma.api_providers.findMany({
      select: {
        id: true,
        name: true,
        api_url: true,
        status: true,
        is_custom: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    updatedProviders.forEach(provider => {
      const statusIcon = provider.status === 'active' ? '🟢' : '🔴';
      const apiStatus = provider.api_url && provider.api_url.trim() !== '' ? '🔗' : '⚠️';
      console.log(`${statusIcon} ${apiStatus} ${provider.id}. ${provider.name} - ${provider.status} - ${provider.api_url || 'No URL'} ${provider.is_custom ? '(Custom)' : ''}`);
    });

    console.log('\n✅ All providers updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating providers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProviders();