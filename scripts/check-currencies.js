const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCurrencies() {
  try {
    console.log('🚀 Checking All Currencies...\n');

    // Get all currencies
    const allCurrencies = await prisma.currency.findMany({
      orderBy: { code: 'asc' }
    });
    
    console.log('💰 All Currencies in Database:');
    allCurrencies.forEach(currency => {
      const status = currency.enabled ? '✅' : '❌';
      console.log(`${status} ${currency.code} - ${currency.name} (Rate: ${currency.rate}) [ID: ${currency.id}]`);
    });

    // Check specifically for USDT
    console.log('\n🔍 Checking USDT specifically:');
    const usdt = await prisma.currency.findUnique({
      where: { code: 'USDT' }
    });
    
    if (usdt) {
      console.log('✅ USDT found:', usdt);
    } else {
      console.log('❌ USDT not found');
    }

    // Check for any currency with similar code
    const usdtLike = await prisma.currency.findMany({
      where: {
        code: {
          contains: 'USDT'
        }
      }
    });
    
    console.log('\n🔍 Currencies containing "USDT":');
    usdtLike.forEach(currency => {
      console.log(`- ${currency.code} (ID: ${currency.id})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrencies();
