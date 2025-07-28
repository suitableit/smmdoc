const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addApiUrlColumn() {
  try {
    console.log('🔧 Adding api_url column to api_providers table...');
    
    // Check if api_url column exists
    try {
      const result = await prisma.$queryRaw`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'api_providers' 
        AND COLUMN_NAME = 'api_url'
      `;
      
      if (result.length > 0) {
        console.log('✅ api_url column already exists');
      } else {
        // Add api_url column
        await prisma.$executeRaw`
          ALTER TABLE api_providers 
          ADD COLUMN api_url VARCHAR(500) DEFAULT '' AFTER api_key
        `;
        console.log('✅ api_url column added successfully');
      }
    } catch (error) {
      console.log('❌ Error checking/adding api_url column:', error.message);
    }
    
    // Update existing providers with default URLs
    const providers = [
      { name: 'smmcoder', api_url: 'https://smmcoder.com/api/v2' },
      { name: 'attpanel', api_url: 'https://attpanel.com/api/v2' },
      { name: 'growfollows', api_url: 'https://growfollows.com/api/v2' },
      { name: 'smmgen', api_url: 'https://smmgen.com/api/v2' }
    ];
    
    console.log('🔄 Updating providers with default API URLs...');
    
    for (const provider of providers) {
      try {
        await prisma.$executeRaw`
          UPDATE api_providers 
          SET api_url = ${provider.api_url}
          WHERE name = ${provider.name} AND (api_url = '' OR api_url IS NULL)
        `;
        console.log(`✅ Updated ${provider.name} with URL: ${provider.api_url}`);
      } catch (error) {
        console.log(`❌ Error updating ${provider.name}:`, error.message);
      }
    }
    
    // Show current table structure
    console.log('\n📋 Current table structure:');
    const tableInfo = await prisma.$queryRaw`DESCRIBE api_providers`;
    tableInfo.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} (${column.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // Show current data
    console.log('\n📊 Current providers:');
    const currentProviders = await prisma.$queryRaw`
      SELECT id, name, api_key, api_url, status 
      FROM api_providers 
      ORDER BY id
    `;
    
    currentProviders.forEach(provider => {
      console.log(`  - ID: ${provider.id}, Name: ${provider.name}`);
      console.log(`    API URL: ${provider.api_url}`);
      console.log(`    Status: ${provider.status}\n`);
    });
    
    console.log('🎉 Database update completed!');
    
  } catch (error) {
    console.error('❌ Error updating database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addApiUrlColumn();
