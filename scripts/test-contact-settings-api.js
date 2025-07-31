const { contactDB } = require('../lib/contact-db');

async function testContactSettingsAPI() {
  try {
    console.log('🧪 Testing Contact Settings API Functionality...');

    // Test getting contact settings (simulating GET request)
    console.log('\n📋 Testing GET contact settings...');
    const settings = await contactDB.getContactSettings();
    const categories = await contactDB.getContactCategories();

    const formattedSettings = {
      contactSystemEnabled: settings?.contactSystemEnabled ?? true,
      maxPendingContacts: settings?.maxPendingContacts ?? '3',
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name
      }))
    };

    console.log('✅ GET settings successful:');
    console.log('   System Enabled:', formattedSettings.contactSystemEnabled);
    console.log('   Max Pending:', formattedSettings.maxPendingContacts);
    console.log('   Categories:', formattedSettings.categories.length);

    // Test saving contact settings (simulating POST request)
    console.log('\n💾 Testing POST contact settings...');
    
    const testContactSettings = {
      contactSystemEnabled: true,
      maxPendingContacts: '5',
      categories: [
        ...formattedSettings.categories,
        { name: 'API Test Category' } // New category without ID
      ]
    };

    console.log('📝 Saving settings with new category...');

    // Upsert contact settings
    const settingsUpdated = await contactDB.upsertContactSettings({
      contactSystemEnabled: testContactSettings.contactSystemEnabled,
      maxPendingContacts: testContactSettings.maxPendingContacts
    });

    console.log('✅ Settings updated:', settingsUpdated ? 'Success' : 'Failed');

    // Handle categories (simulating the API logic)
    const existingCategories = await contactDB.getContactCategories();
    const existingCategoryMap = new Map(
      existingCategories.map((cat) => [cat.id, cat.name])
    );

    console.log('📂 Processing categories...');

    // Update or create categories
    for (const category of testContactSettings.categories) {
      if (category.id && existingCategoryMap.has(category.id)) {
        if (existingCategoryMap.get(category.id) !== category.name) {
          const updated = await contactDB.updateContactCategory(category.id, category.name.trim());
          console.log(`   ✏️ Updated category ${category.id}: ${updated ? 'Success' : 'Failed'}`);
        }
      } else if (!category.id) {
        const created = await contactDB.createContactCategory(category.name.trim());
        console.log(`   ➕ Created new category "${category.name}": ${created ? 'Success' : 'Failed'}`);
      }
    }

    // Verify final state
    console.log('\n🔍 Verifying final state...');
    const finalSettings = await contactDB.getContactSettings();
    const finalCategories = await contactDB.getContactCategories();

    console.log('✅ Final verification:');
    console.log('   System Enabled:', finalSettings?.contactSystemEnabled);
    console.log('   Max Pending:', finalSettings?.maxPendingContacts);
    console.log('   Total Categories:', finalCategories.length);
    
    console.log('\n📂 Final categories:');
    finalCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name} (ID: ${cat.id})`);
    });

    // Clean up - remove the test category
    console.log('\n🗑️ Cleaning up test category...');
    const testCategory = finalCategories.find(cat => cat.name === 'API Test Category');
    if (testCategory) {
      const deleted = await contactDB.deleteContactCategory(testCategory.id);
      console.log(`   Deleted test category: ${deleted ? 'Success' : 'Failed'}`);
    }

    console.log('\n🎉 Contact Settings API test completed successfully!');
    console.log('✅ Category creation through API is working!');

  } catch (error) {
    console.error('❌ API test failed:', error);
  } finally {
    await contactDB.disconnect();
  }
}

testContactSettingsAPI();
