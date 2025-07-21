const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAllCurrencies() {
  try {
    console.log('🧪 Testing All Currency Functions...\n');

    // 1. Check all currencies in database
    console.log('1️⃣ Checking Database Currencies:');
    const allCurrencies = await prisma.currency.findMany({
      orderBy: { code: 'asc' }
    });
    
    allCurrencies.forEach(currency => {
      const status = currency.enabled ? '✅' : '❌';
      console.log(`${status} ${currency.code} - ${currency.name} (Rate: ${currency.rate}, Symbol: ${currency.symbol})`);
    });

    // 2. Test API endpoints
    console.log('\n2️⃣ Testing API Endpoints:');
    
    // Test enabled currencies API
    try {
      const response = await fetch('http://localhost:3000/api/currencies/enabled');
      const data = await response.json();
      console.log('✅ /api/currencies/enabled - Success');
      console.log(`   Found ${data.currencies?.length || 0} enabled currencies`);
    } catch (error) {
      console.log('❌ /api/currencies/enabled - Failed:', error.message);
    }

    // Test currency settings API
    try {
      const response = await fetch('http://localhost:3000/api/admin/currency-settings');
      const data = await response.json();
      console.log('✅ /api/admin/currency-settings - Success');
      console.log(`   Default Currency: ${data.currencySettings?.defaultCurrency || 'N/A'}`);
    } catch (error) {
      console.log('❌ /api/admin/currency-settings - Failed:', error.message);
    }

    // 3. Test conversion logic
    console.log('\n3️⃣ Testing Currency Conversion Logic:');
    
    const enabledCurrencies = allCurrencies.filter(c => c.enabled);
    
    // Test USD to other currencies
    console.log('\n💱 USD to Other Currencies (100 USD):');
    enabledCurrencies.forEach(currency => {
      if (currency.code !== 'USD') {
        const converted = 100 * Number(currency.rate);
        console.log(`   100 USD → ${converted.toFixed(2)} ${currency.code} (${currency.symbol})`);
      }
    });

    // Test other currencies to USD
    console.log('\n💱 Other Currencies to USD (100 units):');
    enabledCurrencies.forEach(currency => {
      if (currency.code !== 'USD') {
        const converted = 100 / Number(currency.rate);
        console.log(`   100 ${currency.code} → ${converted.toFixed(2)} USD ($)`);
      }
    });

    // 4. Test specific problematic currencies
    console.log('\n4️⃣ Testing Previously Missing Currencies:');
    const testCurrencies = ['USDT', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
    
    for (const code of testCurrencies) {
      const currency = allCurrencies.find(c => c.code === code);
      if (currency) {
        const status = currency.enabled ? '✅ Enabled' : '❌ Disabled';
        console.log(`   ${code}: ${status} (Rate: ${currency.rate})`);
      } else {
        console.log(`   ${code}: ❌ Not Found in Database`);
      }
    }

    // 5. Test balance conversion scenarios
    console.log('\n5️⃣ Testing Balance Conversion Scenarios:');
    
    const testBalance = 12000; // BDT (database storage currency)
    console.log(`   Database Balance: ৳${testBalance.toFixed(2)} BDT`);
    
    enabledCurrencies.forEach(currency => {
      if (currency.code === 'BDT') {
        console.log(`   Display in BDT: ৳${testBalance.toFixed(2)}`);
      } else {
        // Convert BDT to target currency
        const usdAmount = testBalance / 110; // BDT to USD (assuming 110 rate)
        const converted = currency.code === 'USD' ? usdAmount : usdAmount * Number(currency.rate);
        console.log(`   Display in ${currency.code}: ${currency.symbol}${converted.toFixed(2)}`);
      }
    });

    console.log('\n✅ All Currency Tests Completed!');

  } catch (error) {
    console.error('❌ Test Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAllCurrencies();
