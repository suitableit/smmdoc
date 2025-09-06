const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function safeMigration() {
  console.log('🚀 Starting safe migration process...');
  
  try {
    // Step 1: Backup existing data
    console.log('📦 Step 1: Backing up existing data...');
    
    // Backup api_providers table
    const apiProviders = await prisma.$queryRaw`SELECT * FROM api_providers`;
    console.log(`✅ Found ${apiProviders.length} api_providers records`);
    
    // Backup service provider data
    const serviceProviderData = await prisma.$queryRaw`
      SELECT id, providerId, providerName 
      FROM service 
      WHERE providerId IS NOT NULL OR providerName IS NOT NULL
    `;
    console.log(`✅ Found ${serviceProviderData.length} service records with provider data`);
    
    // Backup siteDarkLogo
    const siteDarkLogo = await prisma.$queryRaw`
      SELECT id, siteDarkLogo 
      FROM general_settings 
      WHERE siteDarkLogo IS NOT NULL
    `;
    console.log(`✅ Found ${siteDarkLogo.length} siteDarkLogo records`);
    
    // Step 2: Create backup tables
    console.log('🗄️ Step 2: Creating backup tables...');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS backup_api_providers AS 
      SELECT * FROM api_providers
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS backup_service_provider_data AS 
      SELECT id, providerId, providerName FROM service 
      WHERE providerId IS NOT NULL OR providerName IS NOT NULL
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS backup_general_settings_siteDarkLogo AS 
      SELECT id, siteDarkLogo FROM general_settings 
      WHERE siteDarkLogo IS NOT NULL
    `;
    
    console.log('✅ Backup tables created successfully');
    
    // Step 3: Create temporary tables for new structure
    console.log('🔄 Step 3: Creating temporary tables...');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS temp_providers (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        apiUrl VARCHAR(500) NOT NULL,
        apiKey VARCHAR(500),
        isActive BOOLEAN DEFAULT true,
        created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      )
    `;
    
    // Step 4: Migrate api_providers to temp_providers
    console.log('📋 Step 4: Migrating api_providers data...');
    
    for (const provider of apiProviders) {
      await prisma.$executeRaw`
        INSERT INTO temp_providers (id, name, apiUrl, apiKey, isActive, created_at, updated_at)
        VALUES (
          ${`provider_${provider.id}`},
          ${provider.name},
          ${provider.api_url},
          ${provider.api_key || null},
          ${provider.is_active || true},
          ${provider.created_at || new Date()},
          ${provider.updated_at || new Date()}
        )
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          apiUrl = VALUES(apiUrl),
          apiKey = VALUES(apiKey),
          isActive = VALUES(isActive),
          updated_at = VALUES(updated_at)
      `;
    }
    
    console.log('✅ api_providers data migrated to temp_providers');
    
    // Step 5: Create service provider mapping
    console.log('🔗 Step 5: Creating service provider mapping...');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS temp_service_provider_mapping (
        service_id INT,
        old_provider_id VARCHAR(255),
        old_provider_name VARCHAR(255),
        new_provider_id VARCHAR(191),
        created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
      )
    `;
    
    for (const serviceData of serviceProviderData) {
      const newProviderId = serviceData.providerId ? `provider_${serviceData.providerId}` : null;
      
      await prisma.$executeRaw`
        INSERT INTO temp_service_provider_mapping 
        (service_id, old_provider_id, old_provider_name, new_provider_id)
        VALUES (
          ${serviceData.id},
          ${serviceData.providerId},
          ${serviceData.providerName},
          ${newProviderId}
        )
      `;
    }
    
    console.log('✅ Service provider mapping created');
    
    // Step 6: Store siteDarkLogo data
    console.log('🖼️ Step 6: Storing siteDarkLogo data...');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS temp_general_settings_logo AS 
      SELECT id, siteDarkLogo FROM general_settings 
      WHERE siteDarkLogo IS NOT NULL
    `;
    
    console.log('✅ siteDarkLogo data stored');
    
    // Step 7: Verification
    console.log('🔍 Step 7: Verifying backup data...');
    
    const tempProvidersCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM temp_providers`;
    const tempMappingCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM temp_service_provider_mapping`;
    const tempLogoCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM temp_general_settings_logo`;
    
    console.log(`📊 Verification Results:`);
    console.log(`   - temp_providers: ${tempProvidersCount[0].count} records`);
    console.log(`   - temp_service_provider_mapping: ${tempMappingCount[0].count} records`);
    console.log(`   - temp_general_settings_logo: ${tempLogoCount[0].count} records`);
    
    console.log('\n🎉 Pre-migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npx prisma db push');
    console.log('   2. Run: node scripts/post-migration.js');
    console.log('   3. Run: node scripts/verify-migration.js');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n🔄 You can run rollback if needed:');
    console.log('   node scripts/rollback-migration.js');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
safeMigration()
  .then(() => {
    console.log('\n✅ Safe migration process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration process failed:', error);
    process.exit(1);
  });