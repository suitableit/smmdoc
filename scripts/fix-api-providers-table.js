const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixApiProvidersTable() {
  try {
    console.log('🔧 Fixing api_providers table...');
    
    // Add api_url column if it doesn't exist
    try {
      await prisma.$executeRaw`ALTER TABLE api_providers ADD COLUMN api_url VARCHAR(500) DEFAULT ''`;
      console.log('✅ Added api_url column');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('⚠️ api_url column already exists');
      } else {
        console.log('❌ Error adding api_url column:', error.message);
      }
    }
    
    // Update providers with correct API keys and URLs
    const providers = [
      {
        id: 1, // smmcoder
        name: 'smmcoder',
        api_key: 'd51d09535663bf9b5c171e360a0892ee',
        api_url: 'https://smmcoder.com/api/v2'
      },
      {
        id: 2, // attpanel
        name: 'attpanel', 
        api_key: '345ee2f4cde2378106ca9d9adfe7622c',
        api_url: 'https://attpanel.com/api/v2'
      },
      {
        id: 3, // growfollows
        name: 'growfollows',
        api_key: 'c5acb7dcf2cf56294633836160f2ef3a',
        api_url: 'https://growfollows.com/api/v2'
      },
      {
        id: 4, // smmgen
        name: 'smmgen',
        api_key: 'af86d6b5cdd86703c1d269c3af8193ec',
        api_url: 'https://smmgen.com/api/v2'
      }
    ];
    
    console.log('🔄 Updating providers with correct API keys and URLs...');
    
    for (const provider of providers) {
      try {
        await prisma.$executeRaw`
          UPDATE api_providers 
          SET api_key = ${provider.api_key}, api_url = ${provider.api_url}
          WHERE id = ${provider.id}
        `;
        console.log(`✅ Updated ${provider.name} (ID: ${provider.id})`);
      } catch (error) {
        console.log(`❌ Error updating ${provider.name}:`, error.message);
      }
    }
    
    // Show updated data
    console.log('\n📊 Updated providers:');
    const updatedProviders = await prisma.$queryRaw`
      SELECT id, name, api_key, api_url, status 
      FROM api_providers 
      ORDER BY id
    `;
    
    updatedProviders.forEach(provider => {
      console.log(`  - ID: ${provider.id}, Name: ${provider.name}`);
      console.log(`    API Key: ${provider.api_key}`);
      console.log(`    API URL: ${provider.api_url}`);
      console.log(`    Status: ${provider.status}\n`);
    });
    
    console.log('🎉 API providers table fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixApiProvidersTable();
