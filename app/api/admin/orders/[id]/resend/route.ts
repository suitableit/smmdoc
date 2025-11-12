import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { ProviderOrderForwarder } from '@/lib/utils/providerOrderForwarder';

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

    const order = await db.newOrder.findUnique({
      where: { id: orderId },
      include: {
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

    if (order.status !== 'failed') {
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
      timestamp: new Date().toISOString()
    });

    let resendResult = null;
    let newStatus = 'pending';

    if (order.service.providerId && order.service.providerServiceId) {
      const apiProvider = await db.api_providers.findUnique({
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
          const orderCost = order.charge || order.price;

          if (providerBalance < orderCost) {
            console.log(`Provider ${apiProvider.name} has insufficient balance. Required: ${orderCost}, Available: ${providerBalance}`);
            
            return NextResponse.json(
              {
                error: 'Failed to resend order. Please try again.',
                success: false,
                data: null
              },
              { status: 400 }
            );
          }
        } catch (balanceError) {
          console.error('Error checking provider balance:', balanceError);
          return NextResponse.json(
            {
              error: 'Failed to resend order. Please try again.',
              success: false,
              data: null
            },
            { status: 400 }
          );
        }

        const orderData = {
          service: order.service.providerServiceId,
          link: order.link,
          quantity: order.qty,
          runs: order.dripfeedRuns || undefined,
          interval: order.dripfeedInterval || undefined
        };

        resendResult = await providerForwarder.forwardOrderToProvider(providerForBalance, orderData);

        newStatus = resendResult.status || 'pending';
        
        await db.newOrder.update({
          where: { id: orderId },
          data: {
            status: newStatus,
            providerOrderId: resendResult.order,
            providerStatus: resendResult.status,
            lastSyncAt: new Date(),
            updatedAt: new Date()
          }
        });

        console.log(`Order ${order.id} successfully resent to provider. New provider order ID: ${resendResult.order}, Status: ${newStatus}`);

      } catch (providerError) {
        console.error('Error resending order to provider:', providerError);
        
        const errorMessage = providerError instanceof Error ? providerError.message : String(providerError);
        if (errorMessage.toLowerCase().includes('balance') || errorMessage.toLowerCase().includes('insufficient')) {
          return NextResponse.json(
            {
              error: 'Failed to resend order. Please try again.',
              success: false,
              data: null
            },
            { status: 400 }
          );
        }

        return NextResponse.json(
          {
            error: 'Failed to resend order to provider. Please try again.',
            success: false,
            data: null
          },
          { status: 500 }
        );
      }
    } else {
      await db.newOrder.update({
        where: { id: orderId },
        data: {
          status: 'pending',
          updatedAt: new Date()
        }
      });

      console.log(`Manual order ${order.id} status updated to pending for resend`);
    }

    const updatedOrder = await db.newOrder.findUnique({
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
