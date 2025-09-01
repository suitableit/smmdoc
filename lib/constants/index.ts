import { getAppNameSync } from '@/lib/utils/general-settings';

// For backward compatibility, we export APP_NAME as a function call
// This will get the app name from database settings or fallback to env
export const APP_NAME = getAppNameSync();
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION;
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
