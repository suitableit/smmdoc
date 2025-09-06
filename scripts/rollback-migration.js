const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function rollbackMigration() {
  console.log('🔄 Starting emergency rollback...');
  console.log('⚠️ WARNING: This will restore database to previous state!');
  
  try {
    // Step 1: Check if backup tables exist
    console.log('🔍 Step 1: Checking backup tables...');
    
    const backupTables = [
      'backup_api_providers',
      'backup_service_provider_data', 
      'backup_general_settings_siteDarkLogo'
    ];
    
    for (const table of backupTables) {
      try {
        const count = await prisma.$queryRaw`
          SELECT COUNT(*) as count FROM ${prisma.Prisma.raw(table)}
        `;
        console.log(`   ✅ ${table}: ${count[0].count} records found`);
      } catch (error) {
        console.log(`   ❌ ${table}: Not found - rollback may be incomplete`);
      }
    }
    
    // Step 2: Drop new tables
    console.log('\n🗑️ Step 2: Removing new tables...');
    
    try {
      await prisma.$executeRaw`DROP TABLE IF EXISTS providerOrderLog`;
      console.log('   ✅ providerOrderLog table dropped');
    } catch (error) {
      console.log('   ⚠️ providerOrderLog table not found or already dropped');
    }
    
    try {
      await prisma.$executeRaw`DROP TABLE IF EXISTS providers`;
      console.log('   ✅ providers table dropped');
    } catch (error) {
      console.log('   ⚠️ providers table not found or already dropped');
    }
    
    // Step 3: Restore api_providers table
    console.log('\n📦 Step 3: Restoring api_providers table...');
    
    try {
      await prisma.$executeRaw`DROP TABLE IF EXISTS api_providers`;
      await prisma.$executeRaw`
        CREATE TABLE api_providers AS 
        SELECT * FROM backup_api_providers
      `;
      console.log('   ✅ api_providers table restored');
    } catch (error) {
      console.error('   ❌ Failed to restore api_providers:', error.message);
    }
    
    // Step 4: Restore service provider data
    console.log('\n🔗 Step 4: Restoring service provider data...');
    
    try {
      const serviceBackupData = await prisma.$queryRaw`
        SELECT * FROM backup_service_provider_data
      `;
      
      for (const data of serviceBackupData) {
        await prisma.$executeRaw`
          UPDATE service 
          SET 
            providerId = ${data.providerId},
            providerName = ${data.providerName}
          WHERE id = ${data.id}
        `;
      }
      
      console.log(`   ✅ Restored provider data for ${serviceBackupData.length} services`);
    } catch (error) {
      console.error('   ❌ Failed to restore service provider data:', error.message);
    }
    
    // Step 5: Restore siteDarkLogo
    console.log('\n🖼️ Step 5: Restoring siteDarkLogo...');
    
    try {
      const logoBackupData = await prisma.$queryRaw`
        SELECT * FROM backup_general_settings_siteDarkLogo
      `;
      
      for (const data of logoBackupData) {
        await prisma.$executeRaw`
          UPDATE general_settings 
          SET siteDarkLogo = ${data.siteDarkLogo}
          WHERE id = ${data.id}
        `;
      }
      
      console.log(`   ✅ Restored siteDarkLogo for ${logoBackupData.length} records`);
    } catch (error) {
      console.error('   ❌ Failed to restore siteDarkLogo:', error.message);
    }
    
    // Step 6: Clean up temporary tables
    console.log('\n🧹 Step 6: Cleaning up temporary tables...');
    
    const tempTables = [
      'temp_providers',
      'temp_service_provider_mapping',
      'temp_general_settings_logo'
    ];
    
    for (const table of tempTables) {
      try {
        await prisma.$executeRaw`DROP TABLE IF EXISTS ${prisma.Prisma.raw(table)}`;
        console.log(`   ✅ ${table} dropped`);
      } catch (error) {
        console.log(`   ⚠️ ${table} not found`);
      }
    }
    
    // Step 7: Verification
    console.log('\n🔍 Step 7: Verifying rollback...');
    
    try {
      const apiProvidersCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM api_providers
      `;
      console.log(`   api_providers restored: ${apiProvidersCount[0].count} records`);
    } catch (error) {
      console.log('   ❌ api_providers table verification failed');
    }
    
    try {
      const serviceProviderCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM service 
        WHERE providerId IS NOT NULL OR providerName IS NOT NULL
      `;
      console.log(`   service provider data restored: ${serviceProviderCount[0].count} records`);
    } catch (error) {
      console.log('   ❌ service provider data verification failed');
    }
    
    try {
      const siteDarkLogoCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM general_settings 
        WHERE siteDarkLogo IS NOT NULL
      `;
      console.log(`   siteDarkLogo restored: ${siteDarkLogoCount[0].count} records`);
    } catch (error) {
      console.log('   ❌ siteDarkLogo verification failed');
    }
    
    console.log('\n🎉 ROLLBACK COMPLETED!');
    console.log('✅ Database restored to previous state');
    
    console.log('\n📝 Next steps after rollback:');
    console.log('   1. Revert your Prisma schema changes');
    console.log('   2. Run: npx prisma db pull');
    console.log('   3. Run: npx prisma generate');
    console.log('   4. Test your application');
    console.log('   5. Review migration issues before trying again');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    console.log('\n🆘 CRITICAL: Rollback failed!');
    console.log('Please manually restore from database backup if available');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Confirmation prompt
function confirmRollback() {
  return new Promise((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('⚠️ Are you sure you want to rollback? This will restore the database to previous state. Type "YES" to confirm: ', (answer) => {
      rl.close();
      resolve(answer === 'YES');
    });
  });
}

// Run rollback with confirmation
async function runRollback() {
  try {
    const confirmed = await confirmRollback();
    
    if (!confirmed) {
      console.log('❌ Rollback cancelled by user');
      process.exit(0);
    }
    
    await rollbackMigration();
    console.log('\n✅ Rollback process completed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Rollback process failed:', error);
    process.exit(1);
  }
}

// Check if running directly
if (require.main === module) {
  runRollback();
}

module.exports = { rollbackMigration };