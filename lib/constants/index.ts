import { getAppNameSync, getGeneralSettings } from '@/lib/utils/general-settings';

// Initialize settings cache on server-side
let isInitialized = false;

async function initializeSettings() {
  if (!isInitialized && typeof window === 'undefined') {
    try {
      await getGeneralSettings();
      isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize general settings:', error);
    }
  }
}

// Initialize settings immediately on server-side
if (typeof window === 'undefined') {
  initializeSettings();
}

// For backward compatibility, we export APP_NAME as a function call
// This will get the app name from cached settings or fallback to env
export const APP_NAME = getAppNameSync();
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION;
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
