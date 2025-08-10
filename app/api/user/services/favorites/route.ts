/* eslint-disable @typescript-eslint/no-unused-vars */

import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const searchRaw = searchParams.get('search') || '';
    const search = searchRaw ? decodeURIComponent(searchRaw).trim() : '';
    const skip = (page - 1) * limit;

    if (!userIdParam) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Convert string to number
    const userId = parseInt(userIdParam);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // First get the favorite service IDs for this user
    const favoriteServices = await db.favoriteService.findMany({
      where: { userId },
      select: { serviceId: true },
    });

    const favoriteServiceIds = favoriteServices.map((fav) => fav.serviceId);
    
    // If there are no favorites, return early
    if (favoriteServiceIds.length === 0) {
      return NextResponse.json(
        {
          data: [],
          total: 0,
          page,
          totalPages: 0,
        },
        { status: 200 }
      );
    }
    
    // Build search condition if needed
    const isNumericSearch = /^\d+$/.test(search);
    
    const searchCondition = search
      ? {
          OR: [
            // If search is numeric, prioritize exact ID match
            ...(isNumericSearch 
              ? [{
                  id: {
                    equals: Number(search)
                  }
                }] 
              : []
            ),
            // Search by service name
            {
              name: {
                contains: search,
              },
            },
            // Search by description
            {
              description: {
                contains: search,
              },
            },
            // Search by category name
            {
              category: {
                category_name: {
                  contains: search,
                },
              },
            },
          ].filter(Boolean),
        }
      : {};
    
    // Combine conditions
    const whereClause = {
      id: { in: favoriteServiceIds },
      ...searchCondition,
    };
    


    // Get services with pagination
    const [services, total] = await Promise.all([
      db.service.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: [
          // If numeric search, prioritize exact ID matches first
          ...(isNumericSearch 
            ? [{ id: 'asc' as any }] 
            : []
          ),
          { createdAt: 'desc' as any },
        ],
        include: {
          category: true,
        },
      }),
      db.service.count({ where: whereClause }),
    ]);
    
    return NextResponse.json(
      {
        data: services || [],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in favorite services API:", error);
    return NextResponse.json(
      {
        data: [],
        total: 0,
        page: 1,
        totalPages: 1,
        message: 'Error fetching favorite services',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 }
    );
  }
}
