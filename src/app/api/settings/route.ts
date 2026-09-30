import { NextResponse } from 'next/server';
import { setSetting, getSetting, getAllSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

function maskSecret(val?: string): string {
  if (!val || val.length <= 8) return val ? '••••••••' : '';
  return val.substring(0, 6) + '••••••••' + val.substring(val.length - 4);
}

export async function GET() {
  try {
    const geminiKey = await getSetting('gemini_api_key');
    const ticketmasterKey = await getSetting('ticketmaster_api_key');
    const resendKey = await getSetting('resend_api_key');
    const smtpUrl = await getSetting('smtp_url');
    const cronSecret = await getSetting('cron_secret', 'tonsberg_cron_secret_2026');
    const slackUrl = await getSetting('slack_webhook_url');
    const teamsUrl = await getSetting('teams_webhook_url');
    const discordUrl = await getSetting('discord_webhook_url');
    const duettUrl = await getSetting('duett_webhook_url');
    const notificationEmail = await getSetting('notification_email', 'post@tonsberglivet.no');
    const autoApprove = await getSetting('auto_approve_bookings', 'false');

    return NextResponse.json({
      success: true,
      data: {
        geminiApiKey: maskSecret(geminiKey || process.env.GEMINI_API_KEY),
        geminiConfigured: !!(geminiKey || process.env.GEMINI_API_KEY),
        ticketmasterApiKey: maskSecret(ticketmasterKey || process.env.TICKETMASTER_API_KEY),
        ticketmasterConfigured: !!(ticketmasterKey || process.env.TICKETMASTER_API_KEY),
        resendApiKey: maskSecret(resendKey || process.env.RESEND_API_KEY),
        resendConfigured: !!(resendKey || process.env.RESEND_API_KEY),
        smtpUrl: maskSecret(smtpUrl || process.env.SMTP_URL),
        smtpConfigured: !!(smtpUrl || process.env.SMTP_URL),
        cronSecret: maskSecret(cronSecret),
        cronConfigured: !!cronSecret,
        duettWebhookUrl: maskSecret(duettUrl),
        duettConfigured: !!duettUrl,
        slackWebhookUrl: maskSecret(slackUrl),
        slackConfigured: !!slackUrl,
        teamsWebhookUrl: maskSecret(teamsUrl),
        teamsConfigured: !!teamsUrl,
        discordWebhookUrl: maskSecret(discordUrl),
        discordConfigured: !!discordUrl,
        notificationEmail,
        autoApproveBookings: autoApprove === 'true',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Kunne ikke hente innstillinger' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Enkeltnøkkel lagring ({ key, value, category })
    if (body.key && typeof body.value === 'string') {
      await setSetting(body.key, body.value, body.category || 'GENERAL');
      return NextResponse.json({ success: true, message: `Innstilling '${body.key}' er lagret!` });
    }

    // 2. Samlet form-lagring
    const {
      geminiApiKey,
      ticketmasterApiKey,
      resendApiKey,
      smtpUrl,
      cronSecret,
      duettWebhookUrl,
      slackWebhookUrl,
      teamsWebhookUrl,
      discordWebhookUrl,
      notificationEmail,
      autoApproveBookings,
    } = body;

    if (geminiApiKey && !geminiApiKey.includes('••••')) {
      await setSetting('gemini_api_key', geminiApiKey.trim(), 'AI');
    }
    if (ticketmasterApiKey && !ticketmasterApiKey.includes('••••')) {
      await setSetting('ticketmaster_api_key', ticketmasterApiKey.trim(), 'INTEGRATIONS');
    }
    if (resendApiKey && !resendApiKey.includes('••••')) {
      await setSetting('resend_api_key', resendApiKey.trim(), 'EMAIL');
    }
    if (smtpUrl && !smtpUrl.includes('••••')) {
      await setSetting('smtp_url', smtpUrl.trim(), 'EMAIL');
    }
    if (cronSecret && !cronSecret.includes('••••')) {
      await setSetting('cron_secret', cronSecret.trim(), 'INTEGRATIONS');
    }
    if (duettWebhookUrl !== undefined && !duettWebhookUrl.includes('••••')) {
      await setSetting('duett_webhook_url', duettWebhookUrl.trim(), 'FINANCE');
    }
    if (slackWebhookUrl !== undefined && !slackWebhookUrl.includes('••••')) {
      await setSetting('slack_webhook_url', slackWebhookUrl.trim(), 'NOTIFICATIONS');
    }
    if (teamsWebhookUrl !== undefined && !teamsWebhookUrl.includes('••••')) {
      await setSetting('teams_webhook_url', teamsWebhookUrl.trim(), 'NOTIFICATIONS');
    }
    if (discordWebhookUrl !== undefined && !discordWebhookUrl.includes('••••')) {
      await setSetting('discord_webhook_url', discordWebhookUrl.trim(), 'NOTIFICATIONS');
    }
    if (notificationEmail) {
      await setSetting('notification_email', notificationEmail.trim(), 'GENERAL');
    }
    if (autoApproveBookings !== undefined) {
      await setSetting('auto_approve_bookings', String(autoApproveBookings), 'AUTOMATION');
    }

    return NextResponse.json({ success: true, message: 'Innstillinger er lagret!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Kunne ikke lagre innstillinger' }, { status: 500 });
  }
}
