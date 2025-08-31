import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

// Mock ticket subjects - in a real app, this would come from database
const defaultSubjects = [
  { id: 1, name: 'General Support' },
  { id: 2, name: 'Technical Issue' },
  { id: 3, name: 'Billing Question' },
  { id: 4, name: 'Account Problem' },
  { id: 5, name: 'Service Inquiry' },
];

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // In a real implementation, you would fetch from database
    // For now, return default subjects
    return NextResponse.json({
      success: true,
      subjects: defaultSubjects
    });
  } catch (error) {
    console.error('Error fetching ticket subjects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}