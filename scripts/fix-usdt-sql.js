const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUSDT() {
  try {
    console.log('🚀 Fixing USDT Currency...\n');

    // Use raw SQL to check and fix USDT
    const result = await prisma.$executeRaw`
      INSERT INTO currencies (code, name, symbol, rate, enabled, createdAt, updatedAt)
      VALUES ('USDT', 'Tether USD', '₮', 1.0000, true, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
      enabled = true,
      name = 'Tether USD',
      symbol = '₮',
      rate = 1.0000,
      updatedAt = NOW()
    `;
    
    console.log('✅ USDT currency fixed/added');

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

fixUSDT();
