// Test ATTPanel with different URLs
const testATTPanelURLs = async () => {
  const apiKey = '345ee2f4cde2378106ca9d9adfe7622c';
  const urls = [
    'https://attpanel.com/api/v2',
    'https://api.attpanel.com/v2',
    'https://attpanel.com/api',
    'https://api.attpanel.com/v3'
  ];

  console.log(`🧪 Testing ATTPanel with different URLs...`);
  console.log(`API Key: ${apiKey.substring(0, 8)}...`);
  
  for (const url of urls) {
    console.log(`\n🔄 Trying: ${url}`);
    
    try {
      const formData = new FormData();
      formData.append('key', apiKey);
      formData.append('action', 'balance');

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      console.log(`Response Status: ${response.status}`);
      
      if (response.ok) {
        const text = await response.text();
        console.log(`Response: ${text.substring(0, 200)}`);
        
        try {
          const data = JSON.parse(text);
          if (data.error) {
            console.log(`❌ API Error: ${data.error}`);
          } else {
            console.log(`✅ SUCCESS with ${url}`);
            break;
          }
        } catch (e) {
          console.log(`❌ JSON parse error: ${e.message}`);
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ HTTP Error ${response.status}: ${errorText.substring(0, 100)}`);
      }
      
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
  }
};

// Run the test
testATTPanelURLs();
