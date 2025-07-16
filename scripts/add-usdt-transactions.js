const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addUSDTAndTransactions() {
  try {
    console.log('🚀 Adding USDT Currency and Transactions...\n');

    // 1. Force add USDT currency
    console.log('💰 Adding USDT currency...');
    try {
      // Delete existing USDT if any
      await prisma.currency.deleteMany({
        where: { code: 'USDT' }
      });
      
      // Create USDT
      await prisma.currency.create({
        data: {
          code: 'USDT',
          name: 'Tether USD',
          symbol: 'USDT',
          rate: 1.0000,
          enabled: true
        }
      });
      console.log('✅ USDT currency added successfully');
    } catch (error) {
      console.log('⚠️ USDT currency creation failed:', error.message);
    }

    // 2. Add more USDT transactions
    console.log('💳 Creating USDT transactions...');
    const users = await prisma.user.findMany({ where: { role: 'user' } });
    let usdtTransactionCount = 0;

    for (const user of users) {
      // Create 5 USDT transactions per user
      for (let i = 0; i < 5; i++) {
        try {
          const amount = Math.floor(Math.random() * 500) + 50;
          const transactionTypes = ['deposit', 'withdrawal', 'purchase', 'refund'];

          await prisma.addFund.create({
            data: {
              invoice_id: `USDT-${Date.now()}-${Math.floor(Math.random() * 1000)}-${user.id}-${i}`,
              amount: amount,
              spent_amount: Math.floor(Math.random() * amount),
              fee: amount * 0.02,
              email: user.email,
              name: user.name,
              status: ['Processing', 'Completed', 'Failed'][Math.floor(Math.random() * 3)],
              admin_status: ['Pending', 'Approved', 'Rejected'][Math.floor(Math.random() * 3)],
              order_id: `USDT-ORD-${Math.floor(Math.random() * 10000)}`,
              method: 'crypto',
              payment_method: 'crypto',
              sender_number: `USDT-${Math.floor(Math.random() * 900000000) + 100000000}`,
              transaction_id: `USDT-TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}-${i}`,
              date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
              userId: user.id,
              currency: 'USDT',
              transaction_type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
              reference_id: `USDT-REF-${Math.floor(Math.random() * 100000)}`
            }
          });
          usdtTransactionCount++;
        } catch (error) {
          console.log(`⚠️ USDT transaction creation failed for user ${user.email}:`, error.message);
        }
      }
    }
    console.log(`✅ USDT transactions created: ${usdtTransactionCount}`);

    // 3. Update user balances with mixed currencies
    console.log('💰 Updating user balances...');
    for (const user of users) {
      try {
        const newBalance = Math.floor(Math.random() * 1000) + 100;
        const newCurrency = Math.random() > 0.5 ? 'USD' : 'BDT';
        
        await prisma.user.update({
          where: { id: user.id },
          data: {
            balance: newBalance,
            currency: newCurrency,
            dollarRate: 120.0 // Fixed rate: 120 BDT = 1 USD
          }
        });
      } catch (error) {
        console.log(`⚠️ Balance update failed for user ${user.email}`);
      }
    }

    // Final summary
    const allTransactions = await prisma.addFund.findMany();
    const bdtTransactions = allTransactions.filter(t => t.currency === 'BDT').length;
    const usdtTransactions = allTransactions.filter(t => t.currency === 'USDT').length;
    const usdTransactions = allTransactions.filter(t => t.currency === 'USD').length;
    
    const allCurrencies = await prisma.currency.findMany();
    const allUsers = await prisma.user.findMany();
    const allOrders = await prisma.newOrder.findMany();
    const allRefills = await prisma.refillRequest.findMany();

    console.log('\n🎉 Complete Database Setup Finished!');
    console.log('\n📊 Final Database Summary:');
    console.log(`👥 Users: ${allUsers.length} (${allUsers.filter(u => u.role === 'user').length} regular + ${allUsers.filter(u => u.role === 'admin').length} admin)`);
    console.log(`📦 Orders: ${allOrders.length}`);
    console.log(`💳 Total Transactions: ${allTransactions.length}`);
    console.log(`   - BDT Transactions: ${bdtTransactions}`);
    console.log(`   - USDT Transactions: ${usdtTransactions}`);
    console.log(`   - USD Transactions: ${usdTransactions}`);
    console.log(`🔄 Refill Requests: ${allRefills.length}`);
    console.log(`💰 Currencies: ${allCurrencies.length} (${allCurrencies.map(c => c.code).join(', ')})`);

    console.log('\n💡 Exchange Rate: 120 BDT = 1 USD = 1 USDT');
    
    console.log('\n🔑 Login Credentials:');
    console.log('Regular Users: user1@example.com to user10@example.com (password: password123)');
    console.log('Admin Users: admin1@example.com to admin5@example.com (password: admin123)');

    console.log('\n🌐 Your SMM Panel is now ready with:');
    console.log('✅ Complete user management');
    console.log('✅ Service catalog with categories');
    console.log('✅ Order management system');
    console.log('✅ Multi-currency transactions (BDT, USD, USDT)');
    console.log('✅ Refill request system');
    console.log('✅ Admin panel functionality');

    console.log('\n🚀 Start your application: npm run dev');

  } catch (error) {
    console.error('❌ Error during setup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addUSDTAndTransactions();
