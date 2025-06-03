import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

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
        total_spent: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found', data: null },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Handle both single order and mass orders
    const isMultipleOrders = Array.isArray(body);
    const orders = isMultipleOrders ? body : [body];

    // Validate all orders first
    for (const orderData of orders) {
      const { categoryId, serviceId, link, qty } = orderData;

      if (!categoryId || !serviceId || !link || !qty) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields: categoryId, serviceId, link, qty', data: null },
          { status: 400 }
        );
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
          status: true
        }
      });

      if (!service) {
        return NextResponse.json(
          { success: false, message: `Service not found: ${serviceId}`, data: null },
          { status: 404 }
        );
      }

      if (service.status !== 'active') {
        return NextResponse.json(
          { success: false, message: `Service is not active: ${service.name}`, data: null },
          { status: 400 }
        );
      }

      // Validate quantity limits
      if (qty < service.min_order || qty > service.max_order) {
        return NextResponse.json(
          { success: false, message: `Quantity for ${service.name} must be between ${service.min_order} and ${service.max_order}`, data: null },
          { status: 400 }
        );
      }
    }

    // Calculate total cost for all orders
    let totalCost = 0;
    const processedOrders = [];

    for (const orderData of orders) {
      const { categoryId, serviceId, link, qty, price, usdPrice, bdtPrice, currency, avg_time } = orderData;

      // Get service details for price calculation
      const service = await db.service.findUnique({
        where: { id: serviceId },
        select: { rate: true, avg_time: true }
      });

      // Calculate prices if not provided
      const calculatedUsdPrice = usdPrice || (service!.rate * qty) / 1000;
      const calculatedBdtPrice = bdtPrice || calculatedUsdPrice * (user.dollarRate || 121.52);
      const finalPrice = price || (user.currency === 'USD' ? calculatedUsdPrice : calculatedBdtPrice);

      totalCost += finalPrice;

      processedOrders.push({
        categoryId,
        serviceId,
        userId: session.user.id,
        link,
        qty: parseInt(qty),
        price: finalPrice,
        usdPrice: calculatedUsdPrice,
        bdtPrice: calculatedBdtPrice,
        currency: user.currency,
        avg_time: avg_time || service!.avg_time,
        status: 'pending',
        remains: parseInt(qty),
        startCount: 0
      });
    }

    // Check if user has enough balance for all orders
    if (user.balance < totalCost) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient balance. Required: ${totalCost.toFixed(2)}, Available: ${user.balance.toFixed(2)}`,
          data: null
        },
        { status: 400 }
      );
    }

    // Create all orders in a transaction
    const result = await db.$transaction(async (prisma) => {
      // Create all orders
      const createdOrders = [];
      for (const orderData of processedOrders) {
        const order = await prisma.newOrder.create({
          data: orderData,
          include: {
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
        createdOrders.push(order);
      }

      // Deduct total cost from user balance and update total spent
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          balance: {
            decrement: totalCost
          },
          total_spent: {
            increment: totalCost
          }
        }
      });

      return createdOrders;
    });

    // Log the order creation
    console.log(`User ${session.user.email} created ${result.length} order(s)`, {
      userId: session.user.id,
      orderCount: result.length,
      totalCost,
      orderIds: result.map(o => o.id),
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        success: true,
        message: `${result.length} order(s) created successfully`,
        data: isMultipleOrders ? result : result[0],
        summary: {
          orderCount: result.length,
          totalCost,
          currency: user.currency
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order(s):', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error creating order(s)',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}