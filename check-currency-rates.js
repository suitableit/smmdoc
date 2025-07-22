const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCurrencies() {
  try {
    console.log('=== Current Currency Rates ===');
    const currencies = await prisma.currency.findMany({
      orderBy: { code: 'asc' }
    });
    
    currencies.forEach(currency => {
      console.log(`${currency.code}: ${currency.rate} (${currency.enabled ? 'Enabled' : 'Disabled'})`);
    });
    
    console.log('\n=== Currency Settings ===');
    const settings = await prisma.currencySettings.findFirst();
    if (settings) {
      console.log(`Default Currency: ${settings.defaultCurrency}`);
      console.log(`Display Decimals: ${settings.displayDecimals}`);
      console.log(`Currency Position: ${settings.currencyPosition}`);
    } else {
      console.log('No currency settings found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrencies();
