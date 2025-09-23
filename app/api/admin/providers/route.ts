import { auth } from '@/auth';
import { getCurrentUser } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
// Custom providers only - no predefined providers

// GET - Get all available providers
export async function GET() {
  try {
    console.log('API /admin/providers called');
    const session = await getCurrentUser();
    console.log('Session:', session?.user?.email, session?.user?.role);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      console.log('No session found or user is not admin:', session?.user?.role);
      return NextResponse.json(
        {
          error: 'Unauthorized access. Admin privileges required.',
          success: false,
          data: null
        },
        { status: 401 }
      );
    }

    // Get configured providers from database
    let configuredProviders: any[] = [];
    try {
      // First ensure api_providers table exists and rename if needed
      await db.$executeRaw`
        CREATE TABLE IF NOT EXISTS \`api_providers\` (
          \`id\` int NOT NULL AUTO_INCREMENT,
          \`name\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
          \`api_key\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
          \`api_url\` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          \`status\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'inactive',
          \`is_custom\` boolean DEFAULT FALSE,
          \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`api_providers_name_key\` (\`name\`),
          KEY \`api_providers_status_idx\` (\`status\`),
          KEY \`api_providers_name_idx\` (\`name\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;
      
      // Columns api_url and is_custom already exist in schema, no need to add them



      configuredProviders = await db.api_providers.findMany({
        select: {
          id: true,
          name: true,
          api_key: true,
          api_url: true,
          http_method: true,
          status: true,
          is_custom: true,
          createdAt: true,
          updatedAt: true,
          current_balance: true,
          balance_last_updated: true
        },
        orderBy: {
          createdAt: 'desc'  // Order by newest first (new to old)
        }
      });
    } catch (error) {
      console.log('Provider table error:', error);
      configuredProviders = [];
    }

    // Get service and order counts for each provider
    const providerStats = await Promise.all(
      configuredProviders.map(async (cp: any) => {
        try {
          // Count total services for this provider
          const totalServices = await db.service.count({
            where: { providerId: cp.id }
          });

          // Count active services for this provider
          const activeServices = await db.service.count({
            where: { 
              providerId: cp.id,
              status: 'active'
            }
          });

          // Count orders for services from this provider
          const orderCount = await db.newOrder.count({
            where: {
              service: {
                providerId: cp.id
              }
            }
          });

          return {
            providerId: cp.id,
            totalServices,
            activeServices,
            orderCount
          };
        } catch (error) {
          console.error(`Error getting stats for provider ${cp.id}:`, error);
          return {
            providerId: cp.id,
            totalServices: 0,
            activeServices: 0,
            orderCount: 0
          };
        }
      })
    );

    // Create a map for quick lookup
    const statsMap = new Map(providerStats.map(stat => [stat.providerId, stat]));

    // Map all providers as custom providers with dynamic stats
    const allProviders = configuredProviders.map((cp: any) => {
      const stats = statsMap.get(cp.id) || { totalServices: 0, activeServices: 0, orderCount: 0 };
      
      return {
        value: cp.name,
        label: cp.name,
        description: `Custom provider: ${cp.name}`,
        configured: true,
        status: cp.status,
        id: cp.id,
        apiKey: cp.api_key || '',
        apiUrl: cp.api_url || '',
        httpMethod: cp.http_method || 'POST',
        isCustom: true,
        createdAt: cp.createdAt,
        updatedAt: cp.updatedAt,
        currentBalance: cp.current_balance || 0,
        balanceLastUpdated: cp.balance_last_updated,
        // Add dynamic stats
        services: stats.totalServices,
        importedServices: stats.totalServices,
        activeServices: stats.activeServices,
        orders: stats.orderCount
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        providers: allProviders,
        total: allProviders.length,
        configured: configuredProviders.length,
        available: 0,
        custom: allProviders.length
      },
      error: null
    });

  } catch (error) {
    console.error('Error getting providers:', error);
    return NextResponse.json(
      {
        error: 'Failed to get providers: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// POST - Add new provider
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Unauthorized access. Admin privileges required.',
          success: false,
          data: null
        },
        { status: 401 }
      );
    }

    const { 
      customProviderName, 
      apiKey, 
      apiUrl, 
      httpMethod, 
      // API Specification Fields
      apiKeyParam,
      actionParam,
      servicesAction,
      servicesEndpoint,
      addOrderAction,
      addOrderEndpoint,
      serviceIdParam,
      linkParam,
      quantityParam,
      runsParam,
      intervalParam,
      statusAction,
      statusEndpoint,
      orderIdParam,
      ordersParam,
      refillAction,
      refillEndpoint,
      refillStatusAction,
      refillIdParam,
      refillsParam,
      cancelAction,
      cancelEndpoint,
      balanceAction,
      balanceEndpoint,
      responseMapping,
      requestFormat,
      responseFormat,
      rateLimitPerMin,
      timeoutSeconds
    } = await req.json();

    console.log('POST /api/admin/providers - Received data:', {
      customProviderName,
      apiKey: apiKey ? '[REDACTED]' : 'undefined/null',
      apiUrl,
      httpMethod
    });

    // All providers are custom providers
    const providerName = customProviderName;

    if (!providerName || !apiKey) {
      return NextResponse.json(
        {
          error: 'Provider name and API key are required',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // All providers are custom providers
    const providerConfig = {
      value: providerName,
      label: providerName,
      description: `Custom provider: ${providerName}`
    };

    // Check if provider already exists and create new provider
    let newProvider: any;
    try {
      // Check if provider name already exists
      const existingProviderByName = await db.api_providers.findUnique({
        where: { name: providerName }
      });

      if (existingProviderByName) {
        return NextResponse.json(
          {
            error: 'Provider with this name already exists',
            success: false,
            data: null
          },
          { status: 400 }
        );
      }

      // Check if API URL already exists (if provided)
      if (apiUrl && apiUrl.trim() !== '') {
        const existingProviderByUrl = await db.api_providers.findFirst({
          where: { 
            api_url: apiUrl.trim()
          }
        });

        if (existingProviderByUrl) {
          return NextResponse.json(
            {
              error: 'Provider with this API URL already exists',
              success: false,
              data: null
            },
            { status: 400 }
          );
        }
      }

      // Create new provider
      newProvider = await db.api_providers.create({
        data: {
          name: providerName,
          api_key: apiKey,
          api_url: apiUrl || '',
          http_method: httpMethod || 'POST',
          status: 'inactive',
          is_custom: true,
          // API Specification Fields
          api_key_param: apiKeyParam || 'key',
          action_param: actionParam || 'action',
          services_action: servicesAction || 'services',
          services_endpoint: servicesEndpoint || '',
          add_order_action: addOrderAction || 'add',
          add_order_endpoint: addOrderEndpoint || '',
          service_id_param: serviceIdParam || 'service',
          link_param: linkParam || 'link',
          quantity_param: quantityParam || 'quantity',
          runs_param: runsParam || 'runs',
          interval_param: intervalParam || 'interval',
          status_action: statusAction || 'status',
          status_endpoint: statusEndpoint || '',
          order_id_param: orderIdParam || 'order',
          orders_param: ordersParam || 'orders',
          refill_action: refillAction || 'refill',
          refill_endpoint: refillEndpoint || '',
          refill_status_action: refillStatusAction || 'refill_status',
          refill_id_param: refillIdParam || 'refill',
          refills_param: refillsParam || 'refills',
          cancel_action: cancelAction || 'cancel',
          cancel_endpoint: cancelEndpoint || '',
          balance_action: balanceAction || 'balance',
          balance_endpoint: balanceEndpoint || '',
          response_mapping: responseMapping || '',
          request_format: requestFormat || 'form',
          response_format: responseFormat || 'json',
          rate_limit_per_min: rateLimitPerMin ? parseInt(rateLimitPerMin) : null,
          timeout_seconds: timeoutSeconds || 30
        }
      });

      console.log('Provider created successfully:', {
        id: newProvider.id,
        name: newProvider.name,
        api_key: newProvider.api_key ? '[REDACTED]' : 'null',
        api_url: newProvider.api_url
      });
    } catch (error) {
      console.error('Provider creation error:', error);
      return NextResponse.json(
        {
          error: 'Failed to create provider: ' + (error instanceof Error ? error.message : 'Unknown error'),
          success: false,
          data: null
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Provider ${providerConfig.label} added successfully`,
      data: {
        provider: {
          id: newProvider.id,
          status: newProvider.status,
          isCustom: newProvider.is_custom,
          ...providerConfig
        }
      },
      error: null
    });

  } catch (error) {
    console.error('Error adding provider:', error);
    return NextResponse.json(
      {
        error: 'Failed to add provider: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// PUT - Update provider status
export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentUser();

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Unauthorized access. Admin privileges required.',
          success: false,
          data: null
        },
        { status: 401 }
      );
    }

    const { id, status, name, apiKey, apiUrl, httpMethod, username, password } = await req.json();

    console.log('PUT /api/admin/providers - Received data:', {
      id,
      status,
      name,
      apiKey: apiKey ? '[REDACTED]' : 'undefined/null',
      apiUrl,
      httpMethod,
      username,
      password: password ? '[REDACTED]' : 'undefined/null'
    });

    if (!id) {
      return NextResponse.json(
        {
          error: 'Provider ID is required',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (name !== undefined) updateData.name = name;
    if (apiKey !== undefined) updateData.api_key = apiKey;
    if (apiUrl !== undefined) updateData.api_url = apiUrl;
    if (httpMethod !== undefined) updateData.http_method = httpMethod;

    // If activating provider, validate required fields first
    if (status === 'active') {
      const provider = await db.api_providers.findUnique({
        where: { id: parseInt(id) }
      });

      if (!provider) {
        return NextResponse.json(
          {
            error: 'Provider not found',
            success: false,
            data: null
          },
          { status: 404 }
        );
      }

      // Check if API URL and key will be available after update
      const finalApiUrl = updateData.api_url !== undefined ? updateData.api_url : provider.api_url;
      const finalApiKey = updateData.api_key !== undefined ? updateData.api_key : provider.api_key;

      if (!finalApiUrl || finalApiUrl.trim() === '') {
        return NextResponse.json(
          {
            error: 'Cannot activate provider: API URL is required',
            success: false,
            data: null
          },
          { status: 400 }
        );
      }

      if (!finalApiKey || finalApiKey.trim() === '') {
        return NextResponse.json(
          {
            error: 'Cannot activate provider: API Key is required',
            success: false,
            data: null
          },
          { status: 400 }
        );
      }

      // Validate URL format
      try {
        new URL(finalApiUrl);
      } catch (error) {
        return NextResponse.json(
          {
            error: 'Cannot activate provider: Invalid API URL format',
            success: false,
            data: null
          },
          { status: 400 }
        );
      }
    }

    // Update provider
    const updatedProvider = await db.api_providers.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    console.log('Provider updated successfully:', {
      id: updatedProvider.id,
      name: updatedProvider.name,
      api_key: updatedProvider.api_key ? '[REDACTED]' : 'null',
      api_url: updatedProvider.api_url
    });

    return NextResponse.json({
      success: true,
      message: `Provider ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: {
        provider: updatedProvider
      },
      error: null
    });

  } catch (error) {
    console.error('Error updating provider:', error);
    return NextResponse.json(
      {
        error: 'Failed to update provider: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete provider
export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Unauthorized access. Admin privileges required.',
          success: false,
          data: null
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const deleteType = searchParams.get('type') || 'permanent';

    // Validate ID parameter
    if (!id || id === 'null' || id === 'undefined') {
      return NextResponse.json(
        {
          error: 'Valid Provider ID is required. Cannot delete unconfigured provider.',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Parse and validate numeric ID
    const providerId = parseInt(id);
    if (isNaN(providerId) || providerId <= 0) {
      return NextResponse.json(
        {
          error: 'Invalid Provider ID format. ID must be a positive number.',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    let message = '';
    
    if (deleteType === 'trash') {
    // Move to trash - delete provider and its services
      await db.api_providers.update({
        where: { id: providerId },
        data: { 
          status: 'trash',
          updatedAt: new Date()
        }
      });

      // Get all services associated with this provider
      const providerServices = await db.Service.findMany({
        where: { providerId: providerId },
        select: { id: true }
      });

      const serviceIds = providerServices.map(service => service.id);

      if (serviceIds.length > 0) {
        // Delete dependent records first to avoid foreign key constraint violations
        
        // Delete favorite services
        await db.FavoriteService.deleteMany({
          where: { serviceId: { in: serviceIds } }
        });

        // Delete cancel requests for orders related to these services
        await db.CancelRequest.deleteMany({
          where: { 
            order: { 
              serviceId: { in: serviceIds } 
            } 
          }
        });

        // Delete refill requests for orders related to these services
        await db.RefillRequest.deleteMany({
          where: { 
            order: { 
              serviceId: { in: serviceIds } 
            } 
          }
        });

        // Delete orders related to these services
        await db.NewOrder.deleteMany({
          where: { serviceId: { in: serviceIds } }
        });

        // Finally delete the services
        await db.Service.deleteMany({
          where: { providerId: providerId }
        });
      }

      message = 'Provider moved to trash and all associated imported services & categories are moved to trash';
    } else {
      // Permanent delete - remove provider and its services
      
      // Get all services associated with this provider
      const providerServices = await db.Service.findMany({
        where: { providerId: providerId },
        select: { id: true }
      });

      const serviceIds = providerServices.map(service => service.id);

      if (serviceIds.length > 0) {
        // Delete dependent records first to avoid foreign key constraint violations
        
        // Delete favorite services
        await db.FavoriteService.deleteMany({
          where: { serviceId: { in: serviceIds } }
        });

        // Delete cancel requests for orders related to these services
        await db.CancelRequest.deleteMany({
          where: { 
            order: { 
              serviceId: { in: serviceIds } 
            } 
          }
        });

        // Delete refill requests for orders related to these services
        await db.RefillRequest.deleteMany({
          where: { 
            order: { 
              serviceId: { in: serviceIds } 
            } 
          }
        });

        // Delete orders related to these services
        await db.NewOrder.deleteMany({
          where: { serviceId: { in: serviceIds } }
        });

        // Delete the services
        await db.Service.deleteMany({
          where: { providerId: providerId }
        });
      }

      // Finally delete the provider
      await db.api_providers.delete({
        where: { id: providerId }
      });

      message = 'Provider and all associated imported services & categories permanently deleted successfully';
    }

    return NextResponse.json({
      success: true,
      message: message,
      data: null,
      error: null
    });

  } catch (error) {
    console.error('Error deleting provider:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete provider: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}