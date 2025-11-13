import { db } from '@/lib/db';

const activeConnections = new Set<{
  send: (data: any) => void;
  userId: string;
}>();

export function addRealtimeConnection(send: (data: any) => void, userId: string) {
  const connection = { send, userId };
  activeConnections.add(connection);
  return () => {
    activeConnections.delete(connection);
  };
}

export function broadcastOrderUpdate(orderId: number, orderData: any) {
  const message = {
    type: 'order_updated',
    orderId,
    data: orderData,
    timestamp: new Date().toISOString()
  };

  activeConnections.forEach(({ send }) => {
    try {
      send(message);
    } catch (error) {
      console.error('Error broadcasting to connection:', error);
    }
  });
}

export function broadcastSyncProgress(progress: {
  total: number;
  processed: number;
  synced: number;
  currentOrderId?: number;
}) {
  const message = {
    type: 'sync_progress',
    progress,
    timestamp: new Date().toISOString()
  };

  activeConnections.forEach(({ send }) => {
    try {
      send(message);
    } catch (error) {
      console.error('Error broadcasting sync progress:', error);
    }
  });
}

export function getActiveConnectionsCount() {
  return activeConnections.size;
}

