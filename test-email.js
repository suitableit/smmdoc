// Test email functionality
require('dotenv').config();

const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('EMAIL_SERVER_USER:', process.env.EMAIL_SERVER_USER);
  console.log('EMAIL_SERVER_HOST:', process.env.EMAIL_SERVER_HOST);
  console.log('EMAIL_SERVER_PORT:', process.env.EMAIL_SERVER_PORT);
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_SERVER_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
    pool: true,
    maxConnections: 1,
    rateDelta: 20000,
    rateLimit: 5,
  });

  try {
    // Verify connection
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');

    // Send test email
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"SMMDOC Test" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_SERVER_USER, // Send to self for testing
      subject: 'Test Email - SMMDOC System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Test Successful!</h2>
          <p>This is a test email to verify that the SMMDOC email system is working correctly.</p>
          <p><strong>Test Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>Configuration:</strong></p>
          <ul>
            <li>Host: ${process.env.EMAIL_SERVER_HOST}</li>
            <li>Port: ${process.env.EMAIL_SERVER_PORT}</li>
            <li>User: ${process.env.EMAIL_SERVER_USER}</li>
          </ul>
          <p>Best regards,<br>SMMDOC System</p>
        </div>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
  } finally {
    transporter.close();
  }
}

testEmail();