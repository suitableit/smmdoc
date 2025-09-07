// Account Email Templates
// These templates are used for account-related notifications to users

export interface AccountEmailData {
  userName: string;
  userEmail: string;
  oldEmail?: string;
  newEmail?: string;
  oldPassword?: boolean;
  newPassword?: boolean;
  loginTime?: string;
  ipAddress?: string;
  device?: string;
  location?: string;
  date: string;
  userId?: string;
  verificationCode?: string;
  resetToken?: string;
  accountStatus?: string;
  suspensionReason?: string;
}

export const accountTemplates = {
  // User notification for email change
  userEmailChanged: (data: AccountEmailData) => ({
    subject: 'Email Address Changed Successfully',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Changed</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Email Address Updated</h1>
            <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
      
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${data.userName},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Your email address has been successfully updated. This change will take effect immediately for all future communications.
            </p>
            
            <!-- Change Details -->
            <div style="background-color: #f3f4f6; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">Change Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${data.oldEmail ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Previous Email:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.oldEmail}</td>
                </tr>
                ` : ''}
                ${data.newEmail ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">New Email:</td>
                  <td style="padding: 8px 0; color: #22c55e; font-weight: bold;">${data.newEmail}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Changed On:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.date}</td>
                </tr>
                ${data.ipAddress ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">IP Address:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.ipAddress}</td>
                </tr>
                ` : ''}
                ${data.device ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Device:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.device}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <!-- Security Notice -->
            <div style="background-color: #fef3c7; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Security Notice:</h3>
              <p style="color: #4b5563; margin: 0 0 15px 0;">If you did not make this change, please contact our support team immediately. Your account security is important to us.</p>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">All future notifications will be sent to your new email address</li>
                <li style="margin-bottom: 8px;">Your login credentials remain the same</li>
                <li style="margin-bottom: 8px;">Consider updating your password for additional security</li>
              </ul>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/account" 
                 style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); margin-right: 10px;">
                Manage Account
              </a>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/support" 
                 style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);">
                Contact Support
              </a>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
              Thank you for keeping your account information up to date. If you have any questions, please don't hesitate to contact us.
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

  // User notification for password change
  userPasswordChanged: (data: AccountEmailData) => ({
    subject: 'Password Changed Successfully',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Password Updated</h1>
            <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
      
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${data.userName},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Your account password has been successfully changed. Your account is now secured with your new password.
            </p>
            
            <!-- Change Details -->
            <div style="background-color: #f3f4f6; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">Security Update</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Status:</td>
                  <td style="padding: 8px 0; color: #22c55e; font-weight: bold;">Password Updated</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Changed On:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.date}</td>
                </tr>
                ${data.ipAddress ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">IP Address:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.ipAddress}</td>
                </tr>
                ` : ''}
                ${data.device ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Device:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.device}</td>
                </tr>
                ` : ''}
                ${data.location ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Location:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.location}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <!-- Security Alert -->
            <div style="background-color: #fef2f2; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #ef4444;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Important Security Alert:</h3>
              <p style="color: #4b5563; margin: 0 0 15px 0;"><strong>If you did not change your password, your account may be compromised.</strong></p>
              <p style="color: #4b5563; margin: 0 0 15px 0;">Please take immediate action:</p>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Contact our support team immediately</li>
                <li style="margin-bottom: 8px;">Review your recent account activity</li>
                <li style="margin-bottom: 8px;">Enable two-factor authentication if not already active</li>
                <li style="margin-bottom: 8px;">Check for any unauthorized changes to your account</li>
              </ul>
            </div>
            
            <!-- Security Tips -->
            <div style="background-color: #e0f2fe; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Password Security Tips:</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Use a unique password that you don't use elsewhere</li>
                <li style="margin-bottom: 8px;">Include a mix of uppercase, lowercase, numbers, and symbols</li>
                <li style="margin-bottom: 8px;">Avoid using personal information in your password</li>
                <li style="margin-bottom: 8px;">Consider using a password manager</li>
                <li style="margin-bottom: 8px;">Enable two-factor authentication for extra security</li>
              </ul>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/security" 
                 style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); margin-right: 10px;">
                Security Settings
              </a>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/support" 
                 style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
                Report Issue
              </a>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
              Your account security is our priority. If you have any concerns or questions, please contact our support team immediately.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              This is an automated security notification. Please do not reply to this email.
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

  // User notification for suspicious login activity
  userSuspiciousLogin: (data: AccountEmailData) => ({
    subject: 'Suspicious Login Activity Detected',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Suspicious Login Activity</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Security Alert</h1>
            <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
      
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${data.userName},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              We've detected a login to your account from an unusual location or device. If this was you, you can ignore this message. If not, please take immediate action to secure your account.
            </p>
            
            <!-- Login Details -->
            <div style="background-color: #fef3c7; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Login Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${data.loginTime ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Login Time:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.loginTime}</td>
                </tr>
                ` : ''}
                ${data.ipAddress ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">IP Address:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.ipAddress}</td>
                </tr>
                ` : ''}
                ${data.device ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Device:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.device}</td>
                </tr>
                ` : ''}
                ${data.location ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Location:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.location}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Status:</td>
                  <td style="padding: 8px 0; color: #f59e0b; font-weight: bold;">Suspicious Activity</td>
                </tr>
              </table>
            </div>
            
            <!-- Action Required -->
            <div style="background-color: #fef2f2; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #ef4444;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">If this wasn't you:</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Change your password immediately</li>
                <li style="margin-bottom: 8px;">Enable two-factor authentication</li>
                <li style="margin-bottom: 8px;">Review your recent account activity</li>
                <li style="margin-bottom: 8px;">Contact our support team</li>
                <li style="margin-bottom: 8px;">Log out of all devices</li>
              </ul>
            </div>
            
            <!-- If it was you -->
            <div style="background-color: #f0fdf4; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #22c55e;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">If this was you:</h3>
              <p style="color: #4b5563; margin: 0 0 15px 0;">You can safely ignore this email. However, we recommend:</p>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Adding this device to your trusted devices</li>
                <li style="margin-bottom: 8px;">Enabling two-factor authentication for extra security</li>
                <li style="margin-bottom: 8px;">Using a VPN if you frequently travel</li>
              </ul>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/security" 
                 style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); margin-right: 10px;">
                Secure My Account
              </a>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/activity" 
                 style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                View Activity
              </a>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
              We take your account security seriously. If you have any concerns or need assistance, please contact our support team immediately.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              This is an automated security alert. Please do not reply to this email.
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

  // User notification for account verification
  userAccountVerification: (data: AccountEmailData) => ({
    subject: 'Verify Your Account - Action Required',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Verification</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Verify Your Account</h1>
            <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
      
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${data.userName},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Thank you for creating an account with us! To complete your registration and start using all our features, please verify your email address.
            </p>
            
            <!-- Verification Code -->
            ${data.verificationCode ? `
            <div style="background-color: #f3f4f6; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Your Verification Code</h3>
              <div style="background-color: #ffffff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; display: inline-block; font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 4px;">
                ${data.verificationCode}
              </div>
              <p style="color: #6b7280; font-size: 14px; margin: 15px 0 0 0;">This code expires in 15 minutes</p>
            </div>
            ` : ''}
            
            <!-- Instructions -->
            <div style="background-color: #e0f2fe; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Verification Steps:</h3>
              <ol style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Copy the verification code above</li>
                <li style="margin-bottom: 8px;">Return to the verification page in your browser</li>
                <li style="margin-bottom: 8px;">Paste the code in the verification field</li>
                <li style="margin-bottom: 8px;">Click "Verify Account" to complete the process</li>
              </ol>
            </div>
            
            <!-- Benefits -->
            <div style="background-color: #f0fdf4; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #22c55e;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">After verification, you'll be able to:</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Access all premium features</li>
                <li style="margin-bottom: 8px;">Receive important account notifications</li>
                <li style="margin-bottom: 8px;">Reset your password if needed</li>
                <li style="margin-bottom: 8px;">Enjoy full account security</li>
              </ul>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-account" 
                 style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); font-size: 18px;">
                Verify My Account
              </a>
            </div>
            
            <!-- Help -->
            <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin: 30px 0;">
              <h4 style="color: #1f2937; margin: 0 0 10px 0; font-size: 16px;">Need Help?</h4>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">If you're having trouble with verification or didn't request this account, please contact our support team.</p>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
              Welcome to our platform! We're excited to have you on board.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              This verification email was sent to ${data.userEmail}. If you didn't create this account, please ignore this email.
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