const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCurrencyConversion() {
  try {
    console.log('=== Testing Currency Conversion ===');
    
    // Get current currency rates
    const currencies = await prisma.currency.findMany({
      where: { enabled: true },
      orderBy: { code: 'asc' }
    });
    
    console.log('\n=== Available Currencies ===');
    currencies.forEach(currency => {
      console.log(`${currency.code}: ${currency.rate} (${currency.symbol})`);
    });
    
    // Test USD to BDT conversion
    const usdData = currencies.find(c => c.code === 'USD');
    const bdtData = currencies.find(c => c.code === 'BDT');
    
    if (usdData && bdtData) {
      const usdToBdtRate = Number(bdtData.rate) / Number(usdData.rate);
      console.log(`\n=== USD to BDT Conversion ===`);
      console.log(`1 USD = ${usdToBdtRate} BDT`);
      console.log(`10 USD = ${(10 * usdToBdtRate).toFixed(2)} BDT`);
      console.log(`100 USD = ${(100 * usdToBdtRate).toFixed(2)} BDT`);
      
      console.log(`\n=== BDT to USD Conversion ===`);
      console.log(`120 BDT = ${(120 / usdToBdtRate).toFixed(2)} USD`);
      console.log(`1200 BDT = ${(1200 / usdToBdtRate).toFixed(2)} USD`);
      console.log(`12000 BDT = ${(12000 / usdToBdtRate).toFixed(2)} USD`);
    }
    
    // Test service price conversion
    console.log(`\n=== Service Price Test ===`);
    const sampleServices = await prisma.service.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        rate: true,
        rateUSD: true
      }
    });
    
    sampleServices.forEach(service => {
      const bdtPrice = service.rate;
      const usdPrice = service.rateUSD || (bdtData ? bdtPrice / Number(bdtData.rate) : bdtPrice / 120);
      console.log(`Service: ${service.name}`);
      console.log(`  BDT Price: ৳${bdtPrice}`);
      console.log(`  USD Price: $${usdPrice.toFixed(4)}`);
      console.log(`  Converted Back: ৳${(usdPrice * (bdtData ? Number(bdtData.rate) : 120)).toFixed(2)}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCurrencyConversion();
