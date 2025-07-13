import { auth } from '@/auth';
import { getUserByEmail } from '@/data/user';

/**
 * Get current user session with proper ID conversion
 * Handles migration from string IDs to integer IDs
 */
export const getCurrentUser = async () => {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return null;
    }

    // If user ID is null or invalid, try to get user by email
    if (!session.user.id || session.user.id === null) {
      if (session.user.email) {
        const user = await getUserByEmail(session.user.email);
        if (user) {
          // Update session with correct numeric ID
          session.user.id = user.id;
          return session;
        }
      }
      return null;
    }

    // Ensure ID is numeric
    const numericId = typeof session.user.id === 'string' ? parseInt(session.user.id) : session.user.id;
    if (isNaN(numericId)) {
      // Invalid ID, try to get user by email
      if (session.user.email) {
        const user = await getUserByEmail(session.user.email);
        if (user) {
          session.user.id = user.id;
          return session;
        }
      }
      return null;
    }

    session.user.id = numericId;
    return session;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Get current user ID as number
 */
export const getCurrentUserId = async (): Promise<number | null> => {
  const session = await getCurrentUser();
  return session?.user?.id || null;
};

/**
 * Check if current user is admin
 */
export const isCurrentUserAdmin = async (): Promise<boolean> => {
  const session = await getCurrentUser();
  return session?.user?.role === 'admin';
};

/**
 * Require admin access - throws error if not admin
 */
export const requireAdmin = async () => {
  const session = await getCurrentUser();

  if (!session?.user) {
    throw new Error('Authentication required');
  }

  if (session.user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return session;
};

/**
 * Require user authentication - throws error if not authenticated
 */
export const requireAuth = async () => {
  const session = await getCurrentUser();

  if (!session?.user) {
    throw new Error('Authentication required');
  }

  return session;
};

/**
 * Check if user can access another user's data
 * Admin can access any user's data, regular users can only access their own
 */
export const canAccessUserData = async (targetUserId: number): Promise<boolean> => {
  const session = await getCurrentUser();

  if (!session?.user) {
    return false;
  }

  // Admin can access any user's data
  if (session.user.role === 'admin') {
    return true;
  }

  // Regular users can only access their own data
  return session.user.id === targetUserId;
};
