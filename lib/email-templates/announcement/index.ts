// Announcement Email Templates
// These templates are used for sending announcements to users

export interface AnnouncementEmailData {
  userName: string;
  userEmail: string;
  announcementTitle: string;
  announcementContent: string;
  announcementType: 'general' | 'maintenance' | 'feature' | 'promotion' | 'security' | 'policy';
  date: string;
  actionUrl?: string;
  actionText?: string;
  expiryDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export const announcementTemplates = {
  // General announcement to users
  userAnnouncement: (data: AnnouncementEmailData) => ({
    subject: `${data.announcementType === 'urgent' ? '[URGENT] ' : ''}${data.announcementTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.announcementTitle}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, ${
            data.announcementType === 'maintenance' ? '#f59e0b' :
            data.announcementType === 'security' ? '#ef4444' :
            data.announcementType === 'promotion' ? '#22c55e' :
            data.announcementType === 'feature' ? '#8b5cf6' :
            data.announcementType === 'policy' ? '#6b7280' :
            '#3b82f6'
          } 0%, ${
            data.announcementType === 'maintenance' ? '#d97706' :
            data.announcementType === 'security' ? '#dc2626' :
            data.announcementType === 'promotion' ? '#16a34a' :
            data.announcementType === 'feature' ? '#7c3aed' :
            data.announcementType === 'policy' ? '#4b5563' :
            '#1d4ed8'
          } 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">${data.announcementTitle}</h1>
            <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
              <div style="color: #ffffff; font-size: 40px;">${
                ''
              }</div>
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${data.userName},</h2>
            
            ${data.priority === 'urgent' || data.announcementType === 'security' ? `
            <!-- Urgent Notice -->
            <div style="background-color: #fef2f2; border-radius: 12px; padding: 20px; margin: 0 0 30px 0; border-left: 4px solid #ef4444;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
    
                <h3 style="color: #ef4444; margin: 0; font-size: 18px; font-weight: bold;">Important Notice</h3>
              </div>
              <p style="color: #7f1d1d; margin: 0; font-weight: 600;">This announcement requires your immediate attention.</p>
            </div>
            ` : ''}
            
            <!-- Announcement Content -->
            <div style="background-color: #f9fafb; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <div style="color: #4b5563; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${data.announcementContent}</div>
            </div>
            
            <!-- Announcement Details -->
            <div style="background-color: #f3f4f6; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; border-bottom: 2px solid ${
                data.announcementType === 'maintenance' ? '#f59e0b' :
                data.announcementType === 'security' ? '#ef4444' :
                data.announcementType === 'promotion' ? '#22c55e' :
                data.announcementType === 'feature' ? '#8b5cf6' :
                data.announcementType === 'policy' ? '#6b7280' :
                '#3b82f6'
              }; padding-bottom: 10px;">Announcement Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Type:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold; text-transform: capitalize;">${data.announcementType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Priority:</td>
                  <td style="padding: 8px 0; color: ${
                    data.priority === 'urgent' ? '#ef4444' :
                    data.priority === 'high' ? '#f59e0b' :
                    data.priority === 'medium' ? '#3b82f6' :
                    '#22c55e'
                  }; font-weight: bold; text-transform: capitalize;">${data.priority || 'Medium'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Date:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.date}</td>
                </tr>
                ${data.expiryDate ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Valid Until:</td>
                  <td style="padding: 8px 0; color: #ef4444; font-weight: bold;">${data.expiryDate}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            ${data.announcementType === 'maintenance' ? `
            <!-- Maintenance Notice -->
            <div style="background-color: #fef3c7; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">What to Expect:</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Temporary service interruption during maintenance</li>
                <li style="margin-bottom: 8px;">All data and settings will be preserved</li>
                <li style="margin-bottom: 8px;">Service will resume automatically after completion</li>
                <li style="margin-bottom: 8px;">You'll receive a notification when maintenance is complete</li>
              </ul>
            </div>
            ` : data.announcementType === 'feature' ? `
            <!-- New Feature Notice -->
            <div style="background-color: #f3e8ff; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #8b5cf6;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">What's New:</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Enhanced user experience and functionality</li>
                <li style="margin-bottom: 8px;">New features are available immediately</li>
                <li style="margin-bottom: 8px;">No action required from your side</li>
                <li style="margin-bottom: 8px;">Check out the new features in your dashboard</li>
              </ul>
            </div>
            ` : data.announcementType === 'promotion' ? `
            <!-- Promotion Notice -->
            <div style="background-color: #ecfdf5; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #22c55e;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Special Offer Details:</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Limited time offer - don't miss out!</li>
                <li style="margin-bottom: 8px;">Available to all registered users</li>
                <li style="margin-bottom: 8px;">Terms and conditions apply</li>
                ${data.expiryDate ? `<li style="margin-bottom: 8px;">Offer expires on ${data.expiryDate}</li>` : ''}
              </ul>
            </div>
            ` : data.announcementType === 'security' ? `
            <!-- Security Notice -->
            <div style="background-color: #fef2f2; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #ef4444;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Security Recommendations:</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Review your account security settings</li>
                <li style="margin-bottom: 8px;">Update your password if recommended</li>
                <li style="margin-bottom: 8px;">Enable two-factor authentication</li>
                <li style="margin-bottom: 8px;">Report any suspicious activity immediately</li>
              </ul>
            </div>
            ` : ''}
            
            ${data.actionUrl && data.actionText ? `
            <!-- Call to Action -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${data.actionUrl}" 
                 style="background: linear-gradient(135deg, ${
                   data.announcementType === 'maintenance' ? '#f59e0b' :
                   data.announcementType === 'security' ? '#ef4444' :
                   data.announcementType === 'promotion' ? '#22c55e' :
                   data.announcementType === 'feature' ? '#8b5cf6' :
                   data.announcementType === 'policy' ? '#6b7280' :
                   '#3b82f6'
                 } 0%, ${
                   data.announcementType === 'maintenance' ? '#d97706' :
                   data.announcementType === 'security' ? '#dc2626' :
                   data.announcementType === 'promotion' ? '#16a34a' :
                   data.announcementType === 'feature' ? '#7c3aed' :
                   data.announcementType === 'policy' ? '#4b5563' :
                   '#1d4ed8'
                 } 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                ${data.actionText}
              </a>
            </div>
            ` : ''}
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
              ${data.announcementType === 'maintenance' ? 'We apologize for any inconvenience and appreciate your patience during this maintenance period.' :
                data.announcementType === 'security' ? 'Your account security is our top priority. Please take the recommended actions to keep your account safe.' :
                data.announcementType === 'promotion' ? 'Thank you for being a valued customer. We hope you enjoy this special offer!' :
                data.announcementType === 'feature' ? 'We\'re excited to bring you these new features. Enjoy the enhanced experience!' :
                data.announcementType === 'policy' ? 'Please review the updated information carefully. Contact support if you have any questions.' :
                'Thank you for your attention to this announcement. We appreciate your continued support.'}
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              This is an automated announcement. Please do not reply to this email.
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

  // Newsletter-style announcement
  userNewsletter: (data: AnnouncementEmailData) => ({
    subject: `Newsletter: ${data.announcementTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Newsletter</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Newsletter</h1>
            <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
      
            </div>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">${data.date}</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">${data.announcementTitle}</h2>
            
            <!-- Newsletter Content -->
            <div style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 30px 0; white-space: pre-wrap;">${data.announcementContent}</div>
            
            ${data.actionUrl && data.actionText ? `
            <!-- Call to Action -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${data.actionUrl}" 
                 style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
                ${data.actionText}
              </a>
            </div>
            ` : ''}
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
              Thank you for being part of our community. We appreciate your continued support and engagement!
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              You're receiving this newsletter because you're a valued member of our community.
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