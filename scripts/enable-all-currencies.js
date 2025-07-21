const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function enableAllCurrencies() {
  try {
    console.log('🚀 Enabling All Currencies...\n');

    // Enable all currencies
    const result = await prisma.currency.updateMany({
      data: {
        enabled: true
      }
    });
    
    console.log(`✅ Enabled ${result.count} currencies`);

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

enableAllCurrencies();
