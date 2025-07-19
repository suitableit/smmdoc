import { auth } from '@/auth';
import { NextResponse } from 'next/server';

// SMMCoder Provider Configuration
export const SMMCODER_CONFIG = {
  name: "SMMCoder",
  value: "smmcoder",
  label: "SMMCoder",
  description: "Advanced SMM solutions for all platforms",
  apiUrl: "https://api.smmcoder.com/v2",
  category: "Social Media",

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

// GET - Get SMMCoder configuration
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
      data: SMMCODER_CONFIG,
      error: null
    });

  } catch (error) {
    console.error('Error getting SMMCoder config:', error);
    return NextResponse.json(
      {
        error: 'Failed to get SMMCoder configuration: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}