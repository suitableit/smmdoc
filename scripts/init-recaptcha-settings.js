const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initReCAPTCHASettings() {
  try {
    console.log('Checking existing integration settings...');
    
    let settings = await prisma.integrationSettings.findFirst();
    
    if (!settings) {
      console.log('No integration settings found. Creating initial settings...');
      settings = await prisma.integrationSettings.create({
        data: {
          recaptchaEnabled: true,
          recaptchaVersion: 'v2',
          recaptchaV2SiteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // Google test key
          recaptchaV2SecretKey: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe', // Google test secret
          recaptchaSignUp: true,
          recaptchaSignIn: true,
          recaptchaContact: true,
          recaptchaSupportTicket: true,
          recaptchaContactSupport: true,
        },
      });
      console.log('✅ Initial ReCAPTCHA settings created successfully!');
    } else {
      console.log('Existing settings found. Updating ReCAPTCHA settings...');
      settings = await prisma.integrationSettings.update({
        where: { id: settings.id },
        data: {
          recaptchaEnabled: true,
          recaptchaVersion: 'v2',
          recaptchaV2SiteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // Google test key
          recaptchaV2SecretKey: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe', // Google test secret
          recaptchaSignUp: true,
          recaptchaSignIn: true,
          recaptchaContact: true,
          recaptchaSupportTicket: true,
          recaptchaContactSupport: true,
        },
      });
      console.log('✅ ReCAPTCHA settings updated successfully!');
    }
    
    console.log('\nCurrent ReCAPTCHA Settings:');
    console.log('- Enabled:', settings.recaptchaEnabled);
    console.log('- Version:', settings.recaptchaVersion);
    console.log('- V2 Site Key:', settings.recaptchaV2SiteKey);
    console.log('- Sign Up enabled:', settings.recaptchaSignUp);
    console.log('- Sign In enabled:', settings.recaptchaSignIn);
    console.log('- Contact enabled:', settings.recaptchaContact);
    console.log('- Support Ticket enabled:', settings.recaptchaSupportTicket);
    console.log('- Contact Support enabled:', settings.recaptchaContactSupport);
    
  } catch (error) {
    console.error('❌ Error initializing ReCAPTCHA settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initReCAPTCHASettings();