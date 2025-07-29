const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function dropProvidersTable() {
  try {
    console.log('🗑️ Dropping providers table...');
    
    // Drop the providers table
    await prisma.$executeRaw`DROP TABLE IF EXISTS providers`;
    console.log('✅ providers table dropped successfully');
    
    // Verify it's gone
    const tables = await prisma.$queryRaw`SHOW TABLES LIKE 'providers'`;
    if (tables.length === 0) {
      console.log('✅ Confirmed: providers table no longer exists');
    } else {
      console.log('⚠️ providers table still exists');
    }
    
    // Show remaining provider-related tables
    const providerTables = await prisma.$queryRaw`SHOW TABLES LIKE '%provider%'`;
    console.log('\n📊 Remaining provider-related tables:');
    providerTables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
  } catch (error) {
    console.error('❌ Error dropping table:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

dropProvidersTable();
