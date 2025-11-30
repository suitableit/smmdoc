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
        { transactionId: { contains: search, mode: 'insensitive' } },
        { invoiceId: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        { paymentMethod: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all') {
      if (status === 'success') {
        where.status = 'Success';
      } else if (status === 'pending') {
        where.status = 'Processing';
      } else if (status === 'failed') {
        where.status = { in: ['Failed', 'Cancelled'] };
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
      const needsRefresh = !tx.transactionId || 
                          !tx.paymentMethod || 
                          tx.status === 'Processing' ||
                          tx.transactionId === tx.invoiceId;
      return isRecent && needsRefresh && tx.paymentGateway === 'UddoktaPay';
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
            body: JSON.stringify({ invoice_id: transaction.invoiceId }),
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
                                   extractedTransactionId !== transaction.invoiceId
                                   ? extractedTransactionId 
                                   : null;

          if (validTransactionId || extractedPaymentMethod || extractedSenderNumber) {
            const updateData: any = {};
            
            if (validTransactionId && validTransactionId !== transaction.transactionId) {
              updateData.transactionId = validTransactionId;
            }
            
            if (extractedPaymentMethod && extractedPaymentMethod !== transaction.paymentMethod) {
              updateData.paymentMethod = extractedPaymentMethod;
            }
            
            if (extractedSenderNumber && extractedSenderNumber !== transaction.phoneNumber) {
              updateData.phoneNumber = extractedSenderNumber;
            }

            if (Object.keys(updateData).length > 0) {
              await db.addFunds.update({
                where: { invoiceId: transaction.invoiceId },
                data: updateData,
              });

              if (updateData.transactionId) {
                transaction.transactionId = updateData.transactionId;
              }
              if (updateData.paymentMethod) {
                transaction.paymentMethod = updateData.paymentMethod;
              }
              if (updateData.phoneNumber) {
                transaction.phoneNumber = updateData.phoneNumber;
              }

              console.log(`Updated transaction ${transaction.invoiceId} with gateway data:`, updateData);
            }
          }
        } catch (error) {
          console.error(`Error refreshing transaction ${transaction.invoiceId} from gateway:`, error);
        }
      });

      await Promise.all(refreshPromises).catch(err => {
        console.error('Error in batch transaction refresh:', err);
      });
    }

    const totalPages = Math.ceil(total / limit);

    const transformedTransactions = transactions.map((transaction) => ({
      id: transaction.Id,
      invoice_id: transaction.invoiceId || transaction.Id,
      amount: transaction.usdAmount || 0,
      status: mapStatus(transaction.status || 'Processing'),
      method: transaction.paymentGateway || 'UddoktaPay',
      payment_method: transaction.paymentMethod || 'UddoktaPay',
      transaction_id: transaction.transactionId || null,
      createdAt: transaction.createdAt.toISOString(),
      sender_number: transaction.phoneNumber,
      phone: transaction.phoneNumber,
      currency: transaction.currency || 'USD',
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
