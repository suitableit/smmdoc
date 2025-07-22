const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testServicePriceDisplay() {
  try {
    console.log('=== Testing Service Price Display ===');
    
    // Get currency rates
    const currencies = await prisma.currency.findMany({
      where: { enabled: true },
      orderBy: { code: 'asc' }
    });
    
    const usdRate = currencies.find(c => c.code === 'USD')?.rate || 1;
    const bdtRate = currencies.find(c => c.code === 'BDT')?.rate || 120;
    
    console.log(`USD Rate: ${usdRate}`);
    console.log(`BDT Rate: ${bdtRate}`);
    console.log(`1 USD = ${bdtRate / usdRate} BDT`);
    
    // Get sample services
    const services = await prisma.service.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        rate: true,
        rateUSD: true
      }
    });
    
    console.log('\n=== Service Price Analysis ===');
    services.forEach(service => {
      const storedRate = service.rate; // This should be USD
      const convertedToBDT = storedRate * (bdtRate / usdRate);
      
      console.log(`\nService: ${service.name}`);
      console.log(`  Stored Rate: ${storedRate} (should be USD)`);
      console.log(`  If USD -> BDT: ৳${convertedToBDT.toFixed(2)}`);
      console.log(`  If BDT -> USD: $${(storedRate / (bdtRate / usdRate)).toFixed(4)}`);
      
      // Check if rate seems to be in USD or BDT
      if (storedRate < 50) {
        console.log(`  ✅ Likely USD (reasonable USD price)`);
      } else {
        console.log(`  ⚠️  Might be BDT (high for USD)`);
      }
    });
    
    console.log('\n=== Expected Behavior ===');
    console.log('1. Service rates stored in USD in database');
    console.log('2. PriceDisplay component converts USD to user currency');
    console.log('3. If user currency is BDT: $8.55 USD -> ৳1026 BDT');
    console.log('4. If user currency is USD: $8.55 USD -> $8.55 USD');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testServicePriceDisplay();
