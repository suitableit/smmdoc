interface TransactionEmailData {
  userName: string;
  userEmail: string;
  transactionId: string;
  amount: number;
  currency?: string;
  date: string;
  userId?: string;
  phone?: string;
}

export const emailTemplates = {
  // User notification emails
  paymentSuccess: (data: TransactionEmailData) => ({
    subject: 'Payment Successful - Funds Added to Your Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Successful</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Payment Successful!</h1>
            <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
              <div style="color: #ffffff; font-size: 40px;">✓</div>
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${
              data.userName
            },</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Great news! Your payment has been successfully processed and funds have been added to your account. You can now use these funds to place orders on our platform.
            </p>
            
            <!-- Transaction Details -->
            <div style="background-color: #f9fafb; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">Transaction Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Transaction ID:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${
                    data.transactionId
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Amount:</td>
                  <td style="padding: 8px 0; color: #22c55e; font-weight: bold; font-size: 18px;">${
                    data.amount
                  } ${data.currency || 'BDT'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Status:</td>
                  <td style="padding: 8px 0; color: #22c55e; font-weight: bold;">✓ Approved</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Date:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${
                    data.date
                  }</td>
                </tr>
              </table>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/transactions" 
                 style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                View Transaction History
              </a>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
              Thank you for choosing our service! If you have any questions, please don't hesitate to contact our support team.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              This is an automated message. Please do not reply to this email.
            </p>
            <div style="margin-top: 20px;">
              <a href="https://wa.me/+8801723139610" style="color: #22c55e; text-decoration: none; margin: 0 10px;">WhatsApp</a>
              <a href="https://t.me/Smmdoc" style="color: #3b82f6; text-decoration: none; margin: 0 10px;">Telegram</a>
              <a href="mailto:support@example.com" style="color: #6b7280; text-decoration: none; margin: 0 10px;">Email Support</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  paymentCancelled: (data: TransactionEmailData) => ({
    subject: 'Payment Cancelled - Transaction Not Approved',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Cancelled</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Payment Cancelled</h1>
            <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
              <div style="color: #ffffff; font-size: 40px;">✕</div>
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${
              data.userName
            },</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              We regret to inform you that your payment could not be verified and has been cancelled by our admin team.
            </p>
            
            <!-- Transaction Details -->
            <div style="background-color: #fef2f2; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #ef4444;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Transaction Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Transaction ID:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${
                    data.transactionId
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Amount:</td>
                  <td style="padding: 8px 0; color: #ef4444; font-weight: bold; font-size: 18px;">${
                    data.amount
                  } ${data.currency || 'BDT'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Status:</td>
                  <td style="padding: 8px 0; color: #ef4444; font-weight: bold;">✕ Cancelled</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Date:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${
                    data.date
                  }</td>
                </tr>
              </table>
            </div>
            
            <!-- What to do next -->
            <div style="background-color: #f3f4f6; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">What to do next:</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">If you believe this is an error, please contact our support team</li>
                <li style="margin-bottom: 8px;">You can try making a new payment with correct transaction details</li>
                <li style="margin-bottom: 8px;">Ensure your transaction ID and phone number are accurate</li>
              </ul>
            </div>
            
            <!-- Contact Support -->
            <div style="background-color: #e0f2fe; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Contact Support:</h3>
              <div style="color: #4b5563;">
                <p style="margin: 5px 0;"><strong>WhatsApp:</strong> +8801723139610</p>
                <p style="margin: 5px 0;"><strong>Telegram:</strong> @Smmdoc</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> support@example.com</p>
              </div>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
              We apologize for any inconvenience caused and appreciate your understanding.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Admin notification emails
  adminPendingTransaction: (data: TransactionEmailData) => ({
    subject: 'Pending Payment Requires Manual Review',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pending Transaction Review</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Payment Pending Review</h1>
            <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
              <div style="color: #ffffff; font-size: 40px;">⏳</div>
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              A new payment requires manual verification and approval.
            </p>
            
            <!-- Transaction Details -->
            <div style="background-color: #fef3c7; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Transaction Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">User:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${
                    data.userName
                  } (${data.userEmail})</td>
                </tr>
                ${
                  data.userId
                    ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">User ID:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.userId}</td>
                </tr>
                `
                    : ''
                }
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Transaction ID:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${
                    data.transactionId
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Amount:</td>
                  <td style="padding: 8px 0; color: #f59e0b; font-weight: bold; font-size: 18px;">${
                    data.amount
                  } ${data.currency || 'BDT'}</td>
                </tr>
                ${
                  data.phone
                    ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Phone:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.phone}</td>
                </tr>
                `
                    : ''
                }
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Status:</td>
                  <td style="padding: 8px 0; color: #f59e0b; font-weight: bold;">⏳ Pending Manual Review</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Date:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${
                    data.date
                  }</td>
                </tr>
              </table>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/funds" 
                 style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                Review Transaction
              </a>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
              Please log in to the admin dashboard to approve or cancel this transaction.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              This is an automated admin notification.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  adminAutoApproved: (data: TransactionEmailData) => ({
    subject: 'New Payment Received - Auto Approved',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Auto Approved</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">New Payment Received</h1>
            <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
              <div style="color: #ffffff; font-size: 40px;">💰</div>
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              A new payment has been automatically verified and approved.
            </p>
            
            <!-- Transaction Details -->
            <div style="background-color: #f3f4f6; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Transaction Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">User:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${
                    data.userName
                  } (${data.userEmail})</td>
                </tr>
                ${
                  data.userId
                    ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">User ID:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.userId}</td>
                </tr>
                `
                    : ''
                }
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Transaction ID:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${
                    data.transactionId
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Amount:</td>
                  <td style="padding: 8px 0; color: #22c55e; font-weight: bold; font-size: 18px;">${
                    data.amount
                  } ${data.currency || 'BDT'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Status:</td>
                  <td style="padding: 8px 0; color: #22c55e; font-weight: bold;">✓ Auto-Approved</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Date:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${
                    data.date
                  }</td>
                </tr>
              </table>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
              The user's account balance has been automatically updated.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              This is an automated admin notification.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};
