const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedProviders() {
  try {
    console.log('🌱 Starting provider seeding...');

    // Sample provider data
    const providers = [
      {
        name: 'SMMKing',
        api_key: 'sk_test_smmking_12345',
        api_url: 'https://smmking.com/api/v2',
        login_user: 'admin',
        login_pass: 'password123',
        status: 'active',
        is_custom: false
      },
      {
        name: 'SocialPanel',
        api_key: 'sp_api_67890',
        api_url: 'https://socialpanel.com/api',
        login_user: 'user123',
        login_pass: 'secret456',
        status: 'active',
        is_custom: false
      },
      {
        name: 'CustomProvider1',
        api_key: 'custom_key_abc123',
        api_url: 'https://custom-provider.com/api/v1',
        login_user: 'customuser',
        login_pass: 'custompass',
        status: 'active',
        is_custom: true
      },
      {
        name: 'InactiveProvider',
        api_key: 'inactive_key_xyz789',
        api_url: 'https://inactive-provider.com/api',
        login_user: 'inactive',
        login_pass: 'inactive123',
        status: 'inactive',
        is_custom: false
      },
      {
        name: 'TestProvider',
        api_key: 'test_provider_key_456',
        api_url: 'https://test-provider.com/api/v2',
        login_user: 'testuser',
        login_pass: 'testpass789',
        status: 'active',
        is_custom: true
      }
    ];

    // Insert providers one by one
    for (const provider of providers) {
      try {
        // Check if provider already exists
        const existingProvider = await prisma.api_providers.findUnique({
          where: { name: provider.name }
        });

        if (existingProvider) {
          console.log(`⚠️  Provider '${provider.name}' already exists, skipping...`);
          continue;
        }

        // Create new provider
        const createdProvider = await prisma.api_providers.create({
          data: {
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

        console.log(`✅ Created provider: ${createdProvider.name} (ID: ${createdProvider.id})`);
      } catch (error) {
        console.error(`❌ Error creating provider '${provider.name}':`, error.message);
      }
    }

    // Display summary
    const totalProviders = await prisma.api_providers.count();
    const activeProviders = await prisma.api_providers.count({
      where: { status: 'active' }
    });
    const customProviders = await prisma.api_providers.count({
      where: { is_custom: true }
    });

    console.log('\n📊 Provider Summary:');
    console.log(`   Total Providers: ${totalProviders}`);
    console.log(`   Active Providers: ${activeProviders}`);
    console.log(`   Custom Providers: ${customProviders}`);
    console.log('\n🎉 Provider seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during provider seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedProviders()
  .then(() => {
    console.log('\n✨ Script execution completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script execution failed:', error);
    process.exit(1);
  });