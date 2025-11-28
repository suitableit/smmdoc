import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { serializeService } from '@/lib/utils';

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('x-remote-addr');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (remoteAddr) {
    return remoteAddr;
  }
  return 'unknown';
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Unauthorized access. Admin privileges required.',
          data: null,
          success: false,
        },
        { status: 401 }
      );
    }

    const moduleSettings = await db.moduleSettings.findFirst();
    const serviceUpdateLogsEnabled = moduleSettings?.serviceUpdateLogsEnabled ?? true;

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const body = await request.json();
    if (!body) {
      return NextResponse.json({
        error: 'Service data is required',
        data: null,
        success: false,
      });
    }
    const {
      categoryId,
      name,
      description,
      rate,
      min_order,
      max_order,
      perqty,
      avg_time,
      updateText,
      serviceTypeId,
      refill,
      cancel,
      refillDays,
      refillDisplay,
      serviceSpeed,
      mode,
      orderLink,
      packageType,
      providerServiceId,
      dripfeedEnabled,
      subscriptionMin,
      subscriptionMax,
      subscriptionDelay,
      autoPostsMin,
      autoPostsMax,
      autoDelay,
      customComments,
      isSecret,
    } = body;
    if (!id) {
      return NextResponse.json({
        error: 'Service ID is required',
        data: null,
        success: false,
      });
    }

    const currentService = await db.services.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: { select: { category_name: true } },
        serviceType: { select: { name: true } }
      }
    });

    if (!currentService) {
      return NextResponse.json({
        error: 'Service not found',
        data: null,
        success: false,
      });
    }
    const toBool = (value: unknown): boolean => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1';
      }
      return Boolean(value);
    };

    const toNumber = (value: unknown, defaultValue: number = 0): number => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string' && value.trim() !== '') {
        const num = Number(value);
        return isNaN(num) ? defaultValue : num;
      }
      return defaultValue;
    };

    const toInt = (value: unknown): number | undefined => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string' && value.trim() !== '') {
        const num = parseInt(value);
        return isNaN(num) ? undefined : num;
      }
      return undefined;
    };

    const updateData: any = {};

    if (categoryId !== undefined && categoryId !== null && categoryId !== '') {
      updateData.categoryId = toInt(categoryId);
    }
    if (name !== undefined && name !== null && name !== '') {
      updateData.name = name;
    }
    if (description !== undefined && description !== null && description !== '') {
      updateData.description = description;
    }
    if (rate !== undefined && rate !== null && rate !== '') {
      updateData.rate = toNumber(rate, 0);
    }
    if (min_order !== undefined && min_order !== null && min_order !== '') {
      updateData.min_order = toNumber(min_order, 0);
    }
    if (max_order !== undefined && max_order !== null && max_order !== '') {
      updateData.max_order = toNumber(max_order, 0);
    }
    if (perqty !== undefined && perqty !== null && perqty !== '') {
      updateData.perqty = toNumber(perqty, 1000);
    }
    if (avg_time !== undefined && avg_time !== null && avg_time !== '') {
      updateData.avg_time = avg_time;
    }
    if (updateText !== undefined && updateText !== null && updateText !== '') {
      updateData.updateText = updateText;
    }
    if (serviceTypeId !== undefined && serviceTypeId !== null && serviceTypeId !== '') {
      updateData.serviceTypeId = toInt(serviceTypeId);
    }
    if (refill !== undefined && refill !== null) {
      updateData.refill = toBool(refill);
    }
    if (cancel !== undefined && cancel !== null) {
      updateData.cancel = toBool(cancel);
    }
    if (refillDays !== undefined && refillDays !== null && refillDays !== '') {
      updateData.refillDays = toNumber(refillDays, 30);
    }
    if (refillDisplay !== undefined && refillDisplay !== null && refillDisplay !== '') {
      updateData.refillDisplay = toNumber(refillDisplay, 24);
    }
    if (serviceSpeed !== undefined && serviceSpeed !== null && serviceSpeed !== '') {
      updateData.serviceSpeed = serviceSpeed;
    }
    if (mode !== undefined && mode !== null && mode !== '') {
      updateData.mode = mode;
    }
    if (orderLink !== undefined && orderLink !== null && orderLink !== '') {
      updateData.orderLink = orderLink;
    }

    if (packageType !== undefined && packageType !== null && packageType !== '') {
      updateData.packageType = toNumber(packageType, 1);
    }
    if (providerServiceId !== undefined && providerServiceId !== null && providerServiceId !== '') {
      updateData.providerServiceId = providerServiceId;
    }
    if (dripfeedEnabled !== undefined && dripfeedEnabled !== null) {
      updateData.dripfeedEnabled = toBool(dripfeedEnabled);
    }
    if (subscriptionMin !== undefined && subscriptionMin !== null && subscriptionMin !== '') {
      updateData.subscriptionMin = toInt(subscriptionMin);
    }
    if (subscriptionMax !== undefined && subscriptionMax !== null && subscriptionMax !== '') {
      updateData.subscriptionMax = toInt(subscriptionMax);
    }
    if (subscriptionDelay !== undefined && subscriptionDelay !== null && subscriptionDelay !== '') {
      updateData.subscriptionDelay = toInt(subscriptionDelay);
    }
    if (autoPostsMin !== undefined && autoPostsMin !== null && autoPostsMin !== '') {
      updateData.autoPostsMin = toInt(autoPostsMin);
    }
    if (autoPostsMax !== undefined && autoPostsMax !== null && autoPostsMax !== '') {
      updateData.autoPostsMax = toInt(autoPostsMax);
    }
    if (autoDelay !== undefined && autoDelay !== null && autoDelay !== '') {
      updateData.autoDelay = toInt(autoDelay);
    }
    if (customComments !== undefined && customComments !== null && customComments !== '') {
      updateData.customComments = customComments;
    }
    if (isSecret !== undefined && isSecret !== null) {
      updateData.isSecret = toBool(isSecret);
    }

    const changes: any = {};
    Object.keys(updateData).forEach(key => {
      const oldValue = (currentService as any)[key];
      const newValue = (updateData as any)[key];
      if (oldValue !== newValue) {
        changes[key] = {
          from: oldValue,
          to: newValue
        };
      }
    });

    if (Object.keys(changes).length > 0) {
      updateData.updateText = JSON.stringify({
        action: 'updated',
        changes,
        updatedAt: new Date().toISOString(),
        updatedBy: session.user.email
      });
    }

    const updatedService = await db.services.update({
      where: {
        id: parseInt(id),
      },
      data: updateData,
    });

    if (serviceUpdateLogsEnabled) {
      try {
        const clientIP = getClientIP(request);
        const userAgent = request.headers.get('user-agent') || 'unknown';

        const changes: any = {};
        const oldValues: any = {};
        const newValues: any = {};

        Object.keys(updateData).forEach(key => {
          const oldValue = (currentService as any)[key];
          const newValue = (updateData as any)[key];

          if (oldValue !== newValue) {
            changes[key] = {
              from: oldValue,
              to: newValue
            };
            oldValues[key] = oldValue;
            newValues[key] = newValue;
          }
        });

        await db.serviceUpdateLogs.create({
          data: {
            serviceId: parseInt(id),
            serviceName: currentService.name,
            adminId: parseInt(session.user.id),
            adminEmail: session.user.email || 'unknown',
            action: 'updated',
            changes,
            oldValues,
            newValues,
            ipAddress: clientIP,
            userAgent
          }
        });

        console.log(`Service update logged: Admin ${session.user.email} updated service ${currentService.name} (ID: ${id})`);
      } catch (logError) {
        console.error('Failed to log service update:', logError);
      }
    }

    return NextResponse.json({
      error: null,
      message: 'Service updated successfully',
      data: null,
      success: true,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to update services' + error,
      data: null,
      success: false,
    });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({
        error: 'Service ID is required',
        data: null,
        success: false,
      });
    }
    const result = await db.services.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        category: true,
        serviceType: true,
      },
    });

    if (!result) {
      return NextResponse.json({
        error: 'Service not found',
        data: null,
        success: false,
      });
    }

    // Serialize BigInt values to strings for JSON serialization
    const serializedResult = serializeService(result);

    return NextResponse.json(
      {
        error: null,
        data: serializedResult,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch service: ' + error,
        data: null,
        success: false,
      },
      { status: 500 }
    );
  }
}
