const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyMigration() {
  console.log('🔍 Starting migration verification...');
  
  try {
    console.log('\n📊 MIGRATION VERIFICATION REPORT');
    console.log('================================');
    
    // 1. Check providers migration
    console.log('\n🏢 Provider Migration Check:');
    
    const originalProvidersCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM backup_api_providers
    `;
    
    const newProvidersCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM providers
    `;
    
    console.log(`   Original api_providers count: ${originalProvidersCount[0].count}`);
    console.log(`   New providers count: ${newProvidersCount[0].count}`);
    
    const providerMigrationSuccess = originalProvidersCount[0].count === newProvidersCount[0].count;
    console.log(`   Migration success: ${providerMigrationSuccess ? 'SUCCESS ✅' : 'FAILED ❌'}`);
    
    // 2. Check service provider relationships
    console.log('\n🔗 Service Provider Relationship Check:');
    
    const originalServiceProviderCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM backup_service_provider_data
    `;
    
    const newServiceProviderCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM service WHERE providerId IS NOT NULL
    `;
    
    console.log(`   Original service provider data count: ${originalServiceProviderCount[0].count}`);
    console.log(`   Services with provider after migration: ${newServiceProviderCount[0].count}`);
    
    // 3. Check for orphaned data
    console.log('\n🔍 Orphaned Data Check:');
    
    const orphanedServices = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM service s
      LEFT JOIN providers p ON s.providerId = p.id
      WHERE s.providerId IS NOT NULL AND p.id IS NULL
    `;
    
    console.log(`   Services with invalid provider references: ${orphanedServices[0].count}`);
    
    // 4. Check siteDarkLogo data
    console.log('\n🖼️ SiteDarkLogo Migration Check:');
    
    const originalLogoCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM backup_general_settings_siteDarkLogo
    `;
    
    console.log(`   Original siteDarkLogo count: ${originalLogoCount[0].count}`);
    console.log(`   Note: siteDarkLogo data is preserved in backup table`);
    
    // 5. Check table structures
    console.log('\n🏗️ Table Structure Check:');
    
    const providersTableExists = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name = 'providers' AND table_schema = DATABASE()
    `;
    
    const providerOrderLogExists = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name = 'providerOrderLog' AND table_schema = DATABASE()
    `;
    
    const tablesExist = providersTableExists[0].count > 0 && providerOrderLogExists[0].count > 0;
    console.log(`   Required tables exist: ${tablesExist ? 'SUCCESS ✅' : 'FAILED ❌'}`);
    
    // 6. Sample data verification
    console.log('\n📋 Sample Provider Data:');
    
    const sampleProviders = await prisma.$queryRaw`
      SELECT id, name, apiUrl, isActive FROM providers LIMIT 3
    `;
    
    sampleProviders.forEach((provider, index) => {
      console.log(`   ${index + 1}. ID: ${provider.id}, Name: ${provider.name}, Active: ${provider.isActive}`);
    });
    
    console.log('\n🔗 Sample Service Provider Relationships:');
    
    const sampleServices = await prisma.$queryRaw`
      SELECT id, name, providerId FROM service WHERE providerId IS NOT NULL LIMIT 3
    `;
    
    sampleServices.forEach((service, index) => {
      console.log(`   ${index + 1}. Service ID: ${service.id}, Name: ${service.name}, Provider: ${service.providerId}`);
    });
    
    // 7. Final summary
    console.log('\n📈 MIGRATION SUMMARY');
    console.log('===================');
    
    console.log(`   Total providers migrated: ${newProvidersCount[0].count}`);
    console.log(`   Total services with providers: ${newServiceProviderCount[0].count}`);
    console.log(`   Provider order log table ready: ${providerOrderLogExists[0].count > 0 ? 'YES ✅' : 'NO ❌'}`);
    
    const overallSuccess = providerMigrationSuccess && 
                          orphanedServices[0].count === 0 && 
                          tablesExist;
    
    console.log(`   Overall migration status: ${overallSuccess ? 'SUCCESS ✅' : 'NEEDS REVIEW ⚠️'}`);
    
    // 8. Recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('==================');
    
    if (overallSuccess) {
      console.log('   ✅ Migration completed successfully!');
      console.log('   ✅ You can now safely use your application');
      console.log('   ✅ Run: npx prisma generate');
      console.log('   ✅ Test provider order functionality');
    } else {
      console.log('   ⚠️ Migration needs review:');
      
      if (!providerMigrationSuccess) {
        console.log('   - Provider data migration incomplete');
      }
      
      if (orphanedServices[0].count > 0) {
        console.log('   - Some services have invalid provider references');
      }
      
      if (!tablesExist) {
        console.log('   - Required tables are missing');
      }
      
      console.log('   - Consider running rollback and trying again');
    }
    
    // 9. Backup data status
    console.log('\n💾 BACKUP DATA STATUS');
    console.log('=====================');
    
    const backupTables = ['backup_api_providers', 'backup_service_provider_data', 'backup_general_settings_siteDarkLogo'];
    
    for (const table of backupTables) {
      try {
        const count = await prisma.$queryRaw`
          SELECT COUNT(*) as count FROM ${prisma.Prisma.raw(table)}
        `;
        console.log(`   ${table}: ${count[0].count} records ✅`);
      } catch (error) {
        console.log(`   ${table}: Not found ❌`);
      }
    }
    
    console.log('\n🎉 Verification completed!');
    
    return overallSuccess;
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyMigration()
  .then((success) => {
    if (success) {
      console.log('\n✅ Migration verification passed!');
      process.exit(0);
    } else {
      console.log('\n⚠️ Migration verification found issues!');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n❌ Verification process failed:', error);
    process.exit(1);
  });