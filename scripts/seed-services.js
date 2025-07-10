const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Categories to create first
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

// Services data based on what was shown in the screenshot
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
    categoryName: 'Instagram Views',
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
    categoryName: 'Facebook Likes',
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
    categoryName: 'Facebook Followers',
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
    categoryName: 'Facebook Followers',
    refill: false,
    cancel: true,
    serviceSpeed: 'fast',
    mode: 'auto'
  },
  {
    name: 'Fb Follow',
    description: 'Facebook followers for your profile',
    rate: 1.55,
    min_order: 100,
    max_order: 10000,
    perqty: 1000,
    avg_time: '1-2 days',
    categoryName: 'Facebook Followers',
    refill: true,
    cancel: false,
    serviceSpeed: 'medium',
    mode: 'manual'
  },
  {
    name: 'TikTok Followers - High Quality',
    description: 'Premium TikTok followers with real accounts',
    rate: 3.8,
    min_order: 100,
    max_order: 20000,
    perqty: 1000,
    avg_time: '1-3 days',
    categoryName: 'YouTube Subscribers',
    refill: true,
    cancel: false,
    serviceSpeed: 'medium',
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
    categoryName: 'YouTube Views',
    refill: true,
    cancel: false,
    serviceSpeed: 'slow',
    mode: 'manual'
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
    refill: true,
    cancel: false,
    serviceSpeed: 'medium',
    mode: 'manual'
  }
];

async function main() {
  console.log('🌱 Seeding categories and services...');

  try {
    // First, get or create admin user
    let adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!adminUser) {
      console.log('Creating admin user...');
      const bcrypt = require('bcrypt');
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
    }

    // Create categories
    const createdCategories = {};
    for (const category of categories) {
      try {
        const existing = await prisma.category.findFirst({
          where: { category_name: category.category_name }
        });

        if (!existing) {
          const created = await prisma.category.create({
            data: {
              category_name: category.category_name,
              userId: adminUser.id,
              position: 'bottom',
              hideCategory: 'no'
            }
          });
          createdCategories[category.category_name] = created.id;
          console.log(`✅ Created category: ${category.category_name}`);
        } else {
          createdCategories[category.category_name] = existing.id;
          console.log(`⏭️  Category already exists: ${category.category_name}`);
        }
      } catch (error) {
        console.error(`❌ Error creating category ${category.category_name}:`, error);
      }
    }

    // Create services
    for (const service of services) {
      try {
        const categoryId = createdCategories[service.categoryName];
        if (!categoryId) {
          console.log(`⚠️  Category not found for service: ${service.name}`);
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
          console.log(`⏭️  Service already exists: ${service.name}`);
        }
      } catch (error) {
        console.error(`❌ Error creating service ${service.name}:`, error);
      }
    }

    console.log('🎉 Categories and services seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
