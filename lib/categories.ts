/**
 * Categories actions to fetch categories data from the API
 */

// Fetch all categories
export async function getCategories() {
  try {
    // আসল API কল করুন
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
    // const data = await response.json();
    // return data.categories;
    
    // ডেমো ডেটা (আপনার বাস্তব API রেডি হলে উপরের কোড আনকমেন্ট করুন)
    return [
      { 
        id: '1', 
        name: 'Facebook', 
        serviceCount: 124,
      },
      { 
        id: '2', 
        name: 'Instagram', 
        serviceCount: 86,
      },
      { 
        id: '3', 
        name: 'YouTube', 
        serviceCount: 54,
      },
      { 
        id: '4', 
        name: 'Twitter', 
        serviceCount: 42,
      },
      { 
        id: '5', 
        name: 'TikTok', 
        serviceCount: 68,
      },
      { 
        id: '6', 
        name: 'LinkedIn', 
        serviceCount: 28,
      },
      { 
        id: '7', 
        name: 'Website Traffic', 
        serviceCount: 34,
      },
      { 
        id: '8', 
        name: 'SEO', 
        serviceCount: 21,
      }
    ];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Get a specific category by ID
export async function getCategoryById(id: string) {
  try {
    // আসল API কল করুন
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`);
    // const data = await response.json();
    // return data.category;
    
    // ডেমো ডেটা (আপনার বাস্তব API রেডি হলে উপরের কোড আনকমেন্ট করুন)
    const categories = await getCategories();
    return categories.find(category => category.id === id);
  } catch (error) {
    console.error(`Error fetching category with ID ${id}:`, error);
    return null;
  }
} 