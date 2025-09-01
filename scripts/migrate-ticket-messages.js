const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateTicketMessages() {
  try {
    console.log('🔄 Starting ticket messages migration...');
    
    // Get all support tickets that don't have messages yet
    const tickets = await prisma.supportTicket.findMany({
      where: {
        messages: {
          none: {}
        }
      },
      include: {
        user: true
      }
    });

    console.log(`📋 Found ${tickets.length} tickets to migrate`);

    let migratedCount = 0;

    for (const ticket of tickets) {
      try {
        // Create initial message from the ticket's main message
        await prisma.ticketMessage.create({
          data: {
            ticketId: ticket.id,
            userId: ticket.userId,
            message: ticket.message,
            messageType: 'customer',
            isFromAdmin: false,
            attachments: ticket.attachments,
            createdAt: ticket.createdAt
          }
        });

        // If there's an admin reply, create that message too
        if (ticket.adminReply && ticket.repliedBy) {
          await prisma.ticketMessage.create({
            data: {
              ticketId: ticket.id,
              userId: ticket.repliedBy,
              message: ticket.adminReply,
              messageType: 'staff',
              isFromAdmin: true,
              attachments: null,
              createdAt: ticket.repliedAt || ticket.updatedAt
            }
          });
        }

        // If there's a system message (for AI tickets), create that too
        if (ticket.systemMessage) {
          await prisma.ticketMessage.create({
            data: {
              ticketId: ticket.id,
              userId: ticket.userId, // Use the ticket owner as the user
              message: ticket.systemMessage,
              messageType: 'system',
              isFromAdmin: false,
              attachments: null,
              createdAt: ticket.createdAt
            }
          });
        }

        migratedCount++;
        console.log(`✅ Migrated ticket #${ticket.id} (${migratedCount}/${tickets.length})`);
      } catch (error) {
        console.error(`❌ Error migrating ticket #${ticket.id}:`, error.message);
      }
    }

    console.log(`\n🎉 Migration completed! Migrated ${migratedCount} out of ${tickets.length} tickets.`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateTicketMessages();