const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkApiProvidersTable() {
  try {
    console.log('🔍 Checking api_providers table structure...');
    
    // Check if table exists and show structure
    const tableInfo = await prisma.$queryRaw`DESCRIBE api_providers`;
    console.log('📋 Current table structure:');
    tableInfo.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} (${column.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // Show existing data
    const existingData = await prisma.$queryRaw`SELECT * FROM api_providers LIMIT 5`;
    console.log('\n📊 Existing data:');
    console.log(existingData);
    
  } catch (error) {
    console.error('❌ Error checking table:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkApiProvidersTable();
