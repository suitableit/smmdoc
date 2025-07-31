const mysql = require('mysql2/promise');

async function testProviderActivation() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'smmdoc21'
  });

  try {
    console.log('🔍 Checking current provider status...');
    
    const [providers] = await connection.execute(
      'SELECT id, name, api_key, api_url, status FROM api_providers'
    );

    console.log('\n📊 Current Providers:');
    providers.forEach(provider => {
      console.log(`  - ID: ${provider.id}, Name: ${provider.name}`);
      console.log(`    API URL: ${provider.api_url || 'NOT SET'}`);
      console.log(`    API Key: ${provider.api_key ? provider.api_key.substring(0, 10) + '...' : 'NOT SET'}`);
      console.log(`    Status: ${provider.status}`);
      console.log('');
    });

    // Check validation logic
    console.log('🔧 Testing validation logic...');
    
    for (const provider of providers) {
      console.log(`\n🧪 Testing provider: ${provider.name}`);
      
      // Check API URL
      if (!provider.api_url || provider.api_url.trim() === '') {
        console.log(`  ❌ API URL missing`);
        continue;
      }
      
      // Check API Key
      if (!provider.api_key || provider.api_key.trim() === '') {
        console.log(`  ❌ API Key missing`);
        continue;
      }
      
      // Check URL format
      try {
        new URL(provider.api_url);
        console.log(`  ✅ API URL format valid: ${provider.api_url}`);
      } catch (error) {
        console.log(`  ❌ Invalid API URL format: ${provider.api_url}`);
        continue;
      }
      
      console.log(`  ✅ Provider ${provider.name} should be activatable`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

testProviderActivation();
