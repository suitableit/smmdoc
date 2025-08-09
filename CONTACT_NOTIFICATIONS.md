# Contact Notification System Documentation

## Overview
This document describes the contact notification system that sends email and SMS notifications when users submit contact messages and when admins reply to them.

## Features

### 1. User to Admin Notifications
When a user submits a new contact message via the contact form:
- **Email notification** is sent to the admin email address
- **SMS notification** is sent to the admin phone number (if configured)

### 2. Admin to User Notifications
When an admin replies to a user's contact message:
- **Email notification** is sent to the user's email address
- **SMS notification** is sent to the user's phone number (if available and valid)

## Configuration

### Environment Variables
Add the following variables to your `.env` file:

```bash
# Admin contact notifications
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PHONE=+8801XXXXXXXXX  # Bangladeshi format: +8801XXXXXXXXX
```

### Email Configuration
Ensure your email configuration is properly set up in `.env`:

```bash
EMAIL_FROM=noreply@yourdomain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### SMS Configuration (Optional)
For SMS notifications, configure your preferred SMS provider:

#### Twilio (International)
```bash
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

#### Bangladeshi SMS Providers
```bash
SMS_PROVIDER=sslwireless
SSLWIRELESS_API_KEY=your-sslwireless-api-key
SSLWIRELESS_SID=your-sslwireless-sid
```

## Email Templates

### Admin Notification Template
**Subject**: New Contact Message - [Subject]
**Content**: Includes user details, message subject, category, and full message

### User Notification Template
**Subject**: Response to your message - [Subject]
**Content**: Includes admin reply, original message, and admin name

## SMS Templates

### Admin SMS
```
New contact message from [Username]: [Subject]... Check admin panel.
```

### User SMS
```
Response received for your message "[Subject]...". Check your email or login to view.
```

## Testing the System

### Test User Submission
1. Go to the contact page (`/contact-support`)
2. Fill out the contact form
3. Submit the form
4. Check admin email and SMS for notifications

### Test Admin Reply
1. Go to admin panel contact messages
2. Select a message and click reply
3. Enter your reply and submit
4. Check user's email and SMS for notifications

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check email configuration in `.env`
   - Verify email credentials are correct
   - Check server logs for errors

2. **SMS not sending**
   - Verify SMS provider configuration
   - Check phone number format (+8801XXXXXXXXX)
   - Check SMS provider balance/credits

3. **Notifications not received**
   - Verify `ADMIN_EMAIL` and `ADMIN_PHONE` are set
   - Check if user has valid email/phone
   - Check spam/junk folders for emails

### Debug Mode
Add logging to monitor notifications:

```javascript
// In your .env file
DEBUG=true
```

## Security Considerations

- Email addresses and phone numbers are validated before sending
- SMS is only sent to valid Bangladeshi phone numbers
- All notifications include appropriate unsubscribe mechanisms
- No sensitive data is exposed in SMS messages

## API Endpoints

### User Contact Submission
- **POST** `/api/contact-support`
- **Description**: Submit new contact message
- **Notifications**: Sends admin notifications

### Admin Reply
- **PUT** `/api/admin/contact-messages/[id]`
- **Description**: Reply to contact message
- **Parameters**: `action=reply&message=[reply_text]`
- **Notifications**: Sends user notifications

## Technical Details

### Files Modified
- `lib/email-templates.ts` - Added contact notification templates
- `lib/sms.ts` - Added contact SMS templates
- `app/api/contact-support/route.ts` - Added admin notifications
- `app/api/admin/contact-messages/[id]/route.ts` - Added user notifications

### Error Handling
- Notification failures don't affect the main operation
- Errors are logged but don't break the user experience
- Graceful degradation if notification services are unavailable

## Support
For issues with the contact notification system, please check:
1. Environment variable configuration
2. Email/SMS provider settings
3. Server logs for error messages
4. User contact details (email/phone) are valid