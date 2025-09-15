export interface Provider {
  id: number;
  name: string;
  api_url: string;
  api_key: string;
  status: 'active' | 'inactive';
  services: number;
  orders: number;
  importedServices: number;
  activeServices: number;
  currentBalance: number;
  successRate: number;
  avgResponseTime: number;
  createdAt: Date;
  lastSync: Date;
  description?: string;
  username?: string;
  password?: string;
}