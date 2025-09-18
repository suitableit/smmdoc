import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch integration settings from database
    const integrationSettings = await prisma.integrationSettings.findFirst();

    if (!integrationSettings) {
      // Return default settings if no settings found
      return NextResponse.json({
        enabled: false,
        hoverTitle: 'Contact Support',
        socialMediaEnabled: false,
        messengerEnabled: false,
        messengerUrl: '',
        whatsappEnabled: false,
        whatsappNumber: '',
        telegramEnabled: false,
        telegramUsername: '',
        tawkToEnabled: false,
        tawkToWidgetCode: '',
        visibility: 'all',
      });
    }

    // Map database fields to response format
    const liveChatSettings = {
      enabled: integrationSettings.liveChatEnabled,
      hoverTitle: integrationSettings.liveChatHoverTitle || 'Contact Support',
      socialMediaEnabled: integrationSettings.liveChatSocialEnabled,
      messengerEnabled: integrationSettings.liveChatMessengerEnabled,
      messengerUrl: integrationSettings.liveChatMessengerUrl || '',
      whatsappEnabled: integrationSettings.liveChatWhatsappEnabled,
      whatsappNumber: integrationSettings.liveChatWhatsappNumber || '',
      telegramEnabled: integrationSettings.liveChatTelegramEnabled,
      telegramUsername: integrationSettings.liveChatTelegramUsername || '',
      tawkToEnabled: integrationSettings.liveChatTawkToEnabled,
      tawkToWidgetCode: integrationSettings.liveChatTawkToCode || '',
      visibility: 'all', // This field doesn't exist in schema, using default
    };

    return NextResponse.json(liveChatSettings);
  } catch (error) {
    console.error('Error fetching live chat settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live chat settings' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}