// API Email Templates
// These templates are used for API-related notifications to users

export interface ApiEmailData {
  userName: string;
  userEmail: string;
  apiKeyName?: string;
  apiKeyId?: string;
  apiEndpoint?: string;
  requestCount?: number;
  rateLimitInfo?: string;
  date: string;
  userId?: string;
  errorMessage?: string;
  statusCode?: number;
  ipAddress?: string;
}

export const apiTemplates = {
  // User notification for new API key generation
  userApiKeyGenerated: (data: ApiEmailData) => ({
    subject: 'New API Key Generated Successfully',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Key Generated</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">API Key Generated</h1>
            <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
      
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${data.userName},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Your new API key has been successfully generated and is ready to use. Please store it securely as it won't be displayed again.
            </p>
            
            <!-- API Key Details -->
            <div style="background-color: #f3f4f6; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">API Key Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${data.apiKeyName ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Key Name:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.apiKeyName}</td>
                </tr>
                ` : ''}
                ${data.apiKeyId ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Key ID:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.apiKeyId}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Status:</td>
                  <td style="padding: 8px 0; color: #22c55e; font-weight: bold;">Active</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Generated:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.date}</td>
                </tr>
                ${data.rateLimitInfo ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Rate Limit:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.rateLimitInfo}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <!-- Security Notice -->
            <div style="background-color: #fef3c7; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Security Best Practices:</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Store your API key securely and never share it publicly</li>
                <li style="margin-bottom: 8px;">Use environment variables to store the key in your applications</li>
                <li style="margin-bottom: 8px;">Regenerate your key if you suspect it has been compromised</li>
                <li style="margin-bottom: 8px;">Monitor your API usage regularly for unusual activity</li>
              </ul>
            </div>
            
            <!-- API Documentation -->
            <div style="background-color: #e0f2fe; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Getting Started:</h3>
              <p style="color: #4b5563; margin: 0 0 15px 0;">Include your API key in the request headers:</p>
              <div style="background-color: #1f2937; color: #e5e7eb; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 14px; overflow-x: auto;">
                Authorization: Bearer YOUR_API_KEY
              </div>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/api/documentation" 
                 style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); margin-right: 10px;">
                View API Documentation
              </a>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/api-keys" 
                 style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);">
                Manage API Keys
              </a>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
              If you have any questions about using our API, please don't hesitate to contact our support team.
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

  // User notification for API rate limit exceeded
  userApiRateLimitExceeded: (data: ApiEmailData) => ({
    subject: 'API Rate Limit Exceeded - Action Required',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Rate Limit Exceeded</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Rate Limit Exceeded</h1>
            <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
      
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${data.userName},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Your API usage has exceeded the allowed rate limit. Some of your recent API requests may have been throttled or rejected.
            </p>
            
            <!-- Usage Details -->
            <div style="background-color: #fef3c7; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Usage Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${data.requestCount ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Requests Made:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.requestCount}</td>
                </tr>
                ` : ''}
                ${data.rateLimitInfo ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Rate Limit:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.rateLimitInfo}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Status:</td>
                  <td style="padding: 8px 0; color: #f59e0b; font-weight: bold;">Rate Limited</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Time:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.date}</td>
                </tr>
                ${data.ipAddress ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">IP Address:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.ipAddress}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <!-- What to do -->
            <div style="background-color: #e0f2fe; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">What you can do:</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Wait for the rate limit window to reset (usually 1 hour)</li>
                <li style="margin-bottom: 8px;">Implement exponential backoff in your API calls</li>
                <li style="margin-bottom: 8px;">Consider upgrading to a higher tier plan for increased limits</li>
                <li style="margin-bottom: 8px;">Optimize your API usage to reduce unnecessary requests</li>
              </ul>
            </div>
            
            <!-- Rate Limit Guidelines -->
            <div style="background-color: #f3f4f6; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Rate Limit Guidelines:</h3>
              <div style="background-color: #ffffff; border-radius: 8px; padding: 15px; border: 1px solid #e5e7eb;">
                <p style="color: #4b5563; margin: 0 0 10px 0; font-size: 14px;"><strong>Best Practices:</strong></p>
                <ul style="color: #6b7280; margin: 0; padding-left: 20px; font-size: 14px;">
                  <li>Check response headers for rate limit information</li>
                  <li>Implement proper error handling for 429 status codes</li>
                  <li>Use caching to reduce API calls where possible</li>
                  <li>Batch requests when the API supports it</li>
                </ul>
              </div>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/api-usage" 
                 style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); margin-right: 10px;">
                View API Usage
              </a>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" 
                 style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);">
                Upgrade Plan
              </a>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
              If you need assistance with optimizing your API usage or have questions about rate limits, please contact our support team.
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

  // User notification for API error/failure
  userApiError: (data: ApiEmailData) => ({
    subject: `API Error Alert - ${data.statusCode ? `Status ${data.statusCode}` : 'Service Issue'}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Error Alert</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">API Error Alert</h1>
            <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
      
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${data.userName},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              We've detected an error with your API requests. Please review the details below and take appropriate action.
            </p>
            
            <!-- Error Details -->
            <div style="background-color: #fef2f2; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #ef4444;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Error Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${data.statusCode ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Status Code:</td>
                  <td style="padding: 8px 0; color: #ef4444; font-weight: bold;">${data.statusCode}</td>
                </tr>
                ` : ''}
                ${data.errorMessage ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Error Message:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.errorMessage}</td>
                </tr>
                ` : ''}
                ${data.apiEndpoint ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Endpoint:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.apiEndpoint}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Time:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.date}</td>
                </tr>
                ${data.ipAddress ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">IP Address:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${data.ipAddress}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <!-- Troubleshooting Steps -->
            <div style="background-color: #f3f4f6; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Troubleshooting Steps:</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Check your API key and ensure it's valid and active</li>
                <li style="margin-bottom: 8px;">Verify the request format and required parameters</li>
                <li style="margin-bottom: 8px;">Review the API documentation for the endpoint</li>
                <li style="margin-bottom: 8px;">Check if you've exceeded your rate limits</li>
                <li style="margin-bottom: 8px;">Ensure your account has sufficient permissions</li>
              </ul>
            </div>
            
            <!-- Common Error Codes -->
            <div style="background-color: #e0f2fe; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Common Error Codes:</h3>
              <div style="background-color: #ffffff; border-radius: 8px; padding: 15px; border: 1px solid #e5e7eb;">
                <ul style="color: #6b7280; margin: 0; padding-left: 20px; font-size: 14px;">
                  <li><strong>400:</strong> Bad Request - Check your request format</li>
                  <li><strong>401:</strong> Unauthorized - Invalid or missing API key</li>
                  <li><strong>403:</strong> Forbidden - Insufficient permissions</li>
                  <li><strong>429:</strong> Too Many Requests - Rate limit exceeded</li>
                  <li><strong>500:</strong> Internal Server Error - Contact support</li>
                </ul>
              </div>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/api/documentation" 
                 style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); margin-right: 10px;">
                View Documentation
              </a>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/support" 
                 style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
                Contact Support
              </a>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
              If you continue to experience issues, please don't hesitate to contact our technical support team for assistance.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              This is an automated error alert. Please do not reply to this email.
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