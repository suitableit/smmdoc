import { auth } from '@/auth';
import { getCurrentUser } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
// Custom providers only - no predefined providers

// GET - Get all available providers
export async function GET() {
  try {
    console.log('API /admin/providers called');
    const session = await getCurrentUser();
    console.log('Session:', session?.user?.email, session?.user?.role);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      console.log('No session found or user is not admin:', session?.user?.role);
      return NextResponse.json(
        {
          error: 'Unauthorized access. Admin privileges required.',
          success: false,
          data: null
        },
        { status: 401 }
      );
    }

    // Get configured providers from database
    let configuredProviders: any[] = [];
    try {
      // First ensure api_providers table exists and rename if needed
      await db.$executeRaw`
        CREATE TABLE IF NOT EXISTS \`api_providers\` (
          \`id\` int NOT NULL AUTO_INCREMENT,
          \`name\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
          \`api_key\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
          \`api_url\` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          \`login_user\` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          \`login_pass\` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          \`status\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'inactive',
          \`is_custom\` boolean DEFAULT FALSE,
          \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`api_providers_name_key\` (\`name\`),
          KEY \`api_providers_status_idx\` (\`status\`),
          KEY \`api_providers_name_idx\` (\`name\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;
      
      // Columns api_url and is_custom already exist in schema, no need to add them



      configuredProviders = await db.api_providers.findMany({
        select: {
          id: true,
          name: true,
          api_url: true,
          status: true,
          is_custom: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } catch (error) {
      console.log('Provider table error:', error);
      configuredProviders = [];
    }

    // Map all providers as custom providers
    const allProviders = configuredProviders.map((cp: any) => ({
      value: cp.name,
      label: cp.name,
      description: `Custom provider: ${cp.name}`,
      configured: true,
      status: cp.status,
      id: cp.id,
      apiUrl: cp.api_url || '',
      isCustom: true,
      createdAt: cp.createdAt,
      updatedAt: cp.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        providers: allProviders,
        total: allProviders.length,
        configured: configuredProviders.length,
        available: 0,
        custom: allProviders.length
      },
      error: null
    });

  } catch (error) {
    console.error('Error getting providers:', error);
    return NextResponse.json(
      {
        error: 'Failed to get providers: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// POST - Add new provider
export async function POST(req: NextRequest) {
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

    const { customProviderName, apiKey, apiUrl, username, password } = await req.json();

    // All providers are custom providers
    const providerName = customProviderName;

    if (!providerName || !apiKey) {
      return NextResponse.json(
        {
          error: 'Provider name and API key are required',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // All providers are custom providers
    const providerConfig = {
      value: providerName,
      label: providerName,
      description: `Custom provider: ${providerName}`
    };

    // Check if provider already exists and create new provider
    let newProvider: any;
    try {
      // Check if provider already exists
      const existingProvider = await db.api_providers.findUnique({
        where: { name: providerName }
      });

      if (existingProvider) {
        return NextResponse.json(
          {
            error: 'Provider already exists',
            success: false,
            data: null
          },
          { status: 400 }
        );
      }

      // Create new provider
      newProvider = await db.api_providers.create({
        data: {
          name: providerName,
          api_key: apiKey,
          api_url: apiUrl || '',
          login_user: username || null,
          login_pass: password || null,
          status: 'inactive',
          is_custom: true
        }
      });
    } catch (error) {
      console.error('Provider creation error:', error);
      return NextResponse.json(
        {
          error: 'Failed to create provider: ' + (error instanceof Error ? error.message : 'Unknown error'),
          success: false,
          data: null
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Provider ${providerConfig.label} added successfully`,
      data: {
        provider: {
          id: newProvider.id,
          status: newProvider.status,
          isCustom: newProvider.is_custom,
          ...providerConfig
        }
      },
      error: null
    });

  } catch (error) {
    console.error('Error adding provider:', error);
    return NextResponse.json(
      {
        error: 'Failed to add provider: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// PUT - Update provider status
export async function PUT(req: NextRequest) {
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

    const { id, status, apiKey, apiUrl, username, password } = await req.json();

    if (!id) {
      return NextResponse.json(
        {
          error: 'Provider ID is required',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (apiKey !== undefined) updateData.api_key = apiKey;
    if (apiUrl !== undefined) updateData.api_url = apiUrl;
    if (username !== undefined) updateData.login_user = username || null;
    if (password !== undefined) updateData.login_pass = password || null;

    // If activating provider, validate required fields first
    if (status === 'active') {
      const provider = await db.api_providers.findUnique({
        where: { id: parseInt(id) }
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

      // Check if API URL and key will be available after update
      const finalApiUrl = updateData.api_url !== undefined ? updateData.api_url : provider.api_url;
      const finalApiKey = updateData.api_key !== undefined ? updateData.api_key : provider.api_key;

      if (!finalApiUrl || finalApiUrl.trim() === '') {
        return NextResponse.json(
          {
            error: 'Cannot activate provider: API URL is required',
            success: false,
            data: null
          },
          { status: 400 }
        );
      }

      if (!finalApiKey || finalApiKey.trim() === '') {
        return NextResponse.json(
          {
            error: 'Cannot activate provider: API Key is required',
            success: false,
            data: null
          },
          { status: 400 }
        );
      }

      // Validate URL format
      try {
        new URL(finalApiUrl);
      } catch (error) {
        return NextResponse.json(
          {
            error: 'Cannot activate provider: Invalid API URL format',
            success: false,
            data: null
          },
          { status: 400 }
        );
      }
    }

    // Update provider
    const updatedProvider = await db.api_providers.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: `Provider ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: {
        provider: updatedProvider
      },
      error: null
    });

  } catch (error) {
    console.error('Error updating provider:', error);
    return NextResponse.json(
      {
        error: 'Failed to update provider: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete provider
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const deleteType = searchParams.get('type') || 'permanent';

    // Validate ID parameter
    if (!id || id === 'null' || id === 'undefined') {
      return NextResponse.json(
        {
          error: 'Valid Provider ID is required. Cannot delete unconfigured provider.',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Parse and validate numeric ID
    const providerId = parseInt(id);
    if (isNaN(providerId) || providerId <= 0) {
      return NextResponse.json(
        {
          error: 'Invalid Provider ID format. ID must be a positive number.',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    let message = '';
    
    if (deleteType === 'trash') {
    // Move to trash - delete provider and its services
      await db.api_providers.update({
        where: { id: providerId },
        data: { 
          status: 'inactive',
          updated_at: new Date()
        }
      });

      // Delete all services associated with this provider
      await db.services.deleteMany({
        where: { provider_id: providerId }
      });

      message = 'Provider moved to trash and all services deleted successfully';
    } else {
      // Permanent delete - remove provider and its services
      // First delete associated services
      await db.services.deleteMany({
        where: { provider_id: providerId }
      });

      // Then delete the provider
      await db.api_providers.delete({
        where: { id: providerId }
      });

      message = 'Provider and all associated services permanently deleted successfully';
    }

    return NextResponse.json({
      success: true,
      message: message,
      data: null,
      error: null
    });

  } catch (error) {
    console.error('Error deleting provider:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete provider: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}