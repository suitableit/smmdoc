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
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const currency = searchParams.get('currency') || 'USD'; // Get user's preferred currency
    const skip = (page - 1) * limit;

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

    const [services, total] = await Promise.all([
      db.service.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          category: true,
          serviceType: true,
        },
      }),
      db.service.count({ where: whereClause }),
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
        totalPages: Math.ceil(total / limit),
        currency: currency, // Include currency info in response
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
