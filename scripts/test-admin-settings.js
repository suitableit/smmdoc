const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAdminSettings() {
  try {
    console.log('🧪 Testing Admin Settings API Endpoints...\n');

    // 1. Ensure admin user exists
    console.log('👤 Checking admin user...');
    let adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@example.com' },
          { email: 'admin1@example.com' }
        ]
      }
    });

    if (!adminUser) {
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      try {
        adminUser = await prisma.user.create({
          data: {
            name: 'Admin User',
            username: 'adminuser',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin',
            emailVerified: new Date(),
            currency: 'USD',
            balance: 1000.0,
          }
        });
        console.log('✅ Admin user created');
      } catch (error) {
        // Try to find existing admin
        adminUser = await prisma.user.findFirst({
          where: { role: 'admin' }
        });
        if (adminUser) {
          console.log('✅ Found existing admin user');
        } else {
          throw error;
        }
      }
    } else {
      console.log('✅ Admin user exists');
    }

    // 2. Test General Settings
    console.log('\n🔧 Testing General Settings...');
    try {
      const generalSettings = await prisma.generalSettings.findFirst();
      if (!generalSettings) {
        await prisma.generalSettings.create({
          data: {
            siteTitle: 'SMM Panel',
            tagline: 'Best SMM Services Provider',
            siteIcon: '',
            siteLogo: '',
            adminEmail: 'admin@example.com',
          }
        });
        console.log('✅ General settings created');
      } else {
        console.log('✅ General settings exist');
      }
    } catch (error) {
      console.log('❌ General settings error:', error.message);
    }

    // 3. Test Meta Settings
    console.log('\n📝 Testing Meta Settings...');
    try {
      const metaSettings = await prisma.metaSettings.findFirst();
      if (!metaSettings) {
        await prisma.metaSettings.create({
          data: {
            googleTitle: 'SMM Panel - Best Social Media Marketing Services',
            siteTitle: 'SMM Panel',
            siteDescription: 'Get the best social media marketing services with fast delivery and affordable prices.',
            keywords: 'smm panel, social media marketing, instagram followers',
            thumbnail: '',
          }
        });
        console.log('✅ Meta settings created');
      } else {
        console.log('✅ Meta settings exist');
      }
    } catch (error) {
      console.log('❌ Meta settings error:', error.message);
    }

    // 4. Test User Settings
    console.log('\n👥 Testing User Settings...');
    try {
      const userSettings = await prisma.userSettings.findFirst();
      if (!userSettings) {
        await prisma.userSettings.create({
          data: {
            resetPasswordEnabled: true,
            signUpPageEnabled: true,
            nameFieldEnabled: true,
            emailConfirmationEnabled: true,
            resetLinkMax: 3,
            transferFundsPercentage: 3,
            userFreeBalanceEnabled: false,
            freeAmount: 0,
            paymentBonusEnabled: false,
            bonusPercentage: 0,
          }
        });
        console.log('✅ User settings created');
      } else {
        console.log('✅ User settings exist');
      }
    } catch (error) {
      console.log('❌ User settings error:', error.message);
    }

    // 5. Test Ticket Settings
    console.log('\n🎫 Testing Ticket Settings...');
    try {
      const ticketSettings = await prisma.ticketSettings.findFirst({
        include: { subjects: true }
      });
      if (!ticketSettings) {
        await prisma.ticketSettings.create({
          data: {
            ticketSystemEnabled: true,
            maxPendingTickets: '3',
            subjects: {
              create: [
                { name: 'General Support' },
                { name: 'Technical Issue' },
                { name: 'Billing Question' },
              ]
            }
          }
        });
        console.log('✅ Ticket settings created');
      } else {
        console.log('✅ Ticket settings exist');
      }
    } catch (error) {
      console.log('❌ Ticket settings error:', error.message);
    }

    // 6. Test Contact Settings
    console.log('\n📞 Testing Contact Settings...');
    try {
      const contactSettings = await prisma.contactSettings.findFirst({
        include: { categories: true }
      });
      if (!contactSettings) {
        await prisma.contactSettings.create({
          data: {
            contactSystemEnabled: true,
            maxPendingContacts: '3',
            categories: {
              create: [
                { name: 'General Inquiry' },
                { name: 'Business Partnership' },
                { name: 'Media & Press' },
              ]
            }
          }
        });
        console.log('✅ Contact settings created');
      } else {
        console.log('✅ Contact settings exist');
      }
    } catch (error) {
      console.log('❌ Contact settings error:', error.message);
    }

    // 7. Test Module Settings
    console.log('\n🧩 Testing Module Settings...');
    try {
      const moduleSettings = await prisma.moduleSettings.findFirst();
      if (!moduleSettings) {
        await prisma.moduleSettings.create({
          data: {
            affiliateSystemEnabled: false,
            commissionRate: 5,
            minimumPayout: 10,
            childPanelSellingEnabled: false,
            childPanelPrice: 10,
            serviceUpdateLogsEnabled: true,
            massOrderEnabled: false,
            servicesListPublic: true,
          }
        });
        console.log('✅ Module settings created');
      } else {
        console.log('✅ Module settings exist');
      }
    } catch (error) {
      console.log('❌ Module settings error:', error.message);
    }

    console.log('\n🎉 Admin Settings Test Complete!');
    console.log('\n🔑 Admin Login Credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('\n🌐 Admin Settings URL: http://localhost:3000/admin/settings');

  } catch (error) {
    console.error('❌ Error during admin settings test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminSettings();
