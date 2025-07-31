const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testServices() {
  try {
    console.log('=== Testing Services ===');
    
    // Check total services
    const totalServices = await prisma.service.count();
    console.log(`Total services in database: ${totalServices}`);
    
    // Check active services
    const activeServices = await prisma.service.count({
      where: { status: 'active' }
    });
    console.log(`Active services: ${activeServices}`);
    
    // Check services with different statuses
    const servicesByStatus = await prisma.service.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });
    
    console.log('\n=== Services by Status ===');
    servicesByStatus.forEach(group => {
      console.log(`${group.status}: ${group._count.id}`);
    });
    
    // Get some sample services
    const sampleServices = await prisma.service.findMany({
      take: 5,
      include: {
        category: {
          select: {
            id: true,
            category_name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('\n=== Sample Services ===');
    sampleServices.forEach(service => {
      console.log(`ID: ${service.id}`);
      console.log(`Name: ${service.name}`);
      console.log(`Status: ${service.status}`);
      console.log(`Rate: $${service.rate}`);
      console.log(`Category: ${service.category?.category_name || 'N/A'}`);
      console.log('---');
    });
    
    // Check categories
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            services: true
          }
        }
      }
    });
    
    console.log('\n=== Categories with Service Count ===');
    categories.forEach(cat => {
      console.log(`${cat.category_name}: ${cat._count.services} services`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testServices();
