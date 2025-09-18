import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Integration settings API called');
    const session = await auth();
    
    if (!session?.user?.id) {
      console.log('❌ Unauthorized - no session or user ID');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'admin') {
      console.log('❌ Access denied - user is not admin:', user?.role);
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    console.log('✅ User authorized as admin');

    // Get integration settings
    console.log('🔍 Querying database for integration settings...');
    const dbSettings = await db.integrationSettings.findFirst();
    console.log('📦 Database query result:', dbSettings ? 'Found settings' : 'No settings found');
    
    if (dbSettings) {
      console.log('🔐 ReCAPTCHA settings from DB:', {
        enabled: dbSettings.recaptchaEnabled,
        version: dbSettings.recaptchaVersion,
        v2SiteKey: dbSettings.recaptchaV2SiteKey ? '***' : 'empty',
        v2SecretKey: dbSettings.recaptchaV2SecretKey ? '***' : 'empty',
        v3SiteKey: dbSettings.recaptchaV3SiteKey ? '***' : 'empty',
        v3SecretKey: dbSettings.recaptchaV3SecretKey ? '***' : 'empty',
      });
    }
    
    // Transform the database response to match the new v2/v3 structure
    const integrationSettings = dbSettings ? {
      ...dbSettings,
      v2: {
        siteKey: dbSettings.recaptchaV2SiteKey || '',
        secretKey: dbSettings.recaptchaV2SecretKey || '',
      },
      v3: {
        siteKey: dbSettings.recaptchaV3SiteKey || '',
        secretKey: dbSettings.recaptchaV3SecretKey || '',
        threshold: dbSettings.recaptchaThreshold || 0.5,
      },
    } : {
      // Default values when no settings exist
      recaptchaEnabled: false,
      recaptchaVersion: 'v3',
      v2: {
        siteKey: '',
        secretKey: '',
      },
      v3: {
        siteKey: '',
        secretKey: '',
        threshold: 0.5,
      },
      recaptchaSignUp: false,
      recaptchaSignIn: false,
      recaptchaContact: false,
      recaptchaSupportTicket: false,
      recaptchaContactSupport: false,
      // Live Chat Settings
      liveChatEnabled: false,
      liveChatHoverTitle: 'Chat with us',
      liveChatSocialEnabled: false,
      liveChatMessengerEnabled: false,
      liveChatMessengerUrl: '',
      liveChatWhatsappEnabled: false,
      liveChatWhatsappNumber: '',
      liveChatTelegramEnabled: false,
      liveChatTelegramUsername: '',
      liveChatTawkToEnabled: false,
      liveChatTawkToCode: '',
      liveChatVisibility: 'all',
      // Analytics Settings
      analyticsEnabled: false,
      googleAnalyticsEnabled: false,
      googleAnalyticsCode: '',
      googleAnalyticsVisibility: 'all',
      facebookPixelEnabled: false,
      facebookPixelCode: '',
      facebookPixelVisibility: 'all',
      gtmEnabled: false,
      gtmCode: '',
      gtmVisibility: 'all',
      // Notification Settings
      pushNotificationsEnabled: false,
      oneSignalCode: '',
      oneSignalVisibility: 'all',
      emailNotificationsEnabled: false,
      // User Notifications
      userNotifWelcome: false,
      userNotifApiKeyChanged: false,
      userNotifOrderStatusChanged: false,
      userNotifNewService: false,
      userNotifServiceUpdates: false,
      // Admin Notifications
      adminNotifApiBalanceAlerts: false,
      adminNotifSupportTickets: false,
      adminNotifNewMessages: false,
      adminNotifNewManualServiceOrders: false,
      adminNotifFailOrders: false,
      adminNotifNewManualRefillRequests: false,
      adminNotifNewManualCancelRequests: false,
      adminNotifNewUsers: false,
      adminNotifUserActivityLogs: false,
      adminNotifPendingTransactions: false,
      adminNotifApiSyncLogs: false,
      adminNotifNewChildPanelOrders: false,
    };

    console.log('📤 Returning integration settings:', {
      success: true,
      hasSettings: !!dbSettings,
      recaptchaEnabled: integrationSettings.recaptchaEnabled,
      recaptchaVersion: integrationSettings.recaptchaVersion,
    });

    return NextResponse.json({
      success: true,
      integrationSettings,
    });
  } catch (error) {
    console.error('💥 Error fetching integration settings:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const { integrationSettings } = await request.json();

    if (!integrationSettings) {
      return NextResponse.json(
        { success: false, message: 'Integration settings are required' },
        { status: 400 }
      );
    }

    // Upsert integration settings
    const updatedSettings = await db.integrationSettings.upsert({
      where: { id: 1 }, // Assuming single settings record
      update: {
        // ReCAPTCHA Settings
        recaptchaEnabled: integrationSettings.recaptchaEnabled ?? false,
        recaptchaVersion: integrationSettings.recaptchaVersion ?? 'v3',
        // Legacy fields (keep for backward compatibility)
        recaptchaSiteKey: integrationSettings.recaptchaSiteKey ?? '',
        recaptchaSecretKey: integrationSettings.recaptchaSecretKey ?? '',
        // New separate v2 and v3 fields
        recaptchaV2SiteKey: integrationSettings.v2?.siteKey ?? '',
        recaptchaV2SecretKey: integrationSettings.v2?.secretKey ?? '',
        recaptchaV3SiteKey: integrationSettings.v3?.siteKey ?? '',
        recaptchaV3SecretKey: integrationSettings.v3?.secretKey ?? '',
        recaptchaThreshold: integrationSettings.recaptchaThreshold ?? 0.5,
        recaptchaSignUp: integrationSettings.recaptchaSignUp ?? false,
        recaptchaSignIn: integrationSettings.recaptchaSignIn ?? false,
        recaptchaContact: integrationSettings.recaptchaContact ?? false,
        recaptchaSupportTicket: integrationSettings.recaptchaSupportTicket ?? false,
        recaptchaContactSupport: integrationSettings.recaptchaContactSupport ?? false,
        // Live Chat Settings
        liveChatEnabled: integrationSettings.liveChatEnabled ?? false,
        liveChatHoverTitle: integrationSettings.liveChatHoverTitle ?? 'Chat with us',
        liveChatSocialEnabled: integrationSettings.liveChatSocialEnabled ?? false,
        liveChatMessengerEnabled: integrationSettings.liveChatMessengerEnabled ?? false,
        liveChatMessengerUrl: integrationSettings.liveChatMessengerUrl ?? '',
        liveChatWhatsappEnabled: integrationSettings.liveChatWhatsappEnabled ?? false,
        liveChatWhatsappNumber: integrationSettings.liveChatWhatsappNumber ?? '',
        liveChatTelegramEnabled: integrationSettings.liveChatTelegramEnabled ?? false,
        liveChatTelegramUsername: integrationSettings.liveChatTelegramUsername ?? '',
        liveChatTawkToEnabled: integrationSettings.liveChatTawkToEnabled ?? false,
        liveChatTawkToCode: integrationSettings.liveChatTawkToCode ?? '',
        liveChatVisibility: integrationSettings.liveChatVisibility ?? 'all',
        // Analytics Settings
        analyticsEnabled: integrationSettings.analyticsEnabled ?? false,
        googleAnalyticsEnabled: integrationSettings.googleAnalyticsEnabled ?? false,
        googleAnalyticsCode: integrationSettings.googleAnalyticsCode ?? '',
        googleAnalyticsVisibility: integrationSettings.googleAnalyticsVisibility ?? 'all',
        facebookPixelEnabled: integrationSettings.facebookPixelEnabled ?? false,
        facebookPixelCode: integrationSettings.facebookPixelCode ?? '',
        facebookPixelVisibility: integrationSettings.facebookPixelVisibility ?? 'all',
        gtmEnabled: integrationSettings.gtmEnabled ?? false,
        gtmCode: integrationSettings.gtmCode ?? '',
        gtmVisibility: integrationSettings.gtmVisibility ?? 'all',
        // Notification Settings
        pushNotificationsEnabled: integrationSettings.pushNotificationsEnabled ?? false,
        oneSignalCode: integrationSettings.oneSignalCode ?? '',
        oneSignalVisibility: integrationSettings.oneSignalVisibility ?? 'all',
        emailNotificationsEnabled: integrationSettings.emailNotificationsEnabled ?? false,
        // User Notifications
        userNotifWelcome: integrationSettings.userNotifWelcome ?? false,
        userNotifApiKeyChanged: integrationSettings.userNotifApiKeyChanged ?? false,
        userNotifOrderStatusChanged: integrationSettings.userNotifOrderStatusChanged ?? false,
        userNotifNewService: integrationSettings.userNotifNewService ?? false,
        userNotifServiceUpdates: integrationSettings.userNotifServiceUpdates ?? false,
        // Admin Notifications
        adminNotifApiBalanceAlerts: integrationSettings.adminNotifApiBalanceAlerts ?? false,
        adminNotifSupportTickets: integrationSettings.adminNotifSupportTickets ?? false,
        adminNotifNewMessages: integrationSettings.adminNotifNewMessages ?? false,
        adminNotifNewManualServiceOrders: integrationSettings.adminNotifNewManualServiceOrders ?? false,
        adminNotifFailOrders: integrationSettings.adminNotifFailOrders ?? false,
        adminNotifNewManualRefillRequests: integrationSettings.adminNotifNewManualRefillRequests ?? false,
        adminNotifNewManualCancelRequests: integrationSettings.adminNotifNewManualCancelRequests ?? false,
        adminNotifNewUsers: integrationSettings.adminNotifNewUsers ?? false,
        adminNotifUserActivityLogs: integrationSettings.adminNotifUserActivityLogs ?? false,
        adminNotifPendingTransactions: integrationSettings.adminNotifPendingTransactions ?? false,
        adminNotifApiSyncLogs: integrationSettings.adminNotifApiSyncLogs ?? false,
        adminNotifNewChildPanelOrders: integrationSettings.adminNotifNewChildPanelOrders ?? false,
        updatedAt: new Date(),
      },
      create: {
        id: 1,
        // ReCAPTCHA Settings
        recaptchaEnabled: integrationSettings.recaptchaEnabled ?? false,
        recaptchaVersion: integrationSettings.recaptchaVersion ?? 'v3',
        // Legacy fields (keep for backward compatibility)
        recaptchaSiteKey: integrationSettings.recaptchaVersion === 'v2' 
          ? (integrationSettings.v2?.siteKey ?? '') 
          : (integrationSettings.v3?.siteKey ?? ''),
        recaptchaSecretKey: integrationSettings.recaptchaVersion === 'v2' 
          ? (integrationSettings.v2?.secretKey ?? '') 
          : (integrationSettings.v3?.secretKey ?? ''),
        // New separate v2 and v3 fields
        recaptchaV2SiteKey: integrationSettings.v2?.siteKey ?? '',
        recaptchaV2SecretKey: integrationSettings.v2?.secretKey ?? '',
        recaptchaV3SiteKey: integrationSettings.v3?.siteKey ?? '',
        recaptchaV3SecretKey: integrationSettings.v3?.secretKey ?? '',
        recaptchaThreshold: integrationSettings.v3?.threshold ?? 0.5,
        recaptchaSignUp: integrationSettings.recaptchaSignUp ?? false,
        recaptchaSignIn: integrationSettings.recaptchaSignIn ?? false,
        recaptchaContact: integrationSettings.recaptchaContact ?? false,
        recaptchaSupportTicket: integrationSettings.recaptchaSupportTicket ?? false,
        recaptchaContactSupport: integrationSettings.recaptchaContactSupport ?? false,
        // Live Chat Settings
        liveChatEnabled: integrationSettings.liveChatEnabled ?? false,
        liveChatHoverTitle: integrationSettings.liveChatHoverTitle ?? 'Chat with us',
        liveChatSocialEnabled: integrationSettings.liveChatSocialEnabled ?? false,
        liveChatMessengerEnabled: integrationSettings.liveChatMessengerEnabled ?? false,
        liveChatMessengerUrl: integrationSettings.liveChatMessengerUrl ?? '',
        liveChatWhatsappEnabled: integrationSettings.liveChatWhatsappEnabled ?? false,
        liveChatWhatsappNumber: integrationSettings.liveChatWhatsappNumber ?? '',
        liveChatTelegramEnabled: integrationSettings.liveChatTelegramEnabled ?? false,
        liveChatTelegramUsername: integrationSettings.liveChatTelegramUsername ?? '',
        liveChatTawkToEnabled: integrationSettings.liveChatTawkToEnabled ?? false,
        liveChatTawkToCode: integrationSettings.liveChatTawkToCode ?? '',
        liveChatVisibility: integrationSettings.liveChatVisibility ?? 'all',
        // Analytics Settings
        analyticsEnabled: integrationSettings.analyticsEnabled ?? false,
        googleAnalyticsEnabled: integrationSettings.googleAnalyticsEnabled ?? false,
        googleAnalyticsCode: integrationSettings.googleAnalyticsCode ?? '',
        googleAnalyticsVisibility: integrationSettings.googleAnalyticsVisibility ?? 'all',
        facebookPixelEnabled: integrationSettings.facebookPixelEnabled ?? false,
        facebookPixelCode: integrationSettings.facebookPixelCode ?? '',
        facebookPixelVisibility: integrationSettings.facebookPixelVisibility ?? 'all',
        gtmEnabled: integrationSettings.gtmEnabled ?? false,
        gtmCode: integrationSettings.gtmCode ?? '',
        gtmVisibility: integrationSettings.gtmVisibility ?? 'all',
        // Notification Settings
        pushNotificationsEnabled: integrationSettings.pushNotificationsEnabled ?? false,
        oneSignalCode: integrationSettings.oneSignalCode ?? '',
        oneSignalVisibility: integrationSettings.oneSignalVisibility ?? 'all',
        emailNotificationsEnabled: integrationSettings.emailNotificationsEnabled ?? false,
        // User Notifications
        userNotifWelcome: integrationSettings.userNotifWelcome ?? false,
        userNotifApiKeyChanged: integrationSettings.userNotifApiKeyChanged ?? false,
        userNotifOrderStatusChanged: integrationSettings.userNotifOrderStatusChanged ?? false,
        userNotifNewService: integrationSettings.userNotifNewService ?? false,
        userNotifServiceUpdates: integrationSettings.userNotifServiceUpdates ?? false,
        // Admin Notifications
        adminNotifApiBalanceAlerts: integrationSettings.adminNotifApiBalanceAlerts ?? false,
        adminNotifSupportTickets: integrationSettings.adminNotifSupportTickets ?? false,
        adminNotifNewMessages: integrationSettings.adminNotifNewMessages ?? false,
        adminNotifNewManualServiceOrders: integrationSettings.adminNotifNewManualServiceOrders ?? false,
        adminNotifFailOrders: integrationSettings.adminNotifFailOrders ?? false,
        adminNotifNewManualRefillRequests: integrationSettings.adminNotifNewManualRefillRequests ?? false,
        adminNotifNewManualCancelRequests: integrationSettings.adminNotifNewManualCancelRequests ?? false,
        adminNotifNewUsers: integrationSettings.adminNotifNewUsers ?? false,
        adminNotifUserActivityLogs: integrationSettings.adminNotifUserActivityLogs ?? false,
        adminNotifPendingTransactions: integrationSettings.adminNotifPendingTransactions ?? false,
        adminNotifApiSyncLogs: integrationSettings.adminNotifApiSyncLogs ?? false,
        adminNotifNewChildPanelOrders: integrationSettings.adminNotifNewChildPanelOrders ?? false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Integration settings updated successfully',
      integrationSettings: updatedSettings,
    });
  } catch (error) {
    console.error('Error updating integration settings:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}