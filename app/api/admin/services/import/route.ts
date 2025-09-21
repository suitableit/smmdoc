import { auth } from '@/auth';
import { convertToUSD } from '@/lib/currency-utils';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Configuration constants
const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Utility function to fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout: number = API_TIMEOUT): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
};

// Utility function to retry API calls
const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`❌ Attempt ${attempt}/${maxRetries} failed:`, lastError.message);
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// Utility function to check if URL is reachable
const checkUrlReachability = async (url: string): Promise<boolean> => {
  try {
    const response = await fetchWithTimeout(url, { method: 'HEAD' }, 5000);
    return response.ok;
  } catch {
    return false;
  }
};

// Create provider configuration dynamically
const createProviderConfig = (provider: any) => {
  return {
    name: provider.name,
    baseUrl: provider.api_url,
    apiKey: provider.api_key,
    endpoints: JSON.parse(provider.endpoints || '{}'),
    headers: JSON.parse(provider.headers || '{}')
  };
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { providerId, selectedServices } = body;

    if (!providerId || !selectedServices || !Array.isArray(selectedServices)) {
      return NextResponse.json(
        { error: 'Provider ID and selected services are required' },
        { status: 400 }
      );
    }

    console.log('🔥 Import request:', { providerId, servicesCount: selectedServices.length });

    // Get provider configuration
    const provider = await db.api_providers.findUnique({
      where: { id: parseInt(providerId) }
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    console.log('✅ Provider found:', provider.name);

    // Create dynamic provider configuration
    const providerConfig = createProviderConfig(provider);
    console.log('🔧 Using dynamic config for provider:', provider.name);

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const service of selectedServices) {
      try {
        console.log(`📝 Processing service: ${service.name} (ID: ${service.id})`);

        // Check if service already exists
        const existingService = await db.services.findFirst({
          where: {
            OR: [
              { name: service.name },
              { external_id: service.id?.toString() }
            ]
          }
        });

        if (existingService) {
          console.log(`⚠️ Service already exists: ${service.name}`);
          skippedCount++;
          continue;
        }

        // Convert price to USD if needed
        let priceInUSD = service.price;
        if (service.currency && service.currency !== 'USD') {
          try {
            priceInUSD = await convertToUSD(service.price, service.currency);
            console.log(`💱 Converted ${service.price} ${service.currency} to ${priceInUSD} USD`);
          } catch (conversionError) {
            console.warn(`⚠️ Currency conversion failed for ${service.name}:`, conversionError);
            // Use original price if conversion fails
          }
        }

        // Create service in database
        const newService = await db.services.create({
          data: {
            name: service.name,
            description: service.description || '',
            category: service.category || 'Other',
            price: priceInUSD,
            currency: 'USD', // Always store in USD
            min_quantity: service.min || 1,
            max_quantity: service.max || 10000,
            status: 'active',
            external_id: service.id?.toString(),
            provider_id: parseInt(providerId),
            api_provider_id: parseInt(providerId),
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        console.log(`✅ Service imported: ${newService.name} (ID: ${newService.id})`);
        importedCount++;

      } catch (serviceError) {
        const errorMsg = `Failed to import ${service.name}: ${serviceError instanceof Error ? serviceError.message : 'Unknown error'}`;
        console.error('❌', errorMsg);
        errors.push(errorMsg);
      }
    }

    console.log(`🎉 Import completed: ${importedCount} imported, ${skippedCount} skipped, ${errors.length} errors`);

    return NextResponse.json({
      success: true,
      data: {
        imported: importedCount,
        skipped: skippedCount,
        errors: errors.length,
        errorDetails: errors
      }
    });

  } catch (error) {
    console.error('❌ Import error:', error);
    return NextResponse.json(
      { error: 'Import failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

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
      try {
        console.log('🔥 Services request:', { providerId, categories });

        const provider = await db.api_providers.findUnique({
          where: { id: parseInt(providerId) }
        });

        if (!provider) {
          console.log('❌ Provider not found:', providerId);
          return NextResponse.json(
            { error: 'Provider not found', success: false, data: null },
            { status: 404 }
          );
        }

        console.log('✅ Provider found:', provider.name);

        // Create dynamic provider configuration
        const providerConfig = createProviderConfig(provider);
        console.log('🔧 Using dynamic config for provider:', provider.name);

        // Fetch services from provider API
        let providerServices = null;
        const categoriesArray = categories.split(',').map(c => c.trim());
        console.log('📋 Requested categories:', categoriesArray);

        // Try different API endpoints based on provider configuration
        const endpoints = providerConfig.endpoints;
        const baseUrl = providerConfig.baseUrl;

        if (endpoints.services) {
          try {
            const servicesUrl = `${baseUrl}${endpoints.services}`;
            console.log(`🌐 Fetching from services endpoint: ${servicesUrl}`);
            
            const response = await retryApiCall(async () => {
              return await fetchWithTimeout(servicesUrl, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${providerConfig.apiKey}`,
                  'Content-Type': 'application/json',
                  ...providerConfig.headers
                }
              });
            });

            if (response.ok) {
              const data = await response.json();
              providerServices = data.services || data.data || data;
              console.log(`✅ Services endpoint successful, got ${Array.isArray(providerServices) ? providerServices.length : 'unknown'} services`);
            }
          } catch (error) {
            console.error(`❌ Services endpoint failed for ${baseUrl}:`, error);
          }
        }

        // If services endpoint failed, try GET method
        if (!providerServices && endpoints.get) {
          try {
            const getUrl = `${baseUrl}${endpoints.get}`;
            console.log(`🌐 Trying GET endpoint: ${getUrl}`);
            
            const response = await retryApiCall(async () => {
              return await fetchWithTimeout(getUrl, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${providerConfig.apiKey}`,
                  'Content-Type': 'application/json',
                  ...providerConfig.headers
                }
              });
            });

            if (response.ok) {
              const data = await response.json();
              providerServices = data.services || data.data || data;
              console.log(`✅ GET endpoint successful, got ${Array.isArray(providerServices) ? providerServices.length : 'unknown'} services`);
            }
          } catch (error) {
            console.error(`❌ GET method failed for ${baseUrl}:`, error);
          }
        }

        if (!providerServices || !Array.isArray(providerServices)) {
          console.log('❌ No services fetched from provider:', {
            providerServices: providerServices ? 'exists but not array' : 'null/undefined',
            type: typeof providerServices,
            isArray: Array.isArray(providerServices)
          });
          return NextResponse.json(
            { error: 'Failed to fetch services from provider', success: false, data: null },
            { status: 500 }
          );
        }

        console.log(`✅ Fetched ${providerServices.length} services from ${provider.name}`);

        // Filter services by categories
        const filteredServices = providerServices.filter((service: any) => {
          const serviceCategory = service.category?.toLowerCase() || '';
          return categoriesArray.some(cat => 
            serviceCategory.includes(cat.toLowerCase()) || 
            cat.toLowerCase().includes(serviceCategory)
          );
        });

        console.log(`🔍 Filtered to ${filteredServices.length} services for categories: ${categoriesArray.join(', ')}`);

        // Format services for frontend
        const formattedServices = filteredServices.map((service: any) => ({
          id: service.service || service.id,
          name: service.name,
          description: service.description || '',
          category: service.category,
          price: parseFloat(service.rate || service.price || '0'),
          currency: service.currency || 'USD',
          min: parseInt(service.min || '1'),
          max: parseInt(service.max || '10000')
        }));

        console.log(`✅ Returning ${formattedServices.length} formatted services`);

        return NextResponse.json({
          success: true,
          data: {
            services: formattedServices,
            total: formattedServices.length,
            provider: provider.name
          },
          error: null
        });

      } catch (error) {
        console.error('❌ Error in services request:', error);
        return NextResponse.json(
          {
            error: `Failed to fetch services: ${error instanceof Error ? error.message : 'Unknown error'}`,
            success: false,
            data: null
          },
          { status: 500 }
        );
      }
    }

    // If requesting categories for a specific provider
    if (action === 'categories' && providerId) {
      try {
        const provider = await db.api_providers.findUnique({
          where: { id: parseInt(providerId) }
        });

        if (!provider) {
          return NextResponse.json(
            { error: 'Provider not found', success: false, data: null },
            { status: 404 }
          );
        }

        // Create dynamic provider configuration
        const providerConfig = createProviderConfig(provider);

        // Fetch services to extract categories
        let providerServices = null;
        const endpoints = providerConfig.endpoints;
        const baseUrl = providerConfig.baseUrl;

        // Try services endpoint first
        if (endpoints.services) {
          try {
            const servicesUrl = `${baseUrl}${endpoints.services}`;
            const response = await retryApiCall(async () => {
              return await fetchWithTimeout(servicesUrl, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${providerConfig.apiKey}`,
                  'Content-Type': 'application/json',
                  ...providerConfig.headers
                }
              });
            });

            if (response.ok) {
              const data = await response.json();
              providerServices = data.services || data.data || data;
            }
          } catch (error) {
            console.error('Error fetching services for categories:', error);
          }
        }

        if (!providerServices || !Array.isArray(providerServices)) {
          return NextResponse.json(
            { error: 'Failed to fetch services from provider', success: false, data: null },
            { status: 500 }
          );
        }

        // Extract unique categories
        const categories = [...new Set(
          providerServices
            .map((service: any) => service.category)
            .filter((category: any) => category && category.trim() !== '')
        )].sort();

        return NextResponse.json({
          success: true,
          data: {
            categories: categories,
            total: categories.length,
            provider: provider.name
          },
          error: null
        });
      } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
          { error: 'Failed to fetch categories: ' + (error instanceof Error ? error.message : 'Unknown error'), success: false, data: null },
          { status: 500 }
        );
      }
    }

    // Default: Get only active providers for service import
    try {
      const configuredProviders = await db.api_providers.findMany({
        where: {
          status: 'active'
        },
        select: {
          id: true,
          name: true,
          api_key: true,
          status: true
        },
        orderBy: [
          { name: 'asc' }     // Alphabetical order
        ]
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
      console.error('Error fetching default providers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch providers: ' + (error instanceof Error ? error.message : 'Unknown error'), success: false, data: null },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data: ' + (error instanceof Error ? error.message : 'Unknown error'), success: false, data: null },
      { status: 500 }
    );
  }
}

// PUT - Import services from selected provider
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { providerId, action } = body;

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // Get provider configuration
    const provider = await db.api_providers.findUnique({
      where: { id: parseInt(providerId) }
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    if (action === 'test_connection') {
      // Test provider connection
      const providerConfig = createProviderConfig(provider);
      const baseUrl = providerConfig.baseUrl;
      
      try {
        const isReachable = await checkUrlReachability(baseUrl);
        
        if (!isReachable) {
          return NextResponse.json({
            success: false,
            error: 'Provider API is not reachable',
            data: { reachable: false }
          });
        }

        // Try to fetch a small sample to test authentication
        const endpoints = providerConfig.endpoints;
        let testSuccessful = false;
        
        if (endpoints.services) {
          try {
            const testUrl = `${baseUrl}${endpoints.services}`;
            const response = await fetchWithTimeout(testUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${providerConfig.apiKey}`,
                'Content-Type': 'application/json',
                ...providerConfig.headers
              }
            }, 10000);
            
            testSuccessful = response.ok;
          } catch (error) {
            console.error('Test connection failed:', error);
          }
        }

        return NextResponse.json({
          success: testSuccessful,
          data: {
            reachable: isReachable,
            authenticated: testSuccessful,
            provider: provider.name
          },
          error: testSuccessful ? null : 'Authentication failed or API error'
        });

      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Connection test failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
          data: { reachable: false, authenticated: false }
        });
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Request failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
