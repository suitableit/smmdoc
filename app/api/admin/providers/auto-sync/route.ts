import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Auto-sync configuration
const SYNC_INTERVALS = {
  prices: 30 * 60 * 1000, // 30 minutes
  services: 6 * 60 * 60 * 1000, // 6 hours
  status: 60 * 60 * 1000, // 1 hour
};

// In-memory store for sync schedules (in production, use Redis or database)
const syncSchedules = new Map();

// GET - Get auto-sync status and schedules
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get sync settings from database (if you have a syncSettings table)
    const syncSettings = {
      priceSyncEnabled: false,
      serviceSyncEnabled: false,
      statusSyncEnabled: false,
      priceSyncInterval: 30,
      serviceSyncInterval: 360,
      statusSyncInterval: 60,
      lastPriceSync: null,
      lastServiceSync: null,
      lastStatusSync: null
    };

    // Get active schedules
    const activeSchedules = Array.from(syncSchedules.keys());

    return NextResponse.json({
      success: true,
      data: {
        settings: syncSettings,
        activeSchedules: activeSchedules,
        intervals: {
          prices: SYNC_INTERVALS.prices / 60000, // Convert to minutes
          services: SYNC_INTERVALS.services / 60000,
          status: SYNC_INTERVALS.status / 60000
        }
      },
      error: null
    });

  } catch (error) {
    console.error('Error getting auto-sync status:', error);
    return NextResponse.json(
      { error: 'Failed to get auto-sync status', success: false, data: null },
      { status: 500 }
    );
  }
}

// POST - Configure auto-sync
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      enablePriceSync = false,
      enableServiceSync = false,
      enableStatusSync = false,
      priceSyncInterval = 30, // minutes
      serviceSyncInterval = 360, // minutes
      statusSyncInterval = 60, // minutes
      profitMargin = 20
    } = await req.json();

    // Clear existing schedules
    for (const [key, intervalId] of syncSchedules) {
      clearInterval(intervalId);
      syncSchedules.delete(key);
    }

    // Setup price sync
    if (enablePriceSync) {
      const priceInterval = setInterval(async () => {
        try {
          console.log('Running scheduled price sync...');
          await performSync('prices', profitMargin);
        } catch (error) {
          console.error('Scheduled price sync failed:', error);
        }
      }, priceSyncInterval * 60 * 1000);

      syncSchedules.set('prices', priceInterval);
    }

    // Setup service sync
    if (enableServiceSync) {
      const serviceInterval = setInterval(async () => {
        try {
          console.log('Running scheduled service sync...');
          await performSync('new_services', profitMargin);
        } catch (error) {
          console.error('Scheduled service sync failed:', error);
        }
      }, serviceSyncInterval * 60 * 1000);

      syncSchedules.set('services', serviceInterval);
    }

    // Setup status sync
    if (enableStatusSync) {
      const statusInterval = setInterval(async () => {
        try {
          console.log('Running scheduled status sync...');
          await performSync('status', profitMargin);
        } catch (error) {
          console.error('Scheduled status sync failed:', error);
        }
      }, statusSyncInterval * 60 * 1000);

      syncSchedules.set('status', statusInterval);
    }

    return NextResponse.json({
      success: true,
      message: 'Auto-sync configuration updated successfully',
      data: {
        enablePriceSync,
        enableServiceSync,
        enableStatusSync,
        priceSyncInterval,
        serviceSyncInterval,
        statusSyncInterval,
        activeSchedules: Array.from(syncSchedules.keys())
      },
      error: null
    });

  } catch (error) {
    console.error('Error configuring auto-sync:', error);
    return NextResponse.json(
      {
        error: 'Failed to configure auto-sync: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// DELETE - Stop auto-sync
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clear all schedules
    let clearedCount = 0;
    for (const [key, intervalId] of syncSchedules) {
      clearInterval(intervalId);
      syncSchedules.delete(key);
      clearedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Stopped ${clearedCount} auto-sync schedule(s)`,
      data: {
        clearedSchedules: clearedCount
      },
      error: null
    });

  } catch (error) {
    console.error('Error stopping auto-sync:', error);
    return NextResponse.json(
      {
        error: 'Failed to stop auto-sync: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// PUT - Manual trigger sync
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { syncType = 'all', profitMargin = 20 } = await req.json();

    console.log(`Manual sync triggered by ${session.user.email}: ${syncType}`);

    const result = await performSync(syncType, profitMargin);

    return NextResponse.json({
      success: true,
      message: `Manual sync ${syncType} completed`,
      data: result.data,
      error: null
    });

  } catch (error) {
    console.error('Error performing manual sync:', error);
    return NextResponse.json(
      {
        error: 'Failed to perform manual sync: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// Helper function to perform sync
async function performSync(syncType: string, profitMargin: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/providers/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        syncType,
        profitMargin
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`Auto-sync ${syncType} completed:`, result.data.totals);
    } else {
      console.error(`Auto-sync ${syncType} failed:`, result.error);
    }

    return result;
  } catch (error) {
    console.error(`Auto-sync ${syncType} error:`, error);
    throw error;
  }
}
