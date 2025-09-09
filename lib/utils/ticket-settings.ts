import { db } from '@/lib/db';

interface TicketSettings {
  ticketSystemEnabled: boolean;
  maxPendingTickets: string;
}

const DEFAULT_TICKET_SETTINGS: TicketSettings = {
  ticketSystemEnabled: true,
  maxPendingTickets: '3',
};

// Cache settings for 5 minutes
let cachedTicketSettings: TicketSettings | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get ticket system settings from database
 * Falls back to defaults if database is unavailable
 */
export async function getTicketSettings(): Promise<TicketSettings> {
  const now = Date.now();
  
  // Return cached value if still valid
  if (cachedTicketSettings && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedTicketSettings;
  }

  try {
    // Try to get from database first
    const settings = await db.ticket_settings.findFirst();
    if (settings) {
      cachedTicketSettings = {
        ticketSystemEnabled: settings.ticketSystemEnabled ?? DEFAULT_TICKET_SETTINGS.ticketSystemEnabled,
        maxPendingTickets: settings.maxPendingTickets || DEFAULT_TICKET_SETTINGS.maxPendingTickets,
      };
      lastFetchTime = now;
      return cachedTicketSettings;
    }
  } catch (error) {
    console.warn('Failed to fetch ticket settings from database:', error);
  }

  // Fallback to default settings
  cachedTicketSettings = { ...DEFAULT_TICKET_SETTINGS };
  lastFetchTime = now;
  return cachedTicketSettings;
}

/**
 * Check if ticket system is enabled
 */
export async function isTicketSystemEnabled(): Promise<boolean> {
  const settings = await getTicketSettings();
  return settings.ticketSystemEnabled;
}

/**
 * Clear the cache (useful when settings are updated)
 */
export function clearTicketSettingsCache(): void {
  cachedTicketSettings = null;
  lastFetchTime = 0;
}