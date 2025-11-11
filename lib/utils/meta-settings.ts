import { db } from '@/lib/db';

export interface MetaSettings {
  googleTitle: string;
  siteTitle: string;
  siteDescription: string;
  keywords: string;
  thumbnail: string;
}

let cachedMetaSettings: MetaSettings | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

const DEFAULT_META_SETTINGS: MetaSettings = {
  googleTitle: 'SMM Panel - Social Media Marketing Services',
  siteTitle: 'SMM Panel',
  siteDescription: 'Discover the cheapest SMM panel in Bangladesh - a cost-effective solution for amazing business growth. Save money, gain new followers, and easily boost your online presence',
  keywords: 'SMM Panel, Cheapest SMM Panel, SMM Panel Bangladesh, Social Media Marketing, Facebook likes, Instagram followers, YouTube views',
  thumbnail: '/general/og-image.jpg'
};

export async function getMetaSettings(): Promise<MetaSettings> {
  const now = Date.now();

  if (cachedMetaSettings && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedMetaSettings;
  }

  try {

    const settings = await db.generalSettings.findFirst();

    if (settings) {
      const metaSettings: MetaSettings = {
        googleTitle: settings.googleTitle || DEFAULT_META_SETTINGS.googleTitle,
        siteTitle: settings.metaSiteTitle || DEFAULT_META_SETTINGS.siteTitle,
        siteDescription: settings.siteDescription || DEFAULT_META_SETTINGS.siteDescription,
        keywords: settings.metaKeywords || DEFAULT_META_SETTINGS.keywords,
        thumbnail: settings.thumbnail || DEFAULT_META_SETTINGS.thumbnail
      };

      cachedMetaSettings = metaSettings;
      lastFetchTime = now;

      return metaSettings;
    }
  } catch (error) {
    console.error('Error fetching meta settings:', error);
  }

  return DEFAULT_META_SETTINGS;
}

export function clearMetaSettingsCache(): void {
  cachedMetaSettings = null;
  lastFetchTime = 0;
}

export function formatKeywords(keywords: string): string[] {
  if (!keywords) return [];
  return keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
}

export function getOpenGraphImageUrl(thumbnail: string, baseUrl: string): string {
  if (!thumbnail) return `${baseUrl}/og-image.jpg`;

  if (thumbnail.startsWith('http')) return thumbnail;

  if (thumbnail.startsWith('/')) return `${baseUrl}${thumbnail}`;

  return `${baseUrl}/general/${thumbnail}`;
}