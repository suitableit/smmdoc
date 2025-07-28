// Test script to check if provider APIs are working
const fetch = require('node-fetch');

const providers = [
  {
    name: 'smmgen',
    api_key: 'af86d6b5cdd86703c1d269c3af8193ec',
    urls: ['https://smmgen.com/api/v2', 'https://api.smmgen.com/v2', 'https://smmgen.com/api']
  },
  {
    name: 'growfollows',
    api_key: 'c5acb7dcf2cf56294633836160f2ef3a',
    urls: ['https://growfollows.com/api/v2', 'https://api.growfollows.com/v2', 'https://growfollows.com/api']
  },
  {
    name: 'attpanel',
    api_key: '345ee2f4cde2378106ca9d9adfe7622c',
    urls: ['https://attpanel.com/api/v2', 'https://api.attpanel.com/v3', 'https://attpanel.com/api']
  }
];

async function testProvider(provider) {
  console.log(`\n🔥 Testing ${provider.name}...`);
  
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
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          console.log(`✅ SUCCESS! Found ${data.length} services`);
          console.log(`📝 Sample service:`, data[0]);
          return { success: true, url, count: data.length };
        } else {
          console.log(`❌ Invalid response format:`, typeof data);
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ Error response:`, errorText.substring(0, 200));
      }
      
    } catch (error) {
      console.log(`❌ Request failed:`, error.message);
    }
  }
  
  return { success: false };
}

async function testAllProviders() {
  console.log('🚀 Starting API provider tests...\n');
  
  for (const provider of providers) {
    const result = await testProvider(provider);
    if (result.success) {
      console.log(`🎉 ${provider.name} is working with ${result.url}`);
    } else {
      console.log(`💥 ${provider.name} failed on all URLs`);
    }
  }
  
  console.log('\n✨ Test completed!');
}

testAllProviders();
