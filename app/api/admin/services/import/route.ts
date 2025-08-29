import { auth } from '@/auth';
import { convertToUSD } from '@/lib/currency-utils';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Provider configurations with multiple API URL options
const PROVIDER_CONFIGS = {
  smmgen: {
    apiUrl: "https://smmgen.com/api/v2",
    alternativeUrls: ["https://api.smmgen.com/v2", "https://smmgen.com/api"],
    endpoints: { services: "", balance: "" },
    method: "POST"
  },
  growfollows: {
    apiUrl: "https://growfollows.com/api/v2",
    alternativeUrls: ["https://api.growfollows.com/v2", "https://growfollows.com/api"],
    endpoints: { services: "", balance: "" },
    method: "POST"
  },
  attpanel: {
    apiUrl: "https://attpanel.com/api/v2",
    alternativeUrls: ["https://api.attpanel.com/v3", "https://attpanel.com/api"],
    endpoints: { services: "", balance: "" },
    method: "POST"
  },
  smmcoder: {
    apiUrl: "https://smmcoder.com/api/v2",
    alternativeUrls: ["https://smmcoder.com/api"],
    endpoints: { services: "", balance: "" },
    method: "POST"
  }
};

// POST - Handle services request with categories in body to avoid URL length limits
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, providerId, categories, page = 1, limit = 1000 } = body;

    console.log('🔥 POST Services request:', { action, providerId, categories: categories?.length, page, limit });

    // Handle services request
    if (action === 'services' && providerId && categories && Array.isArray(categories)) {
      try {
        const provider = await db.apiProvider.findUnique({
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

        // Simple validation - check if provider has API URL and key
        if (!provider.api_url || provider.api_url.trim() === '') {
          console.log('❌ Provider validation failed: API URL missing');
          return NextResponse.json(
            { error: 'Provider validation failed: API URL is missing', success: false, data: null },
            { status: 400 }
          );
        }

        if (!provider.api_key || provider.api_key.trim() === '') {
          console.log('❌ Provider validation failed: API key missing');
          return NextResponse.json(
            { error: 'Provider validation failed: API key is missing', success: false, data: null },
            { status: 400 }
          );
        }

        if (provider.status !== 'active') {
          console.log('❌ Provider validation failed: Provider not active');
          return NextResponse.json(
            { error: 'Provider validation failed: Provider is not active', success: false, data: null },
            { status: 400 }
          );
        }

        console.log('✅ Provider validation passed');

        // Check if provider is in hardcoded configs or use dynamic config for custom providers
        const providerConfig = PROVIDER_CONFIGS[provider.name.toLowerCase() as keyof typeof PROVIDER_CONFIGS];
        let apiUrls: string[] = [];
        
        if (providerConfig) {
          // Use hardcoded provider configuration
          apiUrls = [providerConfig.apiUrl, ...providerConfig.alternativeUrls];
          console.log('✅ Using hardcoded provider config for:', provider.name);
        } else {
          // Use dynamic configuration for custom providers
          apiUrls = [provider.api_url];
          console.log('✅ Using dynamic provider config for custom provider:', provider.name);
        }

        // Fetch services from provider API
        let providerServices = null;

        // Try multiple request methods and formats for all providers
        for (const baseUrl of apiUrls) {
          if (providerServices) break; // Stop if we already got services
          
          console.log(`🔄 Trying API: ${baseUrl}`);
          
          // Method 1: POST with FormData (works for SMMCoder and some others)
          try {
            const formData = new FormData();
            formData.append('key', provider.api_key);
            formData.append('action', 'services');

            const response = await fetch(baseUrl, {
              method: 'POST',
              body: formData,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            });

            if (response.ok) {
              const data = await response.json();
              if (Array.isArray(data) && data.length > 0) {
                providerServices = data;
                console.log(`✅ FormData POST success: ${baseUrl} - ${data.length} services`);
                break;
              }
            }
          } catch (error) {
            console.log(`❌ FormData POST failed: ${baseUrl}`, error);
          }
          
          // Method 2: POST with URLSearchParams (standard SMM panel format)
          try {
            const response = await fetch(baseUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              },
              body: new URLSearchParams({
                key: provider.api_key,
                action: 'services'
              })
            });

            if (response.ok) {
              const data = await response.json();
              if (Array.isArray(data) && data.length > 0) {
                providerServices = data;
                console.log(`✅ URLSearchParams POST success: ${baseUrl} - ${data.length} services`);
                break;
              }
            }
          } catch (error) {
            console.log(`❌ URLSearchParams POST failed: ${baseUrl}`, error);
          }
          
          // Method 3: POST with JSON body
          try {
            const response = await fetch(baseUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              },
              body: JSON.stringify({
                key: provider.api_key,
                action: 'services'
              })
            });

            if (response.ok) {
              const data = await response.json();
              if (Array.isArray(data) && data.length > 0) {
                providerServices = data;
                console.log(`✅ JSON POST success: ${baseUrl} - ${data.length} services`);
                break;
              }
            }
          } catch (error) {
            console.log(`❌ JSON POST failed: ${baseUrl}`, error);
          }
          
          // Method 4: GET with query parameters
          try {
            const url = new URL(baseUrl);
            url.searchParams.append('key', provider.api_key);
            url.searchParams.append('action', 'services');
            
            const response = await fetch(url.toString(), {
              method: 'GET',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            });

            if (response.ok) {
              const data = await response.json();
              if (Array.isArray(data) && data.length > 0) {
                providerServices = data;
                console.log(`✅ GET success: ${baseUrl} - ${data.length} services`);
                break;
              }
            }
          } catch (error) {
            console.log(`❌ GET failed: ${baseUrl}`, error);
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

        // Filter services by selected categories
        console.log('🔍 Filtering by categories:', categories);

        const filteredServices = providerServices.filter((service: any) => {
          const serviceCategory = service.category || 'Uncategorized';
          const matches = categories.includes(serviceCategory);
          return matches;
        });

        console.log(`📊 Filtered to ${filteredServices.length} services from ${providerServices.length} total`);

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedServices = filteredServices.slice(startIndex, endIndex);

        console.log(`📄 Pagination: Page ${page}, Limit ${limit}, Start: ${startIndex}, End: ${endIndex}`);
        console.log(`📄 Returning ${paginatedServices.length} services from ${filteredServices.length} total`);

        // Format services with proper ID and description
        const formattedServices = paginatedServices.map((service: any, index: number) => ({
          ...service,
          id: service.service || service.id || `srv_${startIndex + index + 1}`, // Ensure ID exists with proper indexing
          description: service.description || service.name || 'No description available', // Ensure description exists
          category: service.category || 'Uncategorized'
        }));

        console.log(`✅ Returning ${formattedServices.length} formatted services for page ${page}`);

        return NextResponse.json({
          success: true,
          data: {
            services: formattedServices,
            pagination: {
              page: page,
              limit: limit,
              total: filteredServices.length,
              totalPages: Math.ceil(filteredServices.length / limit),
              hasMore: endIndex < filteredServices.length,
              returned: formattedServices.length
            },
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

    return NextResponse.json(
      { error: 'Invalid request parameters', success: false, data: null },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ POST request error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false, data: null },
      { status: 500 }
    );
  }
}

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
      try {
        console.log('🔥 Services request:', { providerId, categories });

      const provider = await db.apiProvider.findUnique({
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

      // Check if provider is in hardcoded configs, otherwise create dynamic config
      let providerConfig = PROVIDER_CONFIGS[provider.name.toLowerCase() as keyof typeof PROVIDER_CONFIGS];
      
      if (!providerConfig) {
        console.log('🔧 Creating dynamic config for custom provider:', provider.name);
        // Create dynamic config for custom provider
        providerConfig = {
          apiUrl: provider.api_url,
          endpoints: {
            services: '',
            categories: ''
          },
          alternativeUrls: []
        };
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
        // For other providers, try both POST and GET methods with multiple URLs
        const baseUrls = [providerConfig.apiUrl, ...(providerConfig.alternativeUrls || [])];

        for (const baseUrl of baseUrls) {
          console.log(`🔥 Trying provider ${provider.name} with URL: ${baseUrl}`);

          try {
            // Try POST method first (standard for most SMM panels)
            const formData = new FormData();
            formData.append('key', provider.api_key);
            formData.append('action', 'services');

            console.log(`📤 POST request to ${baseUrl} with key: ${provider.api_key.substring(0, 10)}...`);

            const postResponse = await fetch(baseUrl, {
              method: 'POST',
              body: formData,
            });

            console.log(`📥 POST Response status: ${postResponse.status} for ${baseUrl}`);

            if (postResponse.ok) {
              const data = await postResponse.json();
              console.log(`📊 POST Response data type: ${Array.isArray(data) ? 'Array' : typeof data}, length: ${Array.isArray(data) ? data.length : 'N/A'}`);

              if (Array.isArray(data) && data.length > 0) {
                providerServices = data;
                console.log(`✅ SUCCESS with POST ${baseUrl}! Found ${data.length} services`);
                break;
              }
            } else {
              const errorText = await postResponse.text();
              console.log(`❌ POST Error response: ${errorText}`);
            }
          } catch (error) {
            console.error(`❌ POST method failed for ${baseUrl}:`, error);
          }

          // If POST failed, try GET method
          try {
            const servicesUrl = `${baseUrl}${providerConfig.endpoints.services}?key=${provider.api_key}&action=services`;
            console.log(`📤 GET request to ${servicesUrl}`);

            const getResponse = await fetch(servicesUrl);
            console.log(`📥 GET Response status: ${getResponse.status} for ${servicesUrl}`);

            if (getResponse.ok) {
              const data = await getResponse.json();
              console.log(`📊 GET Response data type: ${Array.isArray(data) ? 'Array' : typeof data}, length: ${Array.isArray(data) ? data.length : 'N/A'}`);

              if (Array.isArray(data) && data.length > 0) {
                providerServices = data;
                console.log(`✅ SUCCESS with GET ${servicesUrl}! Found ${data.length} services`);
                break;
              }
            } else {
              const errorText = await getResponse.text();
              console.log(`❌ GET Error response: ${errorText}`);
            }
          } catch (error) {
            console.error(`❌ GET method failed for ${baseUrl}:`, error);
          }
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

      // Filter services by selected categories
      const selectedCategories = categories.split(',').map(cat => cat.trim());
      console.log('🔍 Filtering by categories:', selectedCategories);

      const filteredServices = providerServices.filter((service: any) => {
        const serviceCategory = service.category || 'Uncategorized';
        const matches = selectedCategories.includes(serviceCategory);
        if (!matches) {
          console.log(`⚠️ Service "${service.name}" category "${serviceCategory}" not in selected categories`);
        }
        return matches;
      });

      console.log(`📊 Filtered to ${filteredServices.length} services from ${providerServices.length} total`);

      // Format services with proper ID and description
      const formattedServices = filteredServices.map((service: any, index: number) => ({
        ...service,
        id: service.service || service.id || `srv_${index + 1}`, // Ensure ID exists
        description: service.description || service.name || 'No description available', // Ensure description exists
        category: service.category || 'Uncategorized'
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
      const provider = await db.apiProvider.findUnique({
        where: { id: parseInt(providerId) }
      });

      if (!provider) {
        return NextResponse.json(
          { error: 'Provider not found', success: false, data: null },
          { status: 404 }
        );
      }

      // Check if provider is in hardcoded configs, otherwise create dynamic config
      let providerConfig = PROVIDER_CONFIGS[provider.name.toLowerCase() as keyof typeof PROVIDER_CONFIGS];
      
      if (!providerConfig) {
        console.log('🔧 Creating dynamic config for custom provider:', provider.name);
        // Create dynamic config for custom provider
        providerConfig = {
          apiUrl: provider.api_url,
          endpoints: {
            services: '',
            categories: ''
          },
          alternativeUrls: []
        };
      }

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
      } else if (provider.name.toLowerCase() === 'growfollows') {
        // GrowFollows specific logic - they use standard POST with FormData
        console.log(`🧪 GrowFollows trying API: ${providerConfig.apiUrl}`);
        console.log(`🔑 Using API Key: ${provider.api_key.substring(0, 8)}...`);

        try {
          // Try FormData first
          console.log('🔄 Trying FormData approach...');
          const formData = new FormData();
          formData.append('key', provider.api_key);
          formData.append('action', 'services');

          let response = await fetch(providerConfig.apiUrl, {
            method: 'POST',
            body: formData,
          });

          console.log(`GrowFollows FormData Response status:`, response.status);

          // If FormData fails, try URLSearchParams
          if (!response.ok) {
            console.log('🔄 Trying URLSearchParams approach...');
            const params = new URLSearchParams();
            params.append('key', provider.api_key);
            params.append('action', 'services');

            response = await fetch(providerConfig.apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: params,
            });

            console.log(`GrowFollows URLSearchParams Response status:`, response.status);
          }

          // If still fails, try JSON approach
          if (!response.ok) {
            console.log('🔄 Trying JSON approach...');
            response = await fetch(providerConfig.apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                key: provider.api_key,
                action: 'services'
              }),
            });

            console.log(`GrowFollows JSON Response status:`, response.status);
          }

          console.log(`GrowFollows Response headers:`, Object.fromEntries(response.headers.entries()));

          if (response.ok) {
            const responseText = await response.text();
            console.log(`GrowFollows Raw response:`, responseText.substring(0, 500));

            try {
              const data = JSON.parse(responseText);
              if (Array.isArray(data) && data.length > 0) {
                console.log(`✅ GrowFollows success, found ${data.length} services`);
                providerServices = data;
                workingUrl = providerConfig.apiUrl;
              } else if (data.error) {
                console.log(`❌ GrowFollows API error:`, data.error);
                throw new Error(`GrowFollows API error: ${data.error}`);
              } else {
                console.log(`❌ GrowFollows unexpected response format:`, data);
                throw new Error('GrowFollows returned unexpected response format');
              }
            } catch (parseError) {
              console.log(`❌ GrowFollows JSON parse error:`, parseError);
              throw new Error(`GrowFollows response parsing failed: ${parseError instanceof Error ? parseError.message : parseError}`);
            }
          } else {
            const errorText = await response.text();
            console.log(`❌ GrowFollows HTTP error ${response.status}:`, errorText);
            throw new Error(`GrowFollows API returned ${response.status}: ${errorText}. Please check API key and URL.`);
          }
        } catch (error) {
          console.log(`❌ GrowFollows request failed:`, error instanceof Error ? error.message : error);
          throw error;
        }
      } else if (provider.name.toLowerCase() === 'smmgen') {
        // SMMGen specific logic - they use standard POST with FormData
        console.log(`🧪 SMMGen trying API: ${providerConfig.apiUrl}`);
        console.log(`🔑 Using API Key: ${provider.api_key.substring(0, 8)}...`);

        try {
          // Try FormData first
          console.log('🔄 Trying FormData approach...');
          const formData = new FormData();
          formData.append('key', provider.api_key);
          formData.append('action', 'services');

          let response = await fetch(providerConfig.apiUrl, {
            method: 'POST',
            body: formData,
          });

          console.log(`SMMGen FormData Response status:`, response.status);

          // If FormData fails, try URLSearchParams
          if (!response.ok) {
            console.log('🔄 Trying URLSearchParams approach...');
            const params = new URLSearchParams();
            params.append('key', provider.api_key);
            params.append('action', 'services');

            response = await fetch(providerConfig.apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: params,
            });

            console.log(`SMMGen URLSearchParams Response status:`, response.status);
          }

          console.log(`SMMGen Response headers:`, Object.fromEntries(response.headers.entries()));

          if (response.ok) {
            const responseText = await response.text();
            console.log(`SMMGen Raw response:`, responseText.substring(0, 500));

            try {
              const data = JSON.parse(responseText);
              if (Array.isArray(data) && data.length > 0) {
                console.log(`✅ SMMGen success, found ${data.length} services`);
                providerServices = data;
                workingUrl = providerConfig.apiUrl;
              } else if (data.error) {
                console.log(`❌ SMMGen API error:`, data.error);
                throw new Error(`SMMGen API error: ${data.error}`);
              } else {
                console.log(`❌ SMMGen unexpected response format:`, data);
                throw new Error('SMMGen returned unexpected response format');
              }
            } catch (parseError) {
              console.log(`❌ SMMGen JSON parse error:`, parseError);
              throw new Error(`SMMGen response parsing failed: ${parseError instanceof Error ? parseError.message : parseError}`);
            }
          } else {
            const errorText = await response.text();
            console.log(`❌ SMMGen HTTP error ${response.status}:`, errorText);
            throw new Error(`SMMGen API returned ${response.status}: ${errorText}. Please check API key and URL.`);
          }
        } catch (error) {
          console.log(`❌ SMMGen request failed:`, error instanceof Error ? error.message : error);
          throw error;
        }
      } else if (provider.name.toLowerCase() === 'attpanel') {
        // ATTPanel specific logic - they use standard POST with FormData
        console.log(`🧪 ATTPanel trying API: ${providerConfig.apiUrl}`);
        console.log(`🔑 Using API Key: ${provider.api_key.substring(0, 8)}...`);

        try {
          // Try FormData first
          console.log('🔄 Trying FormData approach...');
          const formData = new FormData();
          formData.append('key', provider.api_key);
          formData.append('action', 'services');

          let response = await fetch(providerConfig.apiUrl, {
            method: 'POST',
            body: formData,
          });

          console.log(`ATTPanel FormData Response status:`, response.status);

          // If FormData fails, try URLSearchParams
          if (!response.ok) {
            console.log('🔄 Trying URLSearchParams approach...');
            const params = new URLSearchParams();
            params.append('key', provider.api_key);
            params.append('action', 'services');

            response = await fetch(providerConfig.apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: params,
            });

            console.log(`ATTPanel URLSearchParams Response status:`, response.status);
          }

          console.log(`ATTPanel Response headers:`, Object.fromEntries(response.headers.entries()));

          if (response.ok) {
            const responseText = await response.text();
            console.log(`ATTPanel Raw response:`, responseText.substring(0, 500));

            try {
              const data = JSON.parse(responseText);
              if (Array.isArray(data) && data.length > 0) {
                console.log(`✅ ATTPanel success, found ${data.length} services`);
                providerServices = data;
                workingUrl = providerConfig.apiUrl;
              } else if (data.error) {
                console.log(`❌ ATTPanel API error:`, data.error);
                throw new Error(`ATTPanel API error: ${data.error}`);
              } else {
                console.log(`❌ ATTPanel unexpected response format:`, data);
                throw new Error('ATTPanel returned unexpected response format');
              }
            } catch (parseError) {
              console.log(`❌ ATTPanel JSON parse error:`, parseError);
              throw new Error(`ATTPanel response parsing failed: ${parseError instanceof Error ? parseError.message : parseError}`);
            }
          } else {
            const errorText = await response.text();
            console.log(`❌ ATTPanel HTTP error ${response.status}:`, errorText);
            
            // Check if it's an API key error
            try {
              const errorData = JSON.parse(errorText);
              if (errorData.error && errorData.error.toLowerCase().includes('invalid api key')) {
                throw new Error(`ATTPanel API Key is invalid. Please update your API key:\n\n1. Go to https://attpanel.com\n2. Login to your account\n3. Go to Account/API section\n4. Copy your valid API key\n5. Run: node fix-attpanel.js YOUR_NEW_API_KEY\n\nCurrent key: ${provider.api_key.substring(0, 8)}...`);
              }
            } catch (parseError) {
              // If not JSON, continue with original error
            }
            
            throw new Error(`ATTPanel API returned ${response.status}: ${errorText}. Please check API key and URL.`);
          }
        } catch (error) {
          console.log(`❌ ATTPanel request failed:`, error instanceof Error ? error.message : error);
          
          // Enhanced error message for API key issues
          if (error instanceof Error && error.message.includes('Invalid API Key')) {
            throw new Error(`ATTPanel API Key is invalid. Please update your API key:\n\n1. Go to https://attpanel.com\n2. Login to your account\n3. Go to Account/API section\n4. Copy your valid API key\n5. Run: node fix-attpanel.js YOUR_NEW_API_KEY\n\nCurrent key: ${provider.api_key.substring(0, 8)}...`);
          }
          
          throw error;
        }
      } else {
        // For other providers (including custom providers), try multiple methods and URLs
        const baseUrls = [providerConfig.apiUrl, ...(providerConfig.alternativeUrls || [])];
        console.log(`🔥 Testing URLs for ${provider.name} categories:`, baseUrls);

        for (const baseUrl of baseUrls) {
          console.log(`🔥 Trying provider ${provider.name} with URL: ${baseUrl}`);

          // Method 1: POST with FormData
          try {
            console.log(`📤 POST FormData request to ${baseUrl}`);
            const formData = new FormData();
            formData.append('key', provider.api_key);
            formData.append('action', 'services');

            const response = await fetch(baseUrl, {
              method: 'POST',
              body: formData,
            });

            console.log(`📥 POST FormData Response status: ${response.status}`);

            if (response.ok) {
              const data = await response.json();
              console.log(`📊 POST FormData Response data:`, JSON.stringify(data, null, 2));
              if (Array.isArray(data) && data.length > 0) {
                providerServices = data;
                workingUrl = baseUrl;
                console.log(`✅ SUCCESS with POST FormData ${baseUrl}! Found ${data.length} services`);
                break;
              } else {
                console.log(`❌ POST FormData: Invalid data format or empty array`);
              }
            }
          } catch (error) {
            console.error(`❌ POST FormData failed for ${baseUrl}:`, error);
          }

          // Method 2: POST with URLSearchParams
          try {
            console.log(`📤 POST URLSearchParams request to ${baseUrl}`);
            const params = new URLSearchParams();
            params.append('key', provider.api_key);
            params.append('action', 'services');

            const response = await fetch(baseUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: params,
            });

            console.log(`📥 POST URLSearchParams Response status: ${response.status}`);

            if (response.ok) {
              const data = await response.json();
              console.log(`📊 POST URLSearchParams Response data:`, JSON.stringify(data, null, 2));
              if (Array.isArray(data) && data.length > 0) {
                providerServices = data;
                workingUrl = baseUrl;
                console.log(`✅ SUCCESS with POST URLSearchParams ${baseUrl}! Found ${data.length} services`);
                break;
              } else {
                console.log(`❌ POST URLSearchParams: Invalid data format or empty array`);
              }
            }
          } catch (error) {
            console.error(`❌ POST URLSearchParams failed for ${baseUrl}:`, error);
          }

          // Method 3: POST with JSON
          try {
            console.log(`📤 POST JSON request to ${baseUrl}`);
            const response = await fetch(baseUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                key: provider.api_key,
                action: 'services'
              }),
            });

            console.log(`📥 POST JSON Response status: ${response.status}`);

            if (response.ok) {
              const data = await response.json();
              console.log(`📊 POST JSON Response data:`, JSON.stringify(data, null, 2));
              if (Array.isArray(data) && data.length > 0) {
                providerServices = data;
                workingUrl = baseUrl;
                console.log(`✅ SUCCESS with POST JSON ${baseUrl}! Found ${data.length} services`);
                break;
              } else {
                console.log(`❌ POST JSON: Invalid data format or empty array`);
              }
            }
          } catch (error) {
            console.error(`❌ POST JSON failed for ${baseUrl}:`, error);
          }

          // Method 4: GET with query parameters
          try {
            const servicesUrl = `${baseUrl}?key=${provider.api_key}&action=services`;
            console.log(`📤 GET request to ${servicesUrl}`);

            const response = await fetch(servicesUrl);
            console.log(`📥 GET Response status: ${response.status}`);

            if (response.ok) {
              const data = await response.json();
              console.log(`📊 GET Response data:`, JSON.stringify(data, null, 2));
              if (Array.isArray(data) && data.length > 0) {
                providerServices = data;
                workingUrl = baseUrl;
                console.log(`✅ SUCCESS with GET ${servicesUrl}! Found ${data.length} services`);
                break;
              } else {
                console.log(`❌ GET: Invalid data format or empty array`);
              }
            }
          } catch (error) {
            console.error(`❌ GET failed for ${baseUrl}:`, error);
          }
        }

        // If services were found, we can proceed
        if (providerServices) {
          // Services found, continue processing
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

    // Default: Get all configured providers (both active and inactive)
    const configuredProviders = await db.apiProvider.findMany({
      select: {
        id: true,
        name: true,
        api_key: true,
        status: true
      },
      orderBy: [
        { status: 'desc' }, // Active providers first
        { name: 'asc' }     // Then alphabetical
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
            // Add provider fields
            providerId: provider.id,
            providerName: provider.name,
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
