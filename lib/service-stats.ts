/**
 * Service Stats actions to fetch service statistics from the API
 */

// Fetch service stats
export async function getServiceStats() {
  try {
    // আসল API কল করুন
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/service-stats`);
    // const data = await response.json();
    // return data.stats;
    
    // ডেমো ডেটা (আপনার বাস্তব API রেডি হলে উপরের কোড আনকমেন্ট করুন)
    return {
      totalServices: 2450,
      avgDeliveryTime: '2 Days',
      supportResponseTime: '1 Hour',
      totalCompletedOrders: 35690,
      customerSatisfactionRate: '98%',
    };
  } catch (error) {
    console.error('Error fetching service stats:', error);
    return {
      totalServices: 0,
      avgDeliveryTime: 'N/A',
      supportResponseTime: 'N/A',
    };
  }
} 