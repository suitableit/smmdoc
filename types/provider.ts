export interface Provider {
  id: number;
  name: string;
  api_url: string;
  api_key: string;
  status: 'active' | 'inactive' | 'trash';
  services: number;
  orders: number;
  importedServices: number;
  activeServices: number;
  currentBalance: number;
  successRate: number;
  avgResponseTime: number;
  createdAt: Date;
  lastSync: Date;
  deletedAt?: string | null;
  description?: string;
  username?: string;
  password?: string;
}