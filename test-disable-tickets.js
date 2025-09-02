const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function disableTicketSystem() {
  try {
    console.log('🔧 Disabling ticket system...');
    
    // Update or create ticket settings to disable the system
    const result = await prisma.ticket_settings.upsert({
      where: { id: 1 }, // Assuming there's only one settings record
      update: {
        ticketSystemEnabled: false
      },
      create: {
        ticketSystemEnabled: false,
        maxPendingTickets: '3',
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Ticket system disabled successfully!');
    console.log('Settings:', result);
    
  } catch (error) {
    console.error('❌ Error disabling ticket system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
disableTicketSystem();