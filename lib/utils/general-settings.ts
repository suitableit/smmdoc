
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

let cachedSettings: GeneralSettings | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

const MINIMAL_FALLBACK: GeneralSettings = {
  siteTitle: process.env.NEXT_PUBLIC_APP_NAME || 'SMM Panel',
  tagline: 'Best SMM Services Provider',
  siteDescription: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Professional Social Media Marketing Panel',
  siteIcon: '/favicon.png',
  siteLogo: '/logo.png',
  siteDarkLogo: '',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || '',
  metaKeywords: 'SMM, Social Media Marketing, Panel',
  metaSiteTitle: process.env.NEXT_PUBLIC_APP_NAME || 'SMM Panel',
  googleTitle: 'SMM Panel - Social Media Marketing Services',
  thumbnail: '/general/og-image.jpg',
  footerText: '© 2025 SMM Panel. All rights reserved.'
};

export async function getGeneralSettings(): Promise<GeneralSettings> {
  const now = Date.now();

  if (cachedSettings && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedSettings;
  }

  try {

    if (typeof window !== 'undefined') {

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

      if (generalResponse.ok) {
        const generalResult = await generalResponse.json();
        if (generalResult.success && generalResult.generalSettings) {
          generalData = generalResult.generalSettings;
        }
      }

      if (metaResponse.ok) {
        const metaResult = await metaResponse.json();
        if (metaResult.success && metaResult.metaSettings) {
          metaData = metaResult.metaSettings;
        }
      }

      if (generalData) {
        cachedSettings = {
          siteTitle: generalData.siteTitle || MINIMAL_FALLBACK.siteTitle,
          tagline: generalData.tagline || MINIMAL_FALLBACK.tagline,
          siteDescription: metaData?.siteDescription || MINIMAL_FALLBACK.siteDescription,
          siteIcon: generalData.siteIcon || MINIMAL_FALLBACK.siteIcon,
          siteLogo: generalData.siteLogo || MINIMAL_FALLBACK.siteLogo,
          siteDarkLogo: generalData.siteDarkLogo || MINIMAL_FALLBACK.siteDarkLogo,
          adminEmail: generalData.adminEmail || MINIMAL_FALLBACK.adminEmail,
          siteUrl: MINIMAL_FALLBACK.siteUrl,
          metaKeywords: metaData?.keywords || MINIMAL_FALLBACK.metaKeywords,
          metaSiteTitle: metaData?.siteTitle || generalData.siteTitle || MINIMAL_FALLBACK.metaSiteTitle,
          googleTitle: metaData?.googleTitle || MINIMAL_FALLBACK.googleTitle,
          thumbnail: metaData?.thumbnail || MINIMAL_FALLBACK.thumbnail,
          footerText: MINIMAL_FALLBACK.footerText
        };
        lastFetchTime = now;
        return cachedSettings;
      }
    } else {

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

  cachedSettings = { ...MINIMAL_FALLBACK };
  lastFetchTime = now;
  return cachedSettings;
}

export async function getAppName(): Promise<string> {
  const settings = await getGeneralSettings();
  return settings.siteTitle;
}

export async function getSiteDescription(): Promise<string> {
  const settings = await getGeneralSettings();
  return settings.siteDescription;
}

export async function getAdminEmail(): Promise<string> {
  const settings = await getGeneralSettings();
  return settings.adminEmail;
}

export async function getTagline(): Promise<string> {
  const settings = await getGeneralSettings();
  return settings.tagline;
}

export async function getMetaSiteTitle(): Promise<string> {
  const settings = await getGeneralSettings();
  return settings.metaSiteTitle;
}

export async function getGoogleTitle(): Promise<string> {
  const settings = await getGeneralSettings();
  return settings.googleTitle;
}

export async function getThumbnail(): Promise<string> {
  const settings = await getGeneralSettings();
  return settings.thumbnail;
}

export async function getFooterText(): Promise<string> {
  const settings = await getGeneralSettings();
  return settings.footerText;
}

export async function getSiteLogo(): Promise<string> {
  const settings = await getGeneralSettings();
  return settings.siteLogo;
}

export async function getSiteIcon(): Promise<string> {
  const settings = await getGeneralSettings();
  return settings.siteIcon;
}

export function getGeneralSettingsSync(): GeneralSettings {
  return cachedSettings || { ...MINIMAL_FALLBACK };
}

export function getAppNameSync(): string {
  const settings = getGeneralSettingsSync();
  return settings.siteTitle;
}

export function getTaglineSync(): string {
  const settings = getGeneralSettingsSync();
  return settings.tagline;
}

export function getSiteDescriptionSync(): string {
  const settings = getGeneralSettingsSync();
  return settings.siteDescription;
}

export function getAdminEmailSync(): string {
  const settings = getGeneralSettingsSync();
  return settings.adminEmail;
}

export function getMetaSiteTitleSync(): string {
  const settings = getGeneralSettingsSync();
  return settings.metaSiteTitle;
}

export function getGoogleTitleSync(): string {
  const settings = getGeneralSettingsSync();
  return settings.googleTitle;
}

export function getThumbnailSync(): string {
  const settings = getGeneralSettingsSync();
  return settings.thumbnail;
}

export function getFooterTextSync(): string {
  const settings = getGeneralSettingsSync();
  return settings.footerText;
}

export function clearGeneralSettingsCache(): void {
  cachedSettings = null;
  lastFetchTime = 0;
}

export function clearAppNameCache(): void {
  clearGeneralSettingsCache();
}

export {
  getAppName as getSiteTitle,
  getAppNameSync as getSiteTitleSync
};