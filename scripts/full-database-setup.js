const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Sample data
const userNames = [
  'আহমেদ হাসান', 'ফাতিমা খাতুন', 'মোহাম্মদ রহিম', 'আয়েশা বেগম', 'করিম উদ্দিন',
  'সালমা আক্তার', 'রফিক আহমেদ', 'নাসরিন সুলতানা', 'জাহিদ হোসেন', 'রুমানা পারভীন'
];

const adminNames = [
  'সুপার এডমিন', 'মোডারেটর ওয়ান', 'সাপোর্ট এডমিন', 'ফিন্যান্স এডমিন', 'টেক এডমিন'
];

const categoryNames = [
  'Instagram Followers', 'Facebook Likes', 'YouTube Views', 'TikTok Followers', 'Twitter Followers',
  'LinkedIn Connections', 'Telegram Members', 'Discord Members', 'Spotify Plays', 'SoundCloud Plays'
];

const serviceTypeNames = [
  'High Quality', 'Premium', 'Standard', 'Basic', 'Instant',
  'Gradual', 'Targeted', 'Global', 'Organic', 'Bot'
];

async function fullDatabaseSetup() {
  try {
    console.log('🚀 Starting Full Database Setup...\n');

    // 1. Setup Currencies
    console.log('💰 Setting up currencies...');
    
    // Check and create currency settings
    const existingSettings = await prisma.currencySettings.findFirst();
    if (!existingSettings) {
      await prisma.currencySettings.create({
        data: {
          defaultCurrency: 'USD',
          displayDecimals: 2,
          currencyPosition: 'left',
          thousandsSeparator: ',',
          decimalSeparator: '.'
        }
      });
    }

    // Add USDT if missing
    const usdtExists = await prisma.currency.findUnique({ where: { code: 'USDT' } });
    if (!usdtExists) {
      try {
        await prisma.currency.upsert({
          where: { code: 'USDT' },
          update: {},
          create: {
            code: 'USDT',
            name: 'Tether USD',
            symbol: 'USDT',
            rate: 1.0000,
            enabled: true
          }
        });
        console.log('✅ USDT currency added');
      } catch (error) {
        console.log('⚠️ USDT currency setup skipped');
      }
    }

    // 2. Create Users (10 regular + 5 admin)
    console.log('👥 Creating users...');
    const allUsers = [];

    // Regular users
    for (let i = 0; i < 10; i++) {
      const email = `user${i + 1}@example.com`;
      try {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            name: userNames[i],
            username: `user${i + 1}`,
            email: email,
            password: hashedPassword,
            role: 'user',
            emailVerified: new Date(),
            currency: i % 2 === 0 ? 'USD' : 'BDT',
            dollarRate: 120.45,
            balance: Math.floor(Math.random() * 1000) + 100,
            total_deposit: Math.floor(Math.random() * 2000) + 500,
            total_spent: Math.floor(Math.random() * 500) + 50,
            status: 'active'
          }
        });
        allUsers.push(user);
      } catch (error) {
        console.log(`⚠️ User ${email} creation skipped`);
      }
    }

    // Admin users
    for (let i = 0; i < 5; i++) {
      const email = `admin${i + 1}@example.com`;
      try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            name: adminNames[i],
            username: `admin${i + 1}`,
            email: email,
            password: hashedPassword,
            role: 'admin',
            emailVerified: new Date(),
            currency: 'USD',
            dollarRate: 120.45,
            balance: Math.floor(Math.random() * 5000) + 1000,
            total_deposit: Math.floor(Math.random() * 10000) + 2000,
            total_spent: Math.floor(Math.random() * 1000) + 100,
            status: 'active'
          }
        });
        allUsers.push(admin);
      } catch (error) {
        console.log(`⚠️ Admin ${email} creation skipped`);
      }
    }

    // Get all users
    const users = await prisma.user.findMany();
    console.log(`✅ Users: ${users.length} total`);

    // 3. Create Service Types (10)
    console.log('🔧 Creating service types...');
    for (let i = 0; i < 10; i++) {
      try {
        await prisma.serviceType.upsert({
          where: { name: serviceTypeNames[i] },
          update: {},
          create: {
            name: serviceTypeNames[i],
            description: `${serviceTypeNames[i]} service type for better results`,
            status: 'active'
          }
        });
      } catch (error) {
        console.log(`⚠️ Service type ${serviceTypeNames[i]} creation skipped`);
      }
    }

    const serviceTypes = await prisma.serviceType.findMany();
    console.log(`✅ Service Types: ${serviceTypes.length} total`);

    // 4. Create Categories (10)
    console.log('📂 Creating categories...');
    for (let i = 0; i < 10; i++) {
      try {
        await prisma.category.upsert({
          where: { 
            category_name_userId: {
              category_name: categoryNames[i],
              userId: users[i % users.length].id
            }
          },
          update: {},
          create: {
            category_name: categoryNames[i],
            status: 'active',
            userId: users[i % users.length].id,
            hideCategory: 'no',
            position: i < 5 ? 'top' : 'bottom'
          }
        });
      } catch (error) {
        // If unique constraint doesn't exist, try simple create
        try {
          const existing = await prisma.category.findFirst({
            where: { category_name: categoryNames[i] }
          });
          if (!existing) {
            await prisma.category.create({
              data: {
                category_name: categoryNames[i],
                status: 'active',
                userId: users[i % users.length].id,
                hideCategory: 'no',
                position: i < 5 ? 'top' : 'bottom'
              }
            });
          }
        } catch (createError) {
          console.log(`⚠️ Category ${categoryNames[i]} creation skipped`);
        }
      }
    }

    const categories = await prisma.category.findMany();
    console.log(`✅ Categories: ${categories.length} total`);

    // 5. Create Services (15)
    console.log('🛠️ Creating services...');
    for (let i = 0; i < 15; i++) {
      const serviceName = `${categoryNames[i % 10]} - ${serviceTypeNames[i % 10]}`;
      try {
        const existing = await prisma.service.findFirst({
          where: { name: serviceName }
        });
        
        if (!existing) {
          await prisma.service.create({
            data: {
              name: serviceName,
              rate: parseFloat((Math.random() * 10 + 0.5).toFixed(2)),
              min_order: Math.floor(Math.random() * 100) + 10,
              max_order: Math.floor(Math.random() * 10000) + 1000,
              avg_time: `${Math.floor(Math.random() * 24) + 1} hours`,
              description: `High quality ${categoryNames[i % 10]} service with fast delivery`,
              userId: users[i % users.length].id,
              categoryId: categories[i % categories.length].id,
              serviceTypeId: serviceTypes[i % serviceTypes.length].id,
              status: 'active',
              perqty: 1000,
              cancel: Math.random() > 0.7,
              mode: Math.random() > 0.5 ? 'auto' : 'manual',
              refill: Math.random() > 0.6,
              refillDays: Math.floor(Math.random() * 30) + 7,
              serviceSpeed: ['slow', 'medium', 'fast'][Math.floor(Math.random() * 3)],
              personalizedService: Math.random() > 0.8,
              refillDisplay: Math.floor(Math.random() * 48) + 12
            }
          });
        }
      } catch (error) {
        console.log(`⚠️ Service ${serviceName} creation skipped`);
      }
    }

    const services = await prisma.service.findMany();
    console.log(`✅ Services: ${services.length} total`);

    // Final summary
    const finalUsers = await prisma.user.findMany();
    const finalServices = await prisma.service.findMany();
    const finalCategories = await prisma.category.findMany();
    const finalServiceTypes = await prisma.serviceType.findMany();
    const finalCurrencies = await prisma.currency.findMany();

    console.log('\n🎉 Full Database Setup Completed Successfully!');
    console.log('\n📊 Final Summary:');
    console.log(`👥 Users: ${finalUsers.length} (${finalUsers.filter(u => u.role === 'user').length} regular + ${finalUsers.filter(u => u.role === 'admin').length} admin)`);
    console.log(`🔧 Service Types: ${finalServiceTypes.length}`);
    console.log(`📂 Categories: ${finalCategories.length}`);
    console.log(`🛠️ Services: ${finalServices.length}`);
    console.log(`💰 Currencies: ${finalCurrencies.length} (${finalCurrencies.map(c => c.code).join(', ')})`);

    console.log('\n🔑 Login Credentials:');
    console.log('Regular Users: user1@example.com to user10@example.com (password: password123)');
    console.log('Admin Users: admin1@example.com to admin5@example.com (password: admin123)');

    console.log('\n🌐 Next Steps:');
    console.log('1. Start development server: npm run dev');
    console.log('2. Open http://localhost:3000');
    console.log('3. Login with sample credentials');
    console.log('4. Test all features!');

  } catch (error) {
    console.error('❌ Error during setup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fullDatabaseSetup();
