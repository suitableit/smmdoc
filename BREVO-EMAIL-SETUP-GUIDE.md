# Brevo Email Configuration Guide

## Issue Identified
The current email configuration is failing because:
1. `EMAIL_SERVER_USER` is set to `57bf8a001@smtp-brevo.com` (incorrect format)
2. This should be your actual email address registered with Brevo
3. The password should be your Brevo SMTP key, not a regular password

## Correct Brevo SMTP Configuration

### Step 1: Get Your Brevo Credentials
1. Go to [Brevo Dashboard](https://app.brevo.com)
2. Navigate to **Settings** > **SMTP & API**
3. Find your SMTP credentials:
   - **SMTP Server**: `smtp-relay.brevo.com`
   - **Port**: `587`
   - **Username**: Your email address (e.g., `your-email@domain.com`)
   - **Password**: Your SMTP key (not your account password)

### Step 2: Update Your .env File
```env
# Email Configuration for Brevo
EMAIL_SERVER_USER=your-actual-email@domain.com
EMAIL_SERVER_PASSWORD=your-brevo-smtp-key-here
EMAIL_SERVER_HOST=smtp-relay.brevo.com
EMAIL_SERVER_PORT=587
EMAIL_FROM=your-actual-email@domain.com
```

### Step 3: Verify Your Domain (if using custom domain)
If you're using a custom domain email:
1. Add your domain in Brevo
2. Verify domain ownership
3. Set up SPF and DKIM records

## Common Issues and Solutions

### Authentication Failed (535 5.7.8)
- **Cause**: Wrong username or SMTP key
- **Solution**: Double-check your email and SMTP key from Brevo dashboard

### Invalid Email Format
- **Cause**: Using SMTP server address as username
- **Solution**: Use your actual email address as username

### Rate Limiting
- **Cause**: Too many requests
- **Solution**: Brevo has daily sending limits based on your plan

## Testing Your Configuration

After updating your .env file, test with:
```bash
node test-email.js
```

## Example Working Configuration
```env
EMAIL_SERVER_USER=john@example.com
EMAIL_SERVER_PASSWORD=xkeysib-a1b2c3d4e5f6...
EMAIL_SERVER_HOST=smtp-relay.brevo.com
EMAIL_SERVER_PORT=587
EMAIL_FROM=john@example.com
```

## Next Steps
1. Update your .env file with correct Brevo credentials
2. Restart your application
3. Test email functionality
4. Monitor Brevo dashboard for sending statistics