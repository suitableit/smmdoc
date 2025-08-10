const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mapping of common offset seconds to timezone identifiers
const offsetToTimezone = {
  '21600': 'Asia/Dhaka',     // UTC+6:00
  '0': 'UTC',                // UTC+0:00
  '3600': 'Europe/Berlin',   // UTC+1:00 (CET)
  '7200': 'Europe/Berlin',   // UTC+2:00 (CEST)
  '-18000': 'America/New_York', // UTC-5:00 (EST)
  '-14400': 'America/New_York', // UTC-4:00 (EDT)
  '-21600': 'America/Chicago',  // UTC-6:00 (CST)
  '-25200': 'America/Denver',   // UTC-7:00 (MST)
  '-28800': 'America/Los_Angeles', // UTC-8:00 (PST)
  '19800': 'Asia/Kolkata',   // UTC+5:30
  '28800': 'Asia/Shanghai',  // UTC+8:00
  '32400': 'Asia/Tokyo',     // UTC+9:00
  '36000': 'Australia/Sydney', // UTC+10:00
  '43200': 'Pacific/Auckland', // UTC+12:00
};

async function convertTimezoneToIdentifiers() {
  try {
    console.log('🌏 Starting timezone conversion from offset seconds to identifiers...');
    
    // Get all users with their current timezone values
    const users = await prisma.user.findMany({
      select: {
        id: true,
        timezone: true,
        username: true,
        email: true
      }
    });
    
    console.log(`Found ${users.length} users to process`);
    
    let convertedCount = 0;
    let alreadyConvertedCount = 0;
    let unknownOffsetCount = 0;
    
    for (const user of users) {
      const currentTimezone = user.timezone;
      
      // Check if timezone is already an identifier (contains '/')
      if (currentTimezone && currentTimezone.includes('/')) {
        alreadyConvertedCount++;
        continue;
      }
      
      // Check if we have a mapping for this offset
      const newTimezone = offsetToTimezone[currentTimezone];
      
      if (newTimezone) {
        await prisma.user.update({
          where: { id: user.id },
          data: { timezone: newTimezone }
        });
        
        console.log(`✅ Updated user ${user.username || user.email || user.id}: ${currentTimezone} → ${newTimezone}`);
        convertedCount++;
      } else {
        // Default to Asia/Dhaka for unknown offsets
        await prisma.user.update({
          where: { id: user.id },
          data: { timezone: 'Asia/Dhaka' }
        });
        
        console.log(`⚠️  Unknown offset ${currentTimezone} for user ${user.username || user.email || user.id}, defaulted to Asia/Dhaka`);
        unknownOffsetCount++;
      }
    }
    
    console.log('\n📊 Conversion Summary:');
    console.log(`✅ Converted: ${convertedCount} users`);
    console.log(`ℹ️  Already converted: ${alreadyConvertedCount} users`);
    console.log(`⚠️  Unknown offsets (defaulted to Asia/Dhaka): ${unknownOffsetCount} users`);
    console.log(`📝 Total processed: ${users.length} users`);
    
    console.log('\n🎉 Timezone conversion completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during timezone conversion:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the conversion
convertTimezoneToIdentifiers()
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });