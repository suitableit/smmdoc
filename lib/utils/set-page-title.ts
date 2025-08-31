'use client';

/**
 * Utility function to set page title with app name
 * @param pageTitle - The specific page title (e.g., "Dashboard", "Settings")
 * @param appName - The app name from context or fallback
 */
export function setPageTitle(pageTitle: string, appName: string) {
  if (typeof document !== 'undefined') {
    document.title = `${pageTitle} — ${appName}`;
  }
}