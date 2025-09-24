const fetch = require('node-fetch');

async function testProviderToggleAPI() {
  try {
    console.log('🔍 Testing Provider Toggle API...\n');

    const baseUrl = 'http://localhost:3001';
    
    // First get all providers
    console.log('📋 Fetching providers...');
    const getResponse = await fetch(`${baseUrl}/api/admin/providers?filter=all`);
    const getResult = await getResponse.json();
    
    if (!getResult.success) {
      console.log('❌ Failed to fetch providers:', getResult.error);
      return;
    }

    const providers = getResult.data.providers.filter(p => !p.deletedAt);
    console.log(`Found ${providers.length} active providers\n`);

    // Test toggle for first provider
    if (providers.length > 0) {
      const provider = providers[0];
      console.log(`🔄 Testing toggle for Provider: ${provider.label} (ID: ${provider.id})`);
      console.log(`Current status: ${provider.status}`);
      
      const newStatus = provider.status === 'active' ? 'inactive' : 'active';
      console.log(`Attempting to change to: ${newStatus}`);

      // Make PUT request to toggle status
      const putResponse = await fetch(`${baseUrl}/api/admin/providers`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: provider.id,
          status: newStatus
        })
      });

      const putResult = await putResponse.json();
      
      if (putResult.success) {
        console.log('✅ API Response:', putResult.message);
        console.log('✅ Provider status updated successfully');
        
        // Revert back
        console.log('\n🔄 Reverting back to original status...');
        const revertResponse = await fetch(`${baseUrl}/api/admin/providers`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: provider.id,
            status: provider.status
          })
        });

        const revertResult = await revertResponse.json();
        if (revertResult.success) {
          console.log('✅ Successfully reverted back');
        } else {
          console.log('❌ Failed to revert:', revertResult.error);
        }
      } else {
        console.log('❌ API Error:', putResult.error);
        console.log('Response status:', putResponse.status);
        console.log('Full response:', putResult);
      }
    } else {
      console.log('❌ No providers found to test');
    }

    console.log('\n🎯 API Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProviderToggleAPI();