import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// In-memory sync logs (in production, use database table)
let syncLogs: any[] = [];

// GET - Get sync logs
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const provider = searchParams.get('provider');
    const syncType = searchParams.get('syncType');
    const status = searchParams.get('status');

    // Filter logs
    let filteredLogs = [...syncLogs];

    if (provider) {
      filteredLogs = filteredLogs.filter(log => 
        log.provider?.toLowerCase().includes(provider.toLowerCase())
      );
    }

    if (syncType) {
      filteredLogs = filteredLogs.filter(log => log.syncType === syncType);
    }

    if (status) {
      filteredLogs = filteredLogs.filter(log => log.status === status);
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    // Calculate stats
    const stats = {
      total: filteredLogs.length,
      successful: filteredLogs.filter(log => log.status === 'success').length,
      failed: filteredLogs.filter(log => log.status === 'failed').length,
      lastSync: filteredLogs.length > 0 ? filteredLogs[0].timestamp : null
    };

    return NextResponse.json({
      success: true,
      data: {
        logs: paginatedLogs,
        pagination: {
          page,
          limit,
          total: filteredLogs.length,
          totalPages: Math.ceil(filteredLogs.length / limit),
          hasNext: endIndex < filteredLogs.length,
          hasPrev: page > 1
        },
        stats
      },
      error: null
    });

  } catch (error) {
    console.error('Error getting sync logs:', error);
    return NextResponse.json(
      { error: 'Failed to get sync logs', success: false, data: null },
      { status: 500 }
    );
  }
}

// POST - Add sync log entry
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logEntry = await req.json();

    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      adminId: session.user.id,
      adminEmail: session.user.email,
      ...logEntry
    };

    // Add to logs (keep only last 1000 entries)
    syncLogs.unshift(newLog);
    if (syncLogs.length > 1000) {
      syncLogs = syncLogs.slice(0, 1000);
    }

    return NextResponse.json({
      success: true,
      data: newLog,
      error: null
    });

  } catch (error) {
    console.error('Error adding sync log:', error);
    return NextResponse.json(
      { error: 'Failed to add sync log', success: false, data: null },
      { status: 500 }
    );
  }
}

// DELETE - Clear sync logs
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clearedCount = syncLogs.length;
    syncLogs = [];

    return NextResponse.json({
      success: true,
      message: `Cleared ${clearedCount} sync log entries`,
      data: { clearedCount },
      error: null
    });

  } catch (error) {
    console.error('Error clearing sync logs:', error);
    return NextResponse.json(
      { error: 'Failed to clear sync logs', success: false, data: null },
      { status: 500 }
    );
  }
}

// Helper function to add sync log (can be called from other APIs)
export async function addSyncLog(logData: any) {
  try {
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...logData
    };

    syncLogs.unshift(newLog);
    if (syncLogs.length > 1000) {
      syncLogs = syncLogs.slice(0, 1000);
    }

    return newLog;
  } catch (error) {
    console.error('Error adding sync log:', error);
    return null;
  }
}
