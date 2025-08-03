import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Helper function to fetch currency data
async function fetchCurrencyData() {
  try {
    const currencies = await db.currency.findMany({
      where: { enabled: true },
      select: {
        code: true,
        symbol: true,
        rate: true,
      },
    });
    return { currencies };
  } catch (error) {
    console.error('Error fetching currency data:', error);
    return { currencies: [] };
  }
}

// Helper function to convert from USD to target currency
function convertFromUSD(usdAmount: number, targetCurrency: string, currencies: any[]) {
  if (targetCurrency === 'USD') {
    return usdAmount;
  }

  const targetCurrencyData = currencies.find(c => c.code === targetCurrency);
  if (!targetCurrencyData) {
    return usdAmount; // Fallback to USD if currency not found
  }

  return usdAmount * targetCurrencyData.rate;
}

export async function GET(request: Request) {
  try {
    // Check module settings for services list access control
    const moduleSettings = await db.moduleSettings.findFirst();
    const servicesListPublic = moduleSettings?.servicesListPublic ?? true;

    // If services list is private, require authentication
    if (!servicesListPublic) {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Authentication required to access services list' },
          { status: 401 }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limitParam = searchParams.get('limit') || '50';
    const search = searchParams.get('search') || '';
    const currency = searchParams.get('currency') || 'USD'; // Get user's preferred currency

    // Categories pagination - limit categories, not services
    const categoryLimit = parseInt(limitParam);
    const categorySkip = (page - 1) * categoryLimit;

    // Get currency data for conversion
    const { currencies } = await fetchCurrencyData();

    let services;
    let paginatedCategories: any;
    let totalCategories;

    if (search) {
      // Search across all services when search term is provided
      const searchQuery = {
        where: {
          status: 'active',
          category: {
            hideCategory: 'no', // Only include services from visible categories
          },
          OR: [
            {
              name: {
                contains: search,
              },
            },
            // Search by service ID (exact match)
            ...(isNaN(Number(search)) 
              ? [] 
              : [{
                  id: {
                    equals: Number(search)
                  }
                }]
            ),
          ].filter(Boolean),
        },
        orderBy: {
          createdAt: 'desc' as any,
        },
        select: {
          id: true,
          name: true,
          rate: true,
          rateUSD: true,
          min_order: true,
          max_order: true,
          avg_time: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              category_name: true,
            }
          },
          serviceType: {
            select: {
              id: true,
              name: true,
            }
          },
        },
      };
      
      services = await db.service.findMany(searchQuery);
      
      // For search results, we don't need category pagination
      paginatedCategories = [];
      totalCategories = 0;
    } else {
      // Normal pagination: First get paginated categories
      [paginatedCategories, totalCategories] = await Promise.all([
        db.category.findMany({
          where: {
            hideCategory: 'no', // Only show categories that are not hidden
          },
          skip: categorySkip,
          take: categoryLimit,
          orderBy: [
            { id: 'asc' as any }, // Order by ID first (1, 2, 3...)
            { position: 'asc' as any },
            { createdAt: 'asc' as any },
          ],
        }),
        db.category.count({
          where: {
            hideCategory: 'no',
          },
        }),
      ]);

      // Get all services for the paginated categories
      const categoryIds = paginatedCategories.map((cat: any) => cat.id);

      services = await db.service.findMany({
        where: {
          status: 'active',
          categoryId: {
            in: categoryIds,
          },
        },
        orderBy: {
          createdAt: 'desc' as any,
        },
        select: {
          id: true,
          name: true,
          rate: true,
          rateUSD: true,
          min_order: true,
          max_order: true,
          avg_time: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              category_name: true,
            }
          },
          serviceType: {
            select: {
              id: true,
              name: true,
            }
          },
        },
      });
    }



    // Convert service prices to user's preferred currency
    const servicesWithConvertedPrices = services.map(service => {
      // Assume service.rate is stored in USD (or use rateUSD if available)
      const priceUSD = service.rateUSD || service.rate;
      const convertedPrice = convertFromUSD(priceUSD, currency, currencies);

      return {
        ...service,
        rate: convertedPrice, // Converted price in user's currency
        rateUSD: priceUSD, // Original USD price
        displayCurrency: currency, // Currency being displayed
      };
    });

    return NextResponse.json(
      {
        data: servicesWithConvertedPrices || [],
        total: services.length, // Total services in current page/search
        page: search ? 1 : page, // For search, always show as page 1
        totalPages: search ? 1 : Math.ceil(totalCategories / categoryLimit), // For search, only 1 page
        totalCategories: search ? 0 : totalCategories, // For search, categories don't matter
        currency: currency, // Include currency info in response
        limit: limitParam,
        allCategories: paginatedCategories || [], // Include paginated categories (empty for search)
        isSearch: !!search, // Flag to indicate if this is a search result
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in services API:", error);
    // Return empty data array instead of error to avoid crashing the client
    return NextResponse.json(
      {
        data: [],
        total: 0,
        page: 1,
        totalPages: 1,
        message: 'Error fetching services',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 }
    );
  }
}
