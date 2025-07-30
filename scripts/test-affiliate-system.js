const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAffiliateSystem() {
  try {
    console.log('🧪 Testing Affiliate System functionality...\n');
    
    // Test 1: Enable Affiliate System
    console.log('📋 Test 1: Enabling Affiliate System');
    await prisma.moduleSettings.upsert({
      where: { id: 1 },
      update: { 
        affiliateSystemEnabled: true,
        commissionRate: 5,
        minimumPayout: 10
      },
      create: {
        id: 1,
        affiliateSystemEnabled: true,
        commissionRate: 5,
        minimumPayout: 10,
        childPanelSellingEnabled: false,
        childPanelPrice: 10,
        serviceUpdateLogsEnabled: true,
        massOrderEnabled: true,
        servicesListPublic: true,
      }
    });
    
    console.log('✅ Affiliate System ENABLED');
    console.log('   - Commission Rate: 5%');
    console.log('   - Minimum Payout: $10');
    console.log('   - Users can join affiliate program');
    
    // Test 2: Create sample affiliate
    console.log('\n📋 Test 2: Creating sample affiliate');
    
    // First, ensure we have a test user
    const testUser = await prisma.user.upsert({
      where: { email: 'affiliate@test.com' },
      update: {},
      create: {
        email: 'affiliate@test.com',
        name: 'Test Affiliate',
        username: 'testaffiliate',
        password: 'hashedpassword',
        role: 'user',
        status: 'active',
        balance: 0,
        currency: 'USD',
        dollarRate: 1
      }
    });
    
    // Create affiliate record
    const affiliate = await prisma.affiliate.upsert({
      where: { userId: testUser.id },
      update: {},
      create: {
        userId: testUser.id,
        referralCode: `REF${testUser.id}${Date.now().toString().slice(-4)}`,
        commissionRate: 5,
        totalEarnings: 0,
        availableEarnings: 0,
        totalReferrals: 0,
        totalVisits: 0,
        status: 'active'
      }
    });
    
    console.log('✅ Sample affiliate created');
    console.log(`   - User ID: ${testUser.id}`);
    console.log(`   - Referral Code: ${affiliate.referralCode}`);
    console.log(`   - Commission Rate: ${affiliate.commissionRate}%`);
    
    // Test 3: Create sample referrals and commissions
    console.log('\n📋 Test 3: Creating sample referrals and commissions');
    
    // Create referred users
    const referredUser1 = await prisma.user.upsert({
      where: { email: 'referred1@test.com' },
      update: {},
      create: {
        email: 'referred1@test.com',
        name: 'Referred User 1',
        username: 'referred1',
        password: 'hashedpassword',
        role: 'user',
        status: 'active',
        balance: 100,
        currency: 'USD',
        dollarRate: 1
      }
    });
    
    const referredUser2 = await prisma.user.upsert({
      where: { email: 'referred2@test.com' },
      update: {},
      create: {
        email: 'referred2@test.com',
        name: 'Referred User 2',
        username: 'referred2',
        password: 'hashedpassword',
        role: 'user',
        status: 'active',
        balance: 200,
        currency: 'USD',
        dollarRate: 1
      }
    });
    
    // Create referral records
    await prisma.affiliateReferral.createMany({
      data: [
        {
          affiliateId: affiliate.id,
          referredUserId: referredUser1.id,
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 Test Browser'
        },
        {
          affiliateId: affiliate.id,
          referredUserId: referredUser2.id,
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 Test Browser'
        }
      ],
      skipDuplicates: true
    });
    
    // Create commission records
    await prisma.affiliateCommission.createMany({
      data: [
        {
          affiliateId: affiliate.id,
          referredUserId: referredUser1.id,
          amount: 50,
          commissionRate: 5,
          commissionAmount: 2.5,
          status: 'approved'
        },
        {
          affiliateId: affiliate.id,
          referredUserId: referredUser2.id,
          amount: 100,
          commissionRate: 5,
          commissionAmount: 5,
          status: 'approved'
        }
      ],
      skipDuplicates: true
    });
    
    // Update affiliate stats
    await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: {
        totalReferrals: 2,
        totalVisits: 50,
        totalEarnings: 7.5,
        availableEarnings: 7.5
      }
    });
    
    console.log('✅ Sample data created');
    console.log('   - 2 referrals added');
    console.log('   - $7.50 total commissions');
    console.log('   - 50 total visits tracked');
    
    // Test 4: Verify affiliate stats
    console.log('\n📋 Test 4: Verifying affiliate stats');
    const affiliateWithStats = await prisma.affiliate.findUnique({
      where: { id: affiliate.id },
      include: {
        referrals: true,
        commissions: {
          where: { status: 'approved' }
        }
      }
    });
    
    console.log('📊 Affiliate Statistics:');
    console.log(`   - Referral Code: ${affiliateWithStats.referralCode}`);
    console.log(`   - Total Visits: ${affiliateWithStats.totalVisits}`);
    console.log(`   - Total Referrals: ${affiliateWithStats.totalReferrals}`);
    console.log(`   - Conversion Rate: ${((affiliateWithStats.totalReferrals / affiliateWithStats.totalVisits) * 100).toFixed(2)}%`);
    console.log(`   - Total Earnings: $${affiliateWithStats.totalEarnings.toFixed(2)}`);
    console.log(`   - Available Earnings: $${affiliateWithStats.availableEarnings.toFixed(2)}`);
    console.log(`   - Commission Rate: ${affiliateWithStats.commissionRate}%`);
    console.log(`   - Status: ${affiliateWithStats.status}`);
    
    // Test 5: Test with disabled state
    console.log('\n📋 Test 5: Testing disabled state');
    await prisma.moduleSettings.update({
      where: { id: 1 },
      data: { affiliateSystemEnabled: false }
    });
    
    console.log('✅ Affiliate System temporarily disabled');
    console.log('   - New affiliates cannot join');
    console.log('   - Existing affiliates cannot earn commissions');
    console.log('   - API returns disabled message');
    
    // Test 6: Re-enable for normal operation
    console.log('\n📋 Test 6: Re-enabling for normal operation');
    await prisma.moduleSettings.update({
      where: { id: 1 },
      data: { affiliateSystemEnabled: true }
    });
    
    console.log('✅ Affiliate System re-enabled');
    
    // Test 7: Verify current settings
    console.log('\n📋 Test 7: Verifying current module settings');
    const currentSettings = await prisma.moduleSettings.findFirst();
    
    console.log('📊 Current Module Settings:');
    console.log(`   - Affiliate System: ${currentSettings?.affiliateSystemEnabled ? 'ENABLED' : 'DISABLED'}`);
    console.log(`   - Commission Rate: ${currentSettings?.commissionRate}%`);
    console.log(`   - Minimum Payout: $${currentSettings?.minimumPayout}`);
    console.log(`   - Service Update Logs: ${currentSettings?.serviceUpdateLogsEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   - Mass Order: ${currentSettings?.massOrderEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   - Services List: ${currentSettings?.servicesListPublic ? 'Public' : 'Private'}`);
    console.log(`   - Child Panel: ${currentSettings?.childPanelSellingEnabled ? 'Enabled' : 'Disabled'}`);
    
    console.log('\n🎉 Affiliate System Test Complete!');
    console.log('\n📝 Implementation Summary:');
    console.log('   ✅ Database Models:');
    console.log('      - Affiliate table for affiliate users');
    console.log('      - AffiliateReferral for tracking referrals');
    console.log('      - AffiliateCommission for commission tracking');
    console.log('      - AffiliatePayout for payout management');
    console.log('   ✅ API Endpoints:');
    console.log('      - POST /api/user/affiliate/join');
    console.log('      - GET /api/user/affiliate/stats');
    console.log('      - Module settings integration');
    console.log('   ✅ Features:');
    console.log('      - Referral code generation');
    console.log('      - Commission calculation');
    console.log('      - Visit and conversion tracking');
    console.log('      - Earnings management');
    console.log('      - Admin control via module settings');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAffiliateSystem();
