const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBalanceDisplay() {
  try {
    console.log('=== Testing Balance Display Logic ===');
    
    // Get user with balance
    const user = await prisma.user.findFirst({
      where: {
        balance: {
          gt: 0
        }
      },
      select: {
        id: true,
        username: true,
        balance: true,
        currency: true,
        dollarRate: true
      }
    });
    
    if (!user) {
      console.log('No user with balance found');
      return;
    }
    
    console.log('\n=== User Data ===');
    console.log(`User: ${user.username}`);
    console.log(`Balance: ${user.balance}`);
    console.log(`Stored Currency: ${user.currency}`);
    console.log(`Dollar Rate: ${user.dollarRate}`);
    
    // Get available currencies
    const currencies = await prisma.currency.findMany({
      where: { enabled: true },
      select: {
        code: true,
        name: true,
        symbol: true,
        rate: true
      }
    });
    
    console.log('\n=== Available Currencies ===');
    currencies.forEach(curr => {
      console.log(`${curr.code}: ${curr.symbol} (Rate: ${curr.rate})`);
    });
    
    // Test conversion logic
    console.log('\n=== Balance Display Test ===');
    
    currencies.forEach(displayCurrency => {
      let convertedAmount = user.balance;
      const userStoredCurrency = user.currency;
      
      if (displayCurrency.code === userStoredCurrency) {
        // Same currency, no conversion needed
        convertedAmount = user.balance;
      } else {
        // Convert between currencies
        const storedCurrencyData = currencies.find(c => c.code === userStoredCurrency);
        
        if (storedCurrencyData) {
          if (userStoredCurrency === 'USD') {
            // Convert from USD to target currency
            convertedAmount = user.balance * Number(displayCurrency.rate);
          } else if (displayCurrency.code === 'USD') {
            // Convert from stored currency to USD
            convertedAmount = user.balance / Number(storedCurrencyData.rate);
          } else {
            // Convert between two non-USD currencies (via USD)
            const usdAmount = user.balance / Number(storedCurrencyData.rate);
            convertedAmount = usdAmount * Number(displayCurrency.rate);
          }
        }
      }
      
      console.log(`Display as ${displayCurrency.code}: ${displayCurrency.symbol}${convertedAmount.toFixed(2)}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBalanceDisplay();
