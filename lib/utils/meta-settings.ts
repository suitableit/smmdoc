import { db } from '@/lib/db';

// Interface for meta settings
export interface MetaSettings {
  googleTitle: string;
  siteTitle: string;
  siteDescription: string;
  keywords: string;
  thumbnail: string;
}

// Cache for meta settings to avoid repeated database calls
let cachedMetaSettings: MetaSettings | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Default fallback meta settings
const DEFAULT_META_SETTINGS: MetaSettings = {
  googleTitle: 'SMM Panel - Social Media Marketing Services',
  siteTitle: 'SMM Panel',
  siteDescription: 'Discover the cheapest SMM panel in Bangladesh - a cost-effective solution for amazing business growth. Save money, gain new followers, and easily boost your online presence',
  keywords: 'SMM Panel, Cheapest SMM Panel, SMM Panel Bangladesh, Social Media Marketing, Facebook likes, Instagram followers, YouTube views',
  thumbnail: '/general/og-image.jpg'
};

/**
 * Get meta settings from database with caching
 * @returns Promise<MetaSettings>
 */
export async function getMetaSettings(): Promise<MetaSettings> {
  const now = Date.now();
  
  // Return cached settings if still valid
  if (cachedMetaSettings && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedMetaSettings;
  }

  try {
    // Get meta settings from general settings table
    const settings = await db.generalSettings.findFirst();
    
    if (settings) {
      const metaSettings: MetaSettings = {
        googleTitle: settings.googleTitle || DEFAULT_META_SETTINGS.googleTitle,
        siteTitle: settings.metaSiteTitle || DEFAULT_META_SETTINGS.siteTitle,
        siteDescription: settings.siteDescription || DEFAULT_META_SETTINGS.siteDescription,
        keywords: settings.metaKeywords || DEFAULT_META_SETTINGS.keywords,
        thumbnail: settings.thumbnail || DEFAULT_META_SETTINGS.thumbnail
      };
      
      // Update cache
      cachedMetaSettings = metaSettings;
      lastFetchTime = now;
      
      return metaSettings;
    }
  } catch (error) {
    console.error('Error fetching meta settings:', error);
  }
  
  // Return default settings if database query fails
  return DEFAULT_META_SETTINGS;
}

/**
 * Clear the meta settings cache (useful after updates)
 */
export function clearMetaSettingsCache(): void {
  cachedMetaSettings = null;
  lastFetchTime = 0;
}

/**
 * Format keywords string into array
 * @param keywords - Comma-separated keywords string
 * @returns Array of keywords
 */
export function formatKeywords(keywords: string): string[] {
  if (!keywords) return [];
  return keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
}

/**
 * Generate Open Graph image URL
 * @param thumbnail - Thumbnail path from settings
 * @param baseUrl - Base URL of the site
 * @returns Full URL for Open Graph image
 */
export function getOpenGraphImageUrl(thumbnail: string, baseUrl: string): string {
  if (!thumbnail) return `${baseUrl}/og-image.jpg`;
  
  // If thumbnail is already a full URL, return as is
  if (thumbnail.startsWith('http')) return thumbnail;
  
  // If thumbnail starts with /, it's a relative path
  if (thumbnail.startsWith('/')) return `${baseUrl}${thumbnail}`;
  
  // Otherwise, assume it's in general directory (new default for meta thumbnails)
  return `${baseUrl}/general/${thumbnail}`;
}