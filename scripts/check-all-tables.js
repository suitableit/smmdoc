const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllTables() {
  try {
    console.log('🔍 Checking all tables...');
    
    // Show all tables
    const tables = await prisma.$queryRaw`SHOW TABLES`;
    console.log('📊 All tables in database:');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`  ${index + 1}. ${tableName}`);
    });
    
    // Check if providers table exists and has data
    try {
      const providersData = await prisma.$queryRaw`SELECT COUNT(*) as count FROM providers`;
      console.log(`\n📋 providers table has ${providersData[0].count} rows`);
      
      if (providersData[0].count > 0) {
        const sampleData = await prisma.$queryRaw`SELECT * FROM providers LIMIT 3`;
        console.log('Sample data from providers table:');
        console.log(sampleData);
      }
    } catch (error) {
      console.log('⚠️ providers table does not exist');
    }
    
    // Check if api_providers table exists and has data
    try {
      const apiProvidersData = await prisma.$queryRaw`SELECT COUNT(*) as count FROM api_providers`;
      console.log(`\n📋 api_providers table has ${apiProvidersData[0].count} rows`);
      
      if (apiProvidersData[0].count > 0) {
        const sampleData = await prisma.$queryRaw`SELECT * FROM api_providers LIMIT 3`;
        console.log('Sample data from api_providers table:');
        console.log(sampleData);
      }
    } catch (error) {
      console.log('⚠️ api_providers table does not exist');
    }
    
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllTables();
