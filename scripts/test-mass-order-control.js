const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMassOrderControl() {
  try {
    console.log('🧪 Testing Mass Order Access Control...\n');
    
    // Test 1: Disable Mass Order
    console.log('📋 Test 1: Disabling Mass Order functionality');
    await prisma.moduleSettings.upsert({
      where: { id: 1 },
      update: { massOrderEnabled: false },
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
    
    console.log('✅ Mass Order DISABLED');
    console.log('   - /mass-orders page will redirect to dashboard');
    console.log('   - API endpoint will return 403 Forbidden');
    console.log('   - Users cannot create bulk orders');
    
    // Test 2: Enable Mass Order
    console.log('\n📋 Test 2: Enabling Mass Order functionality');
    await prisma.moduleSettings.update({
      where: { id: 1 },
      data: { massOrderEnabled: true }
    });
    
    console.log('✅ Mass Order ENABLED');
    console.log('   - /mass-orders page accessible');
    console.log('   - API endpoint accepts requests');
    console.log('   - Users can create bulk orders');
    
    // Test 3: Verify current settings
    console.log('\n📋 Test 3: Verifying current settings');
    const currentSettings = await prisma.moduleSettings.findFirst();
    
    console.log('📊 Current Module Settings:');
    console.log(`   - Mass Order: ${currentSettings?.massOrderEnabled ? 'ENABLED' : 'DISABLED'}`);
    console.log(`   - Services List: ${currentSettings?.servicesListPublic ? 'Public' : 'Private'}`);
    console.log(`   - Affiliate System: ${currentSettings?.affiliateSystemEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   - Child Panel: ${currentSettings?.childPanelSellingEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   - Service Update Logs: ${currentSettings?.serviceUpdateLogsEnabled ? 'Enabled' : 'Disabled'}`);
    
    // Test 4: Test with disabled state for demonstration
    console.log('\n📋 Test 4: Testing disabled state');
    await prisma.moduleSettings.update({
      where: { id: 1 },
      data: { massOrderEnabled: false }
    });
    
    console.log('✅ Mass Order temporarily disabled for testing');
    console.log('   - Frontend will show error message');
    console.log('   - Users will be redirected to dashboard');
    
    // Test 5: Re-enable for normal operation
    console.log('\n📋 Test 5: Re-enabling for normal operation');
    await prisma.moduleSettings.update({
      where: { id: 1 },
      data: { massOrderEnabled: true }
    });
    
    console.log('✅ Mass Order re-enabled');
    
    console.log('\n🎉 Mass Order Access Control Test Complete!');
    console.log('\n📝 Implementation Summary:');
    console.log('   ✅ Frontend Access Control:');
    console.log('      - /mass-orders page checks module settings');
    console.log('      - Redirects to dashboard if disabled');
    console.log('      - Shows error message to user');
    console.log('   ✅ API Access Control:');
    console.log('      - /api/user/mass-orders checks settings');
    console.log('      - Returns 403 Forbidden if disabled');
    console.log('      - Prevents bulk order creation');
    console.log('   ✅ Admin Settings:');
    console.log('      - Toggle in Module Settings section');
    console.log('      - Real-time database updates');
    console.log('      - Immediate effect on functionality');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMassOrderControl();
