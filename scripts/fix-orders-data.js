const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixOrdersData() {
  try {
    console.log('🔄 Checking and fixing orders data...');

    // Check orders with invalid serviceId
    const ordersWithInvalidService = await prisma.newOrder.findMany({
      where: {
        OR: [
          { serviceId: null },
          { serviceId: '' }
        ]
      },
      select: {
        id: true,
        serviceId: true,
        categoryId: true,
        userId: true,
        status: true
      }
    });

    console.log(`📋 Found ${ordersWithInvalidService.length} orders with invalid serviceId`);

    // Check orders with invalid categoryId
    const ordersWithInvalidCategory = await prisma.newOrder.findMany({
      where: {
        OR: [
          { categoryId: null },
          { categoryId: '' }
        ]
      },
      select: {
        id: true,
        serviceId: true,
        categoryId: true,
        userId: true,
        status: true
      }
    });

    console.log(`📋 Found ${ordersWithInvalidCategory.length} orders with invalid categoryId`);

    // Check orders with invalid userId
    const ordersWithInvalidUser = await prisma.newOrder.findMany({
      where: {
        OR: [
          { userId: null },
          { userId: 0 }
        ]
      },
      select: {
        id: true,
        serviceId: true,
        categoryId: true,
        userId: true,
        status: true
      }
    });

    console.log(`📋 Found ${ordersWithInvalidUser.length} orders with invalid userId`);

    // Get first available service, category, and user for fixing
    const [firstService, firstCategory, firstUser] = await Promise.all([
      prisma.service.findFirst({ where: { status: 'active' } }),
      prisma.category.findFirst({ where: { status: 'active' } }),
      prisma.user.findFirst()
    ]);

    if (!firstService || !firstCategory || !firstUser) {
      console.log('❌ Cannot fix orders: Missing required data (service, category, or user)');
      return;
    }

    console.log(`🔧 Using defaults: Service: ${firstService.name}, Category: ${firstCategory.category_name}, User: ${firstUser.email}`);

    // Fix orders with invalid serviceId
    if (ordersWithInvalidService.length > 0) {
      const updateServiceResult = await prisma.newOrder.updateMany({
        where: {
          OR: [
            { serviceId: null },
            { serviceId: '' }
          ]
        },
        data: {
          serviceId: firstService.id
        }
      });
      console.log(`✅ Fixed ${updateServiceResult.count} orders with invalid serviceId`);
    }

    // Fix orders with invalid categoryId
    if (ordersWithInvalidCategory.length > 0) {
      const updateCategoryResult = await prisma.newOrder.updateMany({
        where: {
          OR: [
            { categoryId: null },
            { categoryId: '' }
          ]
        },
        data: {
          categoryId: firstCategory.id
        }
      });
      console.log(`✅ Fixed ${updateCategoryResult.count} orders with invalid categoryId`);
    }

    // Fix orders with invalid userId
    if (ordersWithInvalidUser.length > 0) {
      const updateUserResult = await prisma.newOrder.updateMany({
        where: {
          OR: [
            { userId: null },
            { userId: 0 }
          ]
        },
        data: {
          userId: firstUser.id
        }
      });
      console.log(`✅ Fixed ${updateUserResult.count} orders with invalid userId`);
    }

    console.log('🎉 Orders data fix completed!');

  } catch (error) {
    console.error('❌ Error fixing orders data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOrdersData();
