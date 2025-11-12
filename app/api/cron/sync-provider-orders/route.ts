import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { ApiRequestBuilder, ApiResponseParser, createApiSpecFromProvider } from '@/lib/provider-api-specification';

// GET /api/cron/sync-provider-orders - Sync provider order statuses
export async function GET(req: NextRequest) {
  try {
    console.log('Starting provider order sync...');

    // Get all pending provider orders
    const pendingOrders = await db.newOrder.findMany({
      where: {
        providerOrderId: { not: null },
        providerStatus: { in: ['pending', 'processing', 'in_progress'] }
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            providerServiceId: true
          }
        }
      },
      take: 50 // Limit to 50 orders per sync to avoid timeout
    });

    console.log(`Found ${pendingOrders.length} pending provider orders to sync`);

    if (pendingOrders.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'No pending provider orders to sync',
          data: { syncedCount: 0 }
        },
        { status: 200 }
      );
    }

    // Group orders by provider to minimize API calls
    const ordersByProvider = new Map();
    
    for (const order of pendingOrders) {
      // Extract provider ID from service or order data
      // This assumes we have a way to identify which provider an order belongs to
      const providerId = await getProviderIdForOrder(order);
      
      if (providerId) {
        if (!ordersByProvider.has(providerId)) {
          ordersByProvider.set(providerId, []);
        }
        ordersByProvider.get(providerId).push(order);
      }
    }

    let totalSynced = 0;
    const syncResults = [];

    // Sync orders for each provider
    for (const [providerId, orders] of ordersByProvider) {
      try {
        const provider = await db.api_providers.findUnique({
          where: { id: providerId },
          select: {
            id: true,
            name: true,
            api_url: true,
            api_key: true,
            status: true
          }
        });

        if (!provider || provider.status !== 'active') {
          console.log(`Skipping inactive provider: ${providerId}`);
          continue;
        }

        console.log(`Syncing ${orders.length} orders for provider: ${provider.name}`);

        // Sync each order with the provider
        for (const order of orders) {
          try {
            const syncResult = await syncSingleOrder(order, provider);
            if (syncResult.updated) {
              totalSynced++;
            }
            syncResults.push(syncResult);
          } catch (error) {
            console.error(`Failed to sync order ${order.id}:`, error);
            syncResults.push({
              orderId: order.id,
              updated: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }

      } catch (error) {
        console.error(`Error syncing provider ${providerId}:`, error);
      }
    }

    console.log(`Provider sync completed. Updated ${totalSynced} orders.`);

    return NextResponse.json(
      {
        success: true,
        message: `Synced ${totalSynced} provider orders`,
        data: {
          syncedCount: totalSynced,
          totalChecked: pendingOrders.length,
          results: syncResults
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in provider order sync:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to sync provider orders',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to get provider ID for an order
async function getProviderIdForOrder(order: any): Promise<string | null> {
  try {
    // First, try to get provider from service
    const service = await db.service.findUnique({
      where: { id: order.serviceId },
      select: { providerId: true }
    });

    if (service?.providerId) {
      return service.providerId.toString();
    }

    // If no provider in service, try to get from provider order logs
    const lastLog = await db.providerOrderLog.findFirst({
      where: { orderId: order.id },
      orderBy: { createdAt: 'desc' },
      select: { providerId: true }
    });

    return lastLog?.providerId ? lastLog.providerId.toString() : null;
  } catch (error) {
    console.error(`Error getting provider for order ${order.id}:`, error);
    return null;
  }
}

// Helper function to sync a single order with provider
async function syncSingleOrder(order: any, provider: any) {
  try {
    // Create API specification from provider configuration
    const apiSpec = createApiSpecFromProvider(provider);
    
    // Create API request builder with provider's API specification
    const apiBuilder = new ApiRequestBuilder(
      apiSpec,
      provider.api_url,
      provider.api_key,
      (provider as any).http_method || (provider as any).httpMethod || 'POST'
    );

    // Build status check request using API specification
    const statusRequest = apiBuilder.buildOrderStatusRequest(order.providerOrderId);

    console.log(`Checking status for order ${order.id} (provider order: ${order.providerOrderId})`);

    // Make API call to provider using the built request
    const response = await axios({
      method: statusRequest.method,
      url: statusRequest.url,
      data: statusRequest.data,
      headers: statusRequest.headers,
      timeout: (provider.timeout_seconds || 30) * 1000
    });

    const responseData = response.data;

    if (!responseData) {
      throw new Error('Empty response from provider');
    }

    // Parse response using API specification
    const responseParser = new ApiResponseParser(apiSpec);
    
    const parsedStatus = responseParser.parseOrderStatusResponse(responseData);
    
    // Map provider status to our system status
    const mappedStatus = mapProviderStatus(parsedStatus.status);
    const currentStatus = order.providerStatus;

    // Only update if status has changed
    if (mappedStatus !== currentStatus) {
      console.log(`Status changed for order ${order.id}: ${currentStatus} -> ${mappedStatus}`);

      // Update order in database
      await db.newOrder.update({
        where: { id: order.id },
        data: {
          providerStatus: mappedStatus,
          status: mappedStatus, // Also update main status
          apiResponse: JSON.stringify(responseData),
          lastSyncAt: new Date(),
          // Update additional fields based on parsed response
          ...(parsedStatus.startCount && { startCount: parsedStatus.startCount }),
          ...(parsedStatus.remains && { remains: parsedStatus.remains })
        }
      });

      // Log the status update
      await db.providerOrderLog.create({
        data: {
          orderId: order.id,
          providerId: provider.id,
          action: 'status_sync',
          status: 'success',
          response: JSON.stringify(responseData),
          createdAt: new Date()
        }
      });

      return {
        orderId: order.id,
        updated: true,
        oldStatus: currentStatus,
        newStatus: mappedStatus
      };
    } else {
      // Status unchanged, just update sync time
      await db.newOrder.update({
        where: { id: order.id },
        data: {
          lastSyncAt: new Date()
        }
      });

      return {
        orderId: order.id,
        updated: false,
        status: currentStatus,
        message: 'Status unchanged'
      };
    }

  } catch (error) {
    console.error(`Error syncing order ${order.id}:`, error);

    // Log the failed sync attempt
    await db.providerOrderLog.create({
      data: {
        orderId: order.id,
        providerId: provider.id,
        action: 'status_sync',
        status: 'failed',
        response: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })
      }
    });

    throw error;
  }
}

// Helper function to map provider status to our system status
function mapProviderStatus(providerStatus: string): string {
  const statusMap: { [key: string]: string } = {
    'pending': 'pending',
    'in_progress': 'processing',
    'processing': 'processing',
    'completed': 'completed',
    'partial': 'partial',
    'canceled': 'canceled',
    'cancelled': 'canceled',
    'refunded': 'refunded'
  };

  return statusMap[providerStatus?.toLowerCase()] || 'pending';
}

// POST endpoint for manual sync trigger
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required', data: null },
        { status: 400 }
      );
    }

    // Get specific order
    const order = await db.newOrder.findUnique({
      where: { id: orderId },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            providerServiceId: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found', data: null },
        { status: 404 }
      );
    }

    if (!order.providerOrderId) {
      return NextResponse.json(
        { success: false, message: 'Order is not a provider order', data: null },
        { status: 400 }
      );
    }

    // Get provider for this order
    const providerId = await getProviderIdForOrder(order);
    if (!providerId) {
      return NextResponse.json(
        { success: false, message: 'Provider not found for this order', data: null },
        { status: 404 }
      );
    }

    const provider = await db.api_providers.findUnique({
      where: { id: parseInt(providerId) },
      select: {
        id: true,
        name: true,
        api_url: true,
        api_key: true,
        status: true
      }
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found', data: null },
        { status: 404 }
      );
    }

    // Sync the specific order
    const syncResult = await syncSingleOrder(order, provider);

    return NextResponse.json(
      {
        success: true,
        message: 'Order synced successfully',
        data: syncResult
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in manual order sync:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to sync order',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}