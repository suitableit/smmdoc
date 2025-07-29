const axios = require('axios');

// Payment API Configuration
const PAYMENT_API_URL = 'https://order.paymently.io/api/checkout';
const API_KEY = 'CwcB1JV0FqBueuRrczIqMlPVv3Z1p84TjKDE6GPJ';

async function testPaymentlyAPI() {
    console.log('🔍 Testing Paymently API...');
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
            name: 'API Key Header',
            headers: {
                'X-API-Key': API_KEY,
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
            name: 'Authorization Header',
            headers: {
                'Authorization': API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
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
            console.log('✅ API Response Status:', response.status);
            console.log('✅ API Response Data:', JSON.stringify(response.data, null, 2));

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

async function testDifferentPayloads() {
    console.log('\n🧪 Testing different payload formats...');

    const payloads = [
        {
            name: 'Minimal Payload',
            data: {
                amount: 50,
                currency: 'BDT'
            }
        },
        {
            name: 'Standard Payload',
            data: {
                amount: 100,
                currency: 'BDT',
                customer_name: 'John Doe',
                customer_email: 'john@example.com',
                order_id: 'ORDER_' + Date.now()
            }
        },
        {
            name: 'Full Payload',
            data: {
                amount: 200,
                currency: 'BDT',
                customer_name: 'Jane Smith',
                customer_email: 'jane@example.com',
                customer_phone: '01800000000',
                order_id: 'FULL_' + Date.now(),
                description: 'Test payment for SMM services',
                success_url: 'https://example.com/success',
                cancel_url: 'https://example.com/cancel',
                webhook_url: 'https://example.com/webhook',
                metadata: {
                    user_id: 123,
                    service_type: 'add_funds'
                }
            }
        }
    ];

    for (const payload of payloads) {
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

            console.log(`✅ ${payload.name} - Status:`, response.status);
            console.log(`✅ ${payload.name} - Response:`, JSON.stringify(response.data, null, 2));

        } catch (error) {
            console.log(`❌ ${payload.name} - Failed:`, error.response?.status || error.message);
            if (error.response?.data) {
                console.log(`❌ ${payload.name} - Error Data:`, JSON.stringify(error.response.data, null, 2));
            }
        }

        // Wait between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

async function testAPIEndpoint() {
    console.log('🔍 Testing API endpoint accessibility...');

    try {
        // Test GET request to see if endpoint exists
        const getResponse = await axios.get(PAYMENT_API_URL, {
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500; // Accept any status less than 500
            }
        });

        console.log('✅ GET Response Status:', getResponse.status);
        console.log('✅ GET Response Data:', JSON.stringify(getResponse.data, null, 2));

    } catch (error) {
        console.log('❌ GET Request Failed:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }

    // Test OPTIONS request to check allowed methods
    try {
        const optionsResponse = await axios.options(PAYMENT_API_URL, {
            timeout: 10000
        });

        console.log('✅ OPTIONS Response:', optionsResponse.headers);

    } catch (error) {
        console.log('❌ OPTIONS Request Failed:', error.message);
    }
}

async function runAllTests() {
    console.log('🚀 Starting Paymently API Tests...\n');

    // Test endpoint accessibility first
    await testAPIEndpoint();

    // Test basic connectivity
    const basicTest = await testPaymentlyAPI();

    if (basicTest.success) {
        console.log('\n✅ Basic API test passed! Proceeding with detailed tests...');
        await testDifferentPayloads();
    } else {
        console.log('\n❌ Basic API test failed. Check API credentials and endpoint.');
        console.log('\n💡 Suggestions:');
        console.log('1. Verify API key is correct and active');
        console.log('2. Check if API endpoint URL is correct');
        console.log('3. Contact Paymently support for API documentation');
        console.log('4. Check if there are any IP restrictions');
    }

    console.log('\n🏁 API Testing Complete!');
}

// Run tests
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    testPaymentlyAPI,
    testDifferentPayloads,
    PAYMENT_API_URL,
    API_KEY
};
