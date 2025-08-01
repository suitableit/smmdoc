const { contactDB } = require('../lib/contact-db');

async function testCategoryAPI() {
  try {
    console.log('🧪 Testing Category Management API...\n');

    // Test getting contact categories
    console.log('📂 Testing getContactCategories...');
    const categories = await contactDB.getContactCategories();
    console.log(`✅ Found ${categories.length} categories`);
    categories.forEach(cat => {
      console.log(`  - ${cat.id}: ${cat.name}`);
    });

    // Test creating a new category
    console.log('\n➕ Testing createContactCategory...');
    const newCategoryName = `Test Category ${Date.now()}`;
    const created = await contactDB.createContactCategory(newCategoryName);
    console.log('✅ createContactCategory result:', created);

    // Get categories again to see if it was added
    const updatedCategories = await contactDB.getContactCategories();
    console.log(`✅ Updated categories count: ${updatedCategories.length}`);
    
    const newCategory = updatedCategories.find(cat => cat.name === newCategoryName);
    if (newCategory) {
      console.log(`✅ New category found: ${newCategory.id}: ${newCategory.name}`);
      
      // Test updating the category
      console.log('\n✏️ Testing updateContactCategory...');
      const updatedName = `${newCategoryName} (Updated)`;
      const updated = await contactDB.updateContactCategory(newCategory.id, updatedName);
      console.log('✅ updateContactCategory result:', updated);
      
      // Test deleting the category
      console.log('\n🗑️ Testing deleteContactCategory...');
      const deleted = await contactDB.deleteContactCategory(newCategory.id);
      console.log('✅ deleteContactCategory result:', deleted);
    }

    console.log('\n🎉 Category API test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await contactDB.disconnect();
  }
}

testCategoryAPI();
