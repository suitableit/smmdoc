import { db } from '@/lib/db';

interface ActivityLogData {
  userId?: number;
  username?: string;
  action: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity(data: ActivityLogData) {
  try {
    await db.activityLog.create({
      data: {
        userId: data.userId,
        username: data.username,
        action: data.action,
        details: data.details,
        ipAddress: data.ipAddress || 'unknown',
        userAgent: data.userAgent || 'unknown',
        metadata: data.metadata,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export const ActivityLogger = {
  login: (userId: number, username: string, ipAddress?: string) =>
    logActivity({
      userId,
      username,
      action: 'login',
      details: `User ${username} logged in successfully`,
      ipAddress,
    }),

  adminLogin: (adminId: number, adminUsername: string, ipAddress?: string) =>
    logActivity({
      userId: adminId,
      username: adminUsername,
      action: 'admin_login',
      details: `Admin ${adminUsername} logged into admin panel`,
      ipAddress,
    }),

  logout: (userId: number, username: string, ipAddress?: string) =>
    logActivity({
      userId,
      username,
      action: 'logout',
      details: `User ${username} logged out`,
      ipAddress,
    }),

  adminLogout: (adminId: number, adminUsername: string, ipAddress?: string) =>
    logActivity({
      userId: adminId,
      username: adminUsername,
      action: 'admin_logout',
      details: `Admin ${adminUsername} logged out from admin panel`,
      ipAddress,
    }),

  orderCreated: (userId: number, username: string, orderCount: number, totalCost: number, currency: string, ipAddress?: string) =>
    logActivity({
      userId,
      username,
      action: 'order_created',
      details: `User ${username} created ${orderCount} order(s) with total cost ${totalCost} ${currency}`,
      ipAddress,
      metadata: {
        orderCount,
        totalCost,
        currency
      }
    }),

  fundAdded: (userId: number, username: string, amount: number, currency: string, method: string, ipAddress?: string) =>
    logActivity({
      userId,
      username,
      action: 'fund_added',
      details: `User ${username} added ${amount} ${currency} via ${method}`,
      ipAddress,
      metadata: {
        amount,
        currency,
        method
      }
    }),

  profileUpdated: (userId: number, username: string, fields: string, ipAddress?: string) =>
    logActivity({
      userId,
      username,
      action: 'profile_updated',
      details: `User ${username} updated profile fields: ${fields}`,
      ipAddress,
      metadata: {
        updatedFields: fields
      }
    }),

  passwordChanged: (userId: number, username: string, ipAddress?: string) =>
    logActivity({
      userId,
      username,
      action: 'password_changed',
      details: `User ${username} changed their password`,
      ipAddress,
    }),

  userStatusChanged: (adminId: number, adminUsername: string, targetUserId: number, targetUsername: string, oldStatus: string, newStatus: string) =>
    logActivity({
      userId: adminId,
      username: adminUsername,
      action: 'user_status_changed',
      details: `Admin ${adminUsername} changed user ${targetUsername} status from ${oldStatus} to ${newStatus}`,
      metadata: { targetUserId, targetUsername, oldStatus, newStatus },
    }),
};
