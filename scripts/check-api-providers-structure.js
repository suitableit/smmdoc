const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkApiProvidersStructure() {
  try {
    console.log('🔍 Checking api_providers table structure...');
    
    // Show table structure
    const tableInfo = await prisma.$queryRaw`DESCRIBE api_providers`;
    console.log('📋 Current table structure:');
    tableInfo.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} (${column.Null === 'YES' ? 'NULL' : 'NOT NULL'}) ${column.Default ? `DEFAULT ${column.Default}` : ''}`);
    });
    
    // Show indexes
    const indexes = await prisma.$queryRaw`SHOW INDEX FROM api_providers`;
    console.log('\n📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.Key_name}: ${index.Column_name}`);
    });
    
    // Show sample data
    const sampleData = await prisma.$queryRaw`SELECT * FROM api_providers LIMIT 2`;
    console.log('\n📊 Sample data:');
    console.log(sampleData);
    
  } catch (error) {
    console.error('❌ Error checking structure:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkApiProvidersStructure();
