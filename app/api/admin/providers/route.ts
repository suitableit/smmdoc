import { auth } from '@/auth';
import { getCurrentUser } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
// Custom providers only - no predefined providers

// GET - Get all available providers
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'active'; // 'active', 'trash', 'all', 'with-services'

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

      // Build where clause based on filter
      let whereClause: any = {};
      
      if (filter === 'active') {
        whereClause = {
          deletedAt: null,
          status: 'active'
        };
      } else if (filter === 'inactive') {
        whereClause = {
          deletedAt: null,
          status: 'inactive'
        };
      } else if (filter === 'trash') {
        whereClause.deletedAt = { not: null };
      } else if (filter === 'all') {
        // Include all providers regardless of deletedAt status
        whereClause = {};
      } else if (filter === 'with-services') {
        // For providers with imported services, we'll filter after getting service counts
        whereClause = {
          deletedAt: null,
          status: 'active'
        };
      }
      // For no filter, return everything

      configuredProviders = await db.api_providers.findMany({
        where: whereClause,
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
          deletedAt: true,
          current_balance: true,
          balance_last_updated: true
        },
        orderBy: {
          createdAt: 'desc'  // Order by newest first (new to old)
        }
      });

      console.log(`Filter: ${filter}, Where clause:`, whereClause);
      console.log(`Found ${configuredProviders.length} providers from database:`, configuredProviders.map(p => ({ id: p.id, name: p.name, status: p.status, deletedAt: p.deletedAt })));
    } catch (error) {
      console.log('Provider table error:', error);
      configuredProviders = [];
    }

    // Get service and order counts for each provider
    const providerStats = await Promise.all(
      configuredProviders.map(async (cp: any) => {
        try {
          // Count total services for this provider (including soft-deleted for trash providers)
          const totalServices = await db.service.count({
            where: { 
              providerId: cp.id,
              // For trash providers, include all services; for others, exclude soft-deleted
              ...(cp.deletedAt ? {} : { deletedAt: null })
            }
          });

          // Count active services for this provider
          const activeServices = await db.service.count({
            where: { 
              providerId: cp.id,
              status: 'active',
              // For trash providers, include all services; for others, exclude soft-deleted
              ...(cp.deletedAt ? {} : { deletedAt: null })
            }
          });

          // Count inactive/deactive services for this provider
          const inactiveServices = await db.service.count({
            where: { 
              providerId: cp.id,
              status: 'inactive',
              // For trash providers, include all services; for others, exclude soft-deleted
              ...(cp.deletedAt ? {} : { deletedAt: null })
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
            inactiveServices,
            orderCount
          };
        } catch (error) {
          console.error(`Error getting stats for provider ${cp.id}:`, error);
          return {
            providerId: cp.id,
            totalServices: 0,
            activeServices: 0,
            inactiveServices: 0,
            orderCount: 0
          };
        }
      })
    );

    // Create a map for quick lookup
    const statsMap = new Map(providerStats.map(stat => [stat.providerId, stat]));

    // Map all providers as custom providers with dynamic stats
    let allProviders = configuredProviders.map((cp: any) => {
      const stats = statsMap.get(cp.id) || { totalServices: 0, activeServices: 0, inactiveServices: 0, orderCount: 0 };
      
      return {
        value: cp.name,
        label: cp.name,
        name: cp.name,
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
        deletedAt: cp.deletedAt, // Include deletedAt field in response
        currentBalance: cp.current_balance || 0,
        balanceLastUpdated: cp.balance_last_updated,
        // Add dynamic stats
        services: stats.totalServices,
        importedServices: stats.totalServices,
        activeServices: stats.activeServices,
        inactiveServices: stats.inactiveServices,
        orders: stats.orderCount
      };
    });

    // Filter providers with imported services if requested
    if (filter === 'with-services') {
      allProviders = allProviders.filter(provider => provider.importedServices > 0);
    }



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

// PATCH - Restore provider from trash
export async function PATCH(req: NextRequest) {
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
    const action = searchParams.get('action');

    // Validate parameters
    if (!id || !action || action !== 'restore') {
      return NextResponse.json(
        {
          error: 'Valid Provider ID and action=restore are required.',
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

    // Check if provider exists and is in trash
    const provider = await db.api_providers.findUnique({
      where: { id: providerId }
    });

    if (!provider || !provider.deletedAt) {
      return NextResponse.json(
        {
          error: 'Provider not found in trash.',
          success: false,
          data: null
        },
        { status: 404 }
      );
    }

    // Restore provider
    await db.api_providers.update({
      where: { id: providerId },
      data: { 
        deletedAt: null,
        updatedAt: new Date()
      }
    });

    // Get all soft-deleted services associated with this provider
    const providerServices = await db.service.findMany({
      where: { 
        providerId: providerId,
        deletedAt: { not: null }
      },
      select: { id: true, categoryId: true, serviceTypeId: true }
    });

    const serviceIds = providerServices.map(service => service.id);
    const categoryIds = [...new Set(providerServices.map(service => service.categoryId))];
    const serviceTypeIds = [...new Set(providerServices.map(service => service.serviceTypeId).filter(id => id !== null))];

    if (serviceIds.length > 0) {
      // Restore the services
      await db.service.updateMany({
        where: { 
          providerId: providerId,
          deletedAt: { not: null }
        },
        data: { deletedAt: null }
      });

      // Restore categories that were soft-deleted due to having no own services
      for (const categoryId of categoryIds) {
        const category = await db.category.findUnique({
          where: { id: categoryId }
        });

        if (category && category.deletedAt) {
          await db.category.update({
            where: { id: categoryId },
            data: { deletedAt: null }
          });
        }
      }

      // Restore service types that were marked as deleted due to having no own services
      for (const serviceTypeId of serviceTypeIds) {
        const serviceType = await db.servicetype.findUnique({
          where: { id: serviceTypeId }
        });

        if (serviceType && serviceType.status === 'deleted') {
          await db.servicetype.update({
            where: { id: serviceTypeId },
            data: { 
              status: 'active',
              updatedAt: new Date()
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Provider and all associated services, categories & service types restored successfully',
      data: null,
      error: null
    });

  } catch (error) {
    console.error('Error restoring provider:', error);
    return NextResponse.json(
      {
        error: 'Failed to restore provider: ' + (error instanceof Error ? error.message : 'Unknown error'),
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
      // Move to trash - soft delete provider and its services
      await db.api_providers.update({
        where: { id: providerId },
        data: { 
          deletedAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Get all services associated with this provider
      const providerServices = await db.service.findMany({
        where: { providerId: providerId },
        select: { id: true, categoryId: true, serviceTypeId: true }
      });

      const serviceIds = providerServices.map(service => service.id);
      const categoryIds = [...new Set(providerServices.map(service => service.categoryId))];
      const serviceTypeIds = [...new Set(providerServices.map(service => service.serviceTypeId).filter(id => id !== null))];

      if (serviceIds.length > 0) {
        // Soft delete the provider services
        await db.service.updateMany({
          where: { providerId: providerId },
          data: { deletedAt: new Date() }
        });

        // Handle categories - check if they have self-created services
        for (const categoryId of categoryIds) {
          const selfCreatedServices = await db.service.count({
            where: { 
              categoryId: categoryId,
              providerId: null, // Self-created services have null providerId
              deletedAt: null
            }
          });

          if (selfCreatedServices === 0) {
            // No self-created services, move category to trash
            await db.category.update({
              where: { id: categoryId },
              data: { deletedAt: new Date() }
            });
          } else {
            // Has self-created services, change provider to "Self"
            await db.category.update({
              where: { id: categoryId },
              data: { 
                updatedAt: new Date()
              }
            });
          }
        }

        // Handle service types - check if they have self-created services
        for (const serviceTypeId of serviceTypeIds) {
          const selfCreatedServicesInType = await db.service.count({
            where: { 
              serviceTypeId: serviceTypeId,
              providerId: null, // Self-created services have null providerId
              deletedAt: null
            }
          });

          if (selfCreatedServicesInType === 0) {
            // No self-created services, move service type to trash
            await db.servicetype.update({
              where: { id: serviceTypeId },
              data: { 
                status: 'deleted',
                updatedAt: new Date()
              }
            });
          } else {
            // Has self-created services, change provider to "Self"
            await db.servicetype.update({
              where: { id: serviceTypeId },
              data: { 
                updatedAt: new Date()
              }
            });
          }
        }
      }

      message = 'Provider moved to trash. Categories and service types with self-created services preserved and changed to "Self" provider';
    } else {
      // Permanent delete - remove provider and its services
      
      // Get all services associated with this provider
      const providerServices = await db.service.findMany({
        where: { providerId: providerId },
        select: { id: true, categoryId: true, serviceTypeId: true }
      });

      const serviceIds = providerServices.map(service => service.id);
      const categoryIds = [...new Set(providerServices.map(service => service.categoryId))];
      const serviceTypeIds = [...new Set(providerServices.map(service => service.serviceTypeId).filter(id => id !== null))];

      if (serviceIds.length > 0) {
        // Delete dependent records first to avoid foreign key constraint violations
        
        // Delete favorite services
        await db.favoriteService.deleteMany({
          where: { serviceId: { in: serviceIds } }
        });

        // Delete cancel requests for orders related to these services
        await db.cancelRequest.deleteMany({
          where: { 
            order: { 
              serviceId: { in: serviceIds } 
            } 
          }
        });

        // Delete refill requests for orders related to these services
        await db.refillRequest.deleteMany({
          where: { 
            order: { 
              serviceId: { in: serviceIds } 
            } 
          }
        });

        // Delete orders related to these services
        await db.newOrder.deleteMany({
          where: { serviceId: { in: serviceIds } }
        });

        // Delete the provider services
        await db.service.deleteMany({
          where: { providerId: providerId }
        });

        // Handle categories - check if they have self-created services
        for (const categoryId of categoryIds) {
          const selfCreatedServices = await db.service.count({
            where: { 
              categoryId: categoryId,
              providerId: null, // Self-created services have null providerId
              deletedAt: null
            }
          });

          if (selfCreatedServices === 0) {
            // No self-created services, permanently delete category
            await db.category.delete({
              where: { id: categoryId }
            });
          } else {
            // Has self-created services, change provider to "Self"
            await db.category.update({
              where: { id: categoryId },
              data: { 
                updatedAt: new Date()
              }
            });
          }
        }

        // Handle service types - check if they have self-created services
        for (const serviceTypeId of serviceTypeIds) {
          const selfCreatedServicesInType = await db.service.count({
            where: { 
              serviceTypeId: serviceTypeId,
              providerId: null, // Self-created services have null providerId
              deletedAt: null
            }
          });

          if (selfCreatedServicesInType === 0) {
            // No self-created services, permanently delete service type
            await db.servicetype.delete({
              where: { id: serviceTypeId }
            });
          } else {
            // Has self-created services, change provider to "Self"
            await db.servicetype.update({
              where: { id: serviceTypeId },
              data: { 
                updatedAt: new Date()
              }
            });
          }
        }
      }

      // Finally delete the provider
      await db.api_providers.delete({
        where: { id: providerId }
      });

      message = 'Provider permanently deleted. Categories and service types with self-created services preserved and changed to "Self" provider';
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