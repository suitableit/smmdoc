const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testModuleSettings() {
  try {
    console.log('🧪 Testing Module Settings...');
    
    // Create default module settings
    const settings = await prisma.moduleSettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        affiliateSystemEnabled: false,
        commissionRate: 5,
        minimumPayout: 10,
        childPanelSellingEnabled: false,
        childPanelPrice: 10,
        serviceUpdateLogsEnabled: true,
        massOrderEnabled: false,
        servicesListPublic: true,
      }
    });
    
    console.log('✅ Module settings created/updated:', settings);
    
    // Test different settings
    console.log('\n🔧 Testing different configurations...');
    
    // Enable affiliate system
    await prisma.moduleSettings.update({
      where: { id: 1 },
      data: {
        affiliateSystemEnabled: true,
        commissionRate: 10,
        minimumPayout: 25
      }
    });
    console.log('✅ Affiliate system enabled with 10% commission, $25 minimum payout');
    
    // Enable child panel
    await prisma.moduleSettings.update({
      where: { id: 1 },
      data: {
        childPanelSellingEnabled: true,
        childPanelPrice: 15
      }
    });
    console.log('✅ Child panel selling enabled at $15/month');
    
    // Configure other settings
    await prisma.moduleSettings.update({
      where: { id: 1 },
      data: {
        massOrderEnabled: true,
        servicesListPublic: false
      }
    });
    console.log('✅ Mass order enabled, services list made private');
    
    // Get final settings
    const finalSettings = await prisma.moduleSettings.findFirst();
    console.log('\n📊 Final Module Settings:');
    console.log(`   - Affiliate System: ${finalSettings?.affiliateSystemEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   - Commission Rate: ${finalSettings?.commissionRate}%`);
    console.log(`   - Minimum Payout: $${finalSettings?.minimumPayout}`);
    console.log(`   - Child Panel: ${finalSettings?.childPanelSellingEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   - Child Panel Price: $${finalSettings?.childPanelPrice}/month`);
    console.log(`   - Service Update Logs: ${finalSettings?.serviceUpdateLogsEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   - Mass Order: ${finalSettings?.massOrderEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   - Services List: ${finalSettings?.servicesListPublic ? 'Public' : 'Private'}`);
    
    console.log('\n✅ Module Settings API is ready to use!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testModuleSettings();
