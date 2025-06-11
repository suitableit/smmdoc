import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// POST /api/user/mass-orderss - Create multiple orders at once
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', data: null },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        balance: true,
        currency: true,
        dollarRate: true,
        total_spent: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found', data: null },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { orders, validateOnly = false, batchId } = body;

    // Validate that orders is an array
    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Orders must be a non-empty array',
          data: null,
        },
        { status: 400 }
      );
    }

    // Limit Mass Orderss to prevent abuse
    if (orders.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: 'Maximum 100 orders allowed per Mass Orders request',
          data: null,
        },
        { status: 400 }
      );
    }

    // Validate all orders and calculate total cost
    const validatedOrders = [];
    let totalCost = 0;
    const validationErrors = [];

    for (let i = 0; i < orders.length; i++) {
      const orderData = orders[i];
      const { categoryId, serviceId, link, qty } = orderData;

      try {
        // Validate required fields
        if (!categoryId || !serviceId || !link || !qty) {
          validationErrors.push(
            `Order ${
              i + 1
            }: Missing required fields (categoryId, serviceId, link, qty)`
          );
          continue;
        }

        // Validate service exists and is active
        const service = await db.service.findUnique({
          where: { id: serviceId },
          select: {
            id: true,
            name: true,
            rate: true,
            min_order: true,
            max_order: true,
            avg_time: true,
            status: true,
          },
        });

        if (!service) {
          validationErrors.push(
            `Order ${i + 1}: Service not found (${serviceId})`
          );
          continue;
        }

        if (service.status !== 'active') {
          validationErrors.push(
            `Order ${i + 1}: Service '${service.name}' is not active`
          );
          continue;
        }

        // Validate quantity limits
        const quantity = parseInt(qty);
        if (
          isNaN(quantity) ||
          quantity < service.min_order ||
          quantity > service.max_order
        ) {
          validationErrors.push(
            `Order ${i + 1}: Quantity for '${service.name}' must be between ${
              service.min_order
            } and ${service.max_order}`
          );
          continue;
        }

        // Calculate prices
        const usdPrice = (service.rate * quantity) / 1000;
        const bdtPrice = usdPrice * (user.dollarRate || 121.52);
        const finalPrice = user.currency === 'USD' ? usdPrice : bdtPrice;

        totalCost += finalPrice;

        validatedOrders.push({
          orderIndex: i + 1,
          categoryId,
          serviceId,
          userId: session.user.id,
          link,
          qty: quantity,
          price: finalPrice,
          usdPrice,
          bdtPrice,
          currency: user.currency,
          avg_time: service.avg_time,
          status: 'pending',
          remains: quantity,
          startCount: 0,
          isMassOrder: true, // Mark as Mass Orders
          batchId: batchId || `MO-${Date.now()}-${session.user.id.slice(-4)}`, // Mass Orders batch ID
          service: {
            name: service.name,
            rate: service.rate,
          },
        });
      } catch (error) {
        validationErrors.push(
          `Order ${i + 1}: Validation error - ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }

    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed for some orders',
          data: null,
          errors: validationErrors,
          validOrders: validatedOrders.length,
          totalOrders: orders.length,
        },
        { status: 400 }
      );
    }

    // Check if user has enough balance
    if (user.balance < totalCost) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient balance. Required: ${totalCost.toFixed(2)} ${
            user.currency
          }, Available: ${user.balance.toFixed(2)} ${user.currency}`,
          data: null,
          summary: {
            totalCost,
            availableBalance: user.balance,
            currency: user.currency,
            validOrders: validatedOrders.length,
          },
        },
        { status: 400 }
      );
    }

    // If validateOnly is true, return validation results without creating orders
    if (validateOnly) {
      return NextResponse.json(
        {
          success: true,
          message: 'Validation successful',
          data: {
            validOrders: validatedOrders.length,
            totalOrders: orders.length,
            totalCost,
            currency: user.currency,
            availableBalance: user.balance,
            canAfford: user.balance >= totalCost,
          },
        },
        { status: 200 }
      );
    }

    // Create all orders in a transaction
    const result = await db.$transaction(async (prisma) => {
      const createdOrders = [];

      // Create each order
      for (const orderData of validatedOrders) {
        const { orderIndex, service, ...createData } = orderData;

        const order = await prisma.newOrder.create({
          data: createData,
          include: {
            service: {
              select: {
                id: true,
                name: true,
                rate: true,
              },
            },
            category: {
              select: {
                id: true,
                category_name: true,
              },
            },
          },
        });

        createdOrders.push({
          ...order,
          orderIndex,
        });
      }

      // Deduct total cost from user balance and update total spent
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          balance: {
            decrement: totalCost,
          },
          total_spent: {
            increment: totalCost,
          },
        },
      });

      return createdOrders;
    });

    // Log the Mass Orders creation
    console.log(
      `User ${session.user.email} created ${result.length} Mass Orderss`,
      {
        userId: session.user.id,
        orderCount: result.length,
        totalCost,
        orderIds: result.map((o) => o.id),
        timestamp: new Date().toISOString(),
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: `Successfully created ${result.length} orders`,
        data: result,
        summary: {
          ordersCreated: result.length,
          totalCost,
          currency: user.currency,
          remainingBalance: user.balance - totalCost,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating Mass Orderss:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error creating Mass Orderss',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET /api/user/mass-orderss - Get Mass Orders templates or history
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', data: null },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'recent'; // 'recent', 'templates', 'stats'

    if (type === 'stats') {
      // Get Mass Orders statistics
      const stats = await db.newOrder.aggregate({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        _count: {
          id: true,
        },
        _sum: {
          price: true,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            last30Days: {
              totalOrders: stats._count.id,
              totalSpent: stats._sum.price || 0,
            },
          },
        },
        { status: 200 }
      );
    }

    if (type === 'recent') {
      // Get recent orders grouped by creation time (potential Mass Orderss)
      const recentOrders = await db.newOrder.findMany({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
        include: {
          service: {
            select: {
              name: true,
              rate: true,
            },
          },
          category: {
            select: {
              category_name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      });

      return NextResponse.json(
        {
          success: true,
          data: recentOrders,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Invalid type parameter. Use: recent, templates, or stats',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching Mass Orders data:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching Mass Orders data',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
