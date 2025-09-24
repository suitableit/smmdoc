const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Utility function for timeout
function fetchWithTimeout(url, options, timeout = 30000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
}

// Test API connection for a provider
async function testProviderAPI(provider) {
  console.log(`\n🔍 Testing Provider: ${provider.name} (ID: ${provider.id})`);
  console.log(`   API URL: ${provider.api_url}`);
  console.log(`   API Key: ${provider.api_key.substring(0, 3)}***`);
  
  try {
    // Prepare API request
    const apiUrl = provider.balance_endpoint || provider.api_url;
    const apiKeyParam = provider.api_key_param || 'key';
    const actionParam = provider.action_param || 'action';
    const balanceAction = provider.balance_action || 'balance';
    
    // Try POST method first
    console.log(`   📤 Trying POST method...`);
    const postData = new URLSearchParams();
    postData.append(apiKeyParam, provider.api_key);
    postData.append(actionParam, balanceAction);
    
    const postResponse = await fetchWithTimeout(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'SMM Panel API Client'
      },
      body: postData
    }, 15000);
    
    const postResult = await postResponse.text();
    console.log(`   ✅ POST Response Status: ${postResponse.status}`);
    console.log(`   📄 POST Response: ${postResult.substring(0, 200)}${postResult.length > 200 ? '...' : ''}`);
    
    // Try to parse as JSON
    try {
      const jsonResult = JSON.parse(postResult);
      if (jsonResult.balance !== undefined || jsonResult.current_balance !== undefined) {
        console.log(`   💰 Balance found in response!`);
        return { success: true, method: 'POST', response: jsonResult };
      }
    } catch (e) {
      console.log(`   ⚠️  Response is not valid JSON`);
    }
    
    // If POST didn't work, try GET method
    console.log(`   📤 Trying GET method...`);
    const getUrl = new URL(apiUrl);
    getUrl.searchParams.append(apiKeyParam, provider.api_key);
    getUrl.searchParams.append(actionParam, balanceAction);
    
    const getResponse = await fetchWithTimeout(getUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'SMM Panel API Client'
      }
    }, 15000);
    
    const getResult = await getResponse.text();
    console.log(`   ✅ GET Response Status: ${getResponse.status}`);
    console.log(`   📄 GET Response: ${getResult.substring(0, 200)}${getResult.length > 200 ? '...' : ''}`);
    
    // Try to parse as JSON
    try {
      const jsonResult = JSON.parse(getResult);
      if (jsonResult.balance !== undefined || jsonResult.current_balance !== undefined) {
        console.log(`   💰 Balance found in response!`);
        return { success: true, method: 'GET', response: jsonResult };
      }
    } catch (e) {
      console.log(`   ⚠️  Response is not valid JSON`);
    }
    
    return { success: false, error: 'No balance found in response', postResponse: postResult, getResponse: getResult };
    
  } catch (error) {
    console.log(`   ❌ API Test Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  try {
    console.log('🚀 Starting Provider API Connection Test...\n');
    
    // Get active providers
    const activeProviders = await prisma.api_providers.findMany({
      where: {
        status: 'active',
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        api_url: true,
        api_key: true,
        balance_action: true,
        balance_endpoint: true,
        api_key_param: true,
        action_param: true
      }
    });
    
    console.log(`Found ${activeProviders.length} active providers to test\n`);
    
    const results = [];
    
    for (const provider of activeProviders) {
      const result = await testProviderAPI(provider);
      results.push({
        provider: provider.name,
        id: provider.id,
        ...result
      });
      
      // Wait a bit between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Summary
    console.log('\n📊 Test Summary:');
    console.log('================');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    
    if (successful.length > 0) {
      console.log('\n✅ Working Providers:');
      successful.forEach(r => {
        console.log(`   - ${r.provider} (ID: ${r.id}) - Method: ${r.method}`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n❌ Failed Providers:');
      failed.forEach(r => {
        console.log(`   - ${r.provider} (ID: ${r.id}) - Error: ${r.error}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Script Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();