import { db } from '@/lib/db';

// Interface for general settings
export interface GeneralSettings {
  siteTitle: string;
  siteDescription: string;
  siteIcon: string;
  siteLogo: string;
  siteDarkLogo: string;
  adminEmail: string;
  siteUrl: string;
  metaKeywords: string;
  footerText: string;
}

// Cache for general settings to avoid repeated database calls
let cachedSettings: GeneralSettings | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Default fallback settings
const DEFAULT_SETTINGS: GeneralSettings = {
  siteTitle: 'SMM Panel',
  siteDescription: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Professional Social Media Marketing Panel',
  siteIcon: '/favicon.png',
  siteLogo: '/logo.png',
  siteDarkLogo: '',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  metaKeywords: 'SMM, Social Media Marketing, Panel',
  footerText: '© 2024 SMM Panel. All rights reserved.'
};

/**
 * Get all general settings from database
 * Falls back to environment variables and defaults if database is unavailable
 */
export async function getGeneralSettings(): Promise<GeneralSettings> {
  const now = Date.now();
  
  // Return cached value if still valid
  if (cachedSettings && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedSettings;
  }

  try {
    // Try to get from database first
    const settings = await db.generalSettings.findFirst();
    if (settings) {
      cachedSettings = {
        siteTitle: settings.siteTitle || DEFAULT_SETTINGS.siteTitle,
        siteDescription: settings.siteDescription || DEFAULT_SETTINGS.siteDescription,
        siteIcon: settings.siteIcon || DEFAULT_SETTINGS.siteIcon,
        siteLogo: settings.siteLogo || DEFAULT_SETTINGS.siteLogo,
        siteDarkLogo: settings.siteDarkLogo || DEFAULT_SETTINGS.siteDarkLogo,
        adminEmail: settings.adminEmail || DEFAULT_SETTINGS.adminEmail,
        siteUrl: settings.siteUrl || DEFAULT_SETTINGS.siteUrl,
        metaKeywords: settings.metaKeywords || DEFAULT_SETTINGS.metaKeywords,
        footerText: settings.footerText || DEFAULT_SETTINGS.footerText
      };
      lastFetchTime = now;
      return cachedSettings;
    }
  } catch (error) {
    console.warn('Failed to fetch general settings from database:', error);
  }

  // Fallback to default settings
  cachedSettings = { ...DEFAULT_SETTINGS };
  lastFetchTime = now;
  return cachedSettings;
}

/**
 * Get the app name from General Settings database
 * Falls back to environment variable if database is unavailable
 */
export async function getAppName(): Promise<string> {
  const settings = await getGeneralSettings();
  return settings.siteTitle;
}

/**
 * Get the site description from General Settings
 */
export async function getSiteDescription(): Promise<string> {
  const settings = await getGeneralSettings();
  return settings.siteDescription;
}

/**
 * Get the admin email from General Settings
 */
export async function getAdminEmail(): Promise<string> {
  const settings = await getGeneralSettings();
  return settings.adminEmail;
}

/**
 * Get the site URL from General Settings
 */
export async function getSiteUrl(): Promise<string> {
  const settings = await getGeneralSettings();
  return settings.siteUrl;
}

/**
 * Get the site logo from General Settings
 */
export async function getSiteLogo(): Promise<string> {
  const settings = await getGeneralSettings();
  return settings.siteLogo;
}

/**
 * Get the site icon from General Settings
 */
export async function getSiteIcon(): Promise<string> {
  const settings = await getGeneralSettings();
  return settings.siteIcon;
}

/**
 * Get general settings synchronously (for client-side usage)
 * This should be used after the settings have been fetched server-side
 */
export function getGeneralSettingsSync(): GeneralSettings {
  return cachedSettings || { ...DEFAULT_SETTINGS };
}

/**
 * Get the app name synchronously (for client-side usage)
 * This should be used after the app name has been fetched server-side
 */
export function getAppNameSync(): string {
  const settings = getGeneralSettingsSync();
  return settings.siteTitle;
}

/**
 * Get the site description synchronously
 */
export function getSiteDescriptionSync(): string {
  const settings = getGeneralSettingsSync();
  return settings.siteDescription;
}

/**
 * Get the admin email synchronously
 */
export function getAdminEmailSync(): string {
  const settings = getGeneralSettingsSync();
  return settings.adminEmail;
}

/**
 * Clear the cached general settings (useful when settings are updated)
 */
export function clearGeneralSettingsCache(): void {
  cachedSettings = null;
  lastFetchTime = 0;
}

/**
 * Clear the cached app name (for backward compatibility)
 */
export function clearAppNameCache(): void {
  clearGeneralSettingsCache();
}

// Export individual setting getters for convenience
export {
  getAppName as getSiteTitle,
  getAppNameSync as getSiteTitleSync
};