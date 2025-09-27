import { auth } from '@/auth';
import { convertToUSD } from '@/lib/currency-utils';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { ApiRequestBuilder, ApiResponseParser, createApiSpecFromProvider } from '@/lib/provider-api-specification';
import { validateProvider } from '@/lib/utils/providerValidator';

// Get valid providers function
const getValidProviders = async () => {
  try {
    return await db.api_providers.findMany({
      where: {
        status: 'active',
        api_key: { not: '' },
        api_url: { not: '' }
      }
    });
  } catch (error) {
    console.error('Error getting valid providers:', error);
    return [];
  }
};

// Default endpoints for custom providers
const DEFAULT_ENDPOINTS = {
  services: "/services",
  balance: "/balance"
};

// POST - Sync services from providers
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      providerId, 
      syncType = 'all', // 'all', 'prices', 'status', 'new_services'
      profitMargin = 20 
    } = await req.json();

    let providersToSync = [];

    if (providerId) {
      // Sync specific provider with validation
      const validation = await validateProvider(parseInt(providerId));
      if (validation.isValid && validation.provider) {
        providersToSync.push(validation.provider);
      } else {
        return NextResponse.json(
          { error: `Cannot sync: ${validation.error}. Please check your API configuration.`, success: false, data: null },
          { status: 400 }
        );
      }
    } else {
      // Sync all valid providers (active with API URL and key)
      providersToSync = await getValidProviders();
    }

    if (providersToSync.length === 0) {
      return NextResponse.json(
        { error: 'No active providers found', success: false, data: null },
        { status: 404 }
      );
    }

    const syncResults = [];
    const errors = [];

    // Get enabled currencies for price conversion
    const currenciesData = await db.currency.findMany({
      where: { enabled: true }
    });

    const currencies = currenciesData.map(c => ({
      ...c,
      rate: Number(c.rate)
    }));

    for (const provider of providersToSync) {
      try {
        console.log(`Starting sync for provider: ${provider.name}`);
        
        // Create API specification from provider configuration
        const apiSpec = createApiSpecFromProvider(provider);
        
        // Create API request builder with provider's API specification
        const apiBuilder = new ApiRequestBuilder(
          apiSpec,
          provider.api_url,
          provider.api_key,
          provider.http_method || 'POST'
        );

        // Build services request using API specification
        const servicesRequest = apiBuilder.buildServicesRequest();
        
        const response = await fetch(servicesRequest.url, {
          method: servicesRequest.method,
          headers: servicesRequest.headers,
          body: servicesRequest.data,
          timeout: (provider.timeout_seconds || 30) * 1000
        });

        if (!response.ok) {
          throw new Error(`Provider API error: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        
        // Parse response using API specification
        const responseParser = new ApiResponseParser({
          responseMapping: provider.response_mapping || '',
          responseFormat: (provider.response_format as 'json' | 'xml') || 'json'
        });
        
        const providerServices = responseParser.parseServicesResponse(responseData);

        if (!Array.isArray(providerServices)) {
          throw new Error('Invalid response format from provider');
        }

        console.log(`Fetched ${providerServices.length} services from ${provider.name}`);

        // Get existing services for this provider - try multiple approaches
        let existingServices = await db.service.findMany({
          where: {
            updateText: {
              contains: `"providerId":${provider.id}`
            }
          }
        });

        // If no services found with exact providerId match, try broader search
        if (existingServices.length === 0) {
          console.log(`No services found with exact providerId:${provider.id}, trying broader search...`);
          
          // Try searching for provider name in updateText
          const servicesByProviderName = await db.service.findMany({
            where: {
              updateText: {
                contains: `"provider":"${provider.name}"`
              }
            }
          });

          // Also get all services to check their updateText structure
          const allServices = await db.service.findMany({
            where: {
              updateText: {
                not: null
              }
            },
            take: 10 // Just a sample to debug
          });

          console.log(`Found ${servicesByProviderName.length} services by provider name`);
          console.log(`Sample updateText structures:`, allServices.map(s => ({
            id: s.id,
            name: s.name,
            updateText: s.updateText
          })));

          existingServices = servicesByProviderName;
        }

        console.log(`Found ${existingServices.length} existing services for provider ${provider.name}`);

        let syncStats = {
          provider: provider.name,
          providerId: provider.id,
          totalFetched: providerServices.length,
          updated: 0,
          created: 0,
          disabled: 0,
          priceChanges: 0,
          statusChanges: 0,
          errors: [] as any[]
        };

        // Create a map of existing services by provider service ID
        const existingServiceMap = new Map();
        existingServices.forEach(service => {
          try {
            const providerInfo = JSON.parse(service.updateText || '{}');
            console.log(`Service ${service.id} (${service.name}) updateText:`, providerInfo);
            
            // Try multiple ways to match services
            const serviceId = providerInfo.providerServiceId || providerInfo.id || providerInfo.serviceId;
            if (serviceId) {
              existingServiceMap.set(serviceId.toString(), service);
              // Also add numeric version if it's a string
              if (typeof serviceId === 'string' && !isNaN(parseInt(serviceId))) {
                existingServiceMap.set(parseInt(serviceId).toString(), service);
              }
            }
          } catch (error) {
            console.error('Error parsing service provider info:', error);
          }
        });

        console.log(`Created service map with ${existingServiceMap.size} entries`);

        // Process each provider service
        for (const providerService of providerServices) {
          try {
            const providerServiceId = providerService.service || providerService.id;
            console.log(`Processing provider service: ${providerService.name} (ID: ${providerServiceId})`);
            
            const existingService = existingServiceMap.get(providerServiceId?.toString());
            console.log(`Found existing service:`, existingService ? `${existingService.id} (${existingService.name})` : 'None');

            const providerRate = parseFloat(providerService.rate) || 0;
            const markupRate = providerRate * (1 + profitMargin / 100);
            const rateUSD = convertToUSD(markupRate, 'USD', currencies);

            if (existingService) {
              // Update existing service
              const updates: any = {};
              let hasChanges = false;

              // Parse existing provider info
              const existingProviderInfo = JSON.parse(existingService.updateText || '{}');
              const existingProviderRate = existingProviderInfo.originalRate || 0;

              // Check for price changes - only update provider pricing info, not website service pricing
              if (syncType === 'all' || syncType === 'prices') {
                if (Math.abs(providerRate - existingProviderRate) > 0.01) {
                  // Only update provider pricing information in updateText
                  // Do NOT update rate as this is website service pricing
                  updates.updateText = JSON.stringify({
                    ...existingProviderInfo,
                    originalRate: providerRate,
                    providerMarkupRate: markupRate,
                    providerRateUSD: rateUSD,
                    lastSynced: new Date().toISOString()
                  });
                  hasChanges = true;
                  syncStats.priceChanges++;
                }
              }

              // Check for service details changes
              if (syncType === 'all') {
                if (providerService.name !== existingService.name) {
                  updates.name = providerService.name;
                  hasChanges = true;
                }

                if (parseInt(providerService.min) !== existingService.min_order) {
                  updates.min_order = parseInt(providerService.min) || 100;
                  hasChanges = true;
                }

                if (parseInt(providerService.max) !== existingService.max_order) {
                  updates.max_order = parseInt(providerService.max) || 10000;
                  hasChanges = true;
                }

                // Update provider information in updateText
                const currentProviderInfo = JSON.parse(existingService.updateText || '{}');
                const updatedProviderInfo = {
                  ...currentProviderInfo,
                  provider: provider.name,
                  providerId: provider.id,
                  providerServiceId: providerServiceId,
                  originalRate: providerRate,
                  lastSynced: new Date().toISOString()
                };

                // Always update provider info to ensure it's current
                updates.updateText = JSON.stringify(updatedProviderInfo);
                hasChanges = true;
              }

              if (hasChanges) {
                await db.service.update({
                  where: { id: existingService.id },
                  data: updates
                });
                syncStats.updated++;
              }

            } else {
              // Service doesn't exist - skip creation during sync
              // Services should only be imported through the Import page
              console.log(`Skipping service ${providerService.name} - not found in database. Use Import page to add new services.`);
            }

          } catch (serviceError) {
            console.error(`Error syncing service ${providerService.name}:`, serviceError);
            syncStats.errors.push({
              service: providerService.name,
              error: serviceError instanceof Error ? serviceError.message : 'Unknown error'
            });
          }
        }

        // Check for services that are no longer available from provider
        // Only disable services if we have a substantial response and the service is clearly missing
        if ((syncType === 'all' || syncType === 'status') && providerServices.length > 0) {
          const providerServiceIds = new Set();
          
          // Create a comprehensive set of provider service identifiers
          providerServices.forEach(s => {
            const serviceId = s.service || s.id;
            if (serviceId) {
              providerServiceIds.add(serviceId.toString());
              providerServiceIds.add(parseInt(serviceId).toString()); // Handle string/number conversion
            }
          });

          // Only disable services if we have a reasonable number of services from provider
          // This prevents mass disabling due to API errors or temporary issues
          if (providerServices.length >= 10) {
            for (const [providerServiceId, existingService] of existingServiceMap) {
              if (!providerServiceIds.has(providerServiceId.toString()) && 
                  !providerServiceIds.has(parseInt(providerServiceId).toString()) && 
                  existingService.status === 'active') {
                
                console.log(`Service ${existingService.name} (ID: ${providerServiceId}) not found in provider response, marking as inactive`);
                
                // Service no longer available from provider, disable it
                await db.service.update({
                  where: { id: existingService.id },
                  data: { 
                    status: 'inactive',
                    updateText: JSON.stringify({
                      ...JSON.parse(existingService.updateText || '{}'),
                      disabledReason: 'Service no longer available from provider',
                      disabledAt: new Date().toISOString(),
                      lastSynced: new Date().toISOString()
                    })
                  }
                });
                syncStats.disabled++;
                syncStats.statusChanges++;
              }
            }
          } else {
            console.log(`Skipping service status check - only ${providerServices.length} services returned from provider (minimum 10 required)`);
          }
        }

        syncResults.push(syncStats);

      } catch (providerError) {
        console.error(`Error syncing provider ${provider.name}:`, providerError);
        const errorMessage = providerError instanceof Error ? providerError.message : 'Unknown error';
        
        errors.push({
          provider: provider.name,
          error: errorMessage
        });
      }
    }

    // Calculate totals
    const totals = syncResults.reduce((acc, result) => ({
      totalFetched: acc.totalFetched + result.totalFetched,
      updated: acc.updated + result.updated,
      created: acc.created + result.created,
      disabled: acc.disabled + result.disabled,
      priceChanges: acc.priceChanges + result.priceChanges,
      statusChanges: acc.statusChanges + result.statusChanges
    }), {
      totalFetched: 0,
      updated: 0,
      created: 0,
      disabled: 0,
      priceChanges: 0,
      statusChanges: 0
    });

    return NextResponse.json({
      success: true,
      message: `Sync completed for ${syncResults.length} provider(s)`,
      data: {
        syncType,
        providersProcessed: syncResults.length,
        totals,
        results: syncResults,
        errors: errors,
        timestamp: new Date().toISOString()
      },
      error: null
    });

  } catch (error) {
    console.error('Error syncing providers:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync providers: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
