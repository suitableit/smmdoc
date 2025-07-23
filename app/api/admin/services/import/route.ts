import { auth } from '@/auth';
import { convertToUSD } from '@/lib/currency-utils';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Provider configurations
const PROVIDER_CONFIGS = {
  smmgen: {
    apiUrl: "https://api.smmgen.com/v2",
    endpoints: { services: "/services", balance: "/balance" }
  },
  growfollows: {
    apiUrl: "https://api.growfollows.com/v2", 
    endpoints: { services: "/services", balance: "/balance" }
  },
  attpanel: {
    apiUrl: "https://api.attpanel.com/v3",
    endpoints: { services: "/services", balance: "/balance" }
  },
  smmcoder: {
    apiUrl: "https://smmcoder.com/api/v2",
    endpoints: { services: "/services", balance: "/balance" }
  }
};

// GET - Get available providers for import or categories
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get('providerId');
    const action = searchParams.get('action');
    const categories = searchParams.get('categories');

    // If requesting services for selected categories
    if (action === 'services' && providerId && categories) {
      const provider = await db.apiProvider.findUnique({
        where: { id: parseInt(providerId) }
      });

      if (!provider) {
        return NextResponse.json(
          { error: 'Provider not found', success: false, data: null },
          { status: 404 }
        );
      }

      const providerConfig = PROVIDER_CONFIGS[provider.name.toLowerCase() as keyof typeof PROVIDER_CONFIGS];
      if (!providerConfig) {
        return NextResponse.json(
          { error: 'Provider configuration not found', success: false, data: null },
          { status: 400 }
        );
      }

      // Fetch services from provider API
      let providerServices = null;

      if (provider.name.toLowerCase() === 'smmcoder') {
        // SMMCoder API requires POST method with form data
        const smmcoderUrls = [
          'https://smmcoder.com/api/v2',
          'https://smmcoder.com/api'
        ];

        for (const baseUrl of smmcoderUrls) {
          try {
            const formData = new FormData();
            formData.append('key', provider.api_key);
            formData.append('action', 'services');

            const response = await fetch(baseUrl, {
              method: 'POST',
              body: formData,
            });

            if (response.ok) {
              const data = await response.json();
              if (Array.isArray(data)) {
                providerServices = data;
                break;
              }
            }
          } catch (error) {
            console.error(`Error fetching from ${baseUrl}:`, error);
            continue;
          }
        }
      } else {
        // For other providers, use GET method
        try {
          const servicesUrl = `${providerConfig.apiUrl}${providerConfig.endpoints.services}?key=${provider.api_key}`;
          const response = await fetch(servicesUrl);

          if (response.ok) {
            providerServices = await response.json();
          }
        } catch (error) {
          console.error('Error fetching services:', error);
        }
      }

      if (!providerServices || !Array.isArray(providerServices)) {
        return NextResponse.json(
          { error: 'Failed to fetch services from provider', success: false, data: null },
          { status: 500 }
        );
      }

      // Filter services by selected categories
      const selectedCategories = categories.split(',');
      const filteredServices = providerServices.filter((service: any) =>
        selectedCategories.includes(service.category)
      );

      // Format services with proper ID and description
      const formattedServices = filteredServices.map((service: any, index: number) => ({
        ...service,
        id: service.service || service.id || `srv_${index + 1}`, // Ensure ID exists
        description: service.description || service.name || 'No description available', // Ensure description exists
        category: service.category || 'Uncategorized'
      }));

      return NextResponse.json({
        success: true,
        data: {
          services: formattedServices,
          total: formattedServices.length,
          provider: provider.name
        },
        error: null
      });
    }

    // If requesting categories for a specific provider
    if (action === 'categories' && providerId) {
      const provider = await db.apiProvider.findUnique({
        where: { id: parseInt(providerId) }
      });

      if (!provider) {
        return NextResponse.json(
          { error: 'Provider not found', success: false, data: null },
          { status: 404 }
        );
      }

      const providerConfig = PROVIDER_CONFIGS[provider.name.toLowerCase() as keyof typeof PROVIDER_CONFIGS];
      if (!providerConfig) {
        return NextResponse.json(
          { error: 'Provider configuration not found', success: false, data: null },
          { status: 400 }
        );
      }

      // Try multiple URLs for SMMCoder
      let servicesUrl = `${providerConfig.apiUrl}${providerConfig.endpoints.services}?key=${provider.api_key}`;

      // For SMMCoder, use POST method as per their API documentation
      let providerServices = null;
      let workingUrl = null;



      if (provider.name.toLowerCase() === 'smmcoder') {
        // SMMCoder API requires POST method with form data
        const smmcoderUrls = [
          'https://smmcoder.com/api/v2',
          'https://smmcoder.com/api'
        ];

        for (const baseUrl of smmcoderUrls) {
          try {

            // Create form data for POST request
            const formData = new FormData();
            formData.append('key', provider.api_key);
            formData.append('action', 'services');

            const response = await fetch(baseUrl, {
              method: 'POST',
              body: formData
            });

            if (response.ok) {
              const data = await response.json();

              if (Array.isArray(data) && data.length > 0) {
                providerServices = data;
                workingUrl = baseUrl;
                break;
              } else if (data && typeof data === 'object') {
                // Sometimes API returns object with services array
                if (data.services && Array.isArray(data.services)) {
                  providerServices = data.services;
                  workingUrl = baseUrl;
                  break;
                }
              }
            }
          } catch (urlError) {
            console.log(`❌ SMMCoder failed with ${baseUrl}:`, urlError instanceof Error ? urlError.message : urlError);
          }
        }
      } else {
        // For other providers, use GET method
        const testUrls = [servicesUrl];
        console.log('Testing URLs for categories:', testUrls);

        for (const testUrl of testUrls) {
          try {
            console.log('Trying URL:', testUrl);

            const response = await fetch(testUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });

            console.log(`Response status for ${testUrl}:`, response.status);

            if (response.ok) {
              const data = await response.json();
              if (Array.isArray(data) && data.length > 0) {
                providerServices = data;
                workingUrl = testUrl;
                console.log(`SUCCESS with ${testUrl}! Found ${data.length} services`);
                break;
              }
            }
          } catch (urlError) {
            console.log(`Failed with ${testUrl}:`, urlError instanceof Error ? urlError.message : urlError);
          }
        }
      }

      if (!providerServices) {
        throw new Error(`All API URLs failed for ${provider.name}. No working API endpoint found.`);
      }

      if (!Array.isArray(providerServices)) {
        throw new Error('Invalid response format from provider');
      }

      console.log(`Using working URL: ${workingUrl} for ${provider.name}`);

      // Extract categories from services
      const categoryMap = new Map();

      providerServices.forEach((service: any) => {
        const categoryName = service.category || 'Uncategorized';
        if (categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, categoryMap.get(categoryName) + 1);
        } else {
          categoryMap.set(categoryName, 1);
        }
      });

      // Convert to array format
      const categories = Array.from(categoryMap.entries()).map(([name, count], index) => ({
        id: index + 1,
        name: name,
        servicesCount: count,
        selected: false
      }));

      return NextResponse.json({
        success: true,
        data: {
          categories: categories,
          total: categories.length,
          provider: provider.name
        },
        error: null
      });
    }

    // Default: Get configured providers
    const configuredProviders = await db.apiProvider.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        name: true,
        api_key: true,
        status: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        providers: configuredProviders,
        total: configuredProviders.length
      },
      error: null
    });

  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data: ' + (error instanceof Error ? error.message : 'Unknown error'), success: false, data: null },
      { status: 500 }
    );
  }
}

// POST - Import services from selected provider
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { providerId, profitMargin = 20, services } = await req.json();

    console.log('🔥 Import request received:', {
      providerId,
      profitMargin,
      servicesCount: services?.length,
      firstService: services?.[0]
    });

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required', success: false, data: null },
        { status: 400 }
      );
    }

    if (!services || !Array.isArray(services) || services.length === 0) {
      console.log('❌ No services data received');
      return NextResponse.json(
        { error: 'Services data is required', success: false, data: null },
        { status: 400 }
      );
    }

    // Get provider details
    const provider = await db.apiProvider.findUnique({
      where: { id: parseInt(providerId) }
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found', success: false, data: null },
        { status: 404 }
      );
    }

    // Use services from frontend instead of fetching from API
    const providerServices = services;

    if (!Array.isArray(providerServices)) {
      throw new Error('Invalid services data format');
    }

    console.log(`Processing ${providerServices.length} services from ${provider.name}`);

    // Get enabled currencies for price conversion
    const currenciesData = await db.currency.findMany({
      where: { enabled: true }
    });

    // Convert Decimal to number for currency utils
    const currencies = currenciesData.map(c => ({
      ...c,
      rate: Number(c.rate)
    }));

    // Create a map to store categories by name for efficient lookup
    const categoryMap = new Map();

    // Function to get or create category
    const getOrCreateCategory = async (categoryName: string) => {
      if (categoryMap.has(categoryName)) {
        return categoryMap.get(categoryName);
      }

      // Try to find existing category
      let category = await db.category.findFirst({
        where: { category_name: categoryName }
      });

      // If not found, create new category
      if (!category) {
        category = await db.category.create({
          data: {
            category_name: categoryName,
            status: 'active',
            userId: session.user.id,
            position: 'bottom',
            hideCategory: 'no'
          }
        });
        console.log(`✅ Created new category: ${categoryName}`);
      }

      categoryMap.set(categoryName, category);
      return category;
    };

    // Process and import services
    const importedServices = [];
    const skippedServices = [];
    const errors = [];

    for (const providerService of providerServices) {
      try {
        console.log(`🔍 Processing service: ${providerService.name} (ID: ${providerService.service || providerService.id})`);

        // Check if service already exists with exact same provider service ID
        const existingService = await db.service.findFirst({
          where: {
            updateText: {
              contains: `"providerServiceId":"${providerService.service || providerService.id}"`
            }
          }
        });

        if (existingService) {
          console.log(`⏭️ Skipping service: ${providerService.name} - Already exists`);
          skippedServices.push({
            name: providerService.name,
            reason: 'Already exists with same provider service ID'
          });
          continue;
        }

        // Calculate price with profit margin
        const providerRate = parseFloat(providerService.rate) || 0;
        const markupRate = providerRate * (1 + profitMargin / 100);

        // Convert to USD for storage
        const rateUSD = convertToUSD(markupRate, 'USD', currencies);

        // Get or create category based on provider service category
        const categoryName = providerService.category || 'Imported Services';
        const serviceCategory = await getOrCreateCategory(categoryName);

        // Create service
        console.log('🔥 Creating service:', {
          name: providerService.name,
          rate: markupRate,
          category: categoryName,
          categoryId: serviceCategory.id,
          userId: session.user.id
        });

        const newService = await db.service.create({
          data: {
            name: providerService.name,
            description: `${providerService.description || providerService.name} (Imported from ${provider.name})`,
            rate: markupRate,
            rateUSD: rateUSD,
            min_order: parseInt(providerService.min) || 100,
            max_order: parseInt(providerService.max) || 10000,
            avg_time: '0-1 Hours',
            userId: session.user.id,
            categoryId: serviceCategory.id, // Use dynamic category instead of default
            status: 'active',
            perqty: 1000,
            // Store provider info for order forwarding
            updateText: JSON.stringify({
              provider: provider.name,
              providerId: provider.id,
              providerServiceId: providerService.service || providerService.id,
              originalRate: providerRate,
              category: categoryName // Store original category name
            })
          }
        });

        console.log(`✅ Successfully created service: ${newService.name} (ID: ${newService.id})`);

        importedServices.push({
          id: newService.id,
          name: newService.name,
          rate: newService.rate,
          providerRate: providerRate,
          markup: profitMargin
        });

      } catch (serviceError) {
        console.error(`Error importing service ${providerService.name}:`, serviceError);
        errors.push({
          service: providerService.name,
          error: serviceError instanceof Error ? serviceError.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedServices.length} services from ${provider.name}`,
      data: {
        imported: importedServices.length,
        skipped: skippedServices.length,
        errors: errors.length,
        provider: provider.name,
        profitMargin: profitMargin,
        details: {
          importedServices: importedServices.slice(0, 10), // First 10 for preview
          skippedServices: skippedServices.slice(0, 5),
          errors: errors.slice(0, 5)
        }
      },
      error: null
    });

  } catch (error) {
    console.error('Error importing services:', error);
    return NextResponse.json(
      {
        error: 'Failed to import services: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
