// Test providers with updated info
const testProviders = async () => {
  const providers = [
    {
      name: 'GrowFollows',
      apiKey: 'c5acb7dcf2cf56294633836160f2ef3a',
      apiUrl: 'https://growfollows.com/api/v2'
    },
    {
      name: 'ATTPanel', 
      apiKey: '345ee2f4cde2378106ca9d9adfe7622c',
      apiUrl: 'https://attpanel.com/api/v2'
    }
  ];

  for (const provider of providers) {
    console.log(`\n🧪 Testing ${provider.name}...`);
    console.log(`API URL: ${provider.apiUrl}`);
    console.log(`API Key: ${provider.apiKey.substring(0, 8)}...`);
    
    try {
      // Test with different approaches
      const approaches = [
        {
          name: 'FormData',
          getBody: () => {
            const formData = new FormData();
            formData.append('key', provider.apiKey);
            formData.append('action', 'services');
            return formData;
          },
          headers: {}
        },
        {
          name: 'URLSearchParams',
          getBody: () => {
            const params = new URLSearchParams();
            params.append('key', provider.apiKey);
            params.append('action', 'services');
            return params;
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        },
        {
          name: 'JSON',
          getBody: () => JSON.stringify({
            key: provider.apiKey,
            action: 'services'
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      ];

      let success = false;
      
      for (const approach of approaches) {
        console.log(`🔄 Trying ${approach.name} approach...`);
        
        try {
          const response = await fetch(provider.apiUrl, {
            method: 'POST',
            body: approach.getBody(),
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              ...approach.headers
            }
          });

          console.log(`${approach.name} Response Status: ${response.status}`);
          
          if (response.ok) {
            const text = await response.text();
            console.log(`${approach.name} Response: ${text.substring(0, 200)}`);
            
            try {
              const data = JSON.parse(text);
              if (Array.isArray(data) && data.length > 0) {
                console.log(`✅ ${provider.name} SUCCESS with ${approach.name}! Found ${data.length} services`);
                success = true;
                break;
              } else if (data.error) {
                console.log(`❌ ${provider.name} API Error with ${approach.name}: ${data.error}`);
              } else {
                console.log(`❌ ${provider.name} unexpected format with ${approach.name}:`, typeof data);
              }
            } catch (e) {
              console.log(`❌ ${provider.name} JSON parse error with ${approach.name}: ${e.message}`);
            }
          } else {
            const errorText = await response.text();
            console.log(`❌ ${provider.name} HTTP Error ${response.status} with ${approach.name}: ${errorText.substring(0, 100)}`);
          }
        } catch (error) {
          console.log(`❌ ${provider.name} ${approach.name} request failed: ${error.message}`);
        }
      }
      
      if (!success) {
        console.log(`❌ ${provider.name} FAILED with all approaches`);
      }
      
    } catch (error) {
      console.log(`❌ ${provider.name} overall test failed: ${error.message}`);
    }
  }
};

// Run the test
testProviders();
