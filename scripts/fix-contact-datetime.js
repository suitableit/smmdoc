const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixContactSettings() {
  try {
    console.log('🔧 Fixing contact settings datetime...');
    
    // Delete invalid records
    await prisma.$executeRaw`DELETE FROM contact_settings WHERE updatedAt = '0000-00-00 00:00:00' OR createdAt = '0000-00-00 00:00:00'`;
    
    // Insert proper record
    await prisma.$executeRaw`
      INSERT INTO contact_settings (contactSystemEnabled, maxPendingContacts, createdAt, updatedAt) 
      VALUES (true, '3', NOW(), NOW())
    `;
    
    console.log('✅ Contact settings fixed!');
    
    // Test the fix
    const settings = await prisma.contactSettings.findFirst();
    console.log('📋 Settings:', settings);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixContactSettings();
