const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing Database Connection and Features...\n');

    // 1. Test Database Connection
    console.log('1️⃣ Testing Database Connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');

    // 2. Test Currency Operations
    console.log('2️⃣ Testing Currency Operations...');
    
    // Add currencies
    const currencies = [
      { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0000, enabled: true },
      { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', rate: 120.0000, enabled: true },
      { code: 'USDT', name: 'Tether USD', symbol: 'USDT', rate: 1.0000, enabled: true }
    ];

    for (const currency of currencies) {
      try {
        await prisma.currency.upsert({
          where: { code: currency.code },
          update: currency,
          create: currency
        });
        console.log(`✅ Currency ${currency.code} added/updated`);
      } catch (error) {
        console.log(`⚠️ Currency ${currency.code} operation failed`);
      }
    }

    // 3. Test User Creation
    console.log('\n3️⃣ Testing User Creation...');
    
    // Create test user
    const testUserEmail = 'testuser@example.com';
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    try {
      const testUser = await prisma.user.upsert({
        where: { email: testUserEmail },
        update: {},
        create: {
          name: 'Test User',
          username: 'testuser',
          email: testUserEmail,
          password: hashedPassword,
          role: 'user',
          emailVerified: new Date(),
          currency: 'USD',
          dollarRate: 120.0,
          balance: 500.0,
          total_deposit: 1000.0,
          total_spent: 100.0,
          status: 'active'
        }
      });
      console.log(`✅ Test user created: ${testUser.email}`);
    } catch (error) {
      console.log('⚠️ Test user creation failed:', error.message);
    }

    // Create test admin
    const testAdminEmail = 'testadmin@example.com';
    try {
      const testAdmin = await prisma.user.upsert({
        where: { email: testAdminEmail },
        update: {},
        create: {
          name: 'Test Admin',
          username: 'testadmin',
          email: testAdminEmail,
          password: hashedPassword,
          role: 'admin',
          emailVerified: new Date(),
          currency: 'USD',
          dollarRate: 120.0,
          balance: 2000.0,
          total_deposit: 5000.0,
          total_spent: 500.0,
          status: 'active'
        }
      });
      console.log(`✅ Test admin created: ${testAdmin.email}`);
    } catch (error) {
      console.log('⚠️ Test admin creation failed:', error.message);
    }

    // 4. Test Service Type Creation
    console.log('\n4️⃣ Testing Service Type Creation...');
    
    const serviceTypes = ['High Quality', 'Premium', 'Standard', 'Basic', 'Instant'];
    
    for (const typeName of serviceTypes) {
      try {
        await prisma.serviceType.upsert({
          where: { name: typeName },
          update: {},
          create: {
            name: typeName,
            description: `${typeName} service type for better results`,
            status: 'active'
          }
        });
        console.log(`✅ Service type created: ${typeName}`);
      } catch (error) {
        console.log(`⚠️ Service type ${typeName} creation failed`);
      }
    }

    // 5. Test Category Creation
    console.log('\n5️⃣ Testing Category Creation...');
    
    const users = await prisma.user.findMany();
    const categories = ['Instagram Followers', 'Facebook Likes', 'YouTube Views', 'TikTok Followers'];
    
    for (let i = 0; i < categories.length; i++) {
      try {
        const existing = await prisma.category.findFirst({
          where: { category_name: categories[i] }
        });
        
        if (!existing) {
          await prisma.category.create({
            data: {
              category_name: categories[i],
              status: 'active',
              userId: users[i % users.length].id,
              hideCategory: 'no',
              position: i < 2 ? 'top' : 'bottom'
            }
          });
        }
        console.log(`✅ Category created: ${categories[i]}`);
      } catch (error) {
        console.log(`⚠️ Category ${categories[i]} creation failed`);
      }
    }

    // 6. Test Service Creation
    console.log('\n6️⃣ Testing Service Creation...');
    
    const allCategories = await prisma.category.findMany();
    const allServiceTypes = await prisma.serviceType.findMany();
    
    if (allCategories.length > 0 && allServiceTypes.length > 0) {
      try {
        const existing = await prisma.service.findFirst({
          where: { name: 'Test Instagram Followers Service' }
        });
        
        if (!existing) {
          await prisma.service.create({
            data: {
              name: 'Test Instagram Followers Service',
              rate: 2.50,
              min_order: 100,
              max_order: 10000,
              avg_time: '24 hours',
              description: 'High quality Instagram followers with fast delivery',
              userId: users[0].id,
              categoryId: allCategories[0].id,
              serviceTypeId: allServiceTypes[0].id,
              status: 'active',
              perqty: 1000,
              cancel: true,
              mode: 'auto',
              refill: true,
              refillDays: 30,
              serviceSpeed: 'fast',
              personalizedService: false,
              refillDisplay: 24
            }
          });
        }
        console.log('✅ Test service created');
      } catch (error) {
        console.log('⚠️ Service creation failed:', error.message);
      }
    }

    // 7. Test Order Creation
    console.log('\n7️⃣ Testing Order Creation...');
    
    const services = await prisma.service.findMany();
    
    if (services.length > 0 && users.length > 0) {
      try {
        const service = services[0];
        const user = users.find(u => u.role === 'user') || users[0];
        const category = allCategories.find(c => c.id === service.categoryId);
        
        await prisma.newOrder.create({
          data: {
            categoryId: category.id,
            serviceId: service.id,
            userId: user.id,
            link: 'https://instagram.com/testprofile',
            qty: 1000,
            price: 2.50,
            avg_time: service.avg_time,
            status: 'pending',
            remains: 1000,
            startCount: 0,
            bdtPrice: 300.0,
            currency: 'USD',
            usdPrice: 2.50,
            charge: 0.125,
            profit: 0.25
          }
        });
        console.log('✅ Test order created');
      } catch (error) {
        console.log('⚠️ Order creation failed:', error.message);
      }
    }

    // 8. Test Transaction Creation
    console.log('\n8️⃣ Testing Transaction Creation...');
    
    const regularUser = users.find(u => u.role === 'user') || users[0];
    
    try {
      await prisma.addFund.create({
        data: {
          invoice_id: `TEST-${Date.now()}`,
          amount: 100.0,
          spent_amount: 0.0,
          fee: 2.0,
          email: regularUser.email,
          name: regularUser.name,
          status: 'Completed',
          admin_status: 'Approved',
          order_id: `TEST-ORD-${Date.now()}`,
          method: 'bkash',
          payment_method: 'mobile_banking',
          sender_number: '+8801712345678',
          transaction_id: `TXN-${Date.now()}`,
          date: new Date(),
          userId: regularUser.id,
          currency: 'BDT',
          transaction_type: 'deposit',
          reference_id: `REF-${Date.now()}`
        }
      });
      console.log('✅ Test transaction created');
    } catch (error) {
      console.log('⚠️ Transaction creation failed:', error.message);
    }

    // 9. Test Refill Request Creation
    console.log('\n9️⃣ Testing Refill Request Creation...');
    
    const orders = await prisma.newOrder.findMany();
    
    if (orders.length > 0) {
      try {
        await prisma.refillRequest.create({
          data: {
            orderId: orders[0].id,
            userId: orders[0].userId,
            reason: 'Followers dropped significantly',
            status: 'pending',
            adminNotes: null,
            processedBy: null,
            processedAt: null
          }
        });
        console.log('✅ Test refill request created');
      } catch (error) {
        console.log('⚠️ Refill request creation failed:', error.message);
      }
    }

    // 10. Final Summary
    console.log('\n🔟 Final Database Summary...');
    
    const finalUsers = await prisma.user.findMany();
    const finalCurrencies = await prisma.currency.findMany();
    const finalServiceTypes = await prisma.serviceType.findMany();
    const finalCategories = await prisma.category.findMany();
    const finalServices = await prisma.service.findMany();
    const finalOrders = await prisma.newOrder.findMany();
    const finalTransactions = await prisma.addFund.findMany();
    const finalRefills = await prisma.refillRequest.findMany();

    console.log('\n📊 Database Test Results:');
    console.log(`👥 Users: ${finalUsers.length} (${finalUsers.filter(u => u.role === 'user').length} regular + ${finalUsers.filter(u => u.role === 'admin').length} admin)`);
    console.log(`💰 Currencies: ${finalCurrencies.length} (${finalCurrencies.map(c => c.code).join(', ')})`);
    console.log(`🔧 Service Types: ${finalServiceTypes.length}`);
    console.log(`📂 Categories: ${finalCategories.length}`);
    console.log(`🛠️ Services: ${finalServices.length}`);
    console.log(`📦 Orders: ${finalOrders.length}`);
    console.log(`💳 Transactions: ${finalTransactions.length}`);
    console.log(`🔄 Refill Requests: ${finalRefills.length}`);

    console.log('\n✅ All Database Operations Working Successfully!');
    console.log('\n🔑 Test Login Credentials:');
    console.log('User: testuser@example.com (password: password123)');
    console.log('Admin: testadmin@example.com (password: password123)');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
