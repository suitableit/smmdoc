export interface Order {
  id: number;
  user: {
    id: number;
    email: string;
    name: string;
    username?: string;
    currency: string;
  };
  service: {
    id: number;
    name: string;
    rate: number;
    min_order: number;
    max_order: number;
  };
  category: {
    id: number;
    category_name: string;
  };
  qty: number;
  price: number;
  charge: number;
  profit: number;
  usdPrice: number;
  bdtPrice: number;
  currency: string;
  status:
    | 'pending'
    | 'processing'
    | 'in_progress'
    | 'completed'
    | 'partial'
    | 'cancelled'
    | 'refunded'
    | 'failed';
  createdAt: string;
  updatedAt: string;
  link: string;
  startCount: number;
  remains: number;
  avg_time: string;
  seller: string;
  mode: string;
  isProviderService?: boolean;
  providerId?: string;
  providerServiceId?: string;
  providerOrderId?: string;
  providerStatus?: string;
  lastSyncAt?: string;
  apiProvider?: {
    id: string;
    name: string;
    apiUrl: string;
    status: string;
  };
}