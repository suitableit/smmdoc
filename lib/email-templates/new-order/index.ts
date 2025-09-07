// New Order Email Templates
// These templates are used for order notifications to users and admins

export interface NewOrderEmailData {
  userName: string;
  userEmail: string;
  orderId: string;
  orderTotal: string;
  currency?: string;
  orderDate: string;
  userId?: string;
  orderItems?: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
  deliveryTime?: string;
  orderStatus?: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod?: string;
}

export const newOrderTemplates = {
  // User notification when order is placed
  userOrderConfirmation: (data: NewOrderEmailData) => ({
    subject: `Order Confirmation - #${data.orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Order Confirmed!</h1>
            <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
      
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${data.userName},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Thank you for your order! We've received your request and our team is now processing it. You'll receive updates as your order progresses.
            </p>
            
            <!-- Order Details -->
            <div style="background-color: #f3f4f6; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">Order Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Order ID:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">#${data.orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Order Total:</td>
                  <td style="padding: 8px 0; color: #22c55e; font-weight: bold; font-size: 18px;">${data.orderTotal} ${data.currency || 'BDT'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Status:</td>
                  <td style="padding: 8px 0; color: #f59e0b; font-weight: bold; text-transform: capitalize;">${data.orderStatus || 'Processing'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Order Date:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.orderDate}</td>
                </tr>
                ${data.deliveryTime ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Estimated Delivery:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.deliveryTime}</td>
                </tr>
                ` : ''}
                ${data.paymentMethod ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Payment Method:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.paymentMethod}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            ${data.orderItems && data.orderItems.length > 0 ? `
            <!-- Order Items -->
            <div style="background-color: #f9fafb; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px;">Order Items:</h3>
              <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
                ${data.orderItems.map(item => `
                <div style="padding: 15px; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="color: #1f2937; font-weight: bold; margin-bottom: 4px;">${item.name}</div>
                    <div style="color: #6b7280; font-size: 14px;">Quantity: ${item.quantity}</div>
                  </div>
                  <div style="color: #22c55e; font-weight: bold;">${item.price} ${data.currency || 'BDT'}</div>
                </div>
                `).join('')}
              </div>
            </div>
            ` : ''}
            
            <!-- What's Next -->
            <div style="background-color: #e0f2fe; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">What happens next?</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Our team will review and process your order</li>
                <li style="margin-bottom: 8px;">You'll receive email updates on order progress</li>
                <li style="margin-bottom: 8px;">Order completion typically takes ${data.deliveryTime || '24-48 hours'}</li>
                <li style="margin-bottom: 8px;">You can track your order status in your dashboard</li>
              </ul>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderId}" 
                 style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                Track Order Status
              </a>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
              Thank you for choosing our service! If you have any questions about your order, please don't hesitate to contact our support team.
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

  // Admin notification when new order is placed
  adminNewOrder: (data: NewOrderEmailData) => ({
    subject: `New Order Received - #${data.orderId} [${data.orderTotal} ${data.currency || 'BDT'}]`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Notification</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">New Order Received</h1>
            <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
      
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              A new order has been placed and requires processing.
            </p>
            
            <!-- Order Details -->
            <div style="background-color: #f3f4f6; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Order Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Order ID:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">#${data.orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Customer:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.userName} (${data.userEmail})</td>
                </tr>
                ${data.userId ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">User ID:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.userId}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Order Total:</td>
                  <td style="padding: 8px 0; color: #22c55e; font-weight: bold; font-size: 18px;">${data.orderTotal} ${data.currency || 'BDT'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Status:</td>
                  <td style="padding: 8px 0; color: #f59e0b; font-weight: bold; text-transform: capitalize;">${data.orderStatus || 'Pending'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Order Date:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.orderDate}</td>
                </tr>
                ${data.paymentMethod ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Payment Method:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.paymentMethod}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            ${data.orderItems && data.orderItems.length > 0 ? `
            <!-- Order Items -->
            <div style="background-color: #f9fafb; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px;">Ordered Items:</h3>
              <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
                ${data.orderItems.map((item, index) => `
                <div style="padding: 15px; ${index < data.orderItems.length - 1 ? 'border-bottom: 1px solid #f3f4f6;' : ''} display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="color: #1f2937; font-weight: bold; margin-bottom: 4px;">${item.name}</div>
                    <div style="color: #6b7280; font-size: 14px;">Qty: ${item.quantity}</div>
                  </div>
                  <div style="color: #22c55e; font-weight: bold;">${item.price} ${data.currency || 'BDT'}</div>
                </div>
                `).join('')}
              </div>
            </div>
            ` : ''}
            
            <!-- Priority Actions -->
            <div style="background-color: #fef3c7; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Action Required:</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Review order details and customer requirements</li>
                <li style="margin-bottom: 8px;">Verify payment status and customer balance</li>
                <li style="margin-bottom: 8px;">Begin order processing and update status</li>
                <li style="margin-bottom: 8px;">Notify customer of any delays or issues</li>
              </ul>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${data.orderId}" 
                 style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                Process Order
              </a>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
              Please process this order promptly to maintain customer satisfaction.
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

  // User notification when order status is updated
  userOrderStatusUpdate: (data: NewOrderEmailData) => ({
    subject: `Order Update - #${data.orderId} [${data.orderStatus?.toUpperCase()}]`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Status Update</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, ${data.orderStatus === 'completed' ? '#22c55e' : data.orderStatus === 'cancelled' ? '#ef4444' : '#f59e0b'} 0%, ${data.orderStatus === 'completed' ? '#16a34a' : data.orderStatus === 'cancelled' ? '#dc2626' : '#d97706'} 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Order ${data.orderStatus === 'completed' ? 'Completed' : data.orderStatus === 'cancelled' ? 'Cancelled' : 'Updated'}!</h1>
            <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
      
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${data.userName},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              ${data.orderStatus === 'completed' ? 'Great news! Your order has been completed successfully.' : 
                data.orderStatus === 'cancelled' ? 'We regret to inform you that your order has been cancelled.' :
                data.orderStatus === 'processing' ? 'Your order is now being processed by our team.' :
                'Your order status has been updated.'}
            </p>
            
            <!-- Order Details -->
            <div style="background-color: #f3f4f6; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid ${data.orderStatus === 'completed' ? '#22c55e' : data.orderStatus === 'cancelled' ? '#ef4444' : '#f59e0b'}; padding-bottom: 10px;">Order Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Order ID:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">#${data.orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Order Total:</td>
                  <td style="padding: 8px 0; color: #22c55e; font-weight: bold; font-size: 18px;">${data.orderTotal} ${data.currency || 'BDT'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Status:</td>
                  <td style="padding: 8px 0; color: ${data.orderStatus === 'completed' ? '#22c55e' : data.orderStatus === 'cancelled' ? '#ef4444' : '#f59e0b'}; font-weight: bold; text-transform: capitalize;">${data.orderStatus || 'Updated'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Updated:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.orderDate}</td>
                </tr>
              </table>
            </div>
            
            ${data.orderStatus === 'completed' ? `
            <!-- Completion Message -->
            <div style="background-color: #ecfdf5; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #22c55e;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Order Completed Successfully!</h3>
              <p style="color: #4b5563; margin: 0;">Your order has been processed and completed. Thank you for choosing our service!</p>
            </div>
            ` : data.orderStatus === 'cancelled' ? `
            <!-- Cancellation Message -->
            <div style="background-color: #fef2f2; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #ef4444;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Order Cancelled</h3>
              <p style="color: #4b5563; margin: 0;">If you have any questions about this cancellation, please contact our support team.</p>
            </div>
            ` : `
            <!-- Processing Message -->
            <div style="background-color: #fef3c7; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Order in Progress</h3>
              <p style="color: #4b5563; margin: 0;">Our team is working on your order. You'll receive another update when it's completed.</p>
            </div>
            `}
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderId}" 
                 style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                View Order Details
              </a>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
              ${data.orderStatus === 'completed' ? 'Thank you for your business! We hope to serve you again soon.' :
                data.orderStatus === 'cancelled' ? 'We apologize for any inconvenience. Please feel free to place a new order anytime.' :
                'Thank you for your patience as we process your order.'}
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
};