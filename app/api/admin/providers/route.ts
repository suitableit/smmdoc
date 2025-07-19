import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { ATTPANEL_CONFIG } from './attpanel/route';
import { GROWFOLLOWS_CONFIG } from './growfollows/route';
import { SMMCODER_CONFIG } from './smmcoder/route';
import { SMMGEN_CONFIG } from './smmgen/route';

// Available Providers Configuration
// Remove any provider from here = it won't show in UI
export const AVAILABLE_PROVIDERS = [
  SMMGEN_CONFIG,
  GROWFOLLOWS_CONFIG,
  ATTPANEL_CONFIG,
  SMMCODER_CONFIG
];

// GET - Get all available providers
export async function GET() {
  try {
    const session = await auth();

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

    // Get configured providers from database
    let configuredProviders: any[] = [];
    try {
      // First ensure Provider table exists
      await db.$executeRaw`
        CREATE TABLE IF NOT EXISTS \`Provider\` (
          \`id\` int NOT NULL AUTO_INCREMENT,
          \`name\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
          \`api_key\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
          \`login_user\` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          \`login_pass\` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          \`status\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'inactive',
          \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`Provider_name_key\` (\`name\`),
          KEY \`Provider_status_idx\` (\`status\`),
          KEY \`Provider_name_idx\` (\`name\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;

      const result = await db.$queryRaw`
        SELECT id, name, status, createdAt, updatedAt FROM Provider
      `;
      configuredProviders = Array.isArray(result) ? result : [];
    } catch (error) {
      console.log('Provider table error:', error);
      configuredProviders = [];
    }

    // Merge available providers with configured status
    const providersWithStatus = AVAILABLE_PROVIDERS.map(provider => {
      const configured = configuredProviders.find((cp: any) => cp.name === provider.value);
      return {
        ...provider,
        configured: !!configured,
        status: configured?.status || 'inactive',
        id: configured?.id || null,
        createdAt: configured?.createdAt || null,
        updatedAt: configured?.updatedAt || null
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        providers: providersWithStatus,
        total: providersWithStatus.length,
        configured: configuredProviders.length,
        available: AVAILABLE_PROVIDERS.length
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
    const session = await auth();

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

    const { selectedProvider, apiKey, username, password } = await req.json();

    if (!selectedProvider || !apiKey) {
      return NextResponse.json(
        {
          error: 'Provider and API key are required',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Check if provider is available
    const providerConfig = AVAILABLE_PROVIDERS.find(p => p.value === selectedProvider);
    if (!providerConfig) {
      return NextResponse.json(
        {
          error: 'Invalid provider selected',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Check if provider already exists and create new provider
    let newProvider: any;
    try {
      // First ensure Provider table exists
      await db.$executeRaw`
        CREATE TABLE IF NOT EXISTS \`Provider\` (
          \`id\` int NOT NULL AUTO_INCREMENT,
          \`name\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
          \`api_key\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
          \`login_user\` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          \`login_pass\` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          \`status\` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'inactive',
          \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`Provider_name_key\` (\`name\`),
          KEY \`Provider_status_idx\` (\`status\`),
          KEY \`Provider_name_idx\` (\`name\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;

      // Check if provider already exists
      const existingProviders = await db.$queryRaw`
        SELECT * FROM Provider WHERE name = ${selectedProvider}
      `;

      if (Array.isArray(existingProviders) && existingProviders.length > 0) {
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
      await db.$executeRaw`
        INSERT INTO Provider (name, api_key, login_user, login_pass, status, createdAt, updatedAt)
        VALUES (${selectedProvider}, ${apiKey}, ${username || null}, ${password || null}, 'inactive', NOW(), NOW())
      `;

      // Get the created provider
      const createdProviders = await db.$queryRaw`
        SELECT * FROM Provider WHERE name = ${selectedProvider}
      `;

      newProvider = Array.isArray(createdProviders) && createdProviders.length > 0 ? createdProviders[0] : null;
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
          name: newProvider.name,
          status: newProvider.status,
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
    const session = await auth();

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

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        {
          error: 'Provider ID and status are required',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Update provider status
    await db.$executeRaw`
      UPDATE providers SET status = ${status}, updatedAt = NOW() WHERE id = ${parseInt(id)}
    `;

    // Get updated provider
    const result = await db.$queryRaw`
      SELECT * FROM providers WHERE id = ${parseInt(id)}
    `;
    const updatedProvider = Array.isArray(result) && result.length > 0 ? result[0] : null;

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
    const session = await auth();

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

    // Delete provider
    await db.$executeRaw`
      DELETE FROM providers WHERE id = ${parseInt(id)}
    `;

    return NextResponse.json({
      success: true,
      message: 'Provider deleted successfully',
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