import { auth } from '@/auth';
import { ActivityLogger, getClientIP } from '@/lib/activity-logger';
import { db } from '@/lib/db';
import { emailTemplates } from '@/lib/email-templates';
import { sendMail } from '@/lib/nodemailer';
import { NextRequest, NextResponse } from 'next/server';

// Server-side currency conversion function
function serverConvertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  currencies: any[]
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromCurrencyData = currencies.find(c => c.code === fromCurrency);
  const toCurrencyData = currencies.find(c => c.code === toCurrency);

  console.log('Server currency conversion debug:', {
    amount,
    fromCurrency,
    toCurrency,
    fromCurrencyData: fromCurrencyData ? { code: fromCurrencyData.code, rate: fromCurrencyData.rate } : null,
    toCurrencyData: toCurrencyData ? { code: toCurrencyData.code, rate: toCurrencyData.rate } : null
  });

  if (!fromCurrencyData || !toCurrencyData) {
    console.warn('Currency not found, returning original amount');
    return amount;
  }

  // Convert using rates (USD is base currency with rate 1.0000)
  let convertedAmount: number;

  if (fromCurrency === 'USD') {
    // From USD to other currency
    convertedAmount = amount * Number(toCurrencyData.rate);
  } else if (toCurrency === 'USD') {
    // From other currency to USD
    convertedAmount = amount / Number(fromCurrencyData.rate);
  } else {
    // Between two non-USD currencies (via USD)
    const usdAmount = amount / Number(fromCurrencyData.rate);
    convertedAmount = usdAmount * Number(toCurrencyData.rate);
  }

  console.log('Server conversion result:', { original: amount, converted: convertedAmount });
  return convertedAmount;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const clientIP = getClientIP(request);

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

    const body = await request.json();
    const { username, amount, action, notes, adminCurrency } = body;

    // Validation
    if (!username || !amount || !action) {
      return NextResponse.json(
        {
          error: 'Username, amount, and action are required',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        {
          error: 'Amount must be greater than 0',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    if (!['add', 'deduct'].includes(action)) {
      return NextResponse.json(
        {
          error: 'Action must be either "add" or "deduct"',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Find user by username
    const user = await db.user.findUnique({
      where: { username: username },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        balance: true,
        dollarRate: true
      }
    });

    if (!user) {
      return NextResponse.json(
        {
          error: 'User not found',
          success: false,
          data: null
        },
        { status: 404 }
      );
    }

    // Get available currencies for conversion directly from database
    const availableCurrencies = await db.currency.findMany({
      where: { enabled: true },
      orderBy: { code: 'asc' }
    });

    // Find admin currency info
    const adminCurrencyInfo = availableCurrencies.find((c: any) => c.code === adminCurrency);
    const adminCurrencySymbol = adminCurrencyInfo?.symbol || '$';

    // Convert admin's amount to BDT (database storage currency)
    let amountToAdd: number;

    console.log('Currency conversion:', {
      adminCurrency,
      amount,
      availableCurrencies: availableCurrencies.map(c => ({ code: c.code, rate: c.rate }))
    });

    if (adminCurrency === 'BDT') {
      // Admin using BDT - direct amount
      amountToAdd = amount;
    } else {
      // Convert admin currency to BDT using dynamic rates
      amountToAdd = serverConvertCurrency(amount, adminCurrency, 'BDT', availableCurrencies);
      console.log('Converted amount:', { original: amount, converted: amountToAdd });
    }

    const transactionCurrency = adminCurrency;
    const errorCurrencySymbol = adminCurrencySymbol;
    const successMessage = `Successfully ${action === 'add' ? 'added' : 'deducted'} ${adminCurrencySymbol}${amount} ${action === 'add' ? 'to' : 'from'} ${user.username}'s balance`;

    // Check if deducting more than available balance
    if (action === 'deduct' && user.balance < amountToAdd) {
      return NextResponse.json(
        {
          error: `Insufficient balance. User has ৳${user.balance.toFixed(2)}, trying to deduct ${errorCurrencySymbol}${amount}`,
          success: false,
          data: null
        },
        { status: 400 }
      );
    }



    // Use database transaction to ensure consistency
    const result = await db.$transaction(async (prisma) => {
      // Update user balance
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          balance: action === 'add'
            ? { increment: amountToAdd }
            : { decrement: amountToAdd },
          total_deposit: action === 'add'
            ? { increment: amountToAdd }
            : undefined
        }
      });

      // Create a transaction record for this manual balance adjustment
      // Store the converted BDT amount that was actually added to user's balance
      const transactionRecord = await prisma.addFund.create({
        data: {
          userId: user.id,
          invoice_id: `MANUAL-${Date.now()}`,
          amount: amountToAdd, // Store converted BDT amount that was actually added
          spent_amount: 0,
          fee: 0,
          email: user.email || '',
          name: user.name || '',
          status: 'Success',
          admin_status: 'Success',
          order_id: `MANUAL-${action.toUpperCase()}-${Date.now()}`,
          method: 'manual_adjustment',
          payment_method: `Admin Manual Adjustment (${adminCurrencySymbol}${amount} ${adminCurrency})`,
          sender_number: '',
          transaction_id: action === 'add' ? 'Added by Admin' : 'Deducted by Admin',
          currency: 'BDT' // Always store as BDT since that's what's added to balance
        }
      });

      return { updatedUser, transactionRecord };
    });

    // Send notification emails
    try {
      // Send email notification to user
      if (user.email) {
        const displayAmount = `${adminCurrencySymbol}${amount}`;
        const notificationMessage = action === 'add'
          ? `${displayAmount} has been added to your account by admin.`
          : `${displayAmount} has been deducted from your account by admin.`;

        const emailData = emailTemplates.paymentSuccess({
          userName: user.name || 'Customer',
          userEmail: user.email,
          transactionId: result.transactionRecord.id,
          amount: amount,
          currency: transactionCurrency,
          date: new Date().toLocaleDateString(),
          userId: user.id.toString()
        });

        await sendMail({
          sendTo: user.email,
          subject: `Balance ${action === 'add' ? 'Added' : 'Deducted'} - Manual Adjustment`,
          html: emailData.html
            .replace('Payment Successful!', `Balance ${action === 'add' ? 'Added' : 'Deducted'}`)
            .replace('Your payment has been successfully processed', notificationMessage)
            .replace('funds have been added to your account', `your new balance is ৳${result.updatedUser.balance}`)
        });
      }

      // Send admin notification
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
      const adminEmailData = emailTemplates.adminAutoApproved({
        userName: user.name || 'Unknown User',
        userEmail: user.email || '',
        transactionId: result.transactionRecord.id,
        amount: amount,
        currency: transactionCurrency,
        date: new Date().toLocaleDateString(),
        userId: user.id.toString()
      });

      await sendMail({
        sendTo: adminEmail,
        subject: `Manual Balance ${action === 'add' ? 'Addition' : 'Deduction'} - ${user.username}`,
        html: adminEmailData.html
          .replace('Auto-Approved', `Manual ${action === 'add' ? 'Addition' : 'Deduction'}`)
          .replace('has been automatically approved', `balance has been manually ${action === 'add' ? 'added' : 'deducted'} by admin`)
      });
    } catch (emailError) {
      console.error('Error sending notification emails:', emailError);
      // Don't fail the transaction if email fails
    }

    // Log the activity
     try {
       const adminUsername = session.user.username || session.user.email?.split('@')[0] || `admin${session.user.id}`;
       const targetUsername = user.username || user.email?.split('@')[0] || `user${user.id}`;
       
       if (action === 'add') {
         await ActivityLogger.balanceAdded(
           session.user.id,
           adminUsername,
           user.id,
           targetUsername,
           amountToAdd,
           'BDT',
           clientIP
         );
       } else {
         await ActivityLogger.balanceDeducted(
           session.user.id,
           adminUsername,
           user.id,
           targetUsername,
           amountToAdd,
           'BDT',
           clientIP
         );
       }
     } catch (logError) {
       console.error('Failed to log balance activity:', logError);
     }

    return NextResponse.json({
      success: true,
      message: successMessage,
      data: {
        userId: user.id,
        username: user.username,
        previousBalance: user.balance,
        newBalance: result.updatedUser.balance,
        amount: amount,
        amountAdded: amountToAdd,
        adminCurrency: transactionCurrency,
        action: action,
        transactionId: result.transactionRecord.id
      }
    });

  } catch (error) {
    console.error('Error updating user balance:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        error: 'Failed to update user balance: ' + (error instanceof Error ? error.message : String(error)),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
