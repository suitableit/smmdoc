// Detailed test script to check API responses
const fetch = require('node-fetch');

const providers = [
  {
    name: 'attpanel',
    api_key: '345ee2f4cde2378106ca9d9adfe7622c',
    urls: ['https://attpanel.com/api/v2']
  },
  {
    name: 'growfollows',
    api_key: 'c5acb7dcf2cf56294633836160f2ef3a',
    urls: ['https://growfollows.com/api/v2']
  }
];

async function testProviderDetailed(provider) {
  console.log(`\n🔥 Testing ${provider.name} in detail...`);
  
  for (const url of provider.urls) {
    try {
      console.log(`🔄 Trying: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: new URLSearchParams({
          key: provider.api_key,
          action: 'services'
        })
      });
      
      console.log(`📊 Status: ${response.status}`);
      console.log(`📋 Headers:`, Object.fromEntries(response.headers));
      
      const responseText = await response.text();
      console.log(`📝 Raw Response (first 500 chars):`, responseText.substring(0, 500));
      
      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          console.log(`📊 Response type:`, typeof data);
          console.log(`📊 Is Array:`, Array.isArray(data));
          
          if (Array.isArray(data)) {
            console.log(`✅ SUCCESS! Found ${data.length} services`);
            console.log(`📝 Sample service:`, data[0]);
          } else if (data && typeof data === 'object') {
            console.log(`📊 Object keys:`, Object.keys(data));
            if (data.error) {
              console.log(`❌ API Error:`, data.error);
            }
          }
        } catch (parseError) {
          console.log(`❌ JSON Parse Error:`, parseError.message);
        }
      }
      
    } catch (error) {
      console.log(`❌ Request failed:`, error.message);
    }
  }
}

async function testBalance(provider) {
  console.log(`\n💰 Testing balance for ${provider.name}...`);
  
  try {
    const response = await fetch(provider.urls[0], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: new URLSearchParams({
        key: provider.api_key,
        action: 'balance'
      })
    });
    
    const responseText = await response.text();
    console.log(`💰 Balance Response:`, responseText);
    
  } catch (error) {
    console.log(`❌ Balance test failed:`, error.message);
  }
}

async function runDetailedTests() {
  console.log('🚀 Starting detailed API tests...\n');
  
  for (const provider of providers) {
    await testProviderDetailed(provider);
    await testBalance(provider);
  }
  
  console.log('\n✨ Detailed tests completed!');
}

runDetailedTests();
