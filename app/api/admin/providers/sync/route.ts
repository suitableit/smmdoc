import { auth } from '@/auth';
import { convertToUSD } from '@/lib/currency-utils';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Validate provider function
const validateProvider = async (providerId: string) => {
  try {
    const provider = await db.api_providers.findUnique({
      where: { id: parseInt(providerId) }
    });
    
    if (!provider) {
      return { isValid: false, provider: null, error: 'Provider not found' };
    }
    
    if (provider.status !== 'active') {
      return { isValid: false, provider: null, error: 'Provider is not active' };
    }
    
    if (!provider.api_key || !provider.api_url) {
      return { isValid: false, provider: null, error: 'Provider missing API key or URL' };
    }
    
    return { isValid: true, provider, error: null };
  } catch (error) {
    return { isValid: false, provider: null, error: 'Database error' };
  }
};

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

// Provider configurations
const PROVIDER_CONFIGS = {
  smmgen: {
    apiUrl: "https://smmgen.com/api/v2",
    endpoints: { services: "/services", balance: "/balance" }
  },
  growfollows: {
    apiUrl: "https://growfollows.com/api/v2",
    endpoints: { services: "/services", balance: "/balance" }
  },
  attpanel: {
    apiUrl: "https://attpanel.com/api/v2",
    endpoints: { services: "/services", balance: "/balance" }
  },
  smmcoder: {
    apiUrl: "https://smmcoder.com/api/v2",
    endpoints: { services: "/services", balance: "/balance" }
  },
  smmprovider1: {
    apiUrl: "https://api.smmprovider1.com/v2",
    endpoints: { services: "/services", balance: "/balance" }
  },
  smmprovider2: {
    apiUrl: "https://api.smmprovider2.com/v1",
    endpoints: { services: "/services", balance: "/balance" }
  },
  customprovider: {
    apiUrl: "https://custom.provider.com/api",
    endpoints: { services: "/services", balance: "/balance" }
  },
  testprovider: {
    apiUrl: "https://test.provider.com/v2",
    endpoints: { services: "/services", balance: "/balance" }
  },
  smmking: {
    apiUrl: "https://api.smmking.com/v2",
    endpoints: { services: "/services", balance: "/balance" }
  },
  socialpanel: {
    apiUrl: "https://api.socialpanel.com/v2",
    endpoints: { services: "/services", balance: "/balance" }
  }
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
      const validation = await validateProvider(providerId);
      if (validation.isValid && validation.provider) {
        providersToSync.push(validation.provider);
      } else {
        return NextResponse.json(
          { error: `Provider validation failed: ${validation.error}`, success: false, data: null },
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
        
        // Get provider config or use default endpoints
        const providerConfig = PROVIDER_CONFIGS[provider.name.toLowerCase() as keyof typeof PROVIDER_CONFIGS] || {
          endpoints: { services: "/services", balance: "/balance" }
        };

        // Fetch services from provider API - use database URL instead of hardcoded config
        const servicesUrl = `${provider.api_url}${providerConfig.endpoints.services}?key=${(provider as any).api_key}`;
        
        const response = await fetch(servicesUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Provider API error: ${response.status} ${response.statusText}`);
        }

        const providerServices = await response.json();

        if (!Array.isArray(providerServices)) {
          throw new Error('Invalid response format from provider');
        }

        console.log(`Fetched ${providerServices.length} services from ${provider.name}`);

        // Get existing services for this provider
        const existingServices = await db.service.findMany({
          where: {
            updateText: {
              contains: `"providerId":${provider.id}`
            }
          }
        });

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
            if (providerInfo.providerServiceId) {
              existingServiceMap.set(providerInfo.providerServiceId, service);
            }
          } catch (error) {
            console.error('Error parsing service provider info:', error);
          }
        });

        // Process each provider service
        for (const providerService of providerServices) {
          try {
            const providerServiceId = providerService.service || providerService.id;
            const existingService = existingServiceMap.get(providerServiceId);

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

              // Check for price changes
              if (syncType === 'all' || syncType === 'prices') {
                if (Math.abs(providerRate - existingProviderRate) > 0.01) {
                  updates.rate = markupRate;
                  updates.rateUSD = rateUSD;
                  updates.updateText = JSON.stringify({
                    ...existingProviderInfo,
                    originalRate: providerRate,
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
              }

              if (hasChanges) {
                await db.service.update({
                  where: { id: existingService.id },
                  data: updates
                });
                syncStats.updated++;
              }

            } else if (syncType === 'all' || syncType === 'new_services') {
              // Create new service
              const defaultCategory = await db.category.findFirst({
                where: { category_name: 'Imported Services' }
              }) || await db.category.create({
                data: {
                  category_name: 'Imported Services',
                  status: 'active',
                  userId: session.user.id
                }
              });

              await db.service.create({
                data: {
                  name: providerService.name,
                  description: `${providerService.description || providerService.name}`,
                  rate: markupRate,
                  rateUSD: rateUSD,
                  min_order: parseInt(providerService.min) || 100,
                  max_order: parseInt(providerService.max) || 10000,
                  avg_time: '0-1 Hours',
                  userId: session.user.id,
                  categoryId: defaultCategory.id,
                  status: 'active',
                  perqty: 1000,
                  updateText: JSON.stringify({
                    provider: provider.name,
                    providerId: provider.id,
                    providerServiceId: providerServiceId,
                    originalRate: providerRate,
                    lastSynced: new Date().toISOString()
                  })
                }
              });
              syncStats.created++;
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
        if (syncType === 'all' || syncType === 'status') {
          const providerServiceIds = new Set(
            providerServices.map(s => s.service || s.id)
          );

          for (const [providerServiceId, existingService] of existingServiceMap) {
            if (!providerServiceIds.has(providerServiceId) && existingService.status === 'active') {
              // Service no longer available from provider, disable it
              await db.service.update({
                where: { id: existingService.id },
                data: { 
                  status: 'inactive',
                  updateText: JSON.stringify({
                    ...JSON.parse(existingService.updateText || '{}'),
                    disabledReason: 'Service no longer available from provider',
                    disabledAt: new Date().toISOString()
                  })
                }
              });
              syncStats.disabled++;
              syncStats.statusChanges++;
            }
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
