import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { ProviderOrderForwarder } from '@/lib/utils/providerOrderForwarder';
import { ApiRequestBuilder, ApiResponseParser, createApiSpecFromProvider } from '@/lib/provider-api-specification';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: 'Order ID is required',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return NextResponse.json(
        {
          error: 'Invalid Order ID format',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    const order = await db.newOrders.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        providerStatus: true,
        providerOrderId: true,
        link: true,
        qty: true,
        charge: true,
        startCount: true,
        remains: true,
        dripfeedRuns: true,
        dripfeedInterval: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            balance: true,
            currency: true,
            dollarRate: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            rate: true,
            providerId: true,
            providerServiceId: true,
            mode: true
          }
        },
      }
    });

    if (!order) {
      return NextResponse.json(
        {
          error: 'Order not found',
          success: false,
          data: null
        },
        { status: 404 }
      );
    }

    if (order.status !== 'failed' && order.providerStatus !== 'forward_failed') {
      return NextResponse.json(
        {
          error: 'Only failed orders can be resent',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    console.log(`Admin ${session.user.email} attempting to resend order ${order.id} for user ${order.user.email}`, {
      orderId: order.id,
      userId: order.user.id,
      serviceId: order.service.id,
      isProviderService: !!order.service.providerId,
      providerOrderId: order.providerOrderId,
      status: order.status,
      providerStatus: order.providerStatus,
      timestamp: new Date().toISOString()
    });

    let resendResult = null;
    let newStatus = 'pending';

    if (order.service.providerId && order.service.providerServiceId) {
      const apiProvider = await db.apiProviders.findUnique({
        where: { id: order.service.providerId }
      });

      if (!apiProvider) {
        return NextResponse.json(
          {
            error: 'API provider not found for this service',
            success: false,
            data: null
          },
          { status: 404 }
        );
      }

      if (!order.service.providerServiceId) {
        return NextResponse.json(
          {
            error: 'Service provider service ID is missing. Cannot resend to provider.',
            success: false,
            data: null
          },
          { status: 400 }
        );
      }
      const providerForBalance: any = {
        id: apiProvider.id,
        name: apiProvider.name,
        api_url: apiProvider.api_url,
        api_key: apiProvider.api_key,
        status: apiProvider.status
      };

      try {
        const providerForwarder = ProviderOrderForwarder.getInstance();

        if (apiProvider.status !== 'active') {
          return NextResponse.json(
            {
              error: 'API provider is not active. Cannot resend order.',
              success: false,
              data: null
            },
            { status: 400 }
          );
        }

        try {
          const providerBalance = await providerForwarder.getProviderBalance(providerForBalance);
          const orderCost = order.charge || (order.service.rate * Number(order.qty)) / 1000;

          if (providerBalance < orderCost) {
            console.log(`Provider ${apiProvider.name} has insufficient balance. Required: ${orderCost}, Available: ${providerBalance}`);
            
            return NextResponse.json(
              {
                error: `Provider has insufficient balance. Required: ${orderCost.toFixed(2)}, Available: ${providerBalance.toFixed(2)}`,
                errorType: 'insufficient_balance',
                success: false,
                data: null
              },
              { status: 400 }
            );
          }
        } catch (balanceError) {
          console.error('Error checking provider balance:', balanceError);
          const errorMessage = balanceError instanceof Error ? balanceError.message : 'Unknown error';
          return NextResponse.json(
            {
              error: `Failed to check provider balance: ${errorMessage}`,
              success: false,
              data: null
            },
            { status: 500 }
          );
        }

        console.log(`Resending order ${order.id} to provider - creating new order to API`);
        
        const orderData = {
          service: order.service.providerServiceId,
          link: order.link,
          quantity: Number(order.qty),
          runs: order.dripfeedRuns || undefined,
          interval: order.dripfeedInterval || undefined
        };

        resendResult = await providerForwarder.forwardOrderToProvider(providerForBalance, orderData);

        if (!resendResult.order) {
          throw new Error('Failed to create order: Provider did not return order ID');
        }

        console.log(`Order created with provider order ID: ${resendResult.order}. Fetching status and charge...`);

        const statusResult = await providerForwarder.checkProviderOrderStatus(providerForBalance, resendResult.order);
        
        const apiCharge = statusResult.charge || resendResult.charge || 0;
        newStatus = statusResult.status || resendResult.status || 'pending';
        const profit = order.charge - apiCharge;
        
        await db.newOrders.update({
          where: { id: orderId },
          data: {
            status: newStatus,
            providerOrderId: resendResult.order,
            providerStatus: newStatus,
            charge: apiCharge,
            profit: profit,
            startCount: statusResult.start_count || order.startCount,
            remains: statusResult.remains || order.remains,
            lastSyncAt: new Date(),
            updatedAt: new Date()
          }
        });

        console.log(`Order ${order.id} successfully resent to provider. New provider order ID: ${resendResult.order}, Status: ${newStatus}, Charge: ${apiCharge}, Profit: ${profit}`);

      } catch (providerError) {
        console.error('Error resending order to provider:', providerError);
        
        const errorMessage = providerError instanceof Error ? providerError.message : String(providerError);
        
        if (errorMessage.toLowerCase().includes('balance') || errorMessage.toLowerCase().includes('insufficient')) {
          return NextResponse.json(
            {
              error: 'Provider has insufficient balance to process this order',
              errorType: 'insufficient_balance',
              success: false,
              data: null
            },
            { status: 400 }
          );
        }

        if (errorMessage.toLowerCase().includes('timeout') || errorMessage.toLowerCase().includes('network')) {
          return NextResponse.json(
            {
              error: 'Provider API timeout. Please try again later',
              success: false,
              data: null
            },
            { status: 500 }
          );
        }

        return NextResponse.json(
          {
            error: `Failed to resend order to provider: ${errorMessage}`,
            success: false,
            data: null
          },
          { status: 500 }
        );
      }
    } else {
      await db.newOrders.update({
        where: { id: orderId },
        data: {
          status: 'pending',
          updatedAt: new Date()
        }
      });

      console.log(`Manual order ${order.id} status updated to pending for resend`);
    }

    const updatedOrder = await db.newOrders.findUnique({
      where: { id: orderId },
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

    return NextResponse.json({
      success: true,
      message: 'Order resent successfully',
      data: updatedOrder,
      error: null
    });

  } catch (error) {
    console.error('Error in resend order API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error while resending order',
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
