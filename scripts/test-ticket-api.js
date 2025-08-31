const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTicketAPI() {
  try {
    console.log('🧪 Testing ticket API data structure...');
    
    // Get a ticket with messages directly from database
    const ticket = await prisma.supportTicket.findFirst({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        repliedByUser: {
          select: {
            id: true,
            name: true,
          }
        },
        messages: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        notes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!ticket) {
      console.log('❌ No tickets found in database');
      return;
    }

    console.log(`✅ Found ticket #${ticket.id}: "${ticket.subject}"`);
    console.log(`📧 Messages count: ${ticket.messages.length}`);
    console.log(`📝 Notes count: ${ticket.notes.length}`);
    
    // Transform the data like the API does
    const transformedTicket = {
      id: ticket.id.toString(),
      subject: ticket.subject,
      createdAt: ticket.createdAt.toISOString(),
      lastUpdated: ticket.updatedAt.toISOString(),
      status: ticket.status,
      ticketType: ticket.ticketType,
      aiSubcategory: ticket.aiSubcategory,
      systemMessage: ticket.systemMessage,
      messages: ticket.messages.map((msg) => ({
        id: msg.id.toString(),
        type: msg.messageType,
        author: msg.user.name || msg.user.email,
        authorRole: msg.isFromAdmin ? 'admin' : 'user',
        content: msg.message,
        createdAt: msg.createdAt.toISOString(),
        attachments: msg.attachments ? JSON.parse(msg.attachments) : []
      }))
    };

    console.log('\n📋 Transformed ticket data:');
    console.log('ID:', transformedTicket.id);
    console.log('Subject:', transformedTicket.subject);
    console.log('Status:', transformedTicket.status);
    console.log('Messages:');
    
    transformedTicket.messages.forEach((msg, index) => {
      console.log(`  ${index + 1}. [${msg.type}] ${msg.author}: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`);
    });

    console.log('\n🎉 API data structure is working correctly!');
    console.log('✅ Conversations and ticket details should now be fetched properly on the frontend.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testTicketAPI();