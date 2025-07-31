// Test SMMGen API directly
const testSMMGenAPI = async () => {
  const apiKey = 'af86d6b5cdd86703c1d269c3af8193ec';
  const apiUrl = 'https://smmgen.com/api/v2';
  
  console.log('🧪 Testing SMMGen API...');
  console.log(`API URL: ${apiUrl}`);
  console.log(`API Key: ${apiKey.substring(0, 8)}...`);
  
  try {
    // Test with FormData
    console.log('\n🔄 Trying FormData approach...');
    const formData = new FormData();
    formData.append('key', apiKey);
    formData.append('action', 'services');

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    console.log(`Response Status: ${response.status}`);
    console.log(`Response Headers:`, Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const responseText = await response.text();
      console.log(`\n📄 Raw Response (first 500 chars):`);
      console.log(responseText.substring(0, 500));
      
      try {
        const data = JSON.parse(responseText);
        
        if (Array.isArray(data)) {
          console.log(`\n✅ SUCCESS! Found ${data.length} services`);
          
          // Show first few services
          console.log('\n📋 First 3 services:');
          data.slice(0, 3).forEach((service, index) => {
            console.log(`  ${index + 1}. Service ID: ${service.service}`);
            console.log(`     Name: ${service.name}`);
            console.log(`     Category: ${service.category}`);
            console.log(`     Rate: $${service.rate}`);
            console.log(`     Min: ${service.min}, Max: ${service.max}`);
            console.log('');
          });
          
          // Count categories
          const categories = [...new Set(data.map(s => s.category))];
          console.log(`📊 Total Categories: ${categories.length}`);
          console.log(`Categories: ${categories.slice(0, 5).join(', ')}${categories.length > 5 ? '...' : ''}`);
          
        } else if (data.error) {
          console.log(`❌ API Error: ${data.error}`);
        } else {
          console.log(`❌ Unexpected response format:`, data);
        }
      } catch (parseError) {
        console.log(`❌ JSON Parse Error:`, parseError.message);
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ HTTP Error ${response.status}:`);
      console.log(errorText);
    }
    
  } catch (error) {
    console.log(`❌ Request Failed:`, error.message);
  }
};

// Run the test
testSMMGenAPI();
