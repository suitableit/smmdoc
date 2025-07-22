import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Count total services
    const totalServices = await db.service.count();

    // Get all services with updateText to extract provider info
    const allServices = await db.service.findMany({
      select: {
        id: true,
        name: true,
        updateText: true
      }
    });

    // Count services by provider from updateText
    const providerCounts: Record<string, number> = {};
    let importedServices = 0;

    allServices.forEach(service => {
      if (service.updateText) {
        try {
          const providerInfo = JSON.parse(service.updateText);
          if (providerInfo.provider) {
            const providerName = providerInfo.provider;
            providerCounts[providerName] = (providerCounts[providerName] || 0) + 1;
            importedServices++;
          }
        } catch (error) {
          // Skip invalid JSON
        }
      }
    });

    const servicesByProviderWithNames = Object.entries(providerCounts).map(([providerName, count]) => ({
      provider_name: providerName,
      count: count
    }));

    return NextResponse.json({
      success: true,
      data: {
        total_services: totalServices,
        imported_services: importedServices,
        manual_services: totalServices - importedServices,
        services_by_provider: servicesByProviderWithNames
      }
    });

  } catch (error) {
    console.error('Error checking services:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check services: ' + (error instanceof Error ? error.message : 'Unknown error') 
      },
      { status: 500 }
    );
  }
}
