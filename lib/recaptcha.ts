"use server";

interface ReCAPTCHAVerificationResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

export async function verifyReCAPTCHA(
  token: string,
  secretKey: string,
  expectedAction?: string,
  minimumScore?: number
): Promise<{ success: boolean; error?: string; score?: number }> {
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: 'Failed to verify reCAPTCHA with Google servers',
      };
    }

    const data: ReCAPTCHAVerificationResponse = await response.json();

    if (!data.success) {
      const errorCodes = data['error-codes'] || [];
      let errorMessage = 'reCAPTCHA verification failed';
      
      if (errorCodes.includes('timeout-or-duplicate')) {
        errorMessage = 'reCAPTCHA token has expired or been used already';
      } else if (errorCodes.includes('invalid-input-response')) {
        errorMessage = 'Invalid reCAPTCHA token';
      } else if (errorCodes.includes('invalid-input-secret')) {
        errorMessage = 'Invalid reCAPTCHA secret key configuration';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    // For reCAPTCHA v3, check the score and action
    if (data.score !== undefined) {
      // This is v3
      if (expectedAction && data.action !== expectedAction) {
        return {
          success: false,
          error: 'reCAPTCHA action mismatch',
        };
      }

      if (minimumScore !== undefined && data.score < minimumScore) {
        return {
          success: false,
          error: 'reCAPTCHA score too low - suspicious activity detected',
          score: data.score,
        };
      }

      return {
        success: true,
        score: data.score,
      };
    }

    // For reCAPTCHA v2, just return success
    return {
      success: true,
    };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return {
      success: false,
      error: 'Failed to verify reCAPTCHA - network error',
    };
  }
}

export async function getReCAPTCHASettings() {
  try {
    const { db } = await import('./db');
    const integrationSettings = await db.integrationSettings.findFirst();
    
    if (!integrationSettings?.recaptcha) {
      return null;
    }

    const recaptchaSettings = integrationSettings.recaptcha as any;
    
    if (!recaptchaSettings.enabled) {
      return null;
    }

    return {
      enabled: recaptchaSettings.enabled,
      version: recaptchaSettings.version || 'v3',
      secretKey: recaptchaSettings.version === 'v2' 
        ? recaptchaSettings.v2?.secretKey 
        : recaptchaSettings.v3?.secretKey,
      threshold: recaptchaSettings.v3?.threshold || 0.5,
      enabledForms: recaptchaSettings.enabledForms || {},
    };
  } catch (error) {
    console.error('Error fetching reCAPTCHA settings:', error);
    return null;
  }
}