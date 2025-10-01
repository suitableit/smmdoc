// API Specification Configuration System for SMM Panel Integration
// This module handles the standardized API parameter rules and configurations

export interface ApiSpecification {
  // Basic API Configuration
  apiKeyParam: string;
  actionParam: string;
  
  // Service List Configuration
  servicesAction: string;
  servicesEndpoint?: string;
  
  // Add Order Configuration
  addOrderAction: string;
  addOrderEndpoint?: string;
  serviceIdParam: string;
  linkParam: string;
  quantityParam: string;
  runsParam: string;
  intervalParam: string;
  
  // Order Status Configuration
  statusAction: string;
  statusEndpoint?: string;
  orderIdParam: string;
  ordersParam: string;
  
  // Refill Configuration
  refillAction: string;
  refillEndpoint?: string;
  refillStatusAction: string;
  refillIdParam: string;
  refillsParam: string;
  
  // Cancel Configuration
  cancelAction: string;
  cancelEndpoint?: string;
  
  // Balance Configuration
  balanceAction: string;
  balanceEndpoint?: string;
  
  // Response Mapping
  responseMapping?: ResponseFieldMapping;
  
  // Request Settings
  requestFormat: 'form' | 'json' | 'query';
  responseFormat: 'json' | 'xml';
  rateLimitPerMin?: number;
  timeoutSeconds: number;
}

export interface ResponseFieldMapping {
  // Service List Response Mapping
  services?: {
    serviceId: string;
    name: string;
    type: string;
    category: string;
    rate: string;
    min: string;
    max: string;
    refill: string;
    cancel: string;
  };
  
  // Add Order Response Mapping
  addOrder?: {
    orderId: string;
  };
  
  // Order Status Response Mapping
  orderStatus?: {
    charge: string;
    startCount: string;
    status: string;
    remains: string;
    currency: string;
  };
  
  // Balance Response Mapping
  balance?: {
    balance: string;
    currency: string;
  };
  
  // Refill Response Mapping
  refill?: {
    refillId: string;
  };
  
  refillStatus?: {
    status: string;
  };
}

// Default SMM Panel API Specification (Standard Configuration)
export const DEFAULT_SMM_API_SPEC: ApiSpecification = {
  // Basic Parameters
  apiKeyParam: 'key',
  actionParam: 'action',
  
  // Service List
  servicesAction: 'services',
  
  // Add Order
  addOrderAction: 'add',
  serviceIdParam: 'service',
  linkParam: 'link',
  quantityParam: 'quantity',
  runsParam: 'runs',
  intervalParam: 'interval',
  
  // Order Status
  statusAction: 'status',
  orderIdParam: 'order',
  ordersParam: 'orders',
  
  // Refill
  refillAction: 'refill',
  refillStatusAction: 'refill_status',
  refillIdParam: 'refill',
  refillsParam: 'refills',
  
  // Cancel
  cancelAction: 'cancel',
  
  // Balance
  balanceAction: 'balance',
  
  // Default Response Mapping (Standard SMM Panel Format)
  responseMapping: {
    services: {
      serviceId: 'service',
      name: 'name',
      type: 'type',
      category: 'category',
      rate: 'rate',
      min: 'min',
      max: 'max',
      refill: 'refill',
      cancel: 'cancel'
    },
    addOrder: {
      orderId: 'order'
    },
    orderStatus: {
      charge: 'charge',
      startCount: 'start_count',
      status: 'status',
      remains: 'remains',
      currency: 'currency'
    },
    balance: {
      balance: 'balance',
      currency: 'currency'
    },
    refill: {
      refillId: 'refill'
    },
    refillStatus: {
      status: 'status'
    }
  },
  
  // Request Settings
  requestFormat: 'form',
  responseFormat: 'json',
  timeoutSeconds: 30
};

// API Request Builder Class
export class ApiRequestBuilder {
  private spec: ApiSpecification;
  private baseUrl: string;
  private apiKey: string;
  private httpMethod: string;

  constructor(spec: ApiSpecification, baseUrl: string, apiKey: string, httpMethod: string = 'POST') {
    this.spec = spec;
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.httpMethod = httpMethod;
  }

  // Build request for getting services
  buildServicesRequest(): RequestConfig {
    const endpoint = this.spec.servicesEndpoint || this.baseUrl;
    const params = {
      [this.spec.apiKeyParam]: this.apiKey,
      [this.spec.actionParam]: this.spec.servicesAction
    };

    return this.buildRequest(endpoint, params);
  }

  // Build request for adding order
  buildAddOrderRequest(serviceId: string, link: string, quantity: number, runs?: number, interval?: number): RequestConfig {
    const endpoint = this.spec.addOrderEndpoint || this.baseUrl;
    const params: Record<string, string | number> = {
      [this.spec.apiKeyParam]: this.apiKey,
      [this.spec.actionParam]: this.spec.addOrderAction,
      [this.spec.serviceIdParam]: serviceId,
      [this.spec.linkParam]: link,
      [this.spec.quantityParam]: quantity
    };

    if (runs !== undefined) {
      params[this.spec.runsParam] = runs;
    }
    if (interval !== undefined) {
      params[this.spec.intervalParam] = interval;
    }

    return this.buildRequest(endpoint, params);
  }

  // Build request for order status
  buildOrderStatusRequest(orderId: string): RequestConfig {
    const endpoint = this.spec.statusEndpoint || this.baseUrl;
    const params = {
      [this.spec.apiKeyParam]: this.apiKey,
      [this.spec.actionParam]: this.spec.statusAction,
      [this.spec.orderIdParam]: orderId
    };

    return this.buildRequest(endpoint, params);
  }

  // Build request for multiple orders status
  buildMultipleOrderStatusRequest(orderIds: string[]): RequestConfig {
    const endpoint = this.spec.statusEndpoint || this.baseUrl;
    const params = {
      [this.spec.apiKeyParam]: this.apiKey,
      [this.spec.actionParam]: this.spec.statusAction,
      [this.spec.ordersParam]: orderIds.join(',')
    };

    return this.buildRequest(endpoint, params);
  }

  // Build request for balance
  buildBalanceRequest(): RequestConfig {
    const endpoint = this.spec.balanceEndpoint || this.baseUrl;
    const params = {
      [this.spec.apiKeyParam]: this.apiKey,
      [this.spec.actionParam]: this.spec.balanceAction
    };

    return this.buildRequest(endpoint, params);
  }

  // Build request for refill
  buildRefillRequest(orderId: string): RequestConfig {
    const endpoint = this.spec.refillEndpoint || this.baseUrl;
    const params = {
      [this.spec.apiKeyParam]: this.apiKey,
      [this.spec.actionParam]: this.spec.refillAction,
      [this.spec.orderIdParam]: orderId
    };

    return this.buildRequest(endpoint, params);
  }

  // Build request for cancel
  buildCancelRequest(orderIds: string[]): RequestConfig {
    const endpoint = this.spec.cancelEndpoint || this.baseUrl;
    const params = {
      [this.spec.apiKeyParam]: this.apiKey,
      [this.spec.actionParam]: this.spec.cancelAction,
      [this.spec.ordersParam]: orderIds.join(',')
    };

    return this.buildRequest(endpoint, params);
  }

  private buildRequest(endpoint: string, params: Record<string, string | number>): RequestConfig {
    const config: RequestConfig = {
      url: endpoint,
      method: this.httpMethod as 'GET' | 'POST',
      timeout: this.spec.timeoutSeconds * 1000
    };

    if (this.spec.requestFormat === 'json') {
      config.headers = { 'Content-Type': 'application/json' };
      config.data = JSON.stringify(params);
    } else if (this.spec.requestFormat === 'query' || this.httpMethod === 'GET') {
      const stringParams = Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      );
      const queryString = new URLSearchParams(stringParams).toString();
      config.url = `${endpoint}?${queryString}`;
    } else {
      // Form data (default)
      config.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
      const stringParams = Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      );
      config.data = new URLSearchParams(stringParams).toString();
    }

    return config;
  }
}

export interface RequestConfig {
  url: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  data?: string;
  timeout: number;
}

// Response Parser Class
export class ApiResponseParser {
  private spec: ApiSpecification;

  constructor(spec: ApiSpecification) {
    this.spec = spec;
  }

  // Parse services response
  parseServicesResponse(response: unknown): ParsedService[] {
    if (!Array.isArray(response)) {
      throw new Error('Services response must be an array');
    }

    const mapping = this.spec.responseMapping?.services;
    if (!mapping) {
      return response; // Return as-is if no mapping defined
    }

    return response.map(service => ({
      serviceId: String(this.getNestedValue(service, mapping.serviceId) || ''),
      name: String(this.getNestedValue(service, mapping.name) || ''),
      type: String(this.getNestedValue(service, mapping.type) || ''),
      category: String(this.getNestedValue(service, mapping.category) || ''),
      rate: parseFloat(String(this.getNestedValue(service, mapping.rate))) || 0,
      min: parseInt(String(this.getNestedValue(service, mapping.min))) || 0,
      max: parseInt(String(this.getNestedValue(service, mapping.max))) || 0,
      refill: this.parseBooleanValue(this.getNestedValue(service, mapping.refill)),
      cancel: this.parseBooleanValue(this.getNestedValue(service, mapping.cancel))
    }));
  }

  // Parse add order response
  parseAddOrderResponse(response: unknown): { orderId: string } {
    const mapping = this.spec.responseMapping?.addOrder;
    if (!mapping) {
      return response as { orderId: string };
    }

    return {
      orderId: String(this.getNestedValue(response, mapping.orderId) || '')
    };
  }

  // Parse order status response
  parseOrderStatusResponse(response: unknown): ParsedOrderStatus {
    const mapping = this.spec.responseMapping?.orderStatus;
    if (!mapping) {
      return response as ParsedOrderStatus;
    }

    return {
      charge: parseFloat(String(this.getNestedValue(response, mapping.charge) || '0')) || 0,
      startCount: parseInt(String(this.getNestedValue(response, mapping.startCount) || '0')) || 0,
      status: String(this.getNestedValue(response, mapping.status) || ''),
      remains: parseInt(String(this.getNestedValue(response, mapping.remains) || '0')) || 0,
      currency: String(this.getNestedValue(response, mapping.currency) || '')
    };
  }

  // Parse balance response
  parseBalanceResponse(response: unknown): ParsedBalance {
    const mapping = this.spec.responseMapping?.balance;
    if (!mapping) {
      return response as ParsedBalance;
    }

    return {
      balance: parseFloat(String(this.getNestedValue(response, mapping.balance) || '0')) || 0,
      currency: String(this.getNestedValue(response, mapping.currency) || '')
    };
  }

  private getNestedValue(obj: unknown, path: string): unknown {
    return path.split('.').reduce((current: any, key) => current?.[key], obj);
  }

  private parseBooleanValue(value: unknown): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1';
    }
    if (typeof value === 'number') {
      return value === 1;
    }
    return false;
  }
}

// Parsed Response Interfaces
export interface ParsedService {
  serviceId: string;
  name: string;
  type: string;
  category: string;
  rate: number;
  min: number;
  max: number;
  refill: boolean;
  cancel: boolean;
}

export interface ParsedOrderStatus {
  charge: number;
  startCount: number;
  status: string;
  remains: number;
  currency: string;
}

export interface ParsedBalance {
  balance: number;
  currency: string;
}

// Utility function to create API specification from database record
export function createApiSpecFromProvider(provider: Record<string, unknown>): ApiSpecification {
  return {
    apiKeyParam: String(provider.api_key_param || DEFAULT_SMM_API_SPEC.apiKeyParam),
    actionParam: String(provider.action_param || DEFAULT_SMM_API_SPEC.actionParam),
    
    servicesAction: String(provider.services_action || DEFAULT_SMM_API_SPEC.servicesAction),
    servicesEndpoint: provider.services_endpoint ? String(provider.services_endpoint) : undefined,
    
    addOrderAction: String(provider.add_order_action || DEFAULT_SMM_API_SPEC.addOrderAction),
    addOrderEndpoint: provider.add_order_endpoint ? String(provider.add_order_endpoint) : undefined,
    serviceIdParam: String(provider.service_id_param || DEFAULT_SMM_API_SPEC.serviceIdParam),
    linkParam: String(provider.link_param || DEFAULT_SMM_API_SPEC.linkParam),
    quantityParam: String(provider.quantity_param || DEFAULT_SMM_API_SPEC.quantityParam),
    runsParam: String(provider.runs_param || DEFAULT_SMM_API_SPEC.runsParam),
    intervalParam: String(provider.interval_param || DEFAULT_SMM_API_SPEC.intervalParam),
    
    statusAction: String(provider.status_action || DEFAULT_SMM_API_SPEC.statusAction),
    statusEndpoint: provider.status_endpoint ? String(provider.status_endpoint) : undefined,
    orderIdParam: String(provider.order_id_param || DEFAULT_SMM_API_SPEC.orderIdParam),
    ordersParam: String(provider.orders_param || DEFAULT_SMM_API_SPEC.ordersParam),
    
    refillAction: String(provider.refill_action || DEFAULT_SMM_API_SPEC.refillAction),
    refillEndpoint: provider.refill_endpoint ? String(provider.refill_endpoint) : undefined,
    refillStatusAction: String(provider.refill_status_action || DEFAULT_SMM_API_SPEC.refillStatusAction),
    refillIdParam: String(provider.refill_id_param || DEFAULT_SMM_API_SPEC.refillIdParam),
    refillsParam: String(provider.refills_param || DEFAULT_SMM_API_SPEC.refillsParam),
    
    cancelAction: String(provider.cancel_action || DEFAULT_SMM_API_SPEC.cancelAction),
    cancelEndpoint: provider.cancel_endpoint ? String(provider.cancel_endpoint) : undefined,
    
    balanceAction: String(provider.balance_action || DEFAULT_SMM_API_SPEC.balanceAction),
    balanceEndpoint: provider.balance_endpoint ? String(provider.balance_endpoint) : undefined,
    
    responseMapping: provider.response_mapping ? JSON.parse(String(provider.response_mapping)) : DEFAULT_SMM_API_SPEC.responseMapping,
    
    requestFormat: (provider.request_format as 'form' | 'json' | 'query') || DEFAULT_SMM_API_SPEC.requestFormat,
    responseFormat: (provider.response_format as 'json' | 'xml') || DEFAULT_SMM_API_SPEC.responseFormat,
    rateLimitPerMin: provider.rate_limit_per_min ? Number(provider.rate_limit_per_min) : undefined,
    timeoutSeconds: Number(provider.timeout_seconds || DEFAULT_SMM_API_SPEC.timeoutSeconds)
  };
}