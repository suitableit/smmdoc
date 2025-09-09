const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function finalDataVerification() {
  try {
    console.log('🔍 Final Data Recovery Verification...');
    console.log('=' .repeat(50));
    
    // 1. Check Providers
    const totalProviders = await prisma.api_providers.count();
    const activeProviders = await prisma.api_providers.count({
      where: { status: 'active' }
    });
    
    console.log('\n📦 PROVIDERS STATUS:');
    console.log(`   Total providers: ${totalProviders}`);
    console.log(`   Active providers: ${activeProviders}`);
    console.log(`   Status: ${totalProviders > 0 ? '✅ RECOVERED' : '❌ MISSING'}`);
    
    // 2. Check Services with Provider Relations
    const totalServices = await prisma.service.count();
    const servicesWithProviderId = await prisma.service.count({
      where: { providerId: { not: null } }
    });
    const servicesWithProviderName = await prisma.service.count({
      where: { providerName: { not: null } }
    });
    const servicesWithBothFields = await prisma.service.count({
      where: {
        AND: [
          { providerId: { not: null } },
          { providerName: { not: null } }
        ]
      }
    });
    
    console.log('\n🔗 SERVICE-PROVIDER RELATIONSHIPS:');
    console.log(`   Total services: ${totalServices}`);
    console.log(`   Services with providerId: ${servicesWithProviderId}`);
    console.log(`   Services with providerName: ${servicesWithProviderName}`);
    console.log(`   Services with both fields: ${servicesWithBothFields}`);
    
    const serviceRecoveryRate = ((servicesWithBothFields / totalServices) * 100).toFixed(2);
    console.log(`   Recovery rate: ${serviceRecoveryRate}%`);
    console.log(`   Status: ${serviceRecoveryRate > 90 ? '✅ EXCELLENT' : serviceRecoveryRate > 50 ? '⚠️  PARTIAL' : '❌ POOR'}`);
    
    // 3. Check General Settings (using correct table name)
    const generalSettings = await prisma.generalSettings.count();
    console.log('\n⚙️  GENERAL SETTINGS:');
    console.log(`   General settings rows: ${generalSettings}`);
    console.log(`   Status: ${generalSettings > 0 ? '✅ PRESENT' : '❌ MISSING'}`);
    
    // 4. Provider Distribution Analysis
    const providerDistribution = await prisma.$queryRaw`
      SELECT 
        p.id as providerId,
        p.name as providerName,
        COUNT(s.id) as serviceCount
      FROM api_providers p
      LEFT JOIN service s ON p.id = s.providerId
      WHERE p.status = 'active'
      GROUP BY p.id, p.name
      ORDER BY serviceCount DESC
    `;
    
    console.log('\n📊 PROVIDER DISTRIBUTION:');
    providerDistribution.forEach(p => {
      console.log(`   ${p.providerName}: ${p.serviceCount} services`);
    });
    
    // 5. Sample Data Verification
    const sampleServices = await prisma.service.findMany({
      where: {
        AND: [
          { providerId: { not: null } },
          { providerName: { not: null } }
        ]
      },
      select: {
        id: true,
        name: true,
        providerId: true,
        providerName: true,
        rate: true,
        status: true
      },
      take: 5
    });
    
    console.log('\n🔍 SAMPLE RECOVERED SERVICES:');
    sampleServices.forEach(s => {
      console.log(`   ${s.id}: ${s.name.substring(0, 40)}...`);
      console.log(`        Provider: ${s.providerName} (ID: ${s.providerId})`);
      console.log(`        Rate: $${s.rate}, Status: ${s.status}`);
    });
    
    // 6. Overall Recovery Status
    console.log('\n' + '=' .repeat(50));
    console.log('🎯 OVERALL RECOVERY STATUS:');
    
    const recoveryChecks = [
      { name: 'Providers Created', status: totalProviders > 0 },
      { name: 'Active Providers Available', status: activeProviders > 0 },
      { name: 'Service-Provider Relations', status: serviceRecoveryRate > 50 },
      { name: 'General Settings Present', status: generalSettings > 0 }
    ];
    
    let passedChecks = 0;
    recoveryChecks.forEach(check => {
      console.log(`   ${check.status ? '✅' : '❌'} ${check.name}`);
      if (check.status) passedChecks++;
    });
    
    const overallScore = ((passedChecks / recoveryChecks.length) * 100).toFixed(0);
    console.log(`\n🏆 RECOVERY SCORE: ${overallScore}%`);
    
    if (overallScore >= 75) {
      console.log('🎉 DATA RECOVERY SUCCESSFUL!');
    } else if (overallScore >= 50) {
      console.log('⚠️  DATA RECOVERY PARTIAL - Some issues need attention');
    } else {
      console.log('❌ DATA RECOVERY FAILED - Major issues detected');
    }
    
    // 7. Next Steps Recommendations
    console.log('\n📋 NEXT STEPS:');
    if (serviceRecoveryRate < 100) {
      console.log('   • Wait for service-provider update to complete');
    }
    if (totalProviders === 0) {
      console.log('   • Run: node scripts/create-providers.js');
    }
    if (serviceRecoveryRate < 50) {
      console.log('   • Run: node scripts/update-service-providers.js');
    }
    console.log('   • Test application functionality');
    console.log('   • Verify API endpoints work correctly');
    console.log('   • Check admin panel provider management');
    
    console.log('\n✅ Verification completed!');
    
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  finalDataVerification();
}

module.exports = { finalDataVerification };