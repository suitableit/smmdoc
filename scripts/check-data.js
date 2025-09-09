const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 Checking database data...');

    // Providers (correct model: prisma.api_providers)
    const providers = await prisma.api_providers.findMany({
       select: { id: true, name: true, api_url: true, status: true }
     });
    console.log(`\n📦 Providers found: ${providers.length}`);

    if (providers.length > 0) {
      console.log('\n📋 Provider details:');
      providers.forEach((provider, index) => {
        console.log(`   ${index + 1}. ${provider.name} (${provider.id}) - Status: ${provider.status}`);
      });
    }

    // Services (no direct relation defined to providers in schema)
    const services = await prisma.service.findMany({
      select: { id: true, name: true, providerId: true, providerName: true }
    });
    console.log(`\n🔗 Services found: ${services.length}`);

    if (services.length > 0) {
      const servicesWithProviderId = services.filter(s => s.providerId !== null && s.providerId !== undefined);
      console.log(`   Services with providerId (legacy int): ${servicesWithProviderId.length}`);
    }

    // General settings (correct model: prisma.generalSettings)
    const settings = await prisma.generalSettings.findMany();
    console.log(`\n⚙️ General settings rows: ${settings.length}`);

    console.log('\n✅ Data check completed!');
  } catch (error) {
    console.error('❌ Error checking data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();