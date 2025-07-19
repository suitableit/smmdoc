import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

// SMMGen Provider Configuration
export const SMMGEN_CONFIG = {
  name: "SMMGen",
  value: "smmgen",
  label: "SMMGen",
  description: "Premium SMM services with fast delivery",
  apiUrl: "https://api.smmgen.com/v2",
  category: "Multi-Platform",

  // Parameter Mapping (Their parameter -> Our parameter)
  parameterMapping: {
    "service": "service",           // Same parameter name
    "link": "link",                 // Same parameter name
    "quantity": "quantity",         // Same parameter name
    "order": "order_id",           // Their 'order' -> Our 'order_id'
    "key": "api_key"               // Their 'key' -> Our 'api_key'
  },

  // API Endpoints
  endpoints: {
    services: "/services",
    balance: "/balance",
    order: "/add",
    status: "/status",
    multiStatus: "/status"
  },

  // Required Parameters for different operations
  requiredParams: {
    services: ["key"],
    balance: ["key"],
    order: ["key", "service", "link", "quantity"],
    status: ["key", "order"]
  }
};

// GET - Get SMMGen configuration
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

    return NextResponse.json({
      success: true,
      data: SMMGEN_CONFIG,
      error: null
    });

  } catch (error) {
    console.error('Error getting SMMGen config:', error);
    return NextResponse.json(
      {
        error: 'Failed to get SMMGen configuration: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// POST - Test SMMGen API connection
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

    const { api_key } = await req.json();

    if (!api_key) {
      return NextResponse.json(
        {
          error: 'API key is required',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Test API connection by fetching balance
    const testUrl = `${SMMGEN_CONFIG.apiUrl}${SMMGEN_CONFIG.endpoints.balance}?key=${api_key}`;

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok && data) {
      return NextResponse.json({
        success: true,
        message: 'SMMGen API connection successful',
        data: {
          balance: data.balance || 0,
          currency: data.currency || 'USD',
          provider: 'SMMGen'
        },
        error: null
      });
    } else {
      return NextResponse.json(
        {
          error: 'Failed to connect to SMMGen API: ' + (data.error || 'Invalid API key'),
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error testing SMMGen API:', error);
    return NextResponse.json(
      {
        error: 'Failed to test SMMGen API: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// PUT - Fetch services from SMMGen
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

    const { api_key } = await req.json();

    if (!api_key) {
      return NextResponse.json(
        {
          error: 'API key is required',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Fetch services from SMMGen API
    const servicesUrl = `${SMMGEN_CONFIG.apiUrl}${SMMGEN_CONFIG.endpoints.services}?key=${api_key}`;

    const response = await fetch(servicesUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const services = await response.json();

    if (response.ok && Array.isArray(services)) {
      // Map services to our format
      const mappedServices = services.map((service: any) => ({
        provider_service_id: service.service,
        name: service.name,
        rate: parseFloat(service.rate),
        min_order: parseInt(service.min),
        max_order: parseInt(service.max),
        category: service.category || 'General',
        description: service.description || service.name,
        provider: 'smmgen'
      }));

      return NextResponse.json({
        success: true,
        message: `Successfully fetched ${mappedServices.length} services from SMMGen`,
        data: {
          services: mappedServices,
          total: mappedServices.length,
          provider: 'SMMGen'
        },
        error: null
      });
    } else {
      return NextResponse.json(
        {
          error: 'Failed to fetch services from SMMGen API: ' + (services.error || 'Invalid response'),
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error fetching SMMGen services:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch SMMGen services: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}