const fetch = require('node-fetch');

async function testSettingsAPI() {
  try {
    console.log('🧪 Testing Admin Contact Settings API...\n');
    
    // Test GET endpoint (this will fail due to auth, but we can see the response)
    console.log('📡 Testing GET /api/admin/contact-settings...');
    const getResponse = await fetch('http://localhost:3001/api/admin/contact-settings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📡 GET Response status:', getResponse.status);
    const getData = await getResponse.text();
    console.log('📡 GET Response data:', getData);
    
    // Test POST endpoint (this will also fail due to auth)
    console.log('\n📡 Testing POST /api/admin/contact-settings...');
    const postResponse = await fetch('http://localhost:3001/api/admin/contact-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contactSettings: {
          contactSystemEnabled: true,
          maxPendingContacts: '3',
          categories: [
            { id: 30, name: 'General Support' },
            { id: 31, name: 'Technical Issue' },
            { id: null, name: 'New Test Category' }
          ]
        }
      })
    });
    
    console.log('📡 POST Response status:', postResponse.status);
    const postData = await postResponse.text();
    console.log('📡 POST Response data:', postData);
    
    if (getResponse.status === 401 && postResponse.status === 401) {
      console.log('✅ API endpoints are working (expected 401 Unauthorized without auth)');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testSettingsAPI();
