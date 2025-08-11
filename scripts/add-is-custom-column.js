const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addIsCustomColumn() {
  try {
    console.log('🔧 Adding is_custom column to api_providers table...');
    
    // Add is_custom column if it doesn't exist
    try {
      await prisma.$executeRaw`ALTER TABLE api_providers ADD COLUMN is_custom BOOLEAN DEFAULT FALSE`;
      console.log('✅ Added is_custom column successfully');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('ℹ️  is_custom column already exists');
      } else {
        throw error;
      }
    }

    // Show updated table structure
    console.log('\n📋 Updated table structure:');
    const tableInfo = await prisma.$queryRaw`DESCRIBE api_providers`;
    tableInfo.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} (${column.Null === 'YES' ? 'NULL' : 'NOT NULL'}) ${column.Default !== null ? `DEFAULT ${column.Default}` : ''}`);
    });

    // Show current data
    console.log('\n📊 Current providers data:');
    const providers = await prisma.$queryRaw`SELECT id, name, status, is_custom FROM api_providers ORDER BY id`;
    if (providers.length > 0) {
      providers.forEach(provider => {
        console.log(`  - ID: ${provider.id}, Name: ${provider.name}, Status: ${provider.status}, Custom: ${provider.is_custom}`);
      });
    } else {
      console.log('  No providers found');
    }

    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during migration:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addIsCustomColumn();