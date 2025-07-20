// Session invalidation utility for live logout functionality

/**
 * Invalidate user sessions by calling server API and broadcasting to all clients
 * This will force logout users whose sessions have been invalidated
 */
export async function invalidateUserSessions(userId: number | string) {
  try {
    // Call server API to invalidate sessions in database
    const response = await fetch(`/api/admin/users/${userId}/invalidate-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      // Broadcast session invalidation to all connected clients
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('session-invalidation');
        channel.postMessage({
          type: 'SESSION_INVALIDATED',
          userId: userId.toString(),
          timestamp: Date.now()
        });
        channel.close();
      }
      console.log(`Successfully invalidated sessions for user ${userId}`);
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.warn(`Failed to invalidate sessions on server: ${errorData.error || response.statusText}`);
      // Don't throw error, just log warning - user deletion should still proceed
    }
  } catch (error) {
    console.warn('Error invalidating user sessions:', error);
    // Don't throw error, just log warning - user deletion should still proceed
  }
}

/**
 * Listen for session invalidation broadcasts
 * This should be called in the main app layout or auth provider
 */
export function setupSessionInvalidationListener(
  currentUserId: string | number | null,
  onSessionInvalidated: () => void
) {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return () => {}; // Return cleanup function
  }

  const channel = new BroadcastChannel('session-invalidation');
  
  const handleMessage = (event: MessageEvent) => {
    if (
      event.data.type === 'SESSION_INVALIDATED' && 
      currentUserId && 
      event.data.userId === currentUserId.toString()
    ) {
      console.log('Session invalidated for current user, logging out...');
      onSessionInvalidated();
    }
  };

  channel.addEventListener('message', handleMessage);

  // Return cleanup function
  return () => {
    channel.removeEventListener('message', handleMessage);
    channel.close();
  };
}

/**
 * Check if current session is still valid
 * This can be used as a fallback for browsers that don't support BroadcastChannel
 */
export async function checkSessionValidity(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/session-check', {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.valid === true;
  } catch (error) {
    console.error('Error checking session validity:', error);
    return false;
  }
}
