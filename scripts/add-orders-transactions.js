const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addOrdersAndTransactions() {
  try {
    console.log('🚀 Adding Orders and Transactions...\n');

    // Get all data
    const users = await prisma.user.findMany({ where: { role: 'user' } });
    const services = await prisma.service.findMany();
    const categories = await prisma.category.findMany();
    const adminUsers = await prisma.user.findMany({ where: { role: 'admin' } });

    if (users.length === 0 || services.length === 0 || categories.length === 0) {
      console.log('❌ Please run full-database-setup.js first!');
      return;
    }

    // 1. Create Orders (10 per user = 100 total)
    console.log('📦 Creating orders...');
    let orderCount = 0;

    for (const user of users) {
      for (let i = 0; i < 10; i++) {
        try {
          const service = services[Math.floor(Math.random() * services.length)];
          const category = categories.find(cat => cat.id === service.categoryId);
          const qty = Math.floor(Math.random() * 1000) + 100;
          const usdPrice = service.rate * (qty / 1000);
          const bdtPrice = usdPrice * user.dollarRate;

          await prisma.newOrder.create({
            data: {
              categoryId: category.id,
              serviceId: service.id,
              userId: user.id,
              link: `https://example.com/profile${Math.floor(Math.random() * 1000)}`,
              qty: qty,
              price: usdPrice,
              avg_time: service.avg_time,
              status: ['pending', 'processing', 'completed', 'cancelled'][Math.floor(Math.random() * 4)],
              remains: Math.floor(Math.random() * qty),
              startCount: Math.floor(Math.random() * 1000),
              bdtPrice: bdtPrice,
              currency: user.currency,
              usdPrice: usdPrice,
              charge: usdPrice * 0.05,
              profit: usdPrice * 0.1
            }
          });
          orderCount++;
        } catch (error) {
          console.log(`⚠️ Order creation skipped for user ${user.email}`);
        }
      }
    }
    console.log(`✅ Orders created: ${orderCount}`);

    // 2. Create Transactions (10 per user = 100 total)
    console.log('💳 Creating transactions...');
    let transactionCount = 0;

    for (const user of users) {
      for (let i = 0; i < 10; i++) {
        try {
          const currencies = ['BDT', 'USDT'];
          const currency = currencies[Math.floor(Math.random() * currencies.length)];
          const amount = Math.floor(Math.random() * 500) + 50;
          const transactionTypes = ['deposit', 'withdrawal', 'purchase', 'refund'];

          await prisma.addFund.create({
            data: {
              invoice_id: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}-${i}`,
              amount: amount,
              spent_amount: Math.floor(Math.random() * amount),
              fee: amount * 0.02,
              email: user.email,
              name: user.name,
              status: ['Processing', 'Completed', 'Failed'][Math.floor(Math.random() * 3)],
              admin_status: ['Pending', 'Approved', 'Rejected'][Math.floor(Math.random() * 3)],
              order_id: `ORD-${Math.floor(Math.random() * 10000)}`,
              method: ['bkash', 'nagad', 'rocket', 'bank'][Math.floor(Math.random() * 4)],
              payment_method: currency === 'USDT' ? 'crypto' : 'mobile_banking',
              sender_number: `+8801${Math.floor(Math.random() * 900000000) + 100000000}`,
              transaction_id: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}-${i}`,
              date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
              userId: user.id,
              currency: currency,
              transaction_type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
              reference_id: `REF-${Math.floor(Math.random() * 100000)}`
            }
          });
          transactionCount++;
        } catch (error) {
          console.log(`⚠️ Transaction creation skipped for user ${user.email}`);
        }
      }
    }
    console.log(`✅ Transactions created: ${transactionCount}`);

    // 3. Create Refill Requests (3 per user = 30 total)
    console.log('🔄 Creating refill requests...');
    let refillCount = 0;

    const orders = await prisma.newOrder.findMany();
    
    for (const user of users) {
      const userOrders = orders.filter(order => order.userId === user.id);
      
      for (let i = 0; i < 3 && i < userOrders.length; i++) {
        try {
          const order = userOrders[i];
          const reasons = [
            'Followers dropped significantly',
            'Views not delivered completely',
            'Quality not as expected',
            'Delivery was too slow',
            'Account got suspended'
          ];

          await prisma.refillRequest.create({
            data: {
              orderId: order.id,
              userId: user.id,
              reason: reasons[Math.floor(Math.random() * reasons.length)],
              status: ['pending', 'approved', 'rejected', 'completed'][Math.floor(Math.random() * 4)],
              adminNotes: Math.random() > 0.5 ? 'Request reviewed and processed' : null,
              processedBy: Math.random() > 0.5 ? adminUsers[Math.floor(Math.random() * adminUsers.length)].id : null,
              processedAt: Math.random() > 0.5 ? new Date() : null
            }
          });
          refillCount++;
        } catch (error) {
          console.log(`⚠️ Refill request creation skipped for user ${user.email}`);
        }
      }
    }
    console.log(`✅ Refill requests created: ${refillCount}`);

    // Final summary
    const finalOrders = await prisma.newOrder.findMany();
    const finalTransactions = await prisma.addFund.findMany();
    const finalRefills = await prisma.refillRequest.findMany();

    console.log('\n🎉 Orders and Transactions Added Successfully!');
    console.log('\n📊 Final Summary:');
    console.log(`📦 Orders: ${finalOrders.length}`);
    console.log(`💳 Transactions: ${finalTransactions.length}`);
    console.log(`🔄 Refill Requests: ${finalRefills.length}`);

    console.log('\n💰 Currency Distribution:');
    const bdtTransactions = finalTransactions.filter(t => t.currency === 'BDT').length;
    const usdtTransactions = finalTransactions.filter(t => t.currency === 'USDT').length;
    console.log(`BDT Transactions: ${bdtTransactions}`);
    console.log(`USDT Transactions: ${usdtTransactions}`);

    console.log('\n🌐 Database is now fully populated with real data!');
    console.log('Ready for testing all features.');

  } catch (error) {
    console.error('❌ Error during setup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addOrdersAndTransactions();
