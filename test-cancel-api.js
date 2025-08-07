const axios = require('axios');

async function testCancelRequestAPI() {
  try {
    console.log('Testing Cancel Request API...');
    
    // First, let's check if we have any orders to test with
    console.log('\n1. Checking for existing orders...');
    
    // Test the admin cancel requests API first
    console.log('\n2. Testing admin cancel requests API...');
    try {
      const adminResponse = await axios.get('http://localhost:3001/api/admin/cancel-requests', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Admin API Response Status:', adminResponse.status);
      console.log('Admin API Response:', JSON.stringify(adminResponse.data, null, 2));
    } catch (adminError) {
      console.log('❌ Admin API Error:', adminError.response?.status, adminError.response?.data || adminError.message);
    }
    
    // Test creating a cancel request (this will likely fail due to auth, but we can see the error)
    console.log('\n3. Testing cancel request creation (without auth - expect 401)...');
    try {
      const cancelResponse = await axios.post('http://localhost:3001/api/user/orders/1/cancel-request', {
        reason: 'Test cancel request - minimum 10 characters'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Cancel Request Response:', cancelResponse.data);
    } catch (cancelError) {
      console.log('Expected Auth Error:', cancelError.response?.status, cancelError.response?.data || cancelError.message);
    }
    
    // Test if server is responding
    console.log('\n4. Testing server health...');
    try {
      const healthResponse = await axios.get('http://localhost:3001/api/health');
      console.log('✅ Server Health:', healthResponse.status, healthResponse.data);
    } catch (healthError) {
      console.log('❌ Server Health Error:', healthError.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCancelRequestAPI();