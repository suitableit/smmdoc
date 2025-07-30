const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixContactSettings() {
  try {
    console.log('Fixing contact_settings table...');

    // Delete all existing contact_settings records with invalid datetime
    await prisma.$executeRaw`DELETE FROM contact_settings`;
    console.log('Deleted all existing contact_settings records');

    // Create a fresh contact_settings record
    await prisma.$executeRaw`
      INSERT INTO contact_settings (contactSystemEnabled, maxPendingContacts, createdAt, updatedAt)
      VALUES (true, '3', NOW(), NOW())
    `;
    console.log('Created fresh contact_settings record');

    // Also fix contact_categories if needed
    await prisma.$executeRaw`DELETE FROM contact_categories`;
    console.log('Deleted all existing contact_categories records');

    // Get the contact_settings id
    const settings = await prisma.$queryRaw`SELECT id FROM contact_settings ORDER BY id DESC LIMIT 1`;
    const settingsId = settings[0]?.id || 1;

    // Create default categories with contactSettingsId
    await prisma.$executeRaw`
      INSERT INTO contact_categories (name, contactSettingsId, createdAt, updatedAt) VALUES
      ('General Support', ${settingsId}, NOW(), NOW()),
      ('Technical Issue', ${settingsId}, NOW(), NOW()),
      ('Billing Question', ${settingsId}, NOW(), NOW()),
      ('Feature Request', ${settingsId}, NOW(), NOW())
    `;
    console.log('Created default contact categories');

    console.log('Contact settings fixed successfully!');
  } catch (error) {
    console.error('Error fixing contact settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixContactSettings();
