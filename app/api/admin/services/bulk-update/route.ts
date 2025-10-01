import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

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
    
    const body = await req.json();
    const { serviceIds, updateData } = body;
    
    // Validate input
    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return NextResponse.json(
        { 
          error: 'Service IDs array is required and cannot be empty',
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }
    
    if (!updateData || Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { 
          error: 'Update data is required',
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }
    
    // Prepare update data - only include fields that are provided
    const updateFields: {
      rate?: number;
      min_order?: number;
      max_order?: number;
      status?: string;
      updatedAt?: Date;
    } = {};
    
    if (updateData.rate !== undefined && updateData.rate !== null) {
      const rate = parseFloat(updateData.rate);
      if (isNaN(rate) || rate < 0) {
        return NextResponse.json(
          { 
            error: 'Rate must be a valid positive number',
            success: false,
            data: null 
          },
          { status: 400 }
        );
      }
      updateFields.rate = rate;
    }
    
    if (updateData.min_order !== undefined && updateData.min_order !== null) {
      const minOrder = parseInt(updateData.min_order);
      if (isNaN(minOrder) || minOrder < 1) {
        return NextResponse.json(
          { 
            error: 'Minimum order must be a valid positive integer',
            success: false,
            data: null 
          },
          { status: 400 }
        );
      }
      updateFields.min_order = minOrder;
    }
    
    if (updateData.max_order !== undefined && updateData.max_order !== null) {
      const maxOrder = parseInt(updateData.max_order);
      if (isNaN(maxOrder) || maxOrder < 1) {
        return NextResponse.json(
          { 
            error: 'Maximum order must be a valid positive integer',
            success: false,
            data: null 
          },
          { status: 400 }
        );
      }
      updateFields.max_order = maxOrder;
    }
    
    if (updateData.status && ['active', 'inactive'].includes(updateData.status)) {
      updateFields.status = updateData.status;
    }
    
    // Validate min_order <= max_order if both are provided
    if (updateFields.min_order && updateFields.max_order && updateFields.min_order > updateFields.max_order) {
      return NextResponse.json(
        { 
          error: 'Minimum order cannot be greater than maximum order',
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }
    
    // Add updatedAt timestamp
    updateFields.updatedAt = new Date();
    
    // Perform bulk update
    const result = await db.service.updateMany({
      where: {
        id: {
          in: serviceIds
        }
      },
      data: updateFields
    });
    
    // Log the bulk update action
    console.log(`Admin ${session.user.email} performed bulk update on ${result.count} services`, {
      serviceIds,
      updateData: updateFields,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.count} services`,
      data: {
        updatedCount: result.count,
        serviceIds,
        updateFields
      },
      error: null
    });
    
  } catch (error) {
    console.error('Error in bulk update services:', error);
    return NextResponse.json(
      {
        error: 'Failed to update services: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// GET method to retrieve bulk update history (optional feature)
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
    
    // This could be extended to return bulk update history from a logs table
    // For now, just return a success response
    return NextResponse.json({
      success: true,
      message: 'Bulk update endpoint is available',
      data: {
        endpoint: '/api/admin/services/bulk-update',
        methods: ['POST'],
        description: 'Bulk update multiple services at once'
      },
      error: null
    });
    
  } catch (error) {
    console.error('Error in bulk update GET:', error);
    return NextResponse.json(
      {
        error: 'Failed to process request: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
