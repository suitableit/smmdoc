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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limitParam = searchParams.get('limit') || '50';
    const search = searchParams.get('search') || '';
    const currency = searchParams.get('currency') || 'USD'; // Get user's preferred currency

    // Handle "all" option for limit
    const isShowAll = limitParam === 'all';
    const limit = isShowAll ? undefined : parseInt(limitParam);
    const skip = isShowAll ? undefined : (page - 1) * limit!;

    // Get currency data for conversion
    const { currencies } = await fetchCurrencyData();

    // Base where clause - only return active services
    const whereClause = {
      status: 'active', // Only return active services
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {})
    };

    const [services, total, allCategories] = await Promise.all([
      db.service.findMany({
        where: whereClause,
        ...(skip !== undefined && { skip }),
        ...(limit !== undefined && { take: limit }),
        orderBy: {
          createdAt: 'desc',
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
      }),
      db.service.count({ where: whereClause }),
      // Fetch only active categories (not hidden) to show empty ones too
      db.category.findMany({
        where: {
          hideCategory: 'no', // Only show categories that are not hidden
        },
        orderBy: [
          { position: 'asc' },
          { updatedAt: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
    ]);

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
        total,
        page,
        totalPages: isShowAll ? 1 : Math.ceil(total / limit!),
        currency: currency, // Include currency info in response
        isShowAll,
        limit: limitParam,
        allCategories: allCategories || [], // Include all categories for empty category display
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
