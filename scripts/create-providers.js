const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SAMPLE_PROVIDERS = [
  {
    id: 1,
    name: 'SMMProvider1',
    api_key: 'sample_api_key_1',
    api_url: 'https://api.smmprovider1.com/v2',
    login_user: 'user1',
    login_pass: 'pass1',
    status: 'active',
    is_custom: false
  },
  {
    id: 2,
    name: 'SMMProvider2', 
    api_key: 'sample_api_key_2',
    api_url: 'https://api.smmprovider2.com/v1',
    login_user: 'user2',
    login_pass: 'pass2',
    status: 'active',
    is_custom: false
  },
  {
    id: 3,
    name: 'CustomProvider',
    api_key: 'custom_api_key_3',
    api_url: 'https://custom.provider.com/api',
    login_user: null,
    login_pass: null,
    status: 'active',
    is_custom: true
  },
  {
    id: 4,
    name: 'TestProvider',
    api_key: 'test_key_4',
    api_url: 'https://test.provider.com/v2',
    login_user: 'testuser',
    login_pass: 'testpass',
    status: 'inactive',
    is_custom: false
  }
];

async function createProviders() {
  try {
    console.log('🏢 Creating sample providers...');
    
    // Check if providers already exist
    const existingCount = await prisma.api_providers.count();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing providers. Skipping creation.`);
      return;
    }
    
    // Create providers using upsert to avoid duplicates
    for (const provider of SAMPLE_PROVIDERS) {
      const created = await prisma.api_providers.upsert({
        where: { name: provider.name },
        update: {
          api_key: provider.api_key,
          api_url: provider.api_url,
          login_user: provider.login_user,
          login_pass: provider.login_pass,
          status: provider.status,
          is_custom: provider.is_custom,
          updatedAt: new Date()
        },
        create: {
          name: provider.name,
          api_key: provider.api_key,
          api_url: provider.api_url,
          login_user: provider.login_user,
          login_pass: provider.login_pass,
          status: provider.status,
          is_custom: provider.is_custom,
          updatedAt: new Date()
        }
      });
      
      console.log(`✅ Created/Updated provider: ${created.name} (ID: ${created.id})`);
    }
    
    // Verify creation
    const totalProviders = await prisma.api_providers.count();
    const activeProviders = await prisma.api_providers.count({
      where: { status: 'active' }
    });
    
    console.log(`\n📊 Provider creation summary:`);
    console.log(`   Total providers: ${totalProviders}`);
    console.log(`   Active providers: ${activeProviders}`);
    
    console.log('\n✅ Provider creation completed!');
    
  } catch (error) {
    console.error('❌ Error creating providers:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createProviders();
}

module.exports = { createProviders, SAMPLE_PROVIDERS };