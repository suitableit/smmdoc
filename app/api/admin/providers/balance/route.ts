import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Configuration constants
const API_TIMEOUT = 15000; // 15 seconds for balance check
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// Utility function to fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout: number = API_TIMEOUT): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
};

// Utility function to retry API calls
const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`❌ Balance check attempt ${attempt}/${maxRetries} failed:`, lastError.message);
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// GET - Check provider balance
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Checking balance for provider:', providerId);

    // Get provider configuration
    const provider = await db.api_providers.findUnique({
      where: { id: parseInt(providerId) }
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    if (provider.status !== 'active') {
      return NextResponse.json(
        { error: 'Provider is not active' },
        { status: 400 }
      );
    }

    console.log('✅ Provider found:', provider.name);

    const baseUrl = provider.api_url;
    const apiKey = provider.api_key;

    let balanceData = null;

    // Try POST method first (standard SMM panel format)
    try {
      console.log(`🌐 Checking balance using POST method with standard SMM panel format`);
      
      const formData = new FormData();
      formData.append('key', apiKey);
      formData.append('action', 'balance');
      
      const response = await retryApiCall(async () => {
        return await fetchWithTimeout(baseUrl, {
          method: 'POST',
          body: formData
        });
      });

      if (response.ok) {
        const data = await response.json();
        balanceData = data;
        console.log(`✅ POST balance check successful:`, balanceData);
      }
    } catch (error) {
      console.error(`❌ POST balance check failed for ${baseUrl}:`, error);
    }

    // If POST failed, try GET method with query parameters
    if (!balanceData) {
      try {
        const balanceUrl = `${baseUrl}?key=${encodeURIComponent(apiKey)}&action=balance`;
        console.log(`🌐 Trying GET method for balance check: ${balanceUrl}`);
        
        const response = await retryApiCall(async () => {
          return await fetchWithTimeout(balanceUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
        });

        if (response.ok) {
          const data = await response.json();
          balanceData = data;
          console.log(`✅ GET balance check successful:`, balanceData);
        }
      } catch (error) {
        console.error(`❌ GET balance check failed for ${baseUrl}:`, error);
      }
    }

    if (!balanceData) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch balance from provider',
          success: false,
          data: null
        },
        { status: 500 }
      );
    }

    // Format balance response according to standard SMM panel format
    const formattedBalance = {
      balance: parseFloat(balanceData.balance || '0'),
      currency: balanceData.currency || 'USD',
      provider: provider.name,
      providerId: provider.id,
      lastChecked: new Date().toISOString()
    };

    // Store the balance in database for persistence
    try {
      await db.api_providers.update({
        where: { id: provider.id },
        data: {
          current_balance: formattedBalance.balance,
          balance_last_updated: new Date()
        }
      });
      console.log(`💾 Balance cached in database for ${provider.name}: $${formattedBalance.balance}`);
    } catch (dbError) {
      console.error(`❌ Failed to cache balance in database for ${provider.name}:`, dbError);
      // Don't fail the request if database update fails
    }

    console.log(`✅ Balance check completed for ${provider.name}:`, formattedBalance);

    return NextResponse.json({
      success: true,
      data: formattedBalance,
      error: null
    });

  } catch (error) {
    console.error('❌ Error in balance check:', error);
    return NextResponse.json(
      {
        error: `Failed to check balance: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}