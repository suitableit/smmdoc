const axios = require('axios');

// Payment API Configuration
const PAYMENT_API_URL = 'https://order.paymently.io/api/checkout';
const API_KEY = 'W1983jh4AY9n86Oy6qnNlPz1dTXXZkLdIw574Nba';

async function simpleTest() {
    console.log('🔍 Simple Paymently API Test');
    console.log('URL:', PAYMENT_API_URL);
    console.log('Key:', API_KEY.substring(0, 15) + '...');
    
    const payload = {
        amount: 100,
        currency: 'BDT',
        order_id: 'TEST_' + Date.now()
    };
    
    console.log('\n📤 Sending request...');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    try {
        const response = await axios.post(PAYMENT_API_URL, payload, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 15000
        });
        
        console.log('\n✅ SUCCESS!');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('\n❌ FAILED');
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Status Text:', error.response.statusText);
            console.log('Headers:', JSON.stringify(error.response.headers, null, 2));
            console.log('Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.log('Request Error:', error.code || error.message);
        } else {
            console.log('Error:', error.message);
        }
    }
}

async function testUddoktaPay() {
    console.log('\n\n🔍 Testing UddoktaPay for comparison...');
    
    const uddoktaPayload = {
        full_name: 'Test User',
        email: 'test@example.com',
        amount: 100,
        metadata: {
            order_id: 'UDDK_' + Date.now()
        },
        redirect_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
        webhook_url: 'https://example.com/webhook'
    };
    
    try {
        const response = await axios.post('https://sandbox.uddoktapay.com/api/checkout-v2', uddoktaPayload, {
            headers: {
                'RT-UDDOKTAPAY-API-KEY': '982d381360a69d419689740d9f2e26ce36fb7a50',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 15000
        });
        
        console.log('✅ UddoktaPay SUCCESS!');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ UddoktaPay FAILED');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Error:', error.message);
        }
    }
}

async function main() {
    console.log('🚀 Payment API Comparison Test\n');
    
    // Test Paymently
    await simpleTest();
    
    // Test UddoktaPay for comparison
    await testUddoktaPay();
    
    console.log('\n📊 Summary:');
    console.log('- Paymently URL:', PAYMENT_API_URL);
    console.log('- UddoktaPay URL: https://sandbox.uddoktapay.com/api/checkout-v2');
    console.log('- UddoktaPay has working documentation and sandbox');
    
    console.log('\n🏁 Test Complete!');
}

main().catch(console.error);
