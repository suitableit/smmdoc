import { auth } from '@/auth';
import { ActivityLogger } from '@/lib/activity-logger';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { validateOrderByType, getServiceTypeConfig } from '@/lib/serviceTypes';
import { ProviderOrderForwarder } from '@/lib/utils/providerOrderForwarder';
import { convertFromUSD, convertToUSD, fetchCurrencyData } from '@/lib/currency-utils';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', data: null },
        { status: 401 }
      );
    }

    const user = await db.users.findUnique({
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

    const isMultipleOrders = Array.isArray(body);
    const orders = isMultipleOrders ? body : [body];

    for (const orderData of orders) {
      const { 
        categoryId, 
        serviceId, 
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
      } = orderData;

      if (!categoryId || !serviceId || !link || !qty) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Missing required fields: categoryId, serviceId, link, qty',
            data: null,
          },
          { status: 400 }
        );
      }

      const service = await db.services.findUnique({
        where: { id: serviceId },
        select: {
          id: true,
          name: true,
          rate: true,
          min_order: true,
          max_order: true,
          avg_time: true,
          status: true,
          providerId: true,
          providerServiceId: true,
          packageType: true,
        },
      });

      if (!service) {
        return NextResponse.json(
          {
            success: false,
            message: `Service not found: ${serviceId}`,
            data: null,
          },
          { status: 404 }
        );
      }

      if (service.status !== 'active') {
        return NextResponse.json(
          {
            success: false,
            message: `Service is not active: ${service.name}`,
            data: null,
          },
          { status: 400 }
        );
      }

      if (qty < service.min_order || qty > service.max_order) {
        return NextResponse.json(
          {
            success: false,
            message: `Quantity for ${service.name} must be between ${service.min_order} and ${service.max_order}`,
            data: null,
          },
          { status: 400 }
        );
      }

      const typeConfig = getServiceTypeConfig(service.packageType || 1);
      const validationData = {
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
        ? validateOrderByType(typeConfig, validationData)
        : ['Invalid service type'];

      if (errors.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Service type validation failed for ${service.name}: ${errors.join(', ')}`,
            data: null,
          },
          { status: 400 }
        );
      }
    }

    const { currencies } = await fetchCurrencyData();
    
    let totalCost = 0;
    const processedOrders: any[] = [];

    for (const orderData of orders) {
      const {
        categoryId,
        serviceId,
        link,
        qty,
        price,
        usdPrice,
        currency,
        avg_time,
        comments,
        username,
        posts,
        delay,
        minQty,
        maxQty,
        isDripfeed = false,
        dripfeedRuns,
        dripfeedInterval,
        isSubscription = false,
      } = orderData;

      const service = await db.services.findUnique({
        where: { id: serviceId },
        select: { rate: true, avg_time: true, packageType: true },
      });

      const calculatedUsdPrice = usdPrice || (service!.rate * qty) / 1000;

      let finalPrice;
      if (user.currency === 'USD' || user.currency === 'USDT') {
        finalPrice = calculatedUsdPrice;
      } else {
        finalPrice = convertFromUSD(calculatedUsdPrice, user.currency, currencies);
      }

      totalCost += finalPrice;

      processedOrders.push({
        categoryId,
        serviceId,
        userId: session.user.id,
        link,
        qty: parseInt(qty),
        price: finalPrice,
        usdPrice: calculatedUsdPrice,
        currency: user.currency,
        avg_time: avg_time || service!.avg_time,
        status: 'pending',
        remains: parseInt(qty),
        startCount: 0,
        packageType: service!.packageType || 1,
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
        subscriptionStatus: isSubscription ? 'active' : null,
      });
    }

    console.log('Order creation debug:', {
      userCurrency: user.currency,
      userBalance: user.balance,
      totalCost,
      processedOrders: processedOrders.map(o => ({
        currency: o.currency,
        price: o.price,
        usdPrice: o.usdPrice
      })),
      originalOrders: orders.map(o => ({ currency: o.currency, price: o.price }))
    });

    const userCurrencyData = currencies.find(c => c.code === user.currency);
    const userCurrencyRate = userCurrencyData?.rate || 1;
    
    let availableBalance = user.balance;
    if (user.currency !== 'USD' && user.currency !== 'USDT') {
      availableBalance = convertFromUSD(user.balance, user.currency, currencies);
    }

    if (availableBalance < totalCost) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient balance. Required: ${totalCost.toFixed(
            2
          )} ${user.currency}, Available: ${availableBalance.toFixed(2)} ${user.currency}`,
          data: null,
        },
        { status: 400 }
      );
    }

    const providerDataArray: Array<{
      providerOrderId: string | null;
      providerStatus: string;
      apiCharge: number;
      profit: number;
      startCount: number;
      remains: number;
      orderError: string | null;
      serviceProviderId: number | null;
    }> = [];
    
    for (let i = 0; i < processedOrders.length; i++) {
      try {
        const orderData = processedOrders[i];
        let providerOrderId: string | null = null;
        let providerStatus = 'pending';
        let apiCharge = 0;
        let profit = orderData.price;
        let startCount = orderData.startCount || 0;
        let remains = orderData.remains || orderData.qty;
        let orderError: string | null = null;
        let serviceProviderId: number | null = null;

        console.log(`Processing order ${i + 1}/${processedOrders.length} for service ${orderData.serviceId}...`);

        const service = await db.services.findUnique({
          where: { id: orderData.serviceId },
          select: {
            id: true,
            name: true,
            rate: true,
            providerId: true,
            providerServiceId: true
          }
        });

        if (!service) {
          throw new Error(`Service ${orderData.serviceId} not found`);
        }

        if (service?.providerId && service?.providerServiceId) {
          try {
          console.log(`Fetching provider ${service.providerId}...`);
          const provider = await db.apiProviders.findUnique({
            where: { id: service.providerId }
          });

          if (!provider) {
            throw new Error(`Provider ${service.providerId} not found`);
          }

          if (provider.status !== 'active') {
            throw new Error(`Provider ${provider.name} is not active`);
          }

          serviceProviderId = service.providerId;

          const providerForApi: any = {
            id: provider.id,
            name: provider.name,
            api_url: provider.api_url,
            api_key: provider.api_key,
            status: provider.status
          };

          const forwarder = ProviderOrderForwarder.getInstance();

          let shouldForward = true;
          try {
            const providerBalance = await forwarder.getProviderBalance(providerForApi);
            const orderCost = orderData.usdPrice || (service.rate * orderData.qty) / 1000;

            if (providerBalance < orderCost) {
              console.log(`Provider ${provider.name} has insufficient balance. Required: ${orderCost.toFixed(2)}, Available: ${providerBalance.toFixed(2)}. Order will be stored but not forwarded.`);
              shouldForward = false;
              orderError = `Provider has insufficient balance. Required: ${orderCost.toFixed(2)}, Available: ${providerBalance.toFixed(2)}`;
              apiCharge = 0;
              profit = orderData.price;
            }
          } catch (balanceError) {
            console.error('Error checking provider balance:', balanceError);
            const errorMessage = balanceError instanceof Error ? balanceError.message : 'Unknown error';
            shouldForward = false;
            orderError = `Failed to check provider balance: ${errorMessage}`;
            apiCharge = 0;
            profit = orderData.price;
          }

          if (shouldForward) {
            const serviceOverflow = 0;
            const serviceOverflowAmount = Math.floor((serviceOverflow / 100) * orderData.qty);
            const quantityWithOverflow = orderData.qty + serviceOverflowAmount;
            
            const orderDataForProvider = {
              service: service.providerServiceId,
              link: orderData.link,
              quantity: quantityWithOverflow,
              runs: orderData.dripfeedRuns || undefined,
              interval: orderData.dripfeedInterval || undefined
            };

            console.log(`Forwarding order to provider ${provider.name} (${provider.api_url}) before saving to database...`);
            
            try {
              const forwardResult = await forwarder.forwardOrderToProvider(providerForApi, orderDataForProvider);

              if (!forwardResult.order) {
                throw new Error('Failed to create order: Provider did not return order ID');
              }

              providerOrderId = forwardResult.order.toString();
              console.log(`Order created with provider order ID: ${providerOrderId}. Fetching status and charge...`);

              const statusResult = await forwarder.checkProviderOrderStatus(providerForApi, providerOrderId);
              
              const mapProviderStatus = (providerStatus: string): string => {
                if (!providerStatus) return 'pending';
                const normalizedStatus = providerStatus.toLowerCase().trim().replace(/\s+/g, '_');
                const statusMap: { [key: string]: string } = {
                  'pending': 'pending',
                  'in_progress': 'processing',
                  'inprogress': 'processing',
                  'processing': 'processing',
                  'completed': 'completed',
                  'complete': 'completed',
                  'partial': 'partial',
                  'canceled': 'cancelled',
                  'cancelled': 'cancelled',
                  'refunded': 'refunded',
                  'failed': 'failed',
                  'fail': 'failed'
                };
                return statusMap[normalizedStatus] || 'pending';
              };

              providerStatus = mapProviderStatus(statusResult.status);
              apiCharge = statusResult.charge || forwardResult.charge || 0;
              startCount = statusResult.start_count || forwardResult.start_count || 0;
              remains = statusResult.remains || forwardResult.remains || orderData.qty;
              profit = orderData.price - apiCharge;

              console.log(`Order status fetched: ${providerStatus}, Charge: ${apiCharge}, Profit: ${profit}, StartCount: ${startCount}, Remains: ${remains}`);
            } catch (forwardError: any) {
              console.error(`Error forwarding order to provider:`, forwardError);
              const errorMessage = forwardError instanceof Error ? forwardError.message : String(forwardError);
              
              if (errorMessage.toLowerCase().includes('balance') || errorMessage.toLowerCase().includes('insufficient')) {
                orderError = `Provider has insufficient balance to process this order`;
              } else if (errorMessage.toLowerCase().includes('timeout') || errorMessage.toLowerCase().includes('network')) {
                orderError = `Provider API timeout or network error: ${errorMessage}`;
              } else {
                orderError = errorMessage;
              }
              
              apiCharge = 0;
              profit = orderData.price;
            }
          }
        } catch (providerError: any) {
          console.error(`Error processing provider for order:`, {
            error: providerError?.message || providerError,
            stack: providerError?.stack,
            serviceId: service.id,
            providerId: service.providerId
          });
          
          const errorMessage = providerError instanceof Error ? providerError.message : String(providerError);
          
          if (errorMessage.toLowerCase().includes('balance') || errorMessage.toLowerCase().includes('insufficient')) {
            orderError = `Provider has insufficient balance to process this order`;
          } else if (errorMessage.toLowerCase().includes('timeout') || errorMessage.toLowerCase().includes('network')) {
            orderError = `Provider API timeout or network error: ${errorMessage}`;
          } else {
            orderError = errorMessage;
          }
          
          apiCharge = 0;
          profit = orderData.price;
        }
      } else {
        console.log(`Service ${service.id} has no provider, using manual pricing`);
        apiCharge = orderData.price;
        profit = 0;
      }

      providerDataArray.push({
        providerOrderId,
        providerStatus,
        apiCharge,
        profit,
        startCount,
        remains,
        orderError,
        serviceProviderId
      });
      } catch (providerLoopError: any) {
        console.error(`Error processing order ${i + 1} for provider forwarding:`, {
          error: providerLoopError?.message || providerLoopError,
          stack: providerLoopError?.stack,
          orderData: processedOrders[i] ? {
            serviceId: processedOrders[i].serviceId,
            categoryId: processedOrders[i].categoryId
          } : 'N/A'
        });
        
        providerDataArray.push({
          providerOrderId: null,
          providerStatus: 'pending',
          apiCharge: processedOrders[i]?.price || 0,
          profit: 0,
          startCount: 0,
          remains: processedOrders[i]?.qty || 0,
          orderError: providerLoopError instanceof Error ? providerLoopError.message : String(providerLoopError),
          serviceProviderId: null
        });
      }
    }

    const result = await db.$transaction(async (prisma) => {
      const createdOrders = [];
      
      for (let i = 0; i < processedOrders.length; i++) {
        const orderData = processedOrders[i];
        const providerData = providerDataArray[i];
        const {
          providerOrderId,
          providerStatus,
          apiCharge,
          profit,
          startCount,
          remains,
          orderError,
          serviceProviderId
        } = providerData;

        console.log(`Creating order in database with data:`, {
          serviceId: orderData.serviceId,
          categoryId: orderData.categoryId,
          userId: orderData.userId,
          providerOrderId,
          providerStatus,
          status: orderError ? 'failed' : providerStatus,
          charge: apiCharge > 0 ? apiCharge : orderData.price,
          profit
        });

        const orderCreateData = {
          categoryId: orderData.categoryId,
          serviceId: orderData.serviceId,
          userId: orderData.userId,
          link: orderData.link,
          qty: orderData.qty,
          price: orderData.price,
          avg_time: orderData.avg_time,
          status: orderError ? 'failed' : providerStatus,
          remains: remains,
          startCount: startCount,
          currency: orderData.currency,
          usdPrice: orderData.usdPrice,
          charge: apiCharge > 0 ? apiCharge : orderData.price,
          profit: profit,
          packageType: orderData.packageType || 1,
          comments: orderData.comments || null,
          username: orderData.username || null,
          posts: orderData.posts || null,
          delay: orderData.delay || null,
          minQty: orderData.minQty || null,
          maxQty: orderData.maxQty || null,
          isDripfeed: orderData.isDripfeed || false,
          dripfeedRuns: orderData.dripfeedRuns || null,
          dripfeedInterval: orderData.dripfeedInterval || null,
          isSubscription: orderData.isSubscription || false,
          subscriptionStatus: orderData.isSubscription ? (orderData.subscriptionStatus || 'active') : null,
          providerOrderId: providerOrderId,
          providerStatus: orderError ? 'forward_failed' : providerStatus,
          apiResponse: orderError ? JSON.stringify({ error: orderError }) : null,
          lastSyncAt: providerOrderId ? new Date() : null,
        };

        console.log(`Order create data prepared:`, {
          categoryId: orderCreateData.categoryId,
          serviceId: orderCreateData.serviceId,
          userId: orderCreateData.userId,
          hasLink: !!orderCreateData.link,
          qty: orderCreateData.qty,
          price: orderCreateData.price
        });

        const order = await prisma.newOrders.create({
          data: orderCreateData,
          include: {
            service: {
              select: {
                id: true,
                name: true,
                rate: true,
                providerId: true,
                providerServiceId: true,
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

        console.log(`Order ${order.id} created successfully`);

        if (serviceProviderId) {
          try {
            await prisma.providerOrderLogs.create({
              data: {
                orderId: order.id,
                providerId: serviceProviderId,
                action: 'forward_order',
                status: orderError ? 'failed' : 'success',
                errorMessage: orderError || null,
                response: JSON.stringify({ 
                  order: providerOrderId, 
                  status: providerStatus, 
                  charge: apiCharge,
                  error: orderError || null
                }),
                createdAt: new Date()
              }
            });
          } catch (logError) {
            console.warn(`Failed to create provider order log:`, logError);
          }
        }

        createdOrders.push(order);
      }

      let totalUsdCost = 0;
      for (const orderData of processedOrders) {
        totalUsdCost += orderData.usdPrice || 0;
      }
      
      let balanceDeductionAmountUSD = totalUsdCost;
      if (user.currency !== 'USD' && user.currency !== 'USDT') {
        balanceDeductionAmountUSD = convertToUSD(totalCost, user.currency, currencies);
      } else {
        balanceDeductionAmountUSD = totalCost;
      }

      console.log('About to deduct balance:', {
        userId: session.user.id,
        userCurrency: user.currency,
        currentBalance: user.balance,
        totalCostInUserCurrency: totalCost,
        balanceDeductionAmountUSD: balanceDeductionAmountUSD,
        willDeduct: true
      });

      await prisma.users.update({
        where: { id: parseInt(session.user.id) },
        data: {
          balance: {
            decrement: balanceDeductionAmountUSD,
          },
          total_spent: {
            increment: balanceDeductionAmountUSD,
          },
        },
      });

      return createdOrders;
    });

    console.log(
      `User ${session.user.email} created ${result.length} order(s)`,
      {
        userId: session.user.id,
        orderCount: result.length,
        totalCost,
        orderIds: result.map((o) => o.id),
        timestamp: new Date().toISOString(),
      }
    );

    try {
      const username = session.user.username || session.user.email?.split('@')[0] || `user${session.user.id}`;
      await ActivityLogger.orderCreated(
        session.user.id,
        username,
        result.length,
        totalCost,
        user.currency
      );
    } catch (error) {
      console.error('Failed to log order creation activity:', error);
    }

    return NextResponse.json(
      {
        success: true,
        message: `${result.length} order(s) created successfully`,
        data: isMultipleOrders ? result : result[0],
        summary: {
          orderCount: result.length,
          totalCost,
          currency: user.currency,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating order(s):', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorCode = error?.code || error?.meta?.code || undefined;
    const errorMeta = error?.meta || undefined;
    
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      code: errorCode,
      meta: errorMeta,
      error: error
    });
    
    let userFriendlyMessage = 'Error creating order(s)';
    if (errorCode === 'P2002') {
      userFriendlyMessage = 'Duplicate order detected. Please try again.';
    } else if (errorCode === 'P2003') {
      userFriendlyMessage = 'Invalid service or category. Please refresh and try again.';
    } else if (errorMessage.includes('categoryId') || errorMessage.includes('serviceId')) {
      userFriendlyMessage = 'Invalid service or category selected.';
    } else if (errorMessage.includes('balance') || errorMessage.includes('insufficient')) {
      userFriendlyMessage = errorMessage;
    }
    
    return NextResponse.json(
      {
        success: false,
        message: userFriendlyMessage,
        error: errorMessage,
        code: errorCode,
        details: process.env.NODE_ENV === 'development' ? {
          stack: errorStack,
          meta: errorMeta
        } : undefined,
      },
      { status: 500 }
    );
  }
}
