const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserBalance() {
  try {
    console.log('=== Checking User Balance ===');
    
    // Get first few users with their balance
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        username: true,
        email: true,
        balance: true,
        balanceUSD: true,
        currency: true,
        dollarRate: true
      }
    });
    
    console.log('Users found:', users.length);
    
    users.forEach(user => {
      console.log(`\nUser ID: ${user.id}`);
      console.log(`Username: ${user.username || 'N/A'}`);
      console.log(`Email: ${user.email || 'N/A'}`);
      console.log(`Balance: ${user.balance}`);
      console.log(`Balance USD: ${user.balanceUSD}`);
      console.log(`Currency: ${user.currency}`);
      console.log(`Dollar Rate: ${user.dollarRate}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserBalance();
