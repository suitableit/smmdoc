import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const provider = searchParams.get('provider');
    const search = searchParams.get('search');
    
    const skip = (page - 1) * limit;
    
    const whereClause: any = {};
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    if (provider && provider !== 'all') {
      whereClause.provider = provider;
    }
    
    if (search) {
      whereClause.OR = [
        { provider: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const mockLogs = [
      {
        id: '1',
        provider: 'SMM Provider A',
        action: 'Service Update',
        status: 'success',
        message: 'Successfully synchronized 45 services',
        servicesAffected: 45,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        duration: 2.5,
        errorDetails: null
      },
      {
        id: '2',
        provider: 'SMM Provider B',
        action: 'Price Sync',
        status: 'failed',
        message: 'Failed to sync pricing data',
        servicesAffected: 0,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        duration: 1.2,
        errorDetails: 'Connection timeout after 30 seconds'
      },
      {
        id: '3',
        provider: 'SMM Provider C',
        action: 'Full Sync',
        status: 'in_progress',
        message: 'Synchronizing all services...',
        servicesAffected: 120,
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        duration: null,
        errorDetails: null
      },
      {
        id: '4',
        provider: 'SMM Provider A',
        action: 'Status Check',
        status: 'success',
        message: 'All services status verified',
        servicesAffected: 45,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        duration: 0.8,
        errorDetails: null
      },
      {
        id: '5',
        provider: 'SMM Provider D',
        action: 'New Services',
        status: 'pending',
        message: 'Waiting for provider response',
        servicesAffected: 0,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        duration: null,
        errorDetails: null
      }
    ];
    
    let filteredLogs = mockLogs;
    
    if (status && status !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.status === status);
    }
    
    if (provider && provider !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.provider === provider);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.provider.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.message.toLowerCase().includes(searchLower)
      );
    }
    
    const paginatedLogs = filteredLogs.slice(skip, skip + limit);
    
    return NextResponse.json({
      success: true,
      data: {
        logs: paginatedLogs,
        pagination: {
          page,
          limit,
          total: filteredLogs.length,
          totalPages: Math.ceil(filteredLogs.length / limit)
        }
      },
      error: null
    });
    
  } catch (error) {
    console.error('Error fetching sync logs:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch sync logs: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
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
    
    const body = await req.json();
    const { action, provider } = body;
    
    if (!action) {
      return NextResponse.json(
        { 
          error: 'Action is required',
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }
    
    const syncId = `sync_${Date.now()}`;
    
    
    const syncLog = {
      id: syncId,
      provider: provider || 'All Providers',
      action: action,
      status: 'in_progress',
      message: `${action} initiated`,
      servicesAffected: 0,
      timestamp: new Date().toISOString(),
      duration: null,
      errorDetails: null
    };
    
    console.log(`Admin ${session.user.email} initiated sync:`, {
      action,
      provider,
      syncId,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      message: `${action} initiated successfully`,
      data: {
        syncId,
        syncLog
      },
      error: null
    });
    
  } catch (error) {
    console.error('Error initiating sync:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate sync: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    
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
    
    const stats = {
      totalSyncs: 156,
      successfulSyncs: 142,
      failedSyncs: 8,
      pendingSyncs: 6,
      lastSyncTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      providers: [
        {
          name: 'SMM Provider A',
          totalSyncs: 45,
          successRate: 95,
          lastSync: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          name: 'SMM Provider B',
          totalSyncs: 32,
          successRate: 87,
          lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
          name: 'SMM Provider C',
          totalSyncs: 28,
          successRate: 92,
          lastSync: new Date(Date.now() - 1000 * 60 * 5).toISOString()
        }
      ]
    };
    
    return NextResponse.json({
      success: true,
      data: stats,
      error: null
    });
    
  } catch (error) {
    console.error('Error fetching sync stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch sync stats: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
