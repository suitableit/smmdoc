// Shared Email Layout Components
// These templates provide consistent header and footer across all email types

export interface EmailLayoutData {
  title: string;
  headerColor?: 'primary-color';
  footerMessage?: string;
  userEmail?: string;
}

// Header template with primary color gradient
export const emailHeader = (data: EmailLayoutData) => {
  // Use CSS variables for primary color gradient
  const gradient = 'linear-gradient(135deg, var(--primary, #5f1de8) 0%, var(--secondary, #b131f8) 100%)';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: ${gradient}; padding: 30px; text-align: center; box-shadow: 0 4px 12px rgba(95, 29, 232, 0.3);">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">${data.title}</h1>
          <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
            
          </div>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
  `;
};

// Footer template with consistent styling
export const emailFooter = (data: EmailLayoutData) => {
  const defaultMessage = "This is an automated message. Please do not reply to this email.";
  const footerMessage = data.footerMessage || defaultMessage;
  const emailText = data.userEmail ? `This email was sent to ${data.userEmail}.` : "";
  
  return `
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            ${footerMessage} ${emailText}
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
  `;
};

// Complete email wrapper function
export const createEmailTemplate = (layoutData: EmailLayoutData, content: string) => {
  return emailHeader(layoutData) + content + emailFooter(layoutData);
};

// Common content sections
export const emailContentSections = {
  // Standard greeting
  greeting: (userName: string) => `
    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${userName},</h2>
  `,
  
  // Call to action buttons - all using purple gradient for consistency
  actionButtons: (buttons: Array<{text: string, url: string}>) => {
    // Use primary color gradient for all buttons
    const primaryStyle = 'background: linear-gradient(135deg, var(--primary, #5f1de8) 0%, var(--secondary, #b131f8) 100%); box-shadow: 0 4px 12px rgba(95, 29, 232, 0.3);';
    
    const buttonHtml = buttons.map(button => {
      return `
        <a href="${button.url}" 
           style="${primaryStyle} color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 0 5px 10px 5px;">
          ${button.text}
        </a>
      `;
    }).join('');
    
    return `
      <div style="text-align: center; margin: 40px 0;">
        ${buttonHtml}
      </div>
    `;
  },

  // CTA Button - single button with primary styling
  ctaButton: (text: string, url: string) => {
    const primaryStyle = 'background: linear-gradient(135deg, var(--primary, #5f1de8) 0%, var(--secondary, #b131f8) 100%); box-shadow: 0 4px 12px rgba(95, 29, 232, 0.3);';
    
    return `
      <div style="text-align: center; margin: 40px 0;">
        <a href="${url}" 
           style="${primaryStyle} color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          ${text}
        </a>
      </div>
    `;
  },
  
  // Information table
  infoTable: (rows: Array<{label: string, value: string, valueColor?: string}>) => {
    const tableRows = rows.map(row => `
      <tr>
        <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">${row.label}:</td>
        <td style="padding: 8px 0; color: ${row.valueColor || '#1f2937'}; font-weight: bold;">${row.value}</td>
      </tr>
    `).join('');
    
    return `
      <div style="background-color: #f3f4f6; border-radius: 12px; padding: 25px; margin: 30px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          ${tableRows}
        </table>
      </div>
    `;
  },
  
  // Alert boxes with primary color styling
  alertBox: (content: string) => {
    // Use primary color for all alert boxes
    const primaryStyle = 'background-color: rgba(95, 29, 232, 0.1); border-left: 4px solid var(--primary, #5f1de8);';
    
    return `
      <div style="${primaryStyle} border-radius: 12px; padding: 25px; margin: 30px 0;">
        ${content}
      </div>
    `;
  }
};