// Email Templates - Main Export File
// This file imports and re-exports all email templates from their respective folders

// Import all template categories
import { contactMessageTemplates, type ContactMessageEmailData, type AdminReplyEmailData } from './email-templates/contact-message';
import { transactionTemplates, type TransactionEmailData } from './email-templates/transaction';
import { supportTicketTemplates, type SupportTicketEmailData } from './email-templates/support-ticket';
import { newOrderTemplates, type NewOrderEmailData } from './email-templates/new-order';
import { announcementTemplates, type AnnouncementEmailData } from './email-templates/announcement';
import { apiTemplates, type ApiEmailData } from './email-templates/api';
import { accountTemplates, type AccountEmailData } from './email-templates/account';
import { createEmailTemplate, emailContentSections, type EmailLayoutData } from './email-templates/shared/email-layout';

// Re-export all interfaces
export type {
  ContactMessageEmailData,
  AdminReplyEmailData,
  TransactionEmailData,
  SupportTicketEmailData,
  NewOrderEmailData,
  AnnouncementEmailData,
  ApiEmailData,
  AccountEmailData,
};

// General email templates (keeping existing ones that don't fit into categories)
export const emailTemplates = {
  // Welcome email template
  welcome: (data: { userName: string; userEmail: string }) => {
    const layoutData: EmailLayoutData = {
      title: 'Welcome to Our Platform!',
      headerColor: 'blue',
      footerMessage: 'Welcome to our community',
      userEmail: data.userEmail
    };
    
    const content = `
      ${emailContentSections.greeting(data.userName)}
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Thank you for joining our platform. We're excited to have you on board.
      </p>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        Your account has been successfully created with email: ${data.userEmail}
      </p>
      ${emailContentSections.ctaButton('Get Started', `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)}
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
        Best regards,<br>The Team
      </p>
    `;
    
    return {
      subject: 'Welcome to Our Platform!',
      html: createEmailTemplate(layoutData, content)
    };
  },
};

// Re-export all template categories
export const contactEmailTemplates = contactMessageTemplates;
export const transactionEmailTemplates = transactionTemplates;
export const supportTicketEmailTemplates = supportTicketTemplates;
export const newOrderEmailTemplates = newOrderTemplates;
export const announcementEmailTemplates = announcementTemplates;
export const apiEmailTemplates = apiTemplates;
export const accountEmailTemplates = accountTemplates;

// Legacy exports for backward compatibility
export const paymentSuccess = transactionTemplates.paymentSuccess;
export const paymentCancelled = transactionTemplates.paymentCancelled;
export const adminPendingReview = transactionTemplates.adminPendingReview;
export const adminAutoApproved = transactionTemplates.adminAutoApproved;

// All contact email templates have been moved to ./email-templates/contact-message

// All transaction email templates have been moved to ./email-templates/transaction
