const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const prisma = new PrismaClient();

// Function to update AttPanel API key
async function updateAttPanelKey(newApiKey) {
  if (!newApiKey) {
    console.log('❌ Please provide an API key');
    console.log('Usage: node fix-attpanel.js YOUR_API_KEY_HERE');
    return;
  }

  try {
    console.log('🔧 Updating AttPanel API key...');
    console.log(`🔑 New API Key: ${newApiKey.substring(0, 8)}...`);
    
    // Test the API key first
    console.log('🧪 Testing API key...');
    const params = new URLSearchParams();
    params.append('key', newApiKey);
    params.append('action', 'balance');
    
    const response = await fetch('https://attpanel.com/api/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });
    
    const result = await response.text();
    const data = JSON.parse(result);
    
    if (data.error) {
      console.log(`❌ API Key Test Failed: ${data.error}`);
      console.log('Please check your API key and try again.');
      return;
    }
    
    if (data.balance !== undefined) {
      console.log(`✅ API Key Test Successful!`);
      console.log(`💰 Account Balance: ${data.balance} ${data.currency || 'USD'}`);
      
      // Update in database
      await prisma.apiProvider.update({
        where: { name: 'attpanel' },
        data: { 
          api_key: newApiKey,
          status: 'active'
        }
      });
      
      console.log('✅ AttPanel API key updated in database!');
      console.log('🎉 AttPanel is now ready to use!');
      
      // Test service list
      console.log('\n🧪 Testing service list...');
      const serviceParams = new URLSearchParams();
      serviceParams.append('key', newApiKey);
      serviceParams.append('action', 'services');
      
      const serviceResponse = await fetch('https://attpanel.com/api/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: serviceParams
      });
      
      const serviceResult = await serviceResponse.text();
      const serviceData = JSON.parse(serviceResult);
      
      if (Array.isArray(serviceData)) {
        console.log(`✅ Service list test successful! Found ${serviceData.length} services`);
        console.log('📋 You can now import services from AttPanel!');
      } else if (serviceData.error) {
        console.log(`⚠️ Service list error: ${serviceData.error}`);
      }
      
    } else {
      console.log('❌ Unexpected API response format');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Get API key from command line argument
const apiKey = process.argv[2];

if (!apiKey) {
  console.log('🔧 AttPanel API Key Fixer');
  console.log('========================');
  console.log('');
  console.log('❌ Current AttPanel API key is invalid!');
  console.log('');
  console.log('📝 To fix this:');
  console.log('   1. Go to https://attpanel.com');
  console.log('   2. Login to your account');
  console.log('   3. Go to Account/API section');
  console.log('   4. Copy your API key');
  console.log('   5. Run: node fix-attpanel.js YOUR_API_KEY');
  console.log('');
  console.log('Example:');
  console.log('   node fix-attpanel.js abc123def456ghi789');
} else {
  updateAttPanelKey(apiKey);
}