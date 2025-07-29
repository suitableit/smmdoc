const fetch = require('node-fetch');

async function testATTPanelAPI() {
  console.log('🧪 Testing AttPanel API directly...');
  
  const API_KEY = '345ee2f4cde2378106ca9d9adfe7622c';
  const API_URL = 'https://attpanel.com/api/v2';
  
  console.log(`🔑 API Key: ${API_KEY.substring(0, 8)}...`);
  console.log(`🌐 API URL: ${API_URL}`);
  
  try {
    // Test 1: FormData approach
    console.log('\n📋 Test 1: FormData approach');
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('key', API_KEY);
    formData.append('action', 'services');
    
    let response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const text = await response.text();
      console.log(`Response (first 500 chars): ${text.substring(0, 500)}`);
      
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          console.log(`✅ Success! Found ${data.length} services`);
          console.log(`First service:`, data[0]);
          return;
        } else if (data.error) {
          console.log(`❌ API Error: ${data.error}`);
        }
      } catch (parseError) {
        console.log(`❌ JSON Parse Error: ${parseError.message}`);
        console.log(`Raw response: ${text}`);
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ HTTP Error: ${errorText}`);
    }
    
    // Test 2: URLSearchParams approach
    console.log('\n📋 Test 2: URLSearchParams approach');
    const params = new URLSearchParams();
    params.append('key', API_KEY);
    params.append('action', 'services');
    
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const text = await response.text();
      console.log(`Response (first 500 chars): ${text.substring(0, 500)}`);
      
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          console.log(`✅ Success! Found ${data.length} services`);
          console.log(`First service:`, data[0]);
          return;
        } else if (data.error) {
          console.log(`❌ API Error: ${data.error}`);
        }
      } catch (parseError) {
        console.log(`❌ JSON Parse Error: ${parseError.message}`);
        console.log(`Raw response: ${text}`);
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ HTTP Error: ${errorText}`);
    }
    
    // Test 3: Balance check
    console.log('\n📋 Test 3: Balance check');
    const balanceParams = new URLSearchParams();
    balanceParams.append('key', API_KEY);
    balanceParams.append('action', 'balance');
    
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: balanceParams
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const text = await response.text();
      console.log(`Balance response: ${text}`);
      
      try {
        const data = JSON.parse(text);
        if (data.balance !== undefined) {
          console.log(`✅ Balance check successful: ${data.balance} ${data.currency || 'USD'}`);
        } else if (data.error) {
          console.log(`❌ Balance API Error: ${data.error}`);
        }
      } catch (parseError) {
        console.log(`❌ Balance JSON Parse Error: ${parseError.message}`);
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ Balance HTTP Error: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testATTPanelAPI();