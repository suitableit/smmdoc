const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateATTPanelKey() {
  try {
    console.log('🔧 AttPanel API Key Update Tool');
    console.log('================================');
    
    // Check current AttPanel configuration
    const currentProvider = await prisma.apiProvider.findUnique({
      where: { name: 'attpanel' }
    });

    if (currentProvider) {
      console.log('📊 Current AttPanel Configuration:');
      console.log(`  - API Key: ${currentProvider.api_key.substring(0, 8)}...`);
      console.log(`  - API URL: ${currentProvider.api_url}`);
      console.log(`  - Status: ${currentProvider.status}`);
      console.log('');
    } else {
      console.log('❌ AttPanel provider not found in database!');
      return;
    }

    // The current API key seems to be invalid
    console.log('❌ Current API key is invalid according to AttPanel API');
    console.log('📝 To fix this issue, you need to:');
    console.log('   1. Go to https://attpanel.com');
    console.log('   2. Login to your account');
    console.log('   3. Go to Account/API section');
    console.log('   4. Copy your valid API key');
    console.log('   5. Update the API key in the database');
    console.log('');
    
    // Provide update command template
    console.log('💡 To update the API key, run this command:');
    console.log('   node -e "');
    console.log('   const { PrismaClient } = require(\'@prisma/client\');');
    console.log('   const prisma = new PrismaClient();');
    console.log('   prisma.apiProvider.update({');
    console.log('     where: { name: \'attpanel\' },');
    console.log('     data: { api_key: \'YOUR_NEW_API_KEY_HERE\' }');
    console.log('   }).then(() => console.log(\'✅ API key updated!\'))"');
    console.log('');
    
    // Alternative: Create a simple update function
    console.log('🔄 Or use this function to update:');
    console.log('   updateApiKey(\'YOUR_NEW_API_KEY_HERE\');');
    console.log('');
    
    // Test the current key one more time
    console.log('🧪 Testing current API key...');
    const fetch = require('node-fetch');
    const params = new URLSearchParams();
    params.append('key', currentProvider.api_key);
    params.append('action', 'balance');
    
    try {
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
        console.log(`❌ API Test Failed: ${data.error}`);
      } else if (data.balance !== undefined) {
        console.log(`✅ API Test Successful! Balance: ${data.balance} ${data.currency || 'USD'}`);
        console.log('🎉 Your API key is actually working!');
      }
    } catch (error) {
      console.log(`❌ API Test Error: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Function to update API key
async function updateApiKey(newApiKey) {
  if (!newApiKey || newApiKey === 'YOUR_NEW_API_KEY_HERE') {
    console.log('❌ Please provide a valid API key');
    return;
  }
  
  try {
    await prisma.apiProvider.update({
      where: { name: 'attpanel' },
      data: { 
        api_key: newApiKey,
        status: 'active'
      }
    });
    
    console.log('✅ AttPanel API key updated successfully!');
    console.log(`🔑 New key: ${newApiKey.substring(0, 8)}...`);
    
    // Test the new key
    console.log('🧪 Testing new API key...');
    const fetch = require('node-fetch');
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
      console.log(`❌ New API Key Test Failed: ${data.error}`);
    } else if (data.balance !== undefined) {
      console.log(`✅ New API Key Test Successful! Balance: ${data.balance} ${data.currency || 'USD'}`);
    }
    
  } catch (error) {
    console.error('❌ Error updating API key:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Export the update function for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { updateApiKey };
}

// Run the main function if this script is executed directly
if (require.main === module) {
  updateATTPanelKey();
}