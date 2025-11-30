import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';

    const where: any = {
      userId: session.user.id,
    };

    if (search) {
      where.OR = [
        { transaction_id: { contains: search, mode: 'insensitive' } },
        { invoice_id: { contains: search, mode: 'insensitive' } },
        { phone_number: { contains: search, mode: 'insensitive' } },
        { payment_method: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all') {
      if (status === 'success') {
        where.admin_status = 'Success';
      } else if (status === 'pending') {
        where.admin_status = 'Pending';
      } else if (status === 'failed') {
        where.admin_status = { in: ['Failed', 'Cancelled'] };
      }
    }

    await db.$queryRaw`SELECT 1`;

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      db.addFunds.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: skip,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      db.addFunds.count({ where })
    ]);

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const transactionsToRefresh = transactions.filter(tx => {
      const isRecent = tx.createdAt >= tenMinutesAgo;
      const needsRefresh = !tx.transaction_id || 
                          !tx.payment_method || 
                          tx.status === 'Processing' ||
                          tx.transaction_id === tx.invoice_id;
      return isRecent && needsRefresh && tx.payment_gateway === 'UddoktaPay';
    });

    if (transactionsToRefresh.length > 0) {
      console.log(`Auto-refreshing ${transactionsToRefresh.length} recent transactions from payment gateway...`);
      
      const refreshPromises = transactionsToRefresh.map(async (transaction) => {
        try {
          const { getPaymentGatewayApiKey, getPaymentGatewayVerifyUrl } = await import('@/lib/payment-gateway-config');
          const apiKey = await getPaymentGatewayApiKey();
          const verifyUrl = await getPaymentGatewayVerifyUrl();
          
          if (!apiKey || !verifyUrl) {
            return null;
          }

          const verificationResponse = await fetch(verifyUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'RT-UDDOKTAPAY-API-KEY': apiKey,
            },
            body: JSON.stringify({ invoice_id: transaction.invoice_id }),
          });

          if (!verificationResponse.ok) {
            return null;
          }

          const verificationData = await verificationResponse.json();
          
          const extractedTransactionId = verificationData.transaction_id || 
                                       verificationData.transactionId || 
                                       verificationData.trx_id || 
                                       verificationData.trxId ||
                                       verificationData.transactionID ||
                                       verificationData.data?.transaction_id ||
                                       verificationData.data?.transactionId ||
                                       verificationData.payment?.transaction_id ||
                                       null;

          const extractedPaymentMethod = verificationData.payment_method || 
                                       verificationData.paymentMethod || 
                                       verificationData.payment_method_name ||
                                       verificationData.method ||
                                       null;

          const extractedSenderNumber = verificationData.sender_number || 
                                      verificationData.senderNumber || 
                                      verificationData.phone ||
                                      verificationData.sender_phone ||
                                      null;

          const validTransactionId = extractedTransactionId && 
                                   extractedTransactionId !== transaction.invoice_id
                                   ? extractedTransactionId 
                                   : null;

          if (validTransactionId || extractedPaymentMethod || extractedSenderNumber) {
            const updateData: any = {};
            
            if (validTransactionId && validTransactionId !== transaction.transaction_id) {
              updateData.transaction_id = validTransactionId;
            }
            
            if (extractedPaymentMethod && extractedPaymentMethod !== transaction.payment_method) {
              updateData.payment_method = extractedPaymentMethod;
            }
            
            if (extractedSenderNumber && extractedSenderNumber !== transaction.phone_number) {
              updateData.phone_number = extractedSenderNumber;
            }

            if (Object.keys(updateData).length > 0) {
              await db.addFunds.update({
                where: { invoice_id: transaction.invoice_id },
                data: updateData,
              });

              if (updateData.transaction_id) {
                transaction.transaction_id = updateData.transaction_id;
              }
              if (updateData.payment_method) {
                transaction.payment_method = updateData.payment_method;
              }
              if (updateData.phone_number) {
                transaction.phone_number = updateData.phone_number;
              }

              console.log(`Updated transaction ${transaction.invoice_id} with gateway data:`, updateData);
            }
          }
        } catch (error) {
          console.error(`Error refreshing transaction ${transaction.invoice_id} from gateway:`, error);
        }
      });

      await Promise.all(refreshPromises).catch(err => {
        console.error('Error in batch transaction refresh:', err);
      });
    }

    const totalPages = Math.ceil(total / limit);

    const transformedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      invoice_id: transaction.invoice_id || transaction.id,
      amount: transaction.usd_amount || 0,
      status: mapStatus(transaction.status || 'Processing'),
      method: transaction.payment_gateway || 'UddoktaPay',
      payment_method: transaction.payment_method || 'UddoktaPay',
      transaction_id: transaction.transaction_id || null,
      createdAt: transaction.createdAt.toISOString(),
      sender_number: transaction.phone_number,
      phone: transaction.phone_number,
      currency: 'USD',
    }));

    return NextResponse.json({
      transactions: transformedTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }
    });

  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

function mapStatus(dbStatus: string): 'Success' | 'Processing' | 'Cancelled' | 'Failed' {
  switch (dbStatus) {
    case 'Success':
      return 'Success';
    case 'Processing':
      return 'Processing';
    case 'Cancelled':
      return 'Cancelled';
    case 'Failed':
      return 'Failed';
    default:
      return 'Processing';
  }
}
