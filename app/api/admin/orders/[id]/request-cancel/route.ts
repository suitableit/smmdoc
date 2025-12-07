import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { createApiSpecFromProvider, ApiRequestBuilder } from '@/lib/provider-api-specification';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'moderator')) {
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
      include: {
        service: {
          select: {
            id: true,
            name: true,
            providerId: true,
            providerServiceId: true
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

    // Check if order is pending
    if (order.status !== 'pending') {
      return NextResponse.json(
        {
          error: 'Only pending orders can be cancelled',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Check if order has been forwarded to provider
    if (!order.providerOrderId) {
      return NextResponse.json(
        {
          error: 'This order has not been forwarded to a provider yet',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Check if service has a provider
    if (!order.service.providerId) {
      return NextResponse.json(
        {
          error: 'This order does not have an associated provider',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Get the provider
    const provider = await db.apiProviders.findUnique({
      where: { id: order.service.providerId }
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

    if (provider.status !== 'active') {
      return NextResponse.json(
        {
          error: 'Provider is not active',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Build cancel request to provider
    const apiSpec = createApiSpecFromProvider(provider);
    const requestBuilder = new ApiRequestBuilder(
      apiSpec,
      provider.api_url,
      provider.api_key,
      (provider as any).http_method || (provider as any).httpMethod || 'POST'
    );

    const cancelRequestConfig = requestBuilder.buildCancelRequest([String(order.providerOrderId)]);

    console.log('Requesting cancel order from provider:', {
      orderId: order.id,
      providerId: provider.id,
      providerName: provider.name,
      providerOrderId: order.providerOrderId,
      adminId: session.user.id,
      adminEmail: session.user.email
    });

    let providerResponse;
    let providerResult;
    let providerError: string | null = null;

    try {
      const response = await fetch(cancelRequestConfig.url, {
        method: cancelRequestConfig.method,
        headers: cancelRequestConfig.headers || {},
        body: cancelRequestConfig.data,
        signal: AbortSignal.timeout((apiSpec.timeoutSeconds || 30) * 1000)
      });

      providerResponse = response;

      if (response.ok) {
        try {
          providerResult = await response.json();
          
          if (providerResult.error) {
            providerError = `Provider error: ${providerResult.error}`;
            console.error('Provider cancel error:', providerError);
          } else {
            console.log('Cancel request submitted to provider successfully:', providerResult);
          }
        } catch (jsonError) {
          // Provider might return non-JSON response
          const textResponse = await response.text();
          console.log('Provider cancel response (non-JSON):', textResponse);
          providerResult = { message: textResponse };
        }
      } else {
        providerError = `Provider API error: ${response.status} ${response.statusText}`;
        console.error('Provider cancel API error:', providerError);
      }
    } catch (error) {
      providerError = error instanceof Error ? error.message : 'Unknown error submitting to provider';
      console.error('Error submitting cancel request to provider:', error);
    }

    // Log the provider cancel request
    await db.providerOrderLogs.create({
      data: {
        orderId: order.id,
        providerId: provider.id,
        action: 'request_cancel',
        status: providerError ? 'error' : 'success',
        response: JSON.stringify(providerResult || { error: providerError }),
        createdAt: new Date()
      }
    });

    if (providerError) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to request cancellation from provider: ${providerError}`,
          data: null
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cancel request sent to provider successfully. If the provider cancels the order, the user balance will be automatically refunded.',
      data: {
        orderId: order.id,
        providerOrderId: order.providerOrderId,
        providerName: provider.name,
        providerResponse: providerResult
      }
    });

  } catch (error) {
    console.error('Error requesting cancel order:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error',
        data: null
      },
      { status: 500 }
    );
  }
}

