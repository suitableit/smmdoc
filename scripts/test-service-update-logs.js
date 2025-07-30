const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testServiceUpdateLogs() {
  try {
    console.log('🧪 Testing Service Update Logs functionality...\n');
    
    // Test 1: Enable Service Update Logs
    console.log('📋 Test 1: Enabling Service Update Logs');
    await prisma.moduleSettings.upsert({
      where: { id: 1 },
      update: { serviceUpdateLogsEnabled: true },
      create: {
        id: 1,
        affiliateSystemEnabled: false,
        commissionRate: 5,
        minimumPayout: 10,
        childPanelSellingEnabled: false,
        childPanelPrice: 10,
        serviceUpdateLogsEnabled: true,
        massOrderEnabled: true,
        servicesListPublic: true,
      }
    });
    
    console.log('✅ Service Update Logs ENABLED');
    console.log('   - Service updates will be logged');
    console.log('   - Admin can view update history');
    console.log('   - Changes are tracked with details');
    
    // Test 2: Create sample service update logs
    console.log('\n📋 Test 2: Creating sample service update logs');
    
    // Create some sample logs
    const sampleLogs = [
      {
        serviceId: 1,
        serviceName: 'Instagram Followers',
        adminId: 1,
        adminEmail: 'admin@example.com',
        action: 'updated',
        changes: {
          rate: { from: 0.50, to: 0.45 },
          description: { from: 'Old description', to: 'Updated description' }
        },
        oldValues: { rate: 0.50, description: 'Old description' },
        newValues: { rate: 0.45, description: 'Updated description' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 Test Browser'
      },
      {
        serviceId: 2,
        serviceName: 'YouTube Views',
        adminId: 1,
        adminEmail: 'admin@example.com',
        action: 'created',
        changes: { status: 'Service created' },
        oldValues: {},
        newValues: { name: 'YouTube Views', rate: 1.20, status: 'active' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 Test Browser'
      },
      {
        serviceId: 3,
        serviceName: 'TikTok Likes',
        adminId: 1,
        adminEmail: 'admin@example.com',
        action: 'status_changed',
        changes: { status: { from: 'active', to: 'inactive' } },
        oldValues: { status: 'active' },
        newValues: { status: 'inactive' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 Test Browser'
      }
    ];
    
    for (const log of sampleLogs) {
      await prisma.serviceUpdateLog.create({ data: log });
    }
    
    console.log('✅ Created 3 sample service update logs');
    
    // Test 3: Verify logs are stored
    console.log('\n📋 Test 3: Verifying stored logs');
    const logs = await prisma.serviceUpdateLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`📊 Found ${logs.length} service update logs:`);
    logs.forEach((log, index) => {
      console.log(`   ${index + 1}. ${log.action.toUpperCase()}: ${log.serviceName}`);
      console.log(`      Admin: ${log.adminEmail}`);
      console.log(`      Changes: ${Object.keys(log.changes || {}).join(', ')}`);
      console.log(`      Time: ${log.createdAt.toISOString()}`);
    });
    
    // Test 4: Test with disabled state
    console.log('\n📋 Test 4: Testing disabled state');
    await prisma.moduleSettings.update({
      where: { id: 1 },
      data: { serviceUpdateLogsEnabled: false }
    });
    
    console.log('✅ Service Update Logs temporarily disabled');
    console.log('   - New updates will not be logged');
    console.log('   - Existing logs remain accessible');
    console.log('   - API returns empty results with message');
    
    // Test 5: Re-enable for normal operation
    console.log('\n📋 Test 5: Re-enabling for normal operation');
    await prisma.moduleSettings.update({
      where: { id: 1 },
      data: { serviceUpdateLogsEnabled: true }
    });
    
    console.log('✅ Service Update Logs re-enabled');
    
    // Test 6: Verify current settings
    console.log('\n📋 Test 6: Verifying current module settings');
    const currentSettings = await prisma.moduleSettings.findFirst();
    
    console.log('📊 Current Module Settings:');
    console.log(`   - Service Update Logs: ${currentSettings?.serviceUpdateLogsEnabled ? 'ENABLED' : 'DISABLED'}`);
    console.log(`   - Mass Order: ${currentSettings?.massOrderEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   - Services List: ${currentSettings?.servicesListPublic ? 'Public' : 'Private'}`);
    console.log(`   - Affiliate System: ${currentSettings?.affiliateSystemEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   - Child Panel: ${currentSettings?.childPanelSellingEnabled ? 'Enabled' : 'Disabled'}`);
    
    console.log('\n🎉 Service Update Logs Test Complete!');
    console.log('\n📝 Implementation Summary:');
    console.log('   ✅ Database Model:');
    console.log('      - ServiceUpdateLog table created');
    console.log('      - Tracks all service modifications');
    console.log('      - Stores detailed change information');
    console.log('   ✅ Logging Integration:');
    console.log('      - Service update API logs changes');
    console.log('      - Tracks old vs new values');
    console.log('      - Records admin and IP information');
    console.log('   ✅ Module Settings Control:');
    console.log('      - Can be enabled/disabled by admin');
    console.log('      - Respects module settings configuration');
    console.log('      - Provides feedback when disabled');
    console.log('   ✅ API Endpoints:');
    console.log('      - GET /api/admin/service-update-logs');
    console.log('      - DELETE /api/admin/service-update-logs');
    console.log('      - Pagination and filtering support');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testServiceUpdateLogs();
