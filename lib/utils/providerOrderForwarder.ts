import { Provider } from '@/types/provider';
import { Order } from '@/types/order';

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

  /**
   * Forward order to external provider
   */
  async forwardOrderToProvider(
    provider: Provider,
    orderData: ProviderOrderRequest
  ): Promise<ProviderOrderResponse> {
    try {
      const requestBody = {
        key: provider.api_key,
        action: 'add',
        service: orderData.service,
        link: orderData.link,
        quantity: orderData.quantity,
        ...(orderData.runs && { runs: orderData.runs }),
        ...(orderData.interval && { interval: orderData.interval })
      };

      const response = await fetch(provider.api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(requestBody).toString(),
      });

      if (!response.ok) {
        throw new Error(`Provider API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Provider error: ${result.error}`);
      }

      return {
        order: result.order,
        charge: parseFloat(result.charge),
        start_count: result.start_count ? parseInt(result.start_count) : undefined,
        status: this.mapProviderStatus(result.status || 'Pending'),
        remains: result.remains ? parseInt(result.remains) : undefined,
        currency: result.currency || 'USD'
      };
    } catch (error) {
      console.error('Error forwarding order to provider:', error);
      throw error;
    }
  }

  /**
   * Check order status from provider
   */
  async checkProviderOrderStatus(
    provider: Provider,
    providerOrderId: string
  ): Promise<ProviderStatusResponse> {
    try {
      const requestBody = {
        key: provider.api_key,
        action: 'status',
        order: providerOrderId
      };

      const response = await fetch(provider.api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(requestBody).toString(),
      });

      if (!response.ok) {
        throw new Error(`Provider API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Provider error: ${result.error}`);
      }

      return {
        charge: parseFloat(result.charge),
        start_count: parseInt(result.start_count),
        status: this.mapProviderStatus(result.status),
        remains: parseInt(result.remains),
        currency: result.currency || 'USD'
      };
    } catch (error) {
      console.error('Error checking provider order status:', error);
      throw error;
    }
  }

  /**
   * Get provider services list
   */
  async getProviderServices(provider: Provider): Promise<any[]> {
    try {
      const requestBody = {
        key: provider.api_key,
        action: 'services'
      };

      const response = await fetch(provider.api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(requestBody).toString(),
      });

      if (!response.ok) {
        throw new Error(`Provider API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Provider error: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error('Error fetching provider services:', error);
      throw error;
    }
  }

  /**
   * Get provider balance
   */
  async getProviderBalance(provider: Provider): Promise<number> {
    try {
      const requestBody = {
        key: provider.api_key,
        action: 'balance'
      };

      const response = await fetch(provider.api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(requestBody).toString(),
      });

      if (!response.ok) {
        throw new Error(`Provider API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Provider error: ${result.error}`);
      }

      return parseFloat(result.balance);
    } catch (error) {
      console.error('Error fetching provider balance:', error);
      throw error;
    }
  }

  /**
   * Map provider status to internal status
   */
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

  /**
   * Validate provider configuration
   */
  validateProvider(provider: Provider): boolean {
    if (!provider.api_url || !provider.api_key) {
      return false;
    }

    // Basic URL validation
    try {
      new URL(provider.api_url);
    } catch {
      return false;
    }

    return true;
  }

  /**
   * Test provider connection
   */
  async testProviderConnection(provider: Provider): Promise<boolean> {
    try {
      await this.getProviderBalance(provider);
      return true;
    } catch (error) {
      console.error('Provider connection test failed:', error);
      return false;
    }
  }

  /**
   * Sync multiple orders status from provider
   */
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

  /**
   * Calculate provider service cost
   */
  calculateProviderCost(
    serviceRate: number,
    quantity: number,
    markup: number = 0
  ): number {
    const baseCost = (serviceRate / 1000) * quantity;
    const markupAmount = baseCost * (markup / 100);
    return baseCost + markupAmount;
  }

  /**
   * Format provider error message
   */
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