const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestLog() {
  try {
    const result = await prisma.activityLog.create({
      data: {
        username: 'test_user',
        action: 'test_login',
        details: 'Test login for IP address verification',
        ipAddress: '192.168.1.100',
        userAgent: 'Test User Agent'
      }
    });
    
    console.log('Test activity log created:', result);
    
    // Now fetch recent logs to verify
    const recentLogs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        username: true,
        action: true,
        details: true,
        ipAddress: true,
        createdAt: true
      }
    });
    
    console.log('Recent activity logs:');
    console.table(recentLogs);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestLog();