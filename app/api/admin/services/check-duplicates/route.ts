import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { services, providerId } = body;

    if (!services || !Array.isArray(services) || !providerId) {
      return NextResponse.json(
        { error: 'Services array and provider ID are required' },
        { status: 400 }
      );
    }

    // Extract provider service IDs from the services array
    const providerServiceIds = services
      .map(service => service.id?.toString())
      .filter(id => id); // Remove null/undefined IDs

    if (providerServiceIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          duplicates: [],
          duplicateIds: []
        }
      });
    }

    // Check for existing services with the same providerServiceId and providerId
    const existingServices = await db.service.findMany({
      where: {
        providerServiceId: {
          in: providerServiceIds
        },
        providerId: parseInt(providerId),
        deletedAt: null // Only check non-deleted services
      },
      select: {
        id: true,
        name: true,
        providerServiceId: true,
        createdAt: true
      }
    });

    // Create a map of existing provider service IDs for quick lookup
    const existingProviderServiceIds = new Set(
      existingServices.map(service => service.providerServiceId)
    );

    // Find which services from the input are duplicates
    const duplicates = services.filter(service => 
      existingProviderServiceIds.has(service.id?.toString())
    );

    const duplicateIds = duplicates.map(service => service.id?.toString());

    console.log(`🔍 Duplicate check: Found ${duplicates.length} duplicates out of ${services.length} services`);
    console.log('Duplicate provider service IDs:', duplicateIds);

    return NextResponse.json({
      success: true,
      data: {
        duplicates: duplicates,
        duplicateIds: duplicateIds,
        existingServices: existingServices
      }
    });

  } catch (error) {
    console.error('Error checking for duplicate services:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}