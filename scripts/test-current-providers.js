const fetch = require('node-fetch');

// Test current providers with database API keys
async function testCurrentProviders() {
  const providers = [
    {
      name: 'ATTPanel',
      apiKey: 'fee5cc9b32b53641820b8f24622d733b',
      apiUrl: 'https://attpanel.com/api/v2'
    },
    {
      name: 'SMMGen',
      apiKey: 'af86d6b5cdd86703c1d269c3af8193ec',
      apiUrl: 'https://smmgen.com/api/v2'
    },
    {
      name: 'GrowFollows',
      apiKey: 'c5acb7dcf2cf56294633836160f2ef3a',
      apiUrl: 'https://growfollows.com/api/v2'
    },
    {
      name: 'SMMCoder',
      apiKey: 'd51d09535663bf9b5c171e360a0892ee',
      apiUrl: 'https://smmcoder.com/api/v2'
    }
  ];

  for (const provider of providers) {
    console.log(`\n🧪 Testing ${provider.name}...`);
    console.log(`API URL: ${provider.apiUrl}`);
    console.log(`API Key: ${provider.apiKey.substring(0, 8)}...`);
    
    try {
      // Test with URLSearchParams (most common)
      console.log('🔄 Testing with URLSearchParams...');
      const params = new URLSearchParams();
      params.append('key', provider.apiKey);
      params.append('action', 'services');

      const response = await fetch(provider.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      console.log(`Response Status: ${response.status}`);
      
      if (response.ok) {
        const responseText = await response.text();
        console.log(`Response (first 200 chars): ${responseText.substring(0, 200)}`);
        
        try {
          const data = JSON.parse(responseText);
          if (Array.isArray(data)) {
            console.log(`✅ ${provider.name} SUCCESS! Found ${data.length} services`);
            if (data.length > 0) {
              console.log(`First service: ${data[0].name || data[0].service}`);
            }
          } else if (data.error) {
            console.log(`❌ ${provider.name} API Error: ${data.error}`);
          } else {
            console.log(`❌ ${provider.name} unexpected format`);
          }
        } catch (parseError) {
          console.log(`❌ ${provider.name} JSON parse error: ${parseError.message}`);
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ ${provider.name} HTTP error ${response.status}: ${errorText.substring(0, 200)}`);
      }
      
    } catch (error) {
      console.log(`❌ ${provider.name} request failed: ${error.message}`);
    }
  }
}

// Run the test
testCurrentProviders();
