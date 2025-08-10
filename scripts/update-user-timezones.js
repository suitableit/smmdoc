const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserTimezones() {
  try {
    console.log('🌏 Starting timezone update for all users...');
    
    // Update all users to have Asia/Dhaka timezone (21600 seconds = UTC+6:00)
    const result = await prisma.user.updateMany({
      where: {
        timezone: {
          not: '21600'
        }
      },
      data: {
        timezone: '21600' // Asia/Dhaka (UTC+6:00)
      }
    });
    
    console.log(`✅ Updated ${result.count} users to Asia/Dhaka timezone (UTC+6:00)`);
    
    // Verify the update
    const totalUsers = await prisma.user.count();
    const usersWithDhakaTimezone = await prisma.user.count({
      where: {
        timezone: '21600'
      }
    });
    
    console.log(`📊 Total users: ${totalUsers}`);
    console.log(`📊 Users with Asia/Dhaka timezone: ${usersWithDhakaTimezone}`);
    
    if (totalUsers === usersWithDhakaTimezone) {
      console.log('🎉 All users now have Asia/Dhaka timezone set!');
    } else {
      console.log('⚠️  Some users may still have different timezones');
    }
    
  } catch (error) {
    console.error('❌ Error updating user timezones:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateUserTimezones();