const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateProvidersData() {
  try {
    console.log('🔄 Starting providers data migration...');
    
    // Get data from providers table
    const providersData = await prisma.$queryRaw`SELECT * FROM providers`;
    console.log(`📊 Found ${providersData.length} records in providers table`);
    
    // Get existing data from api_providers table
    const existingApiProviders = await prisma.$queryRaw`SELECT name FROM api_providers`;
    const existingNames = existingApiProviders.map(p => p.name);
    console.log(`📊 Found ${existingApiProviders.length} existing records in api_providers table`);
    
    // Migrate data from providers to api_providers
    for (const provider of providersData) {
      if (!existingNames.includes(provider.name)) {
        console.log(`🔄 Migrating ${provider.name}...`);
        
        try {
          await prisma.$executeRaw`
            INSERT INTO api_providers (name, api_key, api_url, status, description, createdAt, updatedAt)
            VALUES (${provider.name}, ${provider.api_key}, ${provider.api_url || ''}, ${provider.status}, ${provider.description || ''}, ${provider.createdAt}, ${provider.updatedAt})
          `;
          console.log(`✅ Migrated ${provider.name}`);
        } catch (error) {
          console.log(`❌ Error migrating ${provider.name}:`, error.message);
        }
      } else {
        console.log(`⚠️ ${provider.name} already exists in api_providers, skipping...`);
      }
    }
    
    // Show final api_providers data
    console.log('\n📊 Final api_providers data:');
    const finalData = await prisma.$queryRaw`SELECT id, name, api_key, api_url, status FROM api_providers ORDER BY id`;
    finalData.forEach(provider => {
      console.log(`  - ID: ${provider.id}, Name: ${provider.name}, Status: ${provider.status}`);
    });
    
    console.log('\n🎉 Migration completed! Now you can safely drop the providers table.');
    console.log('💡 Run: DROP TABLE providers; in your database to remove the old table.');
    
  } catch (error) {
    console.error('❌ Error during migration:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

migrateProvidersData();
