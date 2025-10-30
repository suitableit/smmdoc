import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { ProviderOrderForwarder } from '@/lib/utils/providerOrderForwarder';

// POST /api/admin/orders/:id/resend - Resend a failed order
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Convert string ID to integer
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

    // Get the order with all necessary relations
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
        apiProvider: {
          select: {
            id: true,
            name: true,
            api_url: true,
            api_key: true,
            status: true
          }
        }
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

    // Check if order status is 'failed'
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

    // Log the resend attempt
    console.log(`Admin ${session.user.email} attempting to resend order ${order.id} for user ${order.user.email}`, {
      orderId: order.id,
      userId: order.user.id,
      serviceId: order.service.id,
      isProviderService: !!order.service.providerId,
      timestamp: new Date().toISOString()
    });

    let resendResult = null;
    let newStatus = 'pending';

    // Check if this is an API provider service
    if (order.service.providerId && order.service.providerServiceId && order.apiProvider) {
      try {
        // This is an API provider order - attempt to resend to provider
        const providerForwarder = ProviderOrderForwarder.getInstance();

        // Check if provider is active
        if (order.apiProvider.status !== 'active') {
          return NextResponse.json(
            {
              error: 'API provider is not active. Cannot resend order.',
              success: false,
              data: null
            },
            { status: 400 }
          );
        }

        // Check provider balance first
        try {
          const providerBalance = await providerForwarder.getProviderBalance(order.apiProvider);
          const orderCost = order.charge || order.price;

          if (providerBalance < orderCost) {
            // Provider has insufficient balance
            console.log(`Provider ${order.apiProvider.name} has insufficient balance. Required: ${orderCost}, Available: ${providerBalance}`);
            
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

        // Attempt to resend the order to the provider
        const orderData = {
          service: order.service.providerServiceId,
          link: order.link,
          quantity: order.qty,
          runs: order.dripfeedRuns || undefined,
          interval: order.dripfeedInterval || undefined
        };

        resendResult = await providerForwarder.forwardOrderToProvider(order.apiProvider, orderData);

        // Update order with new provider order ID and status
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
        
        // Check if it's a balance-related error
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

        // For other provider errors, return a generic error
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
      // This is a manual order - just update status to pending
      await db.newOrder.update({
        where: { id: orderId },
        data: {
          status: 'pending',
          updatedAt: new Date()
        }
      });

      console.log(`Manual order ${order.id} status updated to pending for resend`);
    }

    // Get the updated order to return
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