const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCategoryReferences() {
  try {
    console.log('🔍 Checking category references...');

    // Check which category we're trying to delete
    const categoryId = 8; // Change this to the category ID you're trying to delete

    console.log(`\n📋 Checking references for category ID: ${categoryId}`);

    // Check category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      console.log('❌ Category not found');
      return;
    }

    console.log(`✅ Category found: ${category.category_name}`);

    // Check services
    const services = await prisma.service.findMany({
      where: { categoryId: categoryId },
      select: { id: true, name: true }
    });

    console.log(`\n🛠️ Services in this category: ${services.length}`);
    if (services.length > 0) {
      console.log('Services:', services.map(s => `${s.id}: ${s.name}`));
    }

    // Check orders
    const orders = await prisma.newOrder.findMany({
      where: { categoryId: categoryId },
      select: { id: true, status: true, userId: true }
    });

    console.log(`\n📦 Orders in this category: ${orders.length}`);
    if (orders.length > 0) {
      console.log('Orders:', orders.map(o => `${o.id}: ${o.status} (user: ${o.userId})`));
    }

    // Check refill requests (if table exists)
    let refillRequests = [];
    try {
      refillRequests = await prisma.refillRequest.findMany({
        where: {
          order: {
            categoryId: categoryId
          }
        },
        select: { id: true, orderId: true }
      });
    } catch (error) {
      console.log('⚠️ RefillRequest table not found, skipping...');
    }

    console.log(`\n🔄 Refill requests for orders in this category: ${refillRequests.length}`);
    if (refillRequests.length > 0) {
      console.log('Refill requests:', refillRequests);
    }

    // Check cancel requests (if table exists)
    let cancelRequests = [];
    try {
      cancelRequests = await prisma.cancelRequest.findMany({
        where: {
          order: {
            categoryId: categoryId
          }
        },
        select: { id: true, orderId: true }
      });
    } catch (error) {
      console.log('⚠️ CancelRequest table not found, skipping...');
    }

    console.log(`\n❌ Cancel requests for orders in this category: ${cancelRequests.length}`);
    if (cancelRequests.length > 0) {
      console.log('Cancel requests:', cancelRequests);
    }

    // Check favorite services (if table exists)
    let favoriteServices = [];
    try {
      favoriteServices = await prisma.favoriteService.findMany({
        where: {
          service: {
            categoryId: categoryId
          }
        },
        select: { id: true, serviceId: true, userId: true }
      });
    } catch (error) {
      console.log('⚠️ FavoriteService table not found, skipping...');
    }

    console.log(`\n⭐ Favorite services in this category: ${favoriteServices.length}`);
    if (favoriteServices.length > 0) {
      console.log('Favorite services:', favoriteServices);
    }

    console.log('\n🎯 Summary:');
    console.log(`- Services: ${services.length}`);
    console.log(`- Orders: ${orders.length}`);
    console.log(`- Refill requests: ${refillRequests.length}`);
    console.log(`- Cancel requests: ${cancelRequests.length}`);
    console.log(`- Favorite services: ${favoriteServices.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategoryReferences();
