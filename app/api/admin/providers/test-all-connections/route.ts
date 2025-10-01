import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { testProviderConnection } from '@/lib/utils/providerValidator';

export async function POST() {
  try {
    // Get all providers
    const providers = await db.api_providers.findMany({
      select: {
        id: true,
        name: true,
        api_url: true,
        status: true
      }
    });

    // Test connection for each provider
    const connectionResults = await Promise.allSettled(
      providers.map(async (provider) => {
        const result = await testProviderConnection(provider.id);
        return {
          id: provider.id,
          name: provider.name,
          connected: result.success,
          error: result.error || null
        };
      })
    );

    // Process results
    const results = connectionResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          id: providers[index].id,
          name: providers[index].name,
          connected: false,
          error: 'Connection test failed'
        };
      }
    });

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Error testing all provider connections:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test provider connections', 
        success: false 
      },
      { status: 500 }
    );
  }
}