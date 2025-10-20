import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';

// GET /api/admin/providers/[id]/services - Get services by provider ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Unauthorized access. Admin privileges required.',
          success: false,
          data: null
        },
        { status: 401 }
      );
    }

    const providerId = parseInt(params.id);

    if (isNaN(providerId)) {
      return NextResponse.json(
        {
          error: 'Invalid provider ID',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Check if provider exists
    const provider = await db.api_providers.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      return NextResponse.json(
        {
          error: 'Provider not found',
          success: false,
          data: null
        },
        { status: 404 }
      );
    }

    // Fetch services from the provider's API
    if (!provider.api_url || !provider.api_key) {
      return NextResponse.json(
        {
          error: 'Provider API configuration is incomplete',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    try {
      // Build the API URL for fetching services
      const apiKeyParam = provider.api_key_param || 'key';
      const actionParam = provider.action_param || 'action';
      const servicesAction = provider.services_action || 'services';
      
      const servicesUrl = `${provider.api_url}?${apiKeyParam}=${encodeURIComponent(provider.api_key)}&${actionParam}=${servicesAction}`;

      console.log('Fetching services from:', servicesUrl.replace(provider.api_key, '[REDACTED]'));

      const response = await fetch(servicesUrl, {
        method: provider.http_method || 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const apiServices = await response.json();

      // Validate the response
      if (!Array.isArray(apiServices)) {
        throw new Error('Invalid API response format - expected array of services');
      }

      // Transform the services data to a consistent format
      const transformedServices = apiServices.map((service: any) => ({
        id: service.service || service.id,
        name: service.name,
        description: service.desc || service.description || '',
        rate: parseFloat(service.rate) || 0,
        min: parseInt(service.min) || 1,
        max: parseInt(service.max) || 1000000,
        category: service.category || 'Uncategorized',
        type: service.type || 'Default'
      }));

      return NextResponse.json({
        success: true,
        data: {
          services: transformedServices,
          total: transformedServices.length,
          provider: {
            id: provider.id,
            name: provider.name
          }
        },
        error: null
      });

    } catch (apiError) {
      console.error('Error fetching services from provider API:', apiError);
      return NextResponse.json(
        {
          error: `Failed to fetch services from provider: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`,
          success: false,
          data: null
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in provider services endpoint:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch provider services: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}