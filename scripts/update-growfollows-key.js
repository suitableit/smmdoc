const mysql = require('mysql2/promise');

async function updateGrowFollowsKey() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'smmdoc21'
  });

  try {
    console.log('🔧 Updating GrowFollows API key...');
    
    // Update GrowFollows API key
    const newApiKey = 'c5acb7dcf2cf56294633836160f2ef3a';
    const apiUrl = 'https://growfollows.com/api/v2';
    
    const [result] = await connection.execute(
      'UPDATE api_providers SET api_key = ?, api_url = ? WHERE name = ?',
      [newApiKey, apiUrl, 'growfollows']
    );

    console.log(`✅ Updated GrowFollows provider:`, result);

    // Verify the update
    const [providers] = await connection.execute(
      'SELECT id, name, api_key, api_url, status FROM api_providers WHERE name = ?',
      ['growfollows']
    );

    if (providers.length > 0) {
      const provider = providers[0];
      console.log('\n📊 Updated GrowFollows Provider:');
      console.log(`  - ID: ${provider.id}`);
      console.log(`  - Name: ${provider.name}`);
      console.log(`  - API URL: ${provider.api_url}`);
      console.log(`  - API Key: ${provider.api_key.substring(0, 10)}...`);
      console.log(`  - Status: ${provider.status}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

updateGrowFollowsKey();
