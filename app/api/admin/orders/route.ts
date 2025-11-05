import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { validateOrderByType, getServiceTypeConfig } from '@/lib/serviceTypes';
import { ProviderOrderForwarder } from '@/lib/utils/providerOrderForwarder';

// GET /api/admin/orders - Get all orders with pagination and filtering
export async function GET(req: NextRequest) {
  try {
    // console.log('Admin orders API called');
    const session = await auth();
    // console.log('Session:', session?.user?.email, session?.user?.role);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      // console.log('Unauthorized access attempt');
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
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const userId = searchParams.get('userId');
    const serviceId = searchParams.get('serviceId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const skip = (page - 1) * limit;
    
    // Build where clause for filtering
    const whereClause: any = {};
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    if (userId) {
      whereClause.userId = userId;
    }
    
    if (serviceId) {
      whereClause.serviceId = serviceId;
    }
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    if (search) {
      whereClause.OR = [
        { link: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { service: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    console.log('Fetching orders with whereClause:', whereClause);

    // Test database connection first
    try {
      await db.$connect();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      throw new Error('Database connection failed');
    }

    // Get orders with related data using Prisma relations
    const [orders, totalCount] = await Promise.all([
      db.newOrder.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              currency: true
            }
          },
          service: {
            select: {
              id: true,
              name: true,
              rate: true,
              min_order: true,
              max_order: true,
              providerId: true,
              providerName: true,
              providerServiceId: true
            }
          },
          category: {
            select: {
              id: true,
              category_name: true
            }
          },
          apiProvider: {
            select: {
              id: true,
              name: true,
              api_url: true,
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
      db.newOrder.count({ where: whereClause })
    ]);

    console.log('Orders found:', orders.length, 'Total count:', totalCount);

    // Remove duplicates based on order ID to prevent React key conflicts
    const uniqueOrders = orders.filter((order, index, self) =>
      index === self.findIndex(o => o.id === order.id)
    );

    console.log('Unique orders after deduplication:', uniqueOrders.length);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: uniqueOrders,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      error: null
    });
    
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch orders: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/orders - Create a new order (admin can create orders for users)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
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
    
    const body = await req.json();
    const { 
      userId, 
      categoryId, 
      serviceId, 
      link, 
      qty, 
      price, 
      usdPrice, 
      bdtPrice, 
      currency, 
      avg_time,
      status = 'pending',
      skipBalanceCheck = false,
      // Service type specific fields
      comments,
      username,
      posts,
      delay,
      minQty,
      maxQty,
      isDripfeed = false,
      dripfeedRuns,
      dripfeedInterval,
      isSubscription = false
    } = body;
    
    // Validate required fields
    if (!userId || !categoryId || !serviceId || !link || !qty) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: userId, categoryId, serviceId, link, qty',
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }
    
    // Validate service exists and is active
    const service = await db.service.findUnique({
      where: { id: serviceId },
      include: { 
        category: true,
        serviceType: true
      }
    });
    
    if (!service) {
      return NextResponse.json(
        { 
          error: 'Service not found',
          success: false,
          data: null 
        },
        { status: 404 }
      );
    }
    
    if (service.status !== 'active') {
      return NextResponse.json(
        { 
          error: 'Service is not active',
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }
    
    // Validate quantity limits
    if (qty < service.min_order || qty > service.max_order) {
      return NextResponse.json(
        { 
          error: `Quantity must be between ${service.min_order} and ${service.max_order}`,
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }

    // Service type validation
    const typeConfig = getServiceTypeConfig(service.packageType || 1);
    const orderData = {
      link,
      qty,
      comments,
      username,
      posts,
      delay,
      minQty,
      maxQty,
      isDripfeed,
      dripfeedRuns,
      dripfeedInterval,
      isSubscription
    };

    const errors = typeConfig
      ? validateOrderByType(typeConfig, orderData)
      : ['Invalid service type'];
    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: errors.join(', '),
          success: false,
          data: null
        },
        { status: 400 }
      );
    }
    
    // Get user details
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        currency: true,
        dollarRate: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { 
          error: 'User not found',
          success: false,
          data: null 
        },
        { status: 404 }
      );
    }
    
    // Calculate prices if not provided
    const calculatedUsdPrice = usdPrice || (service.rate * qty) / 1000;
    const calculatedBdtPrice = bdtPrice || calculatedUsdPrice * (user.dollarRate || 121.52);
    const finalPrice = price || (user.currency === 'USD' ? calculatedUsdPrice : calculatedBdtPrice);
    
    // Check user balance (unless admin explicitly skips this check)
    if (!skipBalanceCheck) {
      const orderPrice = user.currency === 'USD' ? calculatedUsdPrice : calculatedBdtPrice;

      if (user.balance < orderPrice) {
        return NextResponse.json(
          {
            error: `Insufficient balance. Required: ${orderPrice.toFixed(2)}, Available: ${user.balance.toFixed(2)}`,
            success: false,
            data: null
          },
          { status: 400 }
        );
      }
    }
    
    // Create the order
    const order = await db.newOrder.create({
      data: {
        userId,
        categoryId,
        serviceId,
        link,
        qty: parseInt(qty),
        price: finalPrice,
        usdPrice: calculatedUsdPrice,
        bdtPrice: calculatedBdtPrice,
        currency: user.currency,
        avg_time: avg_time || service.avg_time,
        status,
        remains: parseInt(qty), // Initially, all quantity remains to be delivered
        startCount: 0,
        // Service type specific fields
        packageType: service.packageType || 1,
        comments: comments || null,
        username: username || null,
        posts: posts ? parseInt(posts) : null,
        delay: delay ? parseInt(delay) : null,
        minQty: minQty ? parseInt(minQty) : null,
        maxQty: maxQty ? parseInt(maxQty) : null,
        isDripfeed,
        dripfeedRuns: dripfeedRuns ? parseInt(dripfeedRuns) : null,
        dripfeedInterval: dripfeedInterval ? parseInt(dripfeedInterval) : null,
        isSubscription,
        subscriptionStatus: isSubscription ? 'active' : null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            rate: true
          }
        },
        category: {
          select: {
            id: true,
            category_name: true
          }
        }
      }
    });
    
    // Deduct balance if not skipping balance check and status is not pending
    if (!skipBalanceCheck && status !== 'pending') {
      const orderPrice = user.currency === 'USD' ? calculatedUsdPrice : calculatedBdtPrice;

      await db.user.update({
        where: { id: userId },
        data: {
          balance: {
            decrement: orderPrice
          },
          total_spent: {
            increment: orderPrice
          }
        }
      });
    }
    
    // Forward to API provider if applicable
    let updatedOrder = order;
    try {
      // Ensure service has provider mapping
      if (service.providerId && service.providerServiceId) {
        const apiProvider = await db.api_providers.findUnique({
          where: { id: service.providerId },
          select: {
            id: true,
            name: true,
            api_url: true,
            api_key: true,
            status: true
          }
        });

        if (apiProvider && apiProvider.status === 'active') {
          const forwarder = ProviderOrderForwarder.getInstance();
          const providerOrderData = {
            service: String(service.providerServiceId),
            link,
            quantity: parseInt(qty),
            runs: isDripfeed && dripfeedRuns ? parseInt(dripfeedRuns) : undefined,
            interval: isDripfeed && dripfeedInterval ? parseInt(dripfeedInterval) : undefined
          };

          const providerRes = await forwarder.forwardOrderToProvider(apiProvider, providerOrderData);

          updatedOrder = await db.newOrder.update({
            where: { id: order.id },
            data: {
              status: providerRes.status || 'pending',
              providerOrderId: providerRes.order,
              providerStatus: providerRes.status,
              apiOrderId: providerRes.order,
              charge: providerRes.charge,
              lastSyncAt: new Date(),
              updatedAt: new Date()
            },
            include: {
              user: { select: { id: true, name: true, email: true } },
              service: { select: { id: true, name: true, rate: true } },
              category: { select: { id: true, category_name: true } }
            }
          });

          console.log(
            `Admin ${session.user.email} forwarded order ${order.id} to provider ${apiProvider.name} -> Provider Order ${providerRes.order}`,
            { orderId: order.id, providerId: apiProvider.id, providerOrderId: providerRes.order, status: providerRes.status }
          );
        }
      }
    } catch (providerError) {
      const forwarder = ProviderOrderForwarder.getInstance();
      const errorMessage = forwarder.formatProviderError(providerError);

      updatedOrder = await db.newOrder.update({
        where: { id: order.id },
        data: {
          status: 'failed',
          providerStatus: 'failed',
          apiResponse: errorMessage,
          lastSyncAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          service: { select: { id: true, name: true, rate: true } },
          category: { select: { id: true, category_name: true } }
        }
      });

      console.error('Error forwarding order to provider:', providerError);
    }

    // Log the order creation
    console.log(`Admin ${session.user.email} created order ${order.id} for user ${user.email}`, {
      orderId: order.id,
      userId,
      serviceId,
      amount: finalPrice,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: updatedOrder,
      error: null
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      {
        error: 'Failed to create order: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
