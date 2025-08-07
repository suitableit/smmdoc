const http = require('http');

function testAdminEndpoint() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Testing Admin Cancel Requests Endpoint...');
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/admin/cancel-requests',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      console.log(`📊 Response Status: ${res.statusCode}`);
      console.log(`📊 Response Headers:`, res.headers);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Response Length: ${data.length} characters`);
        
        // Check if response is JSON
        try {
          const jsonData = JSON.parse(data);
          console.log('✅ Response is valid JSON');
          console.log('📋 Response Data:');
          console.log(JSON.stringify(jsonData, null, 2));
        } catch (parseError) {
          console.log('❌ Response is not valid JSON');
          console.log('📋 First 500 characters of response:');
          console.log(data.substring(0, 500));
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Error testing admin endpoint:', error.message);
      reject(error);
    });
    
    req.end();
  });
}

testAdminEndpoint();