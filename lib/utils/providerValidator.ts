import { db } from '@/lib/db';

export interface ProviderValidationResult {
  isValid: boolean;
  error?: string;
  provider?: any;
}

/**
 * Validate if a provider has valid API URL and API key
 * @param providerId - The provider ID to validate
 * @returns Promise<ProviderValidationResult>
 */
export async function validateProvider(providerId: number): Promise<ProviderValidationResult> {
  try {
    // Get provider from database
    const provider = await db.api_providers.findUnique({
      where: { id: providerId },
      select: {
        id: true,
        name: true,
        api_key: true,
        api_url: true,
        status: true
      }
    });

    if (!provider) {
      return {
        isValid: false,
        error: 'Provider not found'
      };
    }

    // Check if provider is active
    if (provider.status !== 'active') {
      return {
        isValid: false,
        error: 'Provider is not active'
      };
    }

    // Check if API key exists and is not empty
    if (!provider.api_key || provider.api_key.trim() === '') {
      return {
        isValid: false,
        error: 'Provider API key is missing or empty'
      };
    }

    // Validate API URL
    if (!provider.api_url || provider.api_url.trim() === '') {
      return {
        isValid: false,
        error: 'API URL is missing or empty'
      };
    }

    // Validate API URL format
    try {
      new URL(provider.api_url);
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid API URL format'
      };
    }

    return {
      isValid: true,
      provider
    };

  } catch (error) {
    console.error('Error validating provider:', error);
    return {
      isValid: false,
      error: 'Database error while validating provider'
    };
  }
}

/**
 * Validate provider by name
 * @param providerName - The provider name to validate
 * @returns Promise<ProviderValidationResult>
 */
export async function validateProviderByName(providerName: string): Promise<ProviderValidationResult> {
  try {
    // Get provider from database
    const provider = await db.api_providers.findUnique({
      where: { name: providerName },
      select: {
        id: true,
        name: true,
        api_key: true,
        api_url: true,
        status: true
      }
    });

    if (!provider) {
      return {
        isValid: false,
        error: 'Provider not found'
      };
    }

    return validateProvider(provider.id);

  } catch (error) {
    console.error('Error validating provider by name:', error);
    return {
      isValid: false,
      error: 'Database error while validating provider'
    };
  }
}

/**
 * Get all valid (active with API URL and key) providers
 * @returns Promise<any[]>
 */
export async function getValidProviders(): Promise<any[]> {
  try {
    const providers = await db.api_providers.findMany({
      where: {
        status: 'active',
        api_key: {
          not: ''
        },
        api_url: {
          not: ''
        }
      },
      select: {
        id: true,
        name: true,
        api_key: true,
        api_url: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Additional validation for URL format
    const validProviders = providers.filter(provider => {
      try {
        new URL(provider.api_url);
        return true;
      } catch {
        console.warn(`Provider ${provider.name} has invalid API URL: ${provider.api_url}`);
        return false;
      }
    });

    return validProviders;

  } catch (error) {
    console.error('Error getting valid providers:', error);
    return [];
  }
}

/**
 * Test provider API connection
 * @param providerId - The provider ID to test
 * @returns Promise<{success: boolean, error?: string}>
 */
export async function testProviderConnection(providerId: number): Promise<{success: boolean, error?: string}> {
  try {
    const validation = await validateProvider(providerId);
    
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      };
    }

    const provider = validation.provider!;

    // Test API connection by calling services endpoint
    const testUrl = provider.api_url;
    
    try {
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: new URLSearchParams({
          key: provider.api_key,
          action: 'services'
        }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) || (data && typeof data === 'object')) {
          return { success: true };
        }
      }

      return {
        success: false,
        error: `API responded with status ${response.status}`
      };

    } catch (error) {
      return {
        success: false,
        error: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

  } catch (error) {
    return {
      success: false,
      error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
