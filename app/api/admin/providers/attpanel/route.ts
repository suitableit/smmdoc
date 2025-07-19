import { auth } from '@/auth';
import { NextResponse } from 'next/server';

// ATTPANEL Provider Configuration
export const ATTPANEL_CONFIG = {
  name: "ATTPANEL",
  value: "attpanel",
  label: "ATTPANEL",
  description: "Reliable SMM panel with competitive prices",
  apiUrl: "https://api.attpanel.com/v3",
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

// GET - Get ATTPANEL configuration
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
      data: ATTPANEL_CONFIG,
      error: null
    });

  } catch (error) {
    console.error('Error getting ATTPANEL config:', error);
    return NextResponse.json(
      {
        error: 'Failed to get ATTPANEL configuration: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}