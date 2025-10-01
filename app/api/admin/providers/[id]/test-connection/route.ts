import { NextRequest, NextResponse } from 'next/server';
import { testProviderConnection } from '@/lib/utils/providerValidator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const providerId = parseInt(resolvedParams.id);
    
    if (isNaN(providerId)) {
      return NextResponse.json(
        { error: 'Invalid provider ID', success: false },
        { status: 400 }
      );
    }

    // Test the provider connection
    const connectionResult = await testProviderConnection(providerId);

    return NextResponse.json({
      success: connectionResult.success,
      connected: connectionResult.success,
      error: connectionResult.error || null
    });

  } catch (error) {
    console.error('Error testing provider connection:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test provider connection', 
        success: false,
        connected: false
      },
      { status: 500 }
    );
  }
}