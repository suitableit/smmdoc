service.ts /**
 * Service actions to fetch services data from the API
 */

// Fetch all services
export async function getServices() {
  try {
    // আসল API কল করুন
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`);
    // const data = await response.json();
    // return data.services;
    
    // ডেমো ডেটা (আপনার বাস্তব API রেডি হলে উপরের কোড আনকমেন্ট করুন)
    return [
      { 
        id: '1', 
        name: 'Facebook Page Likes', 
        description: 'High quality Facebook page likes from real users', 
        price: 5.99, 
        category: { name: 'Facebook' },
        popular: true
      },
      { 
        id: '2', 
        name: 'Instagram Followers', 
        description: 'Organic Instagram followers for your profile', 
        price: 7.99, 
        category: { name: 'Instagram' },
        popular: true,
        new: true
      },
      { 
        id: '3', 
        name: 'YouTube Views', 
        description: 'Real and engaging YouTube views', 
        price: 3.99,
        category: { name: 'YouTube' },
        popular: true
      },
      { 
        id: '4', 
        name: 'TikTok Followers', 
        description: 'Increase your TikTok followers fast', 
        price: 6.99,
        category: { name: 'TikTok' },
        popular: true
      },
      { 
        id: '5', 
        name: 'Twitter Retweets', 
        description: 'Get more engagement with retweets', 
        price: 4.99,
        category: { name: 'Twitter' },
        popular: true
      },
      { 
        id: '6', 
        name: 'LinkedIn Connections', 
        description: 'Build your professional network', 
        price: 9.99,
        category: { name: 'LinkedIn' },
        popular: true
      }
    ];
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

// Get a specific service by ID
export async function getServiceById(id: string) {
  try {
    // আসল API কল করুন
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}`);
    // const data = await response.json();
    // return data.service;
    
    // ডেমো ডেটা (আপনার বাস্তব API রেডি হলে উপরের কোড আনকমেন্ট করুন)
    const services = await getServices();
    return services.find(service => service.id === id);
  } catch (error) {
    console.error(`Error fetching service with ID ${id}:`, error);
    return null;
  }
}

// Get services by category
export async function getServicesByCategory(categoryId: string) {
  try {
    // আসল API কল করুন
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${categoryId}/services`);
    // const data = await response.json();
    // return data.services;
    
    // ডেমো ডেটা (আপনার বাস্তব API রেডি হলে উপরের কোড আনকমেন্ট করুন)
    const services = await getServices();
    return services.filter(service => service.category.id === categoryId);
  } catch (error) {
    console.error(`Error fetching services for category ${categoryId}:`, error);
    return [];
  }
} 