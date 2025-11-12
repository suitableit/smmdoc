import { Provider } from '@/types/provider';
import { ApiRequestBuilder, ApiResponseParser, createApiSpecFromProvider } from '@/lib/provider-api-specification';

export interface ProviderOrderRequest {
  service: string;
  link: string;
  quantity: number;
  runs?: number;
  interval?: number;
}

export interface ProviderOrderResponse {
  order: string;
  charge: number;
  start_count?: number;
  status: string;
  remains?: number;
  currency: string;
}

export interface ProviderStatusResponse {
  charge: number;
  start_count: number;
  status: string;
  remains: number;
  currency: string;
}

export class ProviderOrderForwarder {
  private static instance: ProviderOrderForwarder;

  public static getInstance(): ProviderOrderForwarder {
    if (!ProviderOrderForwarder.instance) {
      ProviderOrderForwarder.instance = new ProviderOrderForwarder();
    }
    return ProviderOrderForwarder.instance;
  }

  async forwardOrderToProvider(
    provider: Provider,
    orderData: ProviderOrderRequest
  ): Promise<ProviderOrderResponse> {
    try {
      const apiSpec = createApiSpecFromProvider(provider);
      const requestBuilder = new ApiRequestBuilder(
        apiSpec,
        provider.api_url,
        provider.api_key,
        (provider as any).http_method || (provider as any).httpMethod || 'POST'
      );

      const orderRequest = requestBuilder.buildAddOrderRequest(
        orderData.service,
        orderData.link,
        orderData.quantity,
        orderData.runs,
        orderData.interval
      );

      const response = await fetch(orderRequest.url, {
        method: orderRequest.method,
        headers: orderRequest.headers,
        body: orderRequest.data,
      });

      if (!response.ok) {
        throw new Error(`Provider API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(`Provider error: ${result.error}`);
      }

      const responseParser = new ApiResponseParser(apiSpec);
      const parsedOrder = responseParser.parseAddOrderResponse(result);

      return {
        order: parsedOrder.orderId,
        charge: (result as any).charge || 0,
        start_count: (result as any).start_count || (result as any).startCount || 0,
        status: this.mapProviderStatus((result as any).status || 'Pending'),
        remains: (result as any).remains || 0,
        currency: (result as any).currency || 'USD'
      };
    } catch (error) {
      console.error('Error forwarding order to provider:', error);
      throw error;
    }
  }

  async checkProviderOrderStatus(
    provider: Provider,
    providerOrderId: string
  ): Promise<ProviderStatusResponse> {
    try {
      const apiSpec = createApiSpecFromProvider(provider);
      const requestBuilder = new ApiRequestBuilder(
        apiSpec,
        provider.api_url,
        provider.api_key,
        (provider as any).http_method || (provider as any).httpMethod || 'POST'
      );

      const statusRequest = requestBuilder.buildOrderStatusRequest(providerOrderId);

      const response = await fetch(statusRequest.url, {
        method: statusRequest.method,
        headers: statusRequest.headers,
        body: statusRequest.data,
      });

      if (!response.ok) {
        throw new Error(`Provider API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(`Provider error: ${result.error}`);
      }

      const responseParser = new ApiResponseParser(apiSpec);
      const parsedStatus = responseParser.parseOrderStatusResponse(result);

      return {
        charge: parsedStatus.charge,
        start_count: parsedStatus.startCount,
        status: this.mapProviderStatus(parsedStatus.status),
        remains: parsedStatus.remains,
        currency: parsedStatus.currency || 'USD'
      };
    } catch (error) {
      console.error('Error checking provider order status:', error);
      throw error;
    }
  }

  async getProviderServices(provider: Provider): Promise<Array<{
    service: string;
    name: string;
    category: string;
    rate: number;
    min: number;
    max: number;
    type: string;
    refill?: boolean;
    cancel?: boolean;
  }>> {
    try {
      const apiSpec = createApiSpecFromProvider(provider);
      const requestBuilder = new ApiRequestBuilder(
        apiSpec,
        provider.api_url,
        provider.api_key,
        (provider as any).http_method || (provider as any).httpMethod || 'POST'
      );

      const servicesRequest = requestBuilder.buildServicesRequest();

      const response = await fetch(servicesRequest.url, {
        method: servicesRequest.method,
        headers: servicesRequest.headers,
        body: servicesRequest.data,
      });

      if (!response.ok) {
        throw new Error(`Provider API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(`Provider error: ${result.error}`);
      }

      const responseParser = new ApiResponseParser(apiSpec);
      const parsedServices = responseParser.parseServicesResponse(result);

      return parsedServices.map(service => ({
        service: service.serviceId,
        name: service.name,
        category: service.category,
        rate: service.rate,
        min: service.min,
        max: service.max,
        type: service.type,
        refill: service.refill,
        cancel: service.cancel
      }));
    } catch (error) {
      console.error('Error fetching provider services:', error);
      throw error;
    }
  }

  async getProviderBalance(provider: Provider): Promise<number> {
    try {
      const apiSpec = createApiSpecFromProvider(provider);
      const requestBuilder = new ApiRequestBuilder(
        apiSpec,
        provider.api_url,
        provider.api_key,
        (provider as any).http_method || (provider as any).httpMethod || 'POST'
      );

      const balanceRequest = requestBuilder.buildBalanceRequest();

      const response = await fetch(balanceRequest.url, {
        method: balanceRequest.method,
        headers: balanceRequest.headers,
        body: balanceRequest.data,
      });

      if (!response.ok) {
        throw new Error(`Provider API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(`Provider error: ${result.error}`);
      }

      const responseParser = new ApiResponseParser(apiSpec);
      const parsedBalance = responseParser.parseBalanceResponse(result);

      return parsedBalance.balance;
    } catch (error) {
      console.error('Error fetching provider balance:', error);
      throw error;
    }
  }

  private mapProviderStatus(providerStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'Pending': 'pending',
      'In progress': 'processing',
      'Processing': 'processing',
      'Completed': 'completed',
      'Partial': 'partial',
      'Canceled': 'cancelled',
      'Cancelled': 'cancelled',
      'Failed': 'failed',
      'Error': 'failed'
    };

    return statusMap[providerStatus] || 'pending';
  }

  validateProvider(provider: Provider): boolean {
    if (!provider.api_url || !provider.api_key) {
      return false;
    }

    try {
      new URL(provider.api_url);
    } catch {
      return false;
    }

    return true;
  }

  async testProviderConnection(provider: Provider): Promise<boolean> {
    try {
      await this.getProviderBalance(provider);
      return true;
    } catch (error) {
      console.error('Provider connection test failed:', error);
      return false;
    }
  }

  async syncOrdersStatus(
    provider: Provider,
    providerOrderIds: string[]
  ): Promise<{ [orderId: string]: ProviderStatusResponse }> {
    const results: { [orderId: string]: ProviderStatusResponse } = {};

    for (const orderId of providerOrderIds) {
      try {
        const status = await this.checkProviderOrderStatus(provider, orderId);
        results[orderId] = status;
      } catch (error) {
        console.error(`Failed to sync status for order ${orderId}:`, error);
      }
    }

    return results;
  }

  calculateProviderCost(
    serviceRate: number,
    quantity: number,
    markup: number = 0
  ): number {
    const baseCost = (serviceRate / 1000) * quantity;
    const markupAmount = baseCost * (markup / 100);
    return baseCost + markupAmount;
  }

  formatProviderError(error: any): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error.message) {
      return error.message;
    }

    return 'Unknown provider error occurred';
  }
}

export default ProviderOrderForwarder;