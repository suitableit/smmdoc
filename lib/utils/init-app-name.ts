import { getAppName } from './app-name';

/**
 * Initialize the app name from database on server startup
 * This ensures the app name is cached from database settings
 */
export async function initializeAppName(): Promise<void> {
  try {
    await getAppName();
    console.log('✅ App name initialized from database settings');
  } catch (error) {
    console.warn('⚠️ Failed to initialize app name from database, using fallback:', error);
  }
}