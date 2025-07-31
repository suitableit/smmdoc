// Test all providers API
const testAllProviders = async () => {
  const providers = [
    {
      name: 'GrowFollows',
      apiKey: 'c5acb7dcf2cf56294633836160f2ef3a',
      apiUrl: 'https://growfollows.com/api/v2'
    },
    {
      name: 'SMMGen',
      apiKey: 'af86d6b5cdd86703c1d269c3af8193ec',
      apiUrl: 'https://smmgen.com/api/v2'
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
      // Test balance first (simpler endpoint)
      console.log('🔄 Testing balance endpoint...');
      const balanceFormData = new FormData();
      balanceFormData.append('key', provider.apiKey);
      balanceFormData.append('action', 'balance');

      const balanceResponse = await fetch(provider.apiUrl, {
        method: 'POST',
        body: balanceFormData,
      });

      console.log(`Balance Response Status: ${balanceResponse.status}`);
      
      if (balanceResponse.ok) {
        const balanceText = await balanceResponse.text();
        console.log(`Balance Response: ${balanceText.substring(0, 200)}`);
        
        // If balance works, try services
        console.log('🔄 Testing services endpoint...');
        const servicesFormData = new FormData();
        servicesFormData.append('key', provider.apiKey);
        servicesFormData.append('action', 'services');

        const servicesResponse = await fetch(provider.apiUrl, {
          method: 'POST',
          body: servicesFormData,
        });

        console.log(`Services Response Status: ${servicesResponse.status}`);
        
        if (servicesResponse.ok) {
          const servicesText = await servicesResponse.text();
          try {
            const data = JSON.parse(servicesText);
            if (Array.isArray(data)) {
              console.log(`✅ ${provider.name} SUCCESS! Found ${data.length} services`);
            } else {
              console.log(`❌ ${provider.name} unexpected format:`, data);
            }
          } catch (e) {
            console.log(`❌ ${provider.name} JSON parse error:`, e.message);
          }
        } else {
          const errorText = await servicesResponse.text();
          console.log(`❌ ${provider.name} services error ${servicesResponse.status}:`, errorText.substring(0, 200));
        }
      } else {
        const errorText = await balanceResponse.text();
        console.log(`❌ ${provider.name} balance error ${balanceResponse.status}:`, errorText.substring(0, 200));
      }
      
    } catch (error) {
      console.log(`❌ ${provider.name} request failed:`, error.message);
    }
  }
};

// Run the test
testAllProviders();
