/**
 * Permission utility functions for moderator access control
 */

// Map permission IDs to route paths
export const PERMISSION_ROUTE_MAP: Record<string, string[]> = {
  all_orders: ['/admin/orders'],
  refill_requests: ['/admin/orders/refill-requests'],
  cancel_requests: ['/admin/orders/cancel-requests'],
  all_services: ['/admin/services'],
  api_sync_logs: ['/admin/services/sync-logs'],
  users: ['/admin/users'],
  user_activity_logs: ['/admin/users/logs'],
  all_transactions: ['/admin/transactions'],
  support_tickets: ['/admin/tickets'],
  contact_messages: ['/admin/contact-messages'],
  blogs: ['/admin/blogs'],
  announcements: ['/admin/announcements'],
  affiliate_users: ['/admin/affiliates'],
  withdrawals: ['/admin/affiliates/withdrawals'],
  analytics: ['/admin/analytics'],
  child_panels: ['/admin/child-panels'],
};

// Map route paths to permission IDs (reverse lookup)
export const ROUTE_PERMISSION_MAP: Record<string, string> = {
  '/admin/orders': 'all_orders',
  '/admin/orders/refill-requests': 'refill_requests',
  '/admin/orders/cancel-requests': 'cancel_requests',
  '/admin/services': 'all_services',
  '/admin/services/sync-logs': 'api_sync_logs',
  '/admin/users': 'users',
  '/admin/users/logs': 'user_activity_logs',
  '/admin/transactions': 'all_transactions',
  '/admin/tickets': 'support_tickets',
  '/admin/contact-messages': 'contact_messages',
  '/admin/blogs': 'blogs',
  '/admin/announcements': 'announcements',
  '/admin/affiliates': 'affiliate_users',
  '/admin/affiliates/withdrawals': 'withdrawals',
  '/admin/analytics': 'analytics',
  '/admin/child-panels': 'child_panels',
};

/**
 * Check if a user has permission to access a route
 */
export function hasPermission(
  userRole: string,
  userPermissions: string[] | null | undefined,
  routePath: string
): boolean {
  // Admins have access to everything
  if (userRole === 'admin' || userRole === 'super_admin') {
    return true;
  }

  // Moderators need specific permissions
  if (userRole === 'moderator') {
    // Normalize pathname (remove trailing slash)
    const normalizedPath = routePath.endsWith('/') && routePath !== '/' 
      ? routePath.slice(0, -1) 
      : routePath;
    
    // Dashboard is always accessible to moderators (even without any permissions)
    if (normalizedPath === '/admin' || normalizedPath === '/') {
      return true;
    }

    // Check if route requires a permission
    const requiredPermission = ROUTE_PERMISSION_MAP[normalizedPath];
    
    if (!requiredPermission) {
      // If route is not in the map, it might be a settings page or other restricted area
      // Deny access to unknown routes for moderators (they should only access pages with explicit permissions)
      return false;
    }

    // Check if user has the required permission
    const permissionsArray = Array.isArray(userPermissions) ? userPermissions : [];
    return permissionsArray.includes(requiredPermission);
  }

  // Regular users don't have admin access
  return false;
}

/**
 * Get the required permission for a route
 */
export function getRequiredPermission(routePath: string): string | null {
  return ROUTE_PERMISSION_MAP[routePath] || null;
}

/**
 * Filter navigation items based on user permissions
 */
export function filterNavItemsByPermissions(
  navItems: Array<{ href: string; [key: string]: any }>,
  userRole: string,
  userPermissions: string[] | null | undefined
): Array<{ href: string; [key: string]: any }> {
  if (userRole === 'admin' || userRole === 'super_admin') {
    return navItems;
  }

  if (userRole === 'moderator') {
    return navItems.filter((item) => {
      // Dashboard is always visible
      if (item.href === '/admin' || item.href === '/admin/') {
        return true;
      }

      // Check if item requires a permission
      const requiredPermission = ROUTE_PERMISSION_MAP[item.href];
      if (!requiredPermission) {
        // Hide items that don't have a permission mapping (like settings, etc.)
        return false;
      }

      // Show item only if user has the required permission
      return userPermissions?.includes(requiredPermission) ?? false;
    });
  }

  // Regular users don't see admin nav items
  return [];
}

