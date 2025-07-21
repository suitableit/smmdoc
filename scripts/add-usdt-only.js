const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addUSDT() {
  try {
    console.log('🚀 Adding USDT Currency...\n');

    // Create USDT
    const usdt = await prisma.currency.create({
      data: {
        code: 'USDT',
        name: 'Tether USD',
        symbol: '₮',
        rate: 1.0000,
        enabled: true
      }
    });
    
    console.log('✅ USDT currency created:', usdt);

    // Show all currencies
    const allCurrencies = await prisma.currency.findMany({
      orderBy: { code: 'asc' }
    });
    
    console.log('\n💰 All Currencies:');
    allCurrencies.forEach(currency => {
      const status = currency.enabled ? '✅' : '❌';
      console.log(`${status} ${currency.code} - ${currency.name} (Rate: ${currency.rate})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addUSDT();
