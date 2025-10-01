import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { ApiRequestBuilder, ApiResponseParser, createApiSpecFromProvider } from '@/lib/provider-api-specification';

// POST /api/orders/place-to-provider - Forward order to external provider
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', data: null },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { orderId, providerId } = body;

    if (!orderId || !providerId) {
      return NextResponse.json(
        { success: false, message: 'Missing orderId or providerId', data: null },
        { status: 400 }
      );
    }

    // Get order details
    const order = await db.newOrder.findUnique({
      where: { id: orderId },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            providerServiceId: true
          }
        },
        user: {
          select: {
            id: true,
            email: true
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

    // Get provider details
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

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found', data: null },
        { status: 404 }
      );
    }

    if (provider.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Provider is not active', data: null },
        { status: 400 }
      );
    }

    // Prepare provider API request using API specification system
    const apiSpec = createApiSpecFromProvider(provider);
    const requestBuilder = new ApiRequestBuilder(apiSpec, provider.api_url, provider.api_key, 'POST');
    
    const orderRequest = requestBuilder.buildAddOrderRequest(
      String(order.service.providerServiceId || order.serviceId),
      order.link,
      order.qty
    );

    console.log('Sending order to provider:', {
      providerId: provider.id,
      providerName: provider.name,
      orderId: order.id,
      requestConfig: orderRequest
    });

    // Send request to provider
    let providerResponse;
    try {
      const response = await axios({
        method: orderRequest.method,
        url: orderRequest.url,
        data: orderRequest.data,
        headers: orderRequest.headers,
        timeout: 30000, // 30 seconds timeout
      });
      providerResponse = response.data;
    } catch (error: unknown) {
      console.error('Provider API error:', error);
      
      // Log the failed attempt
      await db.providerOrderLog.create({
        data: {
          orderId: order.id,
          providerId: provider.id,
          action: 'forward_order',
          status: 'failed',
          response: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })
        }
      });

      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to forward order to provider', 
          error: error instanceof Error ? error.message : 'Unknown error',
          data: null 
        },
        { status: 500 }
      );
    }

    // Check provider response using API specification system
    const responseParser = new ApiResponseParser(apiSpec);
    let parsedOrder;
    
    try {
      parsedOrder = responseParser.parseAddOrderResponse(providerResponse);
    } catch {
      await db.providerOrderLog.create({
        data: {
          orderId: order.id,
          providerId: provider.id,
          action: 'forward_order',
          status: 'failed',
          response: JSON.stringify(providerResponse)
        }
      });

      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid response format from provider', 
          data: null 
        },
        { status: 500 }
      );
    }

    if (!parsedOrder || !parsedOrder.orderId) {
      await db.providerOrderLog.create({
        data: {
          orderId: order.id,
          providerId: provider.id,
          action: 'forward_order',
          status: 'failed',
          response: JSON.stringify(providerResponse)
        }
      });

      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid response from provider', 
          data: null 
        },
        { status: 500 }
      );
    }

    // Update order with provider information
    await db.newOrder.update({
      where: { id: orderId },
      data: {
        providerOrderId: parsedOrder.orderId.toString(),
        providerStatus: 'pending',
        lastSyncAt: new Date()
      }
    });

    // Log successful forwarding
    await db.providerOrderLog.create({
      data: {
        orderId: order.id,
        providerId: provider.id,
        action: 'forward_order',
        status: 'success',
        response: JSON.stringify(providerResponse),
        createdAt: new Date()
      }
    });

    console.log('Order forwarded successfully:', {
      orderId: order.id,
      providerOrderId: parsedOrder.orderId,
      providerId: provider.id
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Order forwarded to provider successfully',
        data: {
          orderId: order.id,
          providerOrderId: providerResponse.order,
          providerName: provider.name,
          status: 'pending'
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error forwarding order to provider:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}