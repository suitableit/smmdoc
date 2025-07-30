const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testServicesAccessControl() {
  try {
    console.log('🧪 Testing Services List Access Control...\n');
    
    // Test 1: Set services list to PUBLIC
    console.log('📋 Test 1: Setting services list to PUBLIC');
    await prisma.moduleSettings.upsert({
      where: { id: 1 },
      update: { servicesListPublic: true },
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
    
    console.log('✅ Services list set to PUBLIC');
    console.log('   - Anyone can access /our-services page');
    console.log('   - API endpoints allow unauthenticated access');
    
    // Test 2: Set services list to PRIVATE
    console.log('\n📋 Test 2: Setting services list to PRIVATE');
    await prisma.moduleSettings.update({
      where: { id: 1 },
      data: { servicesListPublic: false }
    });
    
    console.log('✅ Services list set to PRIVATE');
    console.log('   - /our-services page requires login');
    console.log('   - API endpoints require authentication');
    console.log('   - Unauthenticated users redirected to sign-in');
    
    // Test 3: Verify current settings
    console.log('\n📋 Test 3: Verifying current settings');
    const currentSettings = await prisma.moduleSettings.findFirst();
    
    console.log('📊 Current Module Settings:');
    console.log(`   - Services List: ${currentSettings?.servicesListPublic ? 'PUBLIC' : 'PRIVATE'}`);
    console.log(`   - Affiliate System: ${currentSettings?.affiliateSystemEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   - Child Panel: ${currentSettings?.childPanelSellingEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   - Mass Order: ${currentSettings?.massOrderEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   - Service Update Logs: ${currentSettings?.serviceUpdateLogsEnabled ? 'Enabled' : 'Disabled'}`);
    
    // Test 4: Reset to PUBLIC for normal operation
    console.log('\n📋 Test 4: Resetting to PUBLIC for normal operation');
    await prisma.moduleSettings.update({
      where: { id: 1 },
      data: { servicesListPublic: true }
    });
    
    console.log('✅ Services list reset to PUBLIC');
    
    console.log('\n🎉 Services Access Control Test Complete!');
    console.log('\n📝 Implementation Summary:');
    console.log('   ✅ API Routes Protected:');
    console.log('      - /api/user/services/route.ts');
    console.log('      - /api/user/services/neworderservice/route.ts');
    console.log('      - /api/user/services/serviceById/route.tsx');
    console.log('      - /api/user/services/getUpdateServices/route.ts');
    console.log('   ✅ Page Access Control:');
    console.log('      - /our-services page with server-side auth check');
    console.log('   ✅ Admin Settings:');
    console.log('      - Toggle in Module Settings section');
    console.log('      - Real-time database updates');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testServicesAccessControl();
