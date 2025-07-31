const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testOrderPrices() {
  try {
    console.log('=== Testing Order Prices ===');
    
    // Get some orders with prices
    const orders = await prisma.newOrder.findMany({
      take: 5,
      select: {
        id: true,
        price: true,
        usdPrice: true,
        bdtPrice: true,
        currency: true,
        user: {
          select: {
            username: true,
            currency: true
          }
        },
        service: {
          select: {
            name: true,
            rate: true
          }
        }
      }
    });
    
    console.log(`Found ${orders.length} orders`);
    
    // Get available currencies
    const currencies = await prisma.currency.findMany({
      where: { enabled: true },
      select: {
        code: true,
        symbol: true,
        rate: true
      }
    });
    
    console.log('\n=== Available Currencies ===');
    currencies.forEach(curr => {
      console.log(`${curr.code}: ${curr.symbol} (Rate: ${curr.rate})`);
    });
    
    console.log('\n=== Order Price Analysis ===');
    
    orders.forEach(order => {
      console.log(`\nOrder ID: ${order.id}`);
      console.log(`User: ${order.user.username} (Currency: ${order.user.currency})`);
      console.log(`Service: ${order.service.name} (Rate: $${order.service.rate}/1000)`);
      console.log(`Stored Prices:`);
      console.log(`  - price: ${order.price}`);
      console.log(`  - usdPrice: ${order.usdPrice}`);
      console.log(`  - bdtPrice: ${order.bdtPrice}`);
      console.log(`  - currency: ${order.currency}`);
      
      // Test display in different currencies
      console.log(`Display in different currencies:`);
      currencies.forEach(curr => {
        let displayAmount = 0;
        
        if (curr.code === 'USD') {
          displayAmount = order.usdPrice;
        } else if (curr.code === 'BDT') {
          displayAmount = order.bdtPrice;
        } else {
          // Convert from USD to other currency
          displayAmount = order.usdPrice * Number(curr.rate);
        }
        
        console.log(`  - ${curr.code}: ${curr.symbol}${displayAmount.toFixed(2)}`);
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testOrderPrices();
