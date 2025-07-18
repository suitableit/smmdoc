const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedActivityLogs() {
  try {
    console.log('🌱 Seeding activity logs...');

    // Get some users from database
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        username: true,
        email: true
      }
    });

    if (users.length === 0) {
      console.log('❌ No users found. Please create some users first.');
      return;
    }

    console.log(`📊 Found ${users.length} users to create activity logs for`);

    const activityTypes = [
      {
        action: 'login',
        details: 'User logged in successfully',
      },
      {
        action: 'logout',
        details: 'User logged out',
      },
      {
        action: 'profile_updated',
        details: 'User updated their profile information',
      },
      {
        action: 'password_changed',
        details: 'User changed their password',
      },
      {
        action: 'order_created',
        details: 'User created a new order',
      },
      {
        action: 'order_cancelled',
        details: 'User cancelled an order',
      },
      {
        action: 'fund_added',
        details: 'User added funds to their account',
      },
      {
        action: 'service_viewed',
        details: 'User viewed service details',
      },
      {
        action: 'api_key_generated',
        details: 'User generated a new API key',
      },
      {
        action: 'settings_updated',
        details: 'User updated account settings',
      }
    ];

    const ipAddresses = [
      '192.168.1.1',
      '203.112.58.45',
      '103.191.50.6',
      '45.123.67.89',
      '172.16.0.1',
      '10.0.0.1',
      '198.51.100.42',
      '203.0.113.195'
    ];

    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    ];

    // Create activity logs for each user
    const activityLogs = [];
    
    for (const user of users) {
      // Create 5-10 random activity logs per user
      const logCount = Math.floor(Math.random() * 6) + 5; // 5-10 logs
      
      for (let i = 0; i < logCount; i++) {
        const activity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const ipAddress = ipAddresses[Math.floor(Math.random() * ipAddresses.length)];
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        
        // Create random date within last 30 days
        const randomDate = new Date();
        randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
        
        activityLogs.push({
          userId: user.id,
          username: user.username || user.email?.split('@')[0] || `user${user.id}`,
          action: activity.action,
          details: activity.details,
          ipAddress: ipAddress,
          userAgent: userAgent,
          metadata: {
            browser: userAgent.includes('Chrome') ? 'Chrome' : userAgent.includes('Safari') ? 'Safari' : 'Other',
            platform: userAgent.includes('Windows') ? 'Windows' : userAgent.includes('Mac') ? 'macOS' : userAgent.includes('Linux') ? 'Linux' : userAgent.includes('iPhone') ? 'iOS' : userAgent.includes('iPad') ? 'iPadOS' : 'Unknown'
          },
          createdAt: randomDate
        });
      }
    }

    // Insert all activity logs
    console.log(`📝 Creating ${activityLogs.length} activity logs...`);
    
    const result = await prisma.activityLog.createMany({
      data: activityLogs,
      skipDuplicates: true
    });

    console.log(`✅ Successfully created ${result.count} activity logs`);

    // Show summary
    const totalLogs = await prisma.activityLog.count();
    console.log(`📊 Total activity logs in database: ${totalLogs}`);

    // Show some sample logs
    const sampleLogs = await prisma.activityLog.findMany({
      take: 5,
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('\n📋 Sample activity logs:');
    sampleLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log.username} - ${log.action} - ${log.details} (${log.createdAt.toLocaleDateString()})`);
    });

  } catch (error) {
    console.error('❌ Error seeding activity logs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedActivityLogs()
  .then(() => {
    console.log('🎉 Activity logs seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
