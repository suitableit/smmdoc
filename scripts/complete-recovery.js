const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting complete database recovery...');

  try {
    // Step 1: Create Admin User
    console.log('👤 Creating admin user...');
    let adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'admin',
          emailVerified: new Date(),
          currency: 'USD',
          balance: 1000.0,
        }
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Step 2: Create Test User
    console.log('👤 Creating test user...');
    let testUser = await prisma.user.findFirst({
      where: { email: 'user@example.com' }
    });

    if (!testUser) {
      const hashedPassword = await bcrypt.hash('user123', 10);
      testUser = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'user@example.com',
          password: hashedPassword,
          role: 'user',
          emailVerified: new Date(),
          currency: 'USD',
          balance: 100.0,
        }
      });
      console.log('✅ Test user created');
    } else {
      console.log('✅ Test user already exists');
    }

    // Step 3: Create Service Types
    console.log('🏷️ Creating service types...');
    const serviceTypes = [
      { name: 'Standard', description: 'Standard quality service' },
      { name: 'Premium', description: 'Premium quality service' },
      { name: 'High Quality', description: 'High quality service' },
      { name: 'Fast Delivery', description: 'Fast delivery service' },
      { name: 'Real Users', description: 'Real users service' }
    ];

    const createdServiceTypes = {};
    for (const serviceType of serviceTypes) {
      let existing = await prisma.serviceType.findFirst({
        where: { name: serviceType.name }
      });

      if (!existing) {
        existing = await prisma.serviceType.create({
          data: serviceType
        });
        console.log(`✅ Created service type: ${serviceType.name}`);
      } else {
        console.log(`⏭️ Service type already exists: ${serviceType.name}`);
      }
      createdServiceTypes[serviceType.name] = existing.id;
    }

    // Step 4: Create Categories
    console.log('📂 Creating categories...');
    const categories = [
      { category_name: 'Instagram Followers' },
      { category_name: 'Instagram Likes' },
      { category_name: 'Instagram Views' },
      { category_name: 'Facebook Likes' },
      { category_name: 'Facebook Followers' },
      { category_name: 'YouTube Subscribers' },
      { category_name: 'YouTube Views' },
      { category_name: 'TikTok Followers' },
      { category_name: 'TikTok Likes' },
      { category_name: 'Twitter Followers' },
    ];

    const createdCategories = {};
    for (const category of categories) {
      let existing = await prisma.category.findFirst({
        where: { category_name: category.category_name }
      });

      if (!existing) {
        existing = await prisma.category.create({
          data: {
            category_name: category.category_name,
            userId: adminUser.id,
            position: 'bottom',
            hideCategory: 'no'
          }
        });
        console.log(`✅ Created category: ${category.category_name}`);
      } else {
        console.log(`⏭️ Category already exists: ${category.category_name}`);
      }
      createdCategories[category.category_name] = existing.id;
    }

    // Step 5: Create Services
    console.log('🛠️ Creating services...');
    const services = [
      {
        name: 'Instagram Followers - High Quality',
        description: 'Premium Instagram followers with real accounts and gradual delivery',
        rate: 2.5,
        min_order: 100,
        max_order: 10000,
        perqty: 1000,
        avg_time: '1-3 days',
        categoryName: 'Instagram Followers',
        serviceTypeName: 'High Quality',
        refill: false,
        cancel: false,
        serviceSpeed: 'medium',
        mode: 'manual'
      },
      {
        name: 'Instagram Followers - Premium',
        description: 'High-quality Instagram followers with lifetime guarantee',
        rate: 4.0,
        min_order: 50,
        max_order: 5000,
        perqty: 1000,
        avg_time: '2-4 days',
        categoryName: 'Instagram Followers',
        serviceTypeName: 'Premium',
        refill: true,
        cancel: false,
        serviceSpeed: 'medium',
        mode: 'manual'
      },
      {
        name: 'Instagram Likes - Fast Delivery',
        description: 'Quick Instagram likes delivery within hours',
        rate: 1.2,
        min_order: 100,
        max_order: 50000,
        perqty: 1000,
        avg_time: '0-1 hours',
        categoryName: 'Instagram Likes',
        serviceTypeName: 'Fast Delivery',
        refill: false,
        cancel: true,
        serviceSpeed: 'fast',
        mode: 'auto'
      },
      {
        name: 'Instagram Likes - Real Users',
        description: 'Instagram likes from real active users',
        rate: 2.0,
        min_order: 50,
        max_order: 20000,
        perqty: 1000,
        avg_time: '1-2 hours',
        categoryName: 'Instagram Likes',
        serviceTypeName: 'Real Users',
        refill: true,
        cancel: true,
        serviceSpeed: 'medium',
        mode: 'manual'
      },
      {
        name: 'Instagram Video Views',
        description: 'High-quality Instagram video views',
        rate: 0.8,
        min_order: 1000,
        max_order: 100000,
        perqty: 1000,
        avg_time: '0-6 hours',
        categoryName: 'Instagram Views',
        serviceTypeName: 'Standard',
        refill: false,
        cancel: true,
        serviceSpeed: 'fast',
        mode: 'auto'
      },
      {
        name: 'Facebook Page Likes',
        description: 'Real Facebook page likes from active users',
        rate: 3.5,
        min_order: 100,
        max_order: 10000,
        perqty: 1000,
        avg_time: '1-3 days',
        categoryName: 'Facebook Likes',
        serviceTypeName: 'Standard',
        refill: true,
        cancel: false,
        serviceSpeed: 'medium',
        mode: 'manual'
      },
      {
        name: 'Facebook Post Likes',
        description: 'Facebook post likes for better engagement',
        rate: 1.8,
        min_order: 50,
        max_order: 25000,
        perqty: 1000,
        avg_time: '0-12 hours',
        categoryName: 'Facebook Likes',
        serviceTypeName: 'Standard',
        refill: false,
        cancel: true,
        serviceSpeed: 'fast',
        mode: 'auto'
      },
      {
        name: 'Facebook Profile Followers',
        description: 'Facebook profile followers from real accounts',
        rate: 4.2,
        min_order: 100,
        max_order: 8000,
        perqty: 1000,
        avg_time: '1-2 days',
        categoryName: 'Facebook Followers',
        serviceTypeName: 'Standard',
        refill: true,
        cancel: false,
        serviceSpeed: 'medium',
        mode: 'manual'
      },
      {
        name: 'YouTube Views - High Retention',
        description: 'YouTube views with high retention rate',
        rate: 1.5,
        min_order: 1000,
        max_order: 1000000,
        perqty: 1000,
        avg_time: '0-12 hours',
        categoryName: 'YouTube Views',
        serviceTypeName: 'High Quality',
        refill: false,
        cancel: true,
        serviceSpeed: 'medium',
        mode: 'auto'
      },
      {
        name: 'YouTube Views - Fast Start',
        description: 'YouTube views with instant start',
        rate: 0.9,
        min_order: 500,
        max_order: 500000,
        perqty: 1000,
        avg_time: '0-1 hours',
        categoryName: 'YouTube Views',
        serviceTypeName: 'Fast Delivery',
        refill: false,
        cancel: true,
        serviceSpeed: 'fast',
        mode: 'auto'
      },
      {
        name: 'YouTube Subscribers - Real',
        description: 'Real YouTube subscribers with lifetime guarantee',
        rate: 15.0,
        min_order: 50,
        max_order: 5000,
        perqty: 1000,
        avg_time: '1-7 days',
        categoryName: 'YouTube Subscribers',
        serviceTypeName: 'Real Users',
        refill: true,
        cancel: false,
        serviceSpeed: 'slow',
        mode: 'manual'
      },
      {
        name: 'TikTok Followers - Premium',
        description: 'High-quality TikTok followers with fast delivery',
        rate: 6.5,
        min_order: 50,
        max_order: 10000,
        perqty: 1000,
        avg_time: '0-24 hours',
        categoryName: 'TikTok Followers',
        serviceTypeName: 'Premium',
        refill: true,
        cancel: true,
        serviceSpeed: 'fast',
        mode: 'auto'
      },
      {
        name: 'TikTok Likes - Fast Delivery',
        description: 'Quick TikTok likes with instant start',
        rate: 1.4,
        min_order: 100,
        max_order: 100000,
        perqty: 1000,
        avg_time: '0-1 hours',
        categoryName: 'TikTok Likes',
        serviceTypeName: 'Fast Delivery',
        refill: false,
        cancel: true,
        serviceSpeed: 'fast',
        mode: 'auto'
      },
      {
        name: 'Twitter Followers - Real Users',
        description: 'Real Twitter followers from active accounts',
        rate: 8.0,
        min_order: 100,
        max_order: 15000,
        perqty: 1000,
        avg_time: '1-3 days',
        categoryName: 'Twitter Followers',
        serviceTypeName: 'Real Users',
        refill: true,
        cancel: false,
        serviceSpeed: 'medium',
        mode: 'manual'
      }
    ];

    for (const service of services) {
      try {
        const categoryId = createdCategories[service.categoryName];
        const serviceTypeId = createdServiceTypes[service.serviceTypeName];
        
        if (!categoryId) {
          console.log(`⚠️ Category not found for service: ${service.name}`);
          continue;
        }

        const existing = await prisma.service.findFirst({
          where: { name: service.name }
        });

        if (!existing) {
          await prisma.service.create({
            data: {
              name: service.name,
              description: service.description,
              rate: service.rate,
              min_order: service.min_order,
              max_order: service.max_order,
              perqty: service.perqty,
              avg_time: service.avg_time,
              categoryId: categoryId,
              serviceTypeId: serviceTypeId,
              userId: adminUser.id,
              refill: service.refill,
              cancel: service.cancel,
              serviceSpeed: service.serviceSpeed,
              mode: service.mode,
              status: 'active'
            }
          });
          console.log(`✅ Created service: ${service.name}`);
        } else {
          console.log(`⏭️ Service already exists: ${service.name}`);
        }
      } catch (error) {
        console.error(`❌ Error creating service ${service.name}:`, error);
      }
    }

    console.log('🎉 Complete database recovery finished!');
    console.log(`📊 Summary:`);
    console.log(`   - Users: 2 (1 admin, 1 test user)`);
    console.log(`   - Service Types: ${serviceTypes.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Services: ${services.length}`);

  } catch (error) {
    console.error('❌ Recovery failed:', error);
  }
}

main()
  .catch((e) => {
    console.error('❌ Recovery failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
