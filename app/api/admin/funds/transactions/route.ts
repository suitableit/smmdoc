import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const searchParams = new URL(req.url).searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    let whereCondition = {};
    
    if (search) {
      whereCondition = {
        OR: [
          { transactionId: { contains: search } },
          { user: { name: { contains: search } } },
          { user: { email: { contains: search } } },
        ],
      };
    }
    
    const transactions = await db.addFunds.findMany({
      where: whereCondition,
      select: {
        Id: true,
        invoiceId: true,
        usdAmount: true,
        bdtAmount: true,
        status: true,
        paymentGateway: true,
        paymentMethod: true,
        transactionId: true,
        phoneNumber: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            currency: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });
    
    const totalCount = await db.addFunds.count({ where: whereCondition });
    const totalPages = Math.ceil(totalCount / limit);
    
    const transformedTransactions = transactions.map((t: any) => ({
      id: t.Id,
      invoiceId: t.invoiceId,
      invoice_id: t.invoiceId,
      usdAmount: t.usdAmount,
      usd_amount: t.usdAmount,
      bdtAmount: t.bdtAmount,
      bdt_amount: t.bdtAmount,
      status: t.status,
      admin_status: t.status,
      paymentGateway: t.paymentGateway,
      payment_gateway: t.paymentGateway,
      paymentMethod: t.paymentMethod,
      payment_method: t.paymentMethod,
      transactionId: t.transactionId,
      transaction_id: t.transactionId,
      phoneNumber: t.phoneNumber,
      phone_number: t.phoneNumber,
      phone: t.phoneNumber,
      currency: t.currency,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      userId: t.userId,
      user: t.user,
    }));
    
    return NextResponse.json({
      transactions: transformedTransactions,
      totalPages,
      currentPage: page,
      totalCount,
    });
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
