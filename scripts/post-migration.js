const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function postMigration() {
  console.log('🔄 Starting post-migration data restoration...');
  
  try {
    // Step 1: Restore providers data
    console.log('📦 Step 1: Restoring providers data...');
    
    const tempProviders = await prisma.$queryRaw`SELECT * FROM temp_providers`;
    console.log(`Found ${tempProviders.length} providers to restore`);
    
    for (const provider of tempProviders) {
      await prisma.$executeRaw`
        INSERT INTO providers (id, name, apiUrl, apiKey, isActive, created_at, updated_at)
        VALUES (
          ${provider.id},
          ${provider.name},
          ${provider.apiUrl},
          ${provider.apiKey},
          ${provider.isActive},
          ${provider.created_at},
          ${provider.updated_at}
        )
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          apiUrl = VALUES(apiUrl),
          apiKey = VALUES(apiKey),
          isActive = VALUES(isActive),
          updated_at = VALUES(updated_at)
      `;
    }
    
    console.log('✅ Providers data restored');
    
    // Step 2: Update service table with new provider relationships
    console.log('🔗 Step 2: Updating service provider relationships...');
    
    const serviceMappings = await prisma.$queryRaw`SELECT * FROM temp_service_provider_mapping`;
    console.log(`Found ${serviceMappings.length} service mappings to update`);
    
    for (const mapping of serviceMappings) {
      if (mapping.new_provider_id) {
        await prisma.$executeRaw`
          UPDATE service 
          SET providerId = ${mapping.new_provider_id}
          WHERE id = ${mapping.service_id}
        `;
      }
    }
    
    console.log('✅ Service provider relationships updated');
    
    // Step 3: Create providerOrderLog table if it doesn't exist
    console.log('📋 Step 3: Creating providerOrderLog table...');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS providerOrderLog (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        orderId VARCHAR(191) NOT NULL,
        providerId VARCHAR(191) NOT NULL,
        providerOrderId VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        providerStatus VARCHAR(100),
        providerResponse JSON,
        lastSyncAt DATETIME(3),
        created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        INDEX idx_orderId (orderId),
        INDEX idx_providerId (providerId),
        INDEX idx_providerOrderId (providerOrderId),
        INDEX idx_status (status),
        FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (providerId) REFERENCES providers(id) ON DELETE CASCADE
      )
    `;
    
    console.log('✅ providerOrderLog table created');
    
    // Step 4: Handle siteDarkLogo data (if you have a new field for it)
    console.log('🖼️ Step 4: Handling siteDarkLogo data...');
    
    const logoData = await prisma.$queryRaw`SELECT * FROM temp_general_settings_logo`;
    console.log(`Found ${logoData.length} logo records`);
    
    // Note: You might need to add a new field in general_settings for dark logo
    // For now, we'll just log that the data is preserved in backup
    console.log('ℹ️ siteDarkLogo data is preserved in backup_general_settings_siteDarkLogo table');
    console.log('ℹ️ You may need to manually handle this data based on your new schema');
    
    // Step 5: Verification
    console.log('🔍 Step 5: Verifying restored data...');
    
    const providersCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM providers`;
    const servicesWithProviders = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM service WHERE providerId IS NOT NULL
    `;
    const providerOrderLogExists = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name = 'providerOrderLog' AND table_schema = DATABASE()
    `;
    
    console.log(`\n📊 Restoration Results:`);
    console.log(`   - Providers restored: ${providersCount[0].count}`);
    console.log(`   - Services with providers: ${servicesWithProviders[0].count}`);
    console.log(`   - providerOrderLog table: ${providerOrderLogExists[0].count > 0 ? 'Created ✅' : 'Failed ❌'}`);
    
    // Step 6: Clean up temporary tables (optional)
    console.log('🧹 Step 6: Cleaning up temporary tables...');
    
    await prisma.$executeRaw`DROP TABLE IF EXISTS temp_providers`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS temp_service_provider_mapping`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS temp_general_settings_logo`;
    
    console.log('✅ Temporary tables cleaned up');
    
    console.log('\n🎉 Post-migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: node scripts/verify-migration.js');
    console.log('   2. Test your application');
    console.log('   3. Run: npx prisma generate');
    
  } catch (error) {
    console.error('❌ Post-migration failed:', error);
    console.log('\n🔄 You can run rollback if needed:');
    console.log('   node scripts/rollback-migration.js');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run post-migration
postMigration()
  .then(() => {
    console.log('\n✅ Post-migration process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Post-migration process failed:', error);
    process.exit(1);
  });