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
        const existingService = await db.service.findFirst({
          where: {
            OR: [
              { name: service.name },
              { updateText: { contains: `"providerServiceId":"${service.id}"` } }
            ]
          }
        });

        if (existingService) {
          console.log(`⚠️ Service already exists: ${service.name}`);
          skippedCount++;
          continue;
        }

        // Convert price to USD if needed
        let priceInUSD = service.rate || service.price || 0;
        if (service.currency && service.currency !== 'USD') {
          try {
            priceInUSD = await convertToUSD(priceInUSD, service.currency);
            console.log(`💱 Converted ${priceInUSD} ${service.currency} to ${priceInUSD} USD`);
          } catch (conversionError) {
            console.warn(`⚠️ Currency conversion failed for ${service.name}:`, conversionError);
            // Use original price if conversion fails
          }
        }

        // Find or create service type based on service.type
        let serviceTypeId = null;
        if (service.type) {
          let serviceType = await db.servicetype.findFirst({
            where: { name: service.type }
          });

          if (!serviceType) {
            // Create new service type
            serviceType = await db.servicetype.create({
              data: {
                name: service.type,
                description: `Auto-created from imported service: ${service.type}`,
                status: 'active'
              }
            });
            console.log(`📝 Created new service type: ${service.type}`);
          }
          
          serviceTypeId = serviceType.id;
        }

        // Find or create category
        let category = await db.category.findFirst({
          where: { category_name: service.category || 'Imported Services' }
        });

        if (!category) {
          category = await db.category.create({
            data: {
              category_name: service.category || 'Imported Services',
              status: 'active',
              userId: session.user.id
            }
          });
        }

        // Create service in database
        const newService = await db.service.create({
          data: {
            name: service.name,
            description: service.description || `${service.name} - Imported from ${provider.name}`,
            rate: priceInUSD,
            rateUSD: priceInUSD,
            min_order: service.min || 100,
            max_order: service.max || 10000,
            avg_time: '0-1 Hours',
            status: 'active',
            perqty: 1000,
            userId: session.user.id,
            categoryId: category.id,
            serviceTypeId: serviceTypeId,
            updateText: JSON.stringify({
              provider: provider.name,
              providerId: provider.id,
              providerServiceId: service.id?.toString(),
              originalRate: service.rate || service.price || 0,
              importedAt: new Date().toISOString(),
              type: service.type
            })
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

    // If requesting categories for a provider
    if (action === 'categories' && providerId) {
      try {
        console.log('🔥 Categories request for provider:', providerId);

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

        let providerServices = null;
        const endpoints = providerConfig.endpoints;
        const baseUrl = providerConfig.baseUrl;

        console.log('🔍 Available endpoints:', endpoints);
        console.log('🌐 Base URL:', baseUrl);

        // Try categories endpoint first if available
        if (endpoints.categories) {
          try {
            const categoriesUrl = `${baseUrl}${endpoints.categories}`;
            console.log(`🌐 Fetching from categories endpoint: ${categoriesUrl}`);
            
            const response = await retryApiCall(async () => {
              return await fetchWithTimeout(categoriesUrl, {
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
              const categories = data.categories || data.data || data;
              
              if (Array.isArray(categories)) {
                console.log(`✅ Categories endpoint successful, got ${categories.length} categories`);
                return NextResponse.json({
                  success: true,
                  data: {
                    categories: categories.map(cat => typeof cat === 'string' ? cat : cat.name || cat.category || cat),
                    total: categories.length,
                    provider: provider.name
                  },
                  error: null
                });
              }
            }
          } catch (error) {
            console.error(`❌ Categories endpoint failed for ${baseUrl}:`, error);
          }
        }

        // Fallback: Try services endpoint to extract categories
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

        // Try GET method as fallback
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
          
          // Return mock categories for testing if no real API is available
          const mockCategories = [
            'Instagram Followers',
            'Instagram Likes', 
            'Instagram Views',
            'Facebook Likes',
            'Facebook Followers',
            'Twitter Followers',
            'YouTube Views',
            'YouTube Subscribers',
            'TikTok Followers',
            'TikTok Likes'
          ];
          
          console.log('🔄 Returning mock categories for testing');
          return NextResponse.json({
            success: true,
            data: {
              categories: mockCategories,
              total: mockCategories.length,
              provider: provider.name,
              note: 'Mock data - API endpoint not accessible'
            },
            error: null
          });
        }

        // Extract unique categories from services
        const categories = [...new Set(
          providerServices
            .map((service: any) => service.category)
            .filter((category: any) => category && category.trim() !== '')
        )].sort();

        console.log(`🔍 Extracted ${categories.length} unique categories from services`);

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

        // Use standard SMM panel API format
        const baseUrl = providerConfig.baseUrl;
        
        // Try POST method first (standard SMM panel format)
        try {
          console.log(`🌐 Fetching services using POST method with standard SMM panel format`);
          
          const formData = new FormData();
          formData.append('key', providerConfig.apiKey);
          formData.append('action', 'services');
          
          const response = await retryApiCall(async () => {
            return await fetchWithTimeout(baseUrl, {
              method: 'POST',
              body: formData
            });
          });

          if (response.ok) {
            const data = await response.json();
            providerServices = Array.isArray(data) ? data : (data.services || data.data || data);
            console.log(`✅ POST method successful, got ${Array.isArray(providerServices) ? providerServices.length : 'unknown'} services`);
          }
        } catch (error) {
          console.error(`❌ POST method failed for ${baseUrl}:`, error);
        }

        // If POST failed, try GET method with query parameters
        if (!providerServices) {
          try {
            const servicesUrl = `${baseUrl}?key=${encodeURIComponent(providerConfig.apiKey)}&action=services`;
            console.log(`🌐 Trying GET method with query parameters: ${servicesUrl}`);
            
            const response = await retryApiCall(async () => {
              return await fetchWithTimeout(servicesUrl, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json'
                }
              });
            });

            if (response.ok) {
              const data = await response.json();
              providerServices = Array.isArray(data) ? data : (data.services || data.data || data);
              console.log(`✅ GET method successful, got ${Array.isArray(providerServices) ? providerServices.length : 'unknown'} services`);
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

        // Format services for frontend using standard SMM panel format
        const formattedServices = filteredServices.map((service: any) => ({
          id: service.service || service.id,
          name: service.name,
          description: service.description || '',
          category: service.category,
          price: parseFloat(service.rate || service.price || '0'),
          currency: service.currency || 'USD',
          min: parseInt(service.min || '1'),
          max: parseInt(service.max || '10000'),
          type: service.type || 'Default',
          refill: service.refill || false,
          cancel: service.cancel || false
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

        // Fetch services to extract categories using standard SMM panel format
        let providerServices = null;
        const baseUrl = providerConfig.baseUrl;

        // Try POST method first (standard SMM panel format)
        try {
          const formData = new FormData();
          formData.append('key', providerConfig.apiKey);
          formData.append('action', 'services');
          
          const response = await retryApiCall(async () => {
            return await fetchWithTimeout(baseUrl, {
              method: 'POST',
              body: formData
            });
          });

          if (response.ok) {
            const data = await response.json();
            providerServices = Array.isArray(data) ? data : (data.services || data.data || data);
          }
        } catch (error) {
          console.error('Error fetching services for categories (POST):', error);
        }

        // If POST failed, try GET method
        if (!providerServices) {
          try {
            const servicesUrl = `${baseUrl}?key=${encodeURIComponent(providerConfig.apiKey)}&action=services`;
            const response = await retryApiCall(async () => {
              return await fetchWithTimeout(servicesUrl, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json'
                }
              });
            });

            if (response.ok) {
              const data = await response.json();
              providerServices = Array.isArray(data) ? data : (data.services || data.data || data);
            }
          } catch (error) {
            console.error('Error fetching services for categories (GET):', error);
          }
        }

        if (!providerServices || !Array.isArray(providerServices)) {
          return NextResponse.json(
            { error: 'Failed to fetch services from provider', success: false, data: null },
            { status: 500 }
          );
        }

        // Extract unique categories and count services for each
        const categoryMap = new Map<string, number>();
        
        providerServices.forEach((service: any) => {
          const category = service.category;
          if (category && category.trim() !== '') {
            categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
          }
        });

        // Convert to the format expected by frontend
        const categories = Array.from(categoryMap.entries())
          .map(([name, servicesCount], index) => ({
            id: index + 1,
            name: name,
            servicesCount: servicesCount,
            selected: false
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

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
