const axios = require('axios');

// Updated Payment API Configuration
const PAYMENT_API_URL = 'https://order.paymently.io/api/checkout';
const API_KEY = 'W1983jh4AY9n86Oy6qnNlPz1dTXXZkLdIw574Nba';

async function testPaymentlyAPI() {
    console.log('🔍 Testing Paymently API with new key...');
    console.log('API URL:', PAYMENT_API_URL);
    console.log('API Key:', API_KEY.substring(0, 10) + '...');
    
    const testPayload = {
        amount: 100,
        currency: 'BDT',
        customer_name: 'Test User',
        customer_email: 'test@example.com',
        customer_phone: '01700000000',
        order_id: 'TEST_' + Date.now(),
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
        webhook_url: 'https://example.com/webhook'
    };

    // Try different authentication methods
    const authMethods = [
        {
            name: 'Bearer Token',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        },
        {
            name: 'X-API-Key Header',
            headers: {
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        },
        {
            name: 'API-Key Header',
            headers: {
                'API-Key': API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        },
        {
            name: 'Authorization Direct',
            headers: {
                'Authorization': API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        },
        {
            name: 'API Key in Body',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            payload: { ...testPayload, api_key: API_KEY }
        },
        {
            name: 'API Key in Body (key field)',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            payload: { ...testPayload, key: API_KEY }
        }
    ];

    for (const method of authMethods) {
        console.log(`\n📡 Testing ${method.name}...`);
        
        try {
            const payload = method.payload || testPayload;
            
            const response = await axios.post(PAYMENT_API_URL, payload, {
                headers: method.headers,
                timeout: 30000
            });

            console.log(`✅ ${method.name} - Success!`);
            console.log('✅ Status:', response.status);
            console.log('✅ Response:', JSON.stringify(response.data, null, 2));
            
            return {
                success: true,
                method: method.name,
                status: response.status,
                data: response.data
            };

        } catch (error) {
            console.log(`❌ ${method.name} - Failed:`);
            
            if (error.response) {
                console.log('Status:', error.response.status);
                console.log('Status Text:', error.response.statusText);
                console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
            } else {
                console.log('Error:', error.message);
            }
        }
        
        // Wait between attempts
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return {
        success: false,
        error: 'All authentication methods failed'
    };
}

async function checkUddoktaPayDocs() {
    console.log('\n📚 Checking UddoktaPay Documentation...');
    
    try {
        // Check UddoktaPay docs URL
        const docsUrl = 'https://uddoktapay.readme.io/reference/overview';
        console.log('Documentation URL:', docsUrl);
        
        // Try to fetch the docs page
        const response = await axios.get(docsUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        console.log('✅ UddoktaPay docs accessible');
        console.log('Status:', response.status);
        
        // Look for API patterns in the response
        const content = response.data;
        if (typeof content === 'string') {
            const hasApiKey = content.includes('api_key') || content.includes('API_KEY');
            const hasBearer = content.includes('Bearer') || content.includes('bearer');
            const hasAuth = content.includes('Authorization') || content.includes('authorization');
            
            console.log('📋 Found patterns:');
            console.log('- API Key pattern:', hasApiKey);
            console.log('- Bearer token pattern:', hasBearer);
            console.log('- Authorization header pattern:', hasAuth);
        }
        
    } catch (error) {
        console.log('❌ Could not access UddoktaPay docs:', error.message);
    }
}

async function testMinimalPayload() {
    console.log('\n🧪 Testing minimal payload...');
    
    const minimalPayloads = [
        {
            name: 'Only Amount',
            data: { amount: 100 }
        },
        {
            name: 'Amount + Currency',
            data: { amount: 100, currency: 'BDT' }
        },
        {
            name: 'Amount + Order ID',
            data: { amount: 100, order_id: 'MIN_' + Date.now() }
        }
    ];

    for (const payload of minimalPayloads) {
        console.log(`\n📋 Testing ${payload.name}...`);
        
        try {
            const response = await axios.post(PAYMENT_API_URL, payload.data, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 15000
            });

            console.log(`✅ ${payload.name} - Success!`);
            console.log('Response:', JSON.stringify(response.data, null, 2));

        } catch (error) {
            console.log(`❌ ${payload.name} - Failed:`, error.response?.status || error.message);
            if (error.response?.data) {
                console.log('Error Data:', JSON.stringify(error.response.data, null, 2));
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

async function runAllTests() {
    console.log('🚀 Starting Paymently API Tests with New Key...\n');
    
    // Check UddoktaPay documentation first
    await checkUddoktaPayDocs();
    
    // Test Paymently API
    const basicTest = await testPaymentlyAPI();
    
    if (!basicTest.success) {
        console.log('\n🧪 Trying minimal payloads...');
        await testMinimalPayload();
    }
    
    console.log('\n📊 Test Summary:');
    console.log('- API URL:', PAYMENT_API_URL);
    console.log('- API Key (first 10 chars):', API_KEY.substring(0, 10) + '...');
    console.log('- Test Result:', basicTest.success ? '✅ Success' : '❌ Failed');
    
    if (!basicTest.success) {
        console.log('\n💡 Recommendations:');
        console.log('1. Verify API key is active and correct');
        console.log('2. Check Paymently documentation for correct authentication method');
        console.log('3. Contact Paymently support for API integration help');
        console.log('4. Consider using UddoktaPay as alternative (docs available)');
    }
    
    console.log('\n🏁 Testing Complete!');
}

// Run tests
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    testPaymentlyAPI,
    checkUddoktaPayDocs,
    PAYMENT_API_URL,
    API_KEY
};
