const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupApiProviders() {
  try {
    console.log('🔄 Setting up API providers...');
    
    // Create the api_providers table using raw SQL
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS api_providers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        api_key TEXT NOT NULL,
        api_url VARCHAR(500) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    console.log('✅ API providers table created successfully');
    
    // Insert default providers
    const providers = [
      {
        name: 'smmgen',
        api_key: 'af86d6b5cdd86703c1d269c3af8193ec',
        api_url: 'https://smmgen.com/api/v2',
        description: 'SMMGen Provider - Social Media Marketing Services'
      },
      {
        name: 'growfollows',
        api_key: 'c5acb7dcf2cf56294633836160f2ef3a',
        api_url: 'https://growfollows.com/api/v2',
        description: 'GrowFollows Provider - Social Media Growth Services'
      },
      {
        name: 'attpanel',
        api_key: '345ee2f4cde2378106ca9d9adfe7622c',
        api_url: 'https://attpanel.com/api/v2',
        description: 'ATTPanel Provider - Social Media Panel Services'
      },
      {
        name: 'smmcoder',
        api_key: 'your_smmcoder_api_key_here',
        api_url: 'https://smmcoder.com/api/v2',
        description: 'SMMCoder Provider - SMM Panel Services'
      }
    ];
    
    console.log('🔄 Inserting API providers...');
    
    for (const provider of providers) {
      try {
        await prisma.$executeRaw`
          INSERT IGNORE INTO api_providers (name, api_key, api_url, description)
          VALUES (${provider.name}, ${provider.api_key}, ${provider.api_url}, ${provider.description})
        `;
        console.log(`✅ Provider ${provider.name} inserted`);
      } catch (error) {
        console.log(`⚠️ Provider ${provider.name} might already exist:`, error.message);
      }
    }
    
    // Check if providers were inserted
    const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM api_providers`;
    console.log(`📊 Total API providers in database: ${count[0].count}`);
    
    // Show all providers
    const allProviders = await prisma.$queryRaw`SELECT id, name, api_url, status FROM api_providers`;
    console.log('📋 Current API providers:');
    allProviders.forEach(provider => {
      console.log(`  - ID: ${provider.id}, Name: ${provider.name}, URL: ${provider.api_url}, Status: ${provider.status}`);
    });
    
    console.log('🎉 API providers setup completed!');
    
  } catch (error) {
    console.error('❌ Error setting up API providers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupApiProviders();
