const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAPIEndpoints() {
  try {
    console.log('🔍 Testing API Endpoints and Database Integration...\n');

    // Test database queries that APIs would use
    
    // 1. Test User API queries
    console.log('1️⃣ Testing User API Queries...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balance: true,
        currency: true,
        status: true,
        createdAt: true
      }
    });
    console.log(`✅ Users query: ${users.length} users found`);

    // 2. Test Service API queries
    console.log('\n2️⃣ Testing Service API Queries...');
    
    const services = await prisma.service.findMany({
      include: {
        category: {
          select: {
            id: true,
            category_name: true
          }
        },
        serviceType: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      where: {
        status: 'active'
      }
    });
    console.log(`✅ Services query: ${services.length} active services found`);

    // 3. Test Order API queries
    console.log('\n3️⃣ Testing Order API Queries...');
    
    const orders = await prisma.newOrder.findMany({
      include: {
        service: {
          select: {
            id: true,
            name: true,
            rate: true
          }
        },
        category: {
          select: {
            id: true,
            category_name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    console.log(`✅ Orders query: ${orders.length} recent orders found`);

    // 4. Test Transaction API queries
    console.log('\n4️⃣ Testing Transaction API Queries...');
    
    const transactions = await prisma.addFund.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    console.log(`✅ Transactions query: ${transactions.length} recent transactions found`);

    // 5. Test Admin Dashboard queries
    console.log('\n5️⃣ Testing Admin Dashboard Queries...');
    
    // Total stats
    const totalUsers = await prisma.user.count();
    const totalOrders = await prisma.newOrder.count();
    const totalTransactions = await prisma.addFund.count();
    const totalRevenue = await prisma.addFund.aggregate({
      _sum: {
        amount: true
      },
      where: {
        status: 'Completed'
      }
    });

    console.log(`✅ Dashboard stats:`);
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Total Orders: ${totalOrders}`);
    console.log(`   Total Transactions: ${totalTransactions}`);
    console.log(`   Total Revenue: $${totalRevenue._sum.amount || 0}`);

    // 6. Test User Dashboard queries
    console.log('\n6️⃣ Testing User Dashboard Queries...');
    
    const testUser = await prisma.user.findFirst({
      where: { role: 'user' }
    });

    if (testUser) {
      const userOrders = await prisma.newOrder.count({
        where: { userId: testUser.id }
      });
      
      const userTransactions = await prisma.addFund.count({
        where: { userId: testUser.id }
      });
      
      const userSpent = await prisma.addFund.aggregate({
        _sum: {
          spent_amount: true
        },
        where: {
          userId: testUser.id,
          status: 'Completed'
        }
      });

      console.log(`✅ User dashboard for ${testUser.email}:`);
      console.log(`   Orders: ${userOrders}`);
      console.log(`   Transactions: ${userTransactions}`);
      console.log(`   Total Spent: $${userSpent._sum.spent_amount || 0}`);
      console.log(`   Current Balance: $${testUser.balance}`);
    }

    // 7. Test Category and Service Type queries
    console.log('\n7️⃣ Testing Category and Service Type Queries...');
    
    const categories = await prisma.category.findMany({
      include: {
        services: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        _count: {
          select: {
            services: true
          }
        }
      },
      where: {
        status: 'active'
      }
    });
    console.log(`✅ Categories with services: ${categories.length} categories found`);

    const serviceTypes = await prisma.serviceType.findMany({
      include: {
        _count: {
          select: {
            services: true
          }
        }
      }
    });
    console.log(`✅ Service types: ${serviceTypes.length} types found`);

    // 8. Test Refill Request queries
    console.log('\n8️⃣ Testing Refill Request Queries...');
    
    const refillRequests = await prisma.refillRequest.findMany({
      include: {
        order: {
          select: {
            id: true,
            link: true,
            qty: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    console.log(`✅ Refill requests: ${refillRequests.length} requests found`);

    // 9. Test Currency queries
    console.log('\n9️⃣ Testing Currency Queries...');
    
    const currencies = await prisma.currency.findMany({
      where: {
        enabled: true
      }
    });
    console.log(`✅ Active currencies: ${currencies.map(c => `${c.code} (${c.symbol})`).join(', ')}`);

    // 10. Test Complex queries (like API would use)
    console.log('\n🔟 Testing Complex API Queries...');
    
    // Order with full details (like order details API)
    const orderWithDetails = await prisma.newOrder.findFirst({
      include: {
        service: {
          include: {
            category: true,
            serviceType: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        refillRequests: {
          select: {
            id: true,
            reason: true,
            status: true,
            createdAt: true
          }
        }
      }
    });
    
    if (orderWithDetails) {
      console.log(`✅ Complex order query successful`);
      console.log(`   Order ID: ${orderWithDetails.id}`);
      console.log(`   Service: ${orderWithDetails.service.name}`);
      console.log(`   Category: ${orderWithDetails.service.category.category_name}`);
      console.log(`   User: ${orderWithDetails.user.email}`);
      console.log(`   Refill Requests: ${orderWithDetails.refillRequests.length}`);
    }

    console.log('\n✅ All API Endpoint Queries Working Successfully!');
    console.log('\n📊 Database is fully connected and ready for:');
    console.log('   ✅ User Management APIs');
    console.log('   ✅ Service Management APIs');
    console.log('   ✅ Order Processing APIs');
    console.log('   ✅ Transaction APIs');
    console.log('   ✅ Admin Dashboard APIs');
    console.log('   ✅ User Dashboard APIs');
    console.log('   ✅ Refill Request APIs');
    console.log('   ✅ Currency Management APIs');

  } catch (error) {
    console.error('❌ API endpoint test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPIEndpoints();
