const fetch = require('node-fetch');

async function testBalanceFetch() {
  try {
    console.log('🧪 Testing balance fetch for ATTPanel and SampleSMM...');
    
    // ATTPanel balance test
    console.log('\n🔍 Testing ATTPanel balance fetch...');
    const attpanelResponse = await fetch('http://localhost:3000/api/admin/providers/balance?providerId=19', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const attpanelResult = await attpanelResponse.json();
    console.log('ATTPanel Result:', JSON.stringify(attpanelResult, null, 2));
    
    // SampleSMM balance test
    console.log('\n🔍 Testing SampleSMM balance fetch...');
    const samplesmmResponse = await fetch('http://localhost:3000/api/admin/providers/balance?providerId=11', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const samplesmmResult = await samplesmmResponse.json();
    console.log('SampleSMM Result:', JSON.stringify(samplesmmResult, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing balance fetch:', error);
  }
}

testBalanceFetch();