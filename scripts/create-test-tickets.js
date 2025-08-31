const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const testTickets = [
  {
    subject: 'Unable to place order - Payment gateway error',
    category: 'technical',
    subcategory: 'payment_issues',
    priority: 'high',
    status: 'pending',
    message: 'I am trying to place an order but the payment gateway keeps showing an error. I have tried multiple payment methods but none of them work. Please help me resolve this issue as I need to place this order urgently.'
  },
  {
    subject: 'Service delivery delayed - Order #12345',
    category: 'order_issues',
    subcategory: 'delivery_delay',
    priority: 'medium',
    status: 'pending',
    message: 'My order #12345 was supposed to be delivered 3 days ago but I still haven\'t received any updates. The service shows as "in progress" but there\'s no visible progress. Can you please check what\'s happening with my order?'
  },
  {
    subject: 'Account balance not updated after payment',
    category: 'billing',
    subcategory: 'payment_issues',
    priority: 'high',
    status: 'pending',
    message: 'I made a payment of $50 to my account 2 hours ago but my balance is still showing as $0. The payment was successful from my bank\'s end. Transaction ID: TXN123456789. Please update my account balance.'
  },
  {
    subject: 'How to track my order progress?',
    category: 'general',
    subcategory: 'how_to',
    priority: 'low',
    status: 'pending',
    message: 'I am new to this platform and I placed my first order yesterday. I can see the order in my dashboard but I\'m not sure how to track its progress. Could you please guide me on how to monitor my order status?'
  },
  {
    subject: 'Refund request for cancelled service',
    category: 'billing',
    subcategory: 'refund_request',
    priority: 'medium',
    status: 'pending',
    message: 'I had to cancel my order #67890 due to a change in requirements. The order was cancelled within 1 hour of placing it and no work had started. I would like to request a full refund for this order. Please process my refund request.'
  }
];

async function createTestTickets() {
  try {
    console.log('🎫 Creating test tickets...');
    
    // Find the user with username '@user'
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: '@user' },
          { username: 'user' },
          { email: 'user@example.com' }
        ]
      }
    });

    if (!user) {
      console.error('❌ User "@user" not found. Please create a user first or update the script with an existing username.');
      console.log('\n💡 Available users:');
      const users = await prisma.user.findMany({
        select: { id: true, username: true, email: true },
        take: 10
      });
      users.forEach(u => {
        console.log(`   - ID: ${u.id}, Username: ${u.username}, Email: ${u.email}`);
      });
      return;
    }

    console.log(`✅ Found user: ${user.username} (ID: ${user.id})`);
    
    // Create tickets
    const createdTickets = [];
    
    for (let i = 0; i < testTickets.length; i++) {
      const ticketData = testTickets[i];
      
      const ticket = await prisma.supportTicket.create({
        data: {
          userId: user.id,
          subject: ticketData.subject,
          category: ticketData.category,
          subcategory: ticketData.subcategory,
          priority: ticketData.priority,
          status: ticketData.status,
          message: ticketData.message,
          createdAt: new Date(Date.now() - (i * 3600000)) // Stagger creation times by 1 hour
        }
      });
      
      // Message is already included in the ticket creation above
      
      createdTickets.push(ticket);
      console.log(`✅ Created ticket #${ticket.id}: "${ticket.subject}"`);
    }
    
    console.log(`\n🎉 Successfully created ${createdTickets.length} test tickets for user "${user.username}"`);
    console.log('\n📋 Created tickets:');
    createdTickets.forEach(ticket => {
      console.log(`   - Ticket #${ticket.id}: ${ticket.subject} [${ticket.priority}]`);
    });
    
  } catch (error) {
    console.error('❌ Error creating test tickets:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  createTestTickets();
}

module.exports = { createTestTickets };