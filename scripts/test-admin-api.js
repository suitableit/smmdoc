const fetch = require('node-fetch');

async function testAdminAPI() {
  try {
    console.log('🧪 Testing Admin Contact Messages API...\n');
    
    // Test the API endpoint (this will fail due to auth, but we can see the response)
    const response = await fetch('http://localhost:3001/api/admin/contact-messages', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📡 Response status:', response.status);
    
    const data = await response.text();
    console.log('📡 Response data:', data);
    
    if (response.status === 401) {
      console.log('✅ API is working (expected 401 Unauthorized without auth)');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testAdminAPI();
