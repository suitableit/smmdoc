import { auth } from '@/auth';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

// POST /api/user/child-panel/create - Create child panel
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
          data: null,
        },
        { status: 401 }
      );
    }

    // Check if child panel selling is enabled
    const moduleSettings = await db.moduleSettings.findFirst();
    const childPanelSellingEnabled = moduleSettings?.childPanelSellingEnabled ?? false;
    const childPanelPrice = moduleSettings?.childPanelPrice ?? 10;

    if (!childPanelSellingEnabled) {
      return NextResponse.json(
        {
          success: false,
          message: 'Child panel selling is currently disabled',
          data: null,
        },
        { status: 403 }
      );
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { domain, panelName, plan = 'basic' } = body;

    // Validate required fields
    if (!domain || !panelName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Domain and panel name are required',
          data: null,
        },
        { status: 400 }
      );
    }

    // Check if user already has a child panel
    const existingPanel = await db.childPanel.findUnique({
      where: { userId }
    });

    if (existingPanel) {
      return NextResponse.json(
        {
          success: false,
          message: 'You already have a child panel',
          data: existingPanel,
        },
        { status: 400 }
      );
    }

    // Check if domain is already taken
    const existingDomain = await db.childPanel.findUnique({
      where: { domain }
    });

    if (existingDomain) {
      return NextResponse.json(
        {
          success: false,
          message: 'Domain is already taken',
          data: null,
        },
        { status: 400 }
      );
    }

    // Check user balance
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { balance: true, currency: true }
    });

    if (!user || user.balance < childPanelPrice) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient balance. Required: $${childPanelPrice}, Available: $${user?.balance || 0}`,
          data: null,
        },
        { status: 400 }
      );
    }

    // Generate unique API key
    const generateApiKey = (): string => {
      return crypto.randomBytes(32).toString('hex');
    };

    const apiKey = generateApiKey();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month from now

    // Create child panel and subscription in transaction
    const result = await db.$transaction(async (prisma) => {
      // Deduct balance from user
      await prisma.user.update({
        where: { id: userId },
        data: { 
          balance: { decrement: childPanelPrice },
          total_spent: { increment: childPanelPrice }
        }
      });

      // Create child panel
      const childPanel = await prisma.childPanel.create({
        data: {
          userId,
          domain,
          panelName,
          apiKey,
          plan,
          status: 'pending',
          expiryDate,
          settings: JSON.stringify({
            theme: 'default',
            customBranding: false,
            maxUsers: plan === 'basic' ? 100 : plan === 'standard' ? 500 : 1000,
            featuresEnabled: {
              bulkOrders: plan !== 'basic',
              apiAccess: true,
              customDomain: plan === 'premium',
              analytics: plan !== 'basic',
              userManagement: true,
              ticketSystem: plan === 'premium',
              massOrders: plan === 'premium',
              drip_feed: plan !== 'basic'
            }
          })
        }
      });

      // Create subscription record
      await prisma.childPanelSubscription.create({
        data: {
          childPanelId: childPanel.id,
          amount: childPanelPrice,
          currency: 'USD',
          status: 'active',
          startDate: new Date(),
          endDate: expiryDate,
          paymentMethod: 'balance'
        }
      });

      return childPanel;
    });

    console.log(`User ${session.user.email} created child panel: ${domain}`);

    return NextResponse.json({
      success: true,
      message: 'Child panel created successfully. It will be activated within 3-6 hours.',
      data: {
        id: result.id,
        domain: result.domain,
        panelName: result.panelName,
        apiKey: result.apiKey,
        status: result.status,
        plan: result.plan,
        expiryDate: result.expiryDate
      },
    });

  } catch (error) {
    console.error('Error creating child panel:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create child panel: ' + (error instanceof Error ? error.message : 'Unknown error'),
        data: null,
      },
      { status: 500 }
    );
  }
}
