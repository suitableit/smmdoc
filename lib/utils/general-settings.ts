// Remove direct database import since we're now using API endpoints

// Interface for general settings
export interface GeneralSettings {
  siteTitle: string;
  tagline: string;
  siteDescription: string;
  siteIcon: string;
  siteLogo: string;
  siteDarkLogo: string;
  adminEmail: string;
  siteUrl: string;
  metaKeywords: string;
  metaSiteTitle: string;
  googleTitle: string;
  thumbnail: string;
  footerText: string;
}

// Cache for general settings to avoid repeated database calls
let cachedSettings: GeneralSettings | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Minimal fallback settings (only for critical failures)
const MINIMAL_FALLBACK: GeneralSettings = {
  siteTitle: process.env.NEXT_PUBLIC_APP_NAME || 'SMM Panel',
  tagline: 'Best SMM Services Provider',
  siteDescription: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Professional Social Media Marketing Panel',
  siteIcon: '/favicon.png',
  siteLogo: '/logo.png',
  siteDarkLogo: '',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  metaKeywords: 'SMM, Social Media Marketing, Panel',
  metaSiteTitle: process.env.NEXT_PUBLIC_APP_NAME || 'SMM Panel',
  googleTitle: 'SMM Panel - Social Media Marketing Services',
  thumbnail: '/general/og-image.jpg',
  footerText: '© 2025 SMM Panel. All rights reserved.'
};

/**
 * Get all general settings dynamically from admin settings API
 * This function fetches data from both general-settings and meta-settings endpoints
 * Falls back to minimal settings only in case of critical failures
 */
export async function getGeneralSettings(): Promise<GeneralSettings> {
  const now = Date.now();
  
  // Return cached value if still valid
  if (cachedSettings && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedSettings;
  }

  try {
    // Check if we're in a browser environment and can make API calls
    if (typeof window !== 'undefined') {
      // Client-side: Fetch from API endpoints
      const [generalResponse, metaResponse] = await Promise.all([
        fetch('/api/admin/general-settings', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        fetch('/api/admin/meta-settings', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      ]);

      let generalData = null;
      let metaData = null;

      // Parse general settings response
      if (generalResponse.ok) {
        const generalResult = await generalResponse.json();
        if (generalResult.success && generalResult.generalSettings) {
          generalData = generalResult.generalSettings;
        }
      }

      // Parse meta settings response
      if (metaResponse.ok) {
        const metaResult = await metaResponse.json();
        if (metaResult.success && metaResult.metaSettings) {
          metaData = metaResult.metaSettings;
        }
      }

      // If we have at least general settings, construct the complete settings object
      if (generalData) {
        cachedSettings = {
          siteTitle: generalData.siteTitle || MINIMAL_FALLBACK.siteTitle,
          tagline: generalData.tagline || MINIMAL_FALLBACK.tagline,
          siteDescription: metaData?.siteDescription || MINIMAL_FALLBACK.siteDescription,
          siteIcon: generalData.siteIcon || MINIMAL_FALLBACK.siteIcon,
          siteLogo: generalData.siteLogo || MINIMAL_FALLBACK.siteLogo,
          siteDarkLogo: generalData.siteDarkLogo || MINIMAL_FALLBACK.siteDarkLogo,
          adminEmail: generalData.adminEmail || MINIMAL_FALLBACK.adminEmail,
          siteUrl: MINIMAL_FALLBACK.siteUrl, // Keep from environment
          metaKeywords: metaData?.keywords || MINIMAL_FALLBACK.metaKeywords,
          metaSiteTitle: metaData?.siteTitle || generalData.siteTitle || MINIMAL_FALLBACK.metaSiteTitle,
          googleTitle: metaData?.googleTitle || MINIMAL_FALLBACK.googleTitle,
          thumbnail: metaData?.thumbnail || MINIMAL_FALLBACK.thumbnail,
          footerText: MINIMAL_FALLBACK.footerText // Keep static for now
        };
        lastFetchTime = now;
        return cachedSettings;
      }
    } else {
      // Server-side: Use direct database access for build-time and SSR
      const { db } = await import('@/lib/db');
      
      const settings = await db.generalSettings.findFirst();
      if (settings) {
        cachedSettings = {
          siteTitle: settings.siteTitle || MINIMAL_FALLBACK.siteTitle,
          tagline: settings.tagline || MINIMAL_FALLBACK.tagline,
          siteDescription: settings.siteDescription || MINIMAL_FALLBACK.siteDescription,
          siteIcon: settings.siteIcon || MINIMAL_FALLBACK.siteIcon,
          siteLogo: settings.siteLogo || MINIMAL_FALLBACK.siteLogo,
          siteDarkLogo: settings.siteDarkLogo || MINIMAL_FALLBACK.siteDarkLogo,
          adminEmail: settings.adminEmail || MINIMAL_FALLBACK.adminEmail,
          siteUrl: MINIMAL_FALLBACK.siteUrl,
          metaKeywords: settings.metaKeywords || MINIMAL_FALLBACK.metaKeywords,
          metaSiteTitle: settings.metaSiteTitle || settings.siteTitle || MINIMAL_FALLBACK.metaSiteTitle,
          googleTitle: settings.googleTitle || MINIMAL_FALLBACK.googleTitle,
          thumbnail: settings.thumbnail || MINIMAL_FALLBACK.thumbnail,
          footerText: MINIMAL_FALLBACK.footerText
        };
        lastFetchTime = now;
        return cachedSettings;
      }
    }
  } catch (error) {
    console.warn('Failed to fetch general settings:', error);
  }

  // Fallback to minimal settings only in case of critical failure
  cachedSettings = { ...MINIMAL_FALLBACK };
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
 * Get the tagline from General Settings
 */
export async function getTagline(): Promise<string> {
  const settings = await getGeneralSettings();
  return settings.tagline;
}

/**
 * Get the meta site title from General Settings
 */
export async function getMetaSiteTitle(): Promise<string> {
  const settings = await getGeneralSettings();
  return settings.metaSiteTitle;
}

/**
 * Get the Google title from General Settings
 */
export async function getGoogleTitle(): Promise<string> {
  const settings = await getGeneralSettings();
  return settings.googleTitle;
}

/**
 * Get the thumbnail from General Settings
 */
export async function getThumbnail(): Promise<string> {
  const settings = await getGeneralSettings();
  return settings.thumbnail;
}

/**
 * Get the footer text from General Settings
 */
export async function getFooterText(): Promise<string> {
  const settings = await getGeneralSettings();
  return settings.footerText;
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
  return cachedSettings || { ...MINIMAL_FALLBACK };
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
 * Get the tagline synchronously
 */
export function getTaglineSync(): string {
  const settings = getGeneralSettingsSync();
  return settings.tagline;
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
 * Get the meta site title synchronously
 */
export function getMetaSiteTitleSync(): string {
  const settings = getGeneralSettingsSync();
  return settings.metaSiteTitle;
}

/**
 * Get the Google title synchronously
 */
export function getGoogleTitleSync(): string {
  const settings = getGeneralSettingsSync();
  return settings.googleTitle;
}

/**
 * Get the thumbnail synchronously
 */
export function getThumbnailSync(): string {
  const settings = getGeneralSettingsSync();
  return settings.thumbnail;
}

/**
 * Get the footer text synchronously
 */
export function getFooterTextSync(): string {
  const settings = getGeneralSettingsSync();
  return settings.footerText;
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
  getAppNameSync as getSiteTitleSync,
  getTagline,
  getTaglineSync,
  getMetaSiteTitle,
  getMetaSiteTitleSync,
  getGoogleTitle,
  getGoogleTitleSync,
  getThumbnail,
  getThumbnailSync,
  getFooterText,
  getFooterTextSync
};