/**
 * Utility functions for logging out and clearing session data
 */

/**
 * Clear all session-related storage (localStorage, sessionStorage, and cookies)
 */
export function clearAllSessionData(): void {
  if (typeof window === 'undefined') return;

  try {
    // Clear NextAuth and session-related localStorage keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        if (
          key.startsWith('next-auth') ||
          key.includes('session') ||
          key.includes('auth') ||
          key.includes('token') ||
          key.includes('user')
        ) {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Clear all sessionStorage
    sessionStorage.clear();

    // Clear NextAuth cookies by setting them to expire
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      '__Secure-next-auth.session-token',
      '__Secure-next-auth.csrf-token',
    ];

    cookiesToClear.forEach(cookieName => {
      // Clear cookie by setting it to expire in the past
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`;
      document.cookie = `${cookieName}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      document.cookie = `${cookieName}=; path=/; domain=.${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    });
  } catch (error) {
    console.error('Error clearing session data:', error);
  }
}

/**
 * Complete logout function that clears all session data and signs out
 */
export async function performCompleteLogout(
  signOut: (options?: { callbackUrl?: string; redirect?: boolean }) => Promise<void>,
  callbackUrl: string = '/sign-in'
): Promise<void> {
  try {
    // Clear all session storage first
    clearAllSessionData();

    // Call logout API to log the activity (don't wait for it)
    fetch('/api/auth/logout', {
      method: 'POST',
    }).catch(e => {
      console.error('Failed to log logout activity:', e);
    });

    // Sign out through NextAuth
    await signOut({
      callbackUrl,
      redirect: true,
    });
  } catch (error) {
    console.error('Logout failed:', error);
    // Force redirect even if signOut fails
    clearAllSessionData();
    window.location.href = callbackUrl || '/sign-in';
  }
}

