// SMS Service for sending notifications
// This can be integrated with various SMS providers like Twilio, Nexmo, or local BD SMS services

interface SMSOptions {
  to: string;
  message: string;
}

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// SMS Templates
export const smsTemplates = {
  paymentSuccess: (userName: string, amount: number, transactionId: string) => 
    `Dear ${userName}, your payment of ৳${amount} has been successfully processed. Transaction ID: ${transactionId}. Your account balance has been updated. Thank you! - SMM Panel`,
  
  paymentPending: (userName: string, amount: number, transactionId: string) => 
    `Dear ${userName}, your payment of ৳${amount} is being processed. Transaction ID: ${transactionId}. You will be notified once approved. - SMM Panel`,
  
  paymentCancelled: (userName: string, amount: number, transactionId: string) => 
    `Dear ${userName}, your payment of ৳${amount} has been cancelled. Transaction ID: ${transactionId}. Please contact support if needed. - SMM Panel`,
};

// Mock SMS service - Replace with actual SMS provider
export const sendSMS = async ({ to, message }: SMSOptions): Promise<SMSResponse> => {
  try {
    // Validate phone number format
    if (!to || !isValidBangladeshiPhone(to)) {
      return {
        success: false,
        error: 'Invalid phone number format'
      };
    }

    // Clean phone number
    const cleanPhone = cleanPhoneNumber(to);
    
    console.log('SMS Service - Sending SMS:', {
      to: cleanPhone,
      message: message.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    });

    // TODO: Replace with actual SMS provider integration
    // Example integrations:
    
    // 1. Twilio Integration
    // const twilioClient = twilio(accountSid, authToken);
    // const result = await twilioClient.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: cleanPhone
    // });
    
    // 2. Local BD SMS Provider (e.g., SSL Wireless, Grameenphone)
    // const response = await fetch('https://api.sslwireless.com/api/v3/send-sms', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.SMS_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     to: cleanPhone,
    //     message: message,
    //     sender_id: process.env.SMS_SENDER_ID
    //   })
    // });
    
    // For now, simulate successful SMS sending
    const mockMessageId = `SMS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log SMS for debugging (in production, you might want to store this in database)
    console.log('SMS Sent Successfully:', {
      messageId: mockMessageId,
      to: cleanPhone,
      message,
      sentAt: new Date().toISOString()
    });
    
    return {
      success: true,
      messageId: mockMessageId
    };
    
  } catch (error) {
    console.error('SMS Service Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown SMS error'
    };
  }
};

// Utility functions
export const isValidBangladeshiPhone = (phone: string): boolean => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's a valid Bangladeshi phone number
  // Bangladeshi mobile numbers: +880 1XXXXXXXXX (11 digits total)
  // Without country code: 01XXXXXXXXX (11 digits)
  // With country code: 8801XXXXXXXXX (13 digits)
  
  if (cleanPhone.length === 11 && cleanPhone.startsWith('01')) {
    return true; // 01XXXXXXXXX format
  }
  
  if (cleanPhone.length === 13 && cleanPhone.startsWith('880')) {
    return true; // 8801XXXXXXXXX format
  }
  
  if (cleanPhone.length === 14 && cleanPhone.startsWith('8801')) {
    return true; // +8801XXXXXXXXX format
  }
  
  return false;
};

export const cleanPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  let cleanPhone = phone.replace(/\D/g, '');
  
  // Convert to international format (+8801XXXXXXXXX)
  if (cleanPhone.length === 11 && cleanPhone.startsWith('01')) {
    cleanPhone = '880' + cleanPhone; // Add country code
  }
  
  if (cleanPhone.length === 13 && cleanPhone.startsWith('880')) {
    cleanPhone = '+' + cleanPhone; // Add + prefix
  }
  
  return cleanPhone;
};

// SMS logging for audit trail
export const logSMS = async (smsData: {
  userId?: string;
  phone: string;
  message: string;
  status: 'sent' | 'failed';
  messageId?: string;
  error?: string;
}) => {
  try {
    // In a real application, you might want to store SMS logs in database
    console.log('SMS Log:', {
      ...smsData,
      timestamp: new Date().toISOString()
    });
    
    // TODO: Store in database if needed
    // await db.smsLog.create({
    //   data: {
    //     userId: smsData.userId,
    //     phone: smsData.phone,
    //     message: smsData.message,
    //     status: smsData.status,
    //     messageId: smsData.messageId,
    //     error: smsData.error,
    //     sentAt: new Date()
    //   }
    // });
    
  } catch (error) {
    console.error('Error logging SMS:', error);
  }
};

// Bulk SMS sending (for future use)
export const sendBulkSMS = async (recipients: Array<{ phone: string; message: string }>): Promise<SMSResponse[]> => {
  const results: SMSResponse[] = [];
  
  for (const recipient of recipients) {
    const result = await sendSMS({
      to: recipient.phone,
      message: recipient.message
    });
    results.push(result);
    
    // Add delay between SMS to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
};
