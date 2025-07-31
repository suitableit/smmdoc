const { contactDB } = require('../lib/contact-db');

async function testCategoryCreation() {
  try {
    console.log('🧪 Testing Contact Category Creation...');

    // Get existing categories
    console.log('\n📂 Current categories:');
    const existingCategories = await contactDB.getContactCategories();
    console.log(`   Found ${existingCategories.length} categories:`);
    existingCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name} (ID: ${cat.id})`);
    });

    // Test creating a new category
    console.log('\n➕ Creating new category...');
    const newCategoryName = 'Test New Category ' + Date.now();
    const created = await contactDB.createContactCategory(newCategoryName);
    
    if (created) {
      console.log('✅ New category created successfully!');
      
      // Get updated categories
      const updatedCategories = await contactDB.getContactCategories();
      console.log(`\n📂 Updated categories (${updatedCategories.length} total):`);
      updatedCategories.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.name} (ID: ${cat.id})`);
      });
      
      // Find the new category
      const newCategory = updatedCategories.find(cat => cat.name === newCategoryName);
      if (newCategory) {
        console.log(`\n🎉 New category found: "${newCategory.name}" with ID: ${newCategory.id}`);
        
        // Test updating the category
        console.log('\n✏️ Testing category update...');
        const updatedName = newCategoryName + ' (Updated)';
        const updated = await contactDB.updateContactCategory(newCategory.id, updatedName);
        
        if (updated) {
          console.log('✅ Category updated successfully!');
          
          // Verify update
          const finalCategories = await contactDB.getContactCategories();
          const updatedCategory = finalCategories.find(cat => cat.id === newCategory.id);
          if (updatedCategory && updatedCategory.name === updatedName) {
            console.log(`✅ Update verified: "${updatedCategory.name}"`);
          }
        } else {
          console.log('❌ Category update failed');
        }
        
        // Clean up - delete the test category
        console.log('\n🗑️ Cleaning up test category...');
        const deleted = await contactDB.deleteContactCategory(newCategory.id);
        if (deleted) {
          console.log('✅ Test category deleted successfully');
        } else {
          console.log('❌ Failed to delete test category');
        }
      }
    } else {
      console.log('❌ Failed to create new category');
    }

    console.log('\n🎉 Category creation test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await contactDB.disconnect();
  }
}

testCategoryCreation();
