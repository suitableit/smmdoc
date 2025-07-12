/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { auth } from '@/auth';
import { db } from '../db';

// get full user details from db and set in redux store
export async function getUserDetails() {
  try {
    // Get current user's session
    const session = await auth();
    
    // If user is not authenticated, return null
    if (!session?.user?.id) {
      return null;
    }
    
    try {
      // Find the user in the database with all necessary fields including balance
      const user = await db.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          emailVerified: true,
          currency: true,
          dollarRate: true,
          isTwoFactorEnabled: true,
          balance: true,          // Get actual balance field from database
          total_deposit: true,    // Get actual total_deposit field
          total_spent: true,      // Get actual total_spent field
          createdAt: true,
          updatedAt: true,
          addFunds: true,         // Include user's transactions
        },
      });
      
      if (!user) {
        return null;
      }
      
      // Return the user data with real balance fields from database
      return {
        ...user,
        // Use the actual fields from database, no need for virtual calculation
        balance: user.balance || 0,
        total_deposit: user.total_deposit || 0,
        total_spent: user.total_spent || 0
      };
    } catch (dbError) {
      console.error("Database error:", dbError);
      
      // Fallback approach - get minimal user data
      try {
        // Get minimal user data with balance fields
        const userBasic = await db.user.findUnique({
          where: {
            id: session.user.id,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            emailVerified: true,
            currency: true,
            dollarRate: true,
            isTwoFactorEnabled: true,
            balance: true,
            total_deposit: true,
            total_spent: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        
        if (!userBasic) {
          return null;
        }
        
        // Get transactions separately
        const transactions = await db.addFund.findMany({
          where: {
            userId: session.user.id,
          },
        });
        
        // Return user with transactions and real balance fields
        return {
          ...userBasic,
          addFunds: transactions,
          balance: userBasic.balance || 0,
          total_deposit: userBasic.total_deposit || 0,
          total_spent: userBasic.total_spent || 0
        };
      } catch (fallbackError) {
        console.error("Fallback fetch failed:", fallbackError);

        // Last resort - return session user with defaults
        return {
          id: session.user.id,
          name: session.user.name || null,
          email: session.user.email || null,
          role: session.user.role || 'user',
          image: session.user.image || null,
          emailVerified: null,
          currency: session.user.currency || 'USD',
          dollarRate: session.user.dollarRate || 121.52,
          isTwoFactorEnabled: session.user.isTwoFactorEnabled || false,
          balance: session.user.balance || 0,
          total_deposit: 0,
          total_spent: 0,
          username: session.user.username || null,
          createdAt: new Date(),
          updatedAt: new Date(),
          addFunds: []
        };
      }
    }
  } catch (error) {
    console.error("Error getting user details:", error);
    return null;
  }
}
