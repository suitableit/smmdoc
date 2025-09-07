// Support Ticket Email Templates
// These templates are used for support ticket notifications to users and admins

export interface SupportTicketEmailData {
  userName: string;
  userEmail: string;
  ticketId: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  date: string;
  userId?: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  adminResponse?: string;
}

export const supportTicketTemplates = {
  // User notification when ticket is created
  userTicketCreated: (data: SupportTicketEmailData) => ({
    subject: `Support Ticket Created - #${data.ticketId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Support Ticket Created</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Support Ticket Created</h1>
            <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
      
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${data.userName},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Thank you for contacting our support team. Your ticket has been successfully created and assigned a unique ID. Our team will review your request and respond as soon as possible.
            </p>
            
            <!-- Ticket Details -->
            <div style="background-color: #f3f4f6; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Ticket Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Ticket ID:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">#${data.ticketId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Subject:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.subject}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Category:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.category}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Priority:</td>
                  <td style="padding: 8px 0; color: ${data.priority === 'urgent' ? '#ef4444' : data.priority === 'high' ? '#f59e0b' : data.priority === 'medium' ? '#3b82f6' : '#22c55e'}; font-weight: bold; text-transform: capitalize;">${data.priority}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Status:</td>
                  <td style="padding: 8px 0; color: #3b82f6; font-weight: bold;">Open</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Created:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.date}</td>
                </tr>
              </table>
            </div>
            
            <!-- Message -->
            <div style="background-color: #f9fafb; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Your Message:</h3>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${data.message}</p>
            </div>
            
            <!-- Response Time -->
            <div style="background-color: #e0f2fe; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Expected Response Time:</h3>
              <p style="color: #4b5563; margin: 0;">
                ${data.priority === 'urgent' ? '• Urgent tickets: Within 2-4 hours' : 
                  data.priority === 'high' ? '• High priority tickets: Within 4-8 hours' :
                  data.priority === 'medium' ? '• Medium priority tickets: Within 12-24 hours' :
                  '• Low priority tickets: Within 24-48 hours'}
              </p>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/support/tickets/${data.ticketId}" 
                 style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                View Ticket Status
              </a>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
              You will receive email notifications when our team responds to your ticket. Thank you for your patience!
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

  // Admin notification when new ticket is created
  adminNewTicket: (data: SupportTicketEmailData) => ({
    subject: `New Support Ticket - #${data.ticketId} [${data.priority.toUpperCase()}]`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Support Ticket</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">New Support Ticket</h1>
            <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
      
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              A new support ticket has been submitted and requires attention.
            </p>
            
            <!-- Ticket Details -->
            <div style="background-color: ${data.priority === 'urgent' ? '#fef2f2' : data.priority === 'high' ? '#fef3c7' : '#f3f4f6'}; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid ${data.priority === 'urgent' ? '#ef4444' : data.priority === 'high' ? '#f59e0b' : '#3b82f6'};">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Ticket Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Ticket ID:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">#${data.ticketId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">User:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.userName} (${data.userEmail})</td>
                </tr>
                ${data.userId ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">User ID:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.userId}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Subject:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.subject}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Category:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.category}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Priority:</td>
                  <td style="padding: 8px 0; color: ${data.priority === 'urgent' ? '#ef4444' : data.priority === 'high' ? '#f59e0b' : data.priority === 'medium' ? '#3b82f6' : '#22c55e'}; font-weight: bold; text-transform: uppercase;">${data.priority}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Created:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.date}</td>
                </tr>
              </table>
            </div>
            
            <!-- User Message -->
            <div style="background-color: #f9fafb; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">User Message:</h3>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0; white-space: pre-wrap; background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">${data.message}</p>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/support/tickets/${data.ticketId}" 
                 style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                Respond to Ticket
              </a>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
              Please respond to this ticket as soon as possible based on its priority level.
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

  // User notification when admin responds to ticket
  userTicketResponse: (data: SupportTicketEmailData) => ({
    subject: `Support Ticket Update - #${data.ticketId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Support Ticket Response</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Support Team Response</h1>
            <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
      
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${data.userName},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Our support team has responded to your ticket. Please review the response below and let us know if you need any additional assistance.
            </p>
            
            <!-- Ticket Details -->
            <div style="background-color: #f3f4f6; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">Ticket Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Ticket ID:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">#${data.ticketId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Subject:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.subject}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Status:</td>
                  <td style="padding: 8px 0; color: #22c55e; font-weight: bold; text-transform: capitalize;">${data.status || 'In Progress'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Updated:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.date}</td>
                </tr>
              </table>
            </div>
            
            <!-- Admin Response -->
            <div style="background-color: #ecfdf5; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #22c55e;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Support Team Response:</h3>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0; white-space: pre-wrap; background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #d1fae5;">${data.adminResponse || 'Response content will be displayed here.'}</p>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/support/tickets/${data.ticketId}" 
                 style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                View Full Conversation
              </a>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
              If this response resolves your issue, you can close the ticket. Otherwise, feel free to reply with additional questions or information.
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