import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const orderId = searchParams.get('orderId');
    const providerId = searchParams.get('providerId');
    const action = searchParams.get('action');
    const status = searchParams.get('status');
    
    const skip = (page - 1) * limit;
    
    const whereClause: any = {};
    
    if (orderId) {
      whereClause.orderId = orderId;
    }
    
    if (providerId) {
      whereClause.providerId = providerId;
    }
    
    if (action) {
      whereClause.action = action;
    }
    
    if (status) {
      whereClause.status = status;
    }

    const [logs, totalCount] = await Promise.all([
      db.providerOrderLog.findMany({
        where: whereClause,
        include: {
          order: {
            select: {
              id: true,
              link: true,
              qty: true,
              status: true,
              providerOrderId: true,
              providerStatus: true,
              lastSyncAt: true,
              createdAt: true,
              service: {
                select: {
                  id: true,
                  name: true
                }
              },
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true
                }
              }
            }
          },
          provider: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.providerOrderLog.count({
        where: whereClause
      })
    ]);

    const stats = await db.providerOrderLog.groupBy({
      by: ['status', 'action'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    const providerOrderStats = await db.newOrder.groupBy({
      by: ['providerStatus'],
      _count: {
        id: true
      },
      where: {
        providerOrderId: {
          not: null
        }
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          logs,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
          },
          stats: {
            last24Hours: stats,
            providerOrders: providerOrderStats
          }
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching provider sync data:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch provider sync data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

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

    const body = await req.json();
    const { orderIds, syncAll = false, providerId } = body;

    console.log('Manual provider sync triggered by admin:', {
      adminId: session.user.id,
      orderIds,
      syncAll,
      providerId
    });

    let ordersToSync = [];

    if (syncAll) {
      const whereClause: any = {
        isProviderOrder: true,
        providerOrderId: { not: null },
        providerStatus: { in: ['pending', 'processing', 'in_progress'] }
      };

      if (providerId) {
        const services = await db.service.findMany({
          where: { providerId },
          select: { id: true }
        });
        const serviceIds = services.map(s => s.id);
        whereClause.serviceId = { in: serviceIds };
      }

      ordersToSync = await db.newOrder.findMany({
        where: whereClause,
        include: {
          service: {
            select: {
              id: true,
              name: true,
              providerServiceId: true
            }
          }
        },
        take: 100
      });
    } else if (orderIds && orderIds.length > 0) {
      ordersToSync = await db.newOrder.findMany({
        where: {
          id: { in: orderIds },
          providerOrderId: { not: null }
        },
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
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Either provide orderIds or set syncAll to true',
          data: null
        },
        { status: 400 }
      );
    }

    if (ordersToSync.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'No orders found to sync',
          data: { syncedCount: 0 }
        },
        { status: 200 }
      );
    }

    console.log(`Starting manual sync for ${ordersToSync.length} orders`);

    const ordersByProvider = new Map();
    
    for (const order of ordersToSync) {
      const orderProviderId = await getProviderIdForOrder(order);
      
      if (orderProviderId) {
        if (!ordersByProvider.has(orderProviderId)) {
          ordersByProvider.set(orderProviderId, []);
        }
        ordersByProvider.get(orderProviderId).push(order);
      }
    }

    let totalSynced = 0;
    const syncResults = [];

    for (const [providerIdKey, orders] of ordersByProvider) {
      try {
        const provider = await db.api_providers.findUnique({
          where: { id: providerIdKey },
          select: {
            id: true,
            name: true,
            api_url: true,
            api_key: true,
            status: true
          }
        });

        if (!provider || provider.status !== 'active') {
          console.log(`Skipping inactive provider: ${providerIdKey}`);
          continue;
        }

        console.log(`Syncing ${orders.length} orders for provider: ${provider.name}`);

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
        console.error(`Error syncing provider ${providerIdKey}:`, error);
      }
    }

    console.log(`Manual sync completed. Updated ${totalSynced} orders.`);

    return NextResponse.json(
      {
        success: true,
        message: `Manually synced ${totalSynced} provider orders`,
        data: {
          syncedCount: totalSynced,
          totalChecked: ordersToSync.length,
          results: syncResults
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in manual provider sync:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to manually sync provider orders',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function getProviderIdForOrder(order: any): Promise<string | null> {
  try {
    const service = await db.service.findUnique({
      where: { id: order.serviceId },
      select: { providerId: true }
    });

    if (service?.providerId) {
      return service.providerId.toString();
    }

    const lastLog = await db.providerOrderLog.findFirst({
      where: { orderId: order.id },
      orderBy: { createdAt: 'desc' },
      select: { providerId: true }
    });

    return lastLog?.providerId?.toString() || null;
  } catch (error) {
    console.error(`Error getting provider for order ${order.id}:`, error);
    return null;
  }
}

async function syncSingleOrder(order: any, provider: any) {
  try {
    const statusRequest = {
      key: provider.api_key,
      action: 'status',
      order: order.providerOrderId
    };

    console.log(`Checking status for order ${order.id} (provider order: ${order.providerOrderId})`);

    const response = await axios.post(provider.api_url, statusRequest, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const providerData = response.data;

    if (!providerData) {
      throw new Error('Empty response from provider');
    }

    const mappedStatus = mapProviderStatus(providerData.status);
    const currentStatus = order.providerStatus;

    if (mappedStatus !== currentStatus) {
      console.log(`Status changed for order ${order.id}: ${currentStatus} -> ${mappedStatus}`);

      await db.newOrder.update({
        where: { id: order.id },
        data: {
          providerStatus: mappedStatus,
          status: mappedStatus,
          providerResponse: JSON.stringify(providerData),
          lastSyncAt: new Date(),
          ...(providerData.start_count && { startCount: parseInt(providerData.start_count) }),
          ...(providerData.remains && { remains: parseInt(providerData.remains) })
        }
      });

      await db.providerOrderLog.create({
        data: {
          orderId: order.id,
          providerId: provider.id,
          action: 'manual_sync',
          status: 'success',
          response: JSON.stringify(providerData),
          createdAt: new Date()
        }
      });

      return {
        orderId: order.id,
        updated: true,
        oldStatus: currentStatus,
        newStatus: mappedStatus,
        providerData
      };
    } else {
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

    await db.providerOrderLog.create({
      data: {
        orderId: order.id,
        providerId: provider.id,
        action: 'manual_sync',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        response: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
        createdAt: new Date()
      }
    });

    throw error;
  }
}

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
