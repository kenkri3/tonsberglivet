import { NextResponse } from 'next/server';
import { setSetting, getSetting, getAllSettings } from '@/lib/settings';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function maskSecret(val?: string): string {
  if (!val || val.length <= 8) return val ? '••••••••' : '';
  return val.substring(0, 6) + '••••••••' + val.substring(val.length - 4);
}

export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const oneMinKey = await getSetting('1_min_ai') || await getSetting('one_min_ai_key');
    const geminiKey = await getSetting('gemini_api_key');
    const braveKey = await getSetting('brave_api_key');
    const tavilyKey = await getSetting('tavily_api_key');
    const apifyKey = await getSetting('apify_api_key');
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
    const autonomyMode = await getSetting('autonomy_mode', 'manual');
    const autoPublishArticles = (await getSetting('auto_publish_articles', 'false')) === 'true';
    const autoPublishEvents = (await getSetting('auto_publish_events', 'true')) === 'true';
    const autoRedirectExpired = (await getSetting('auto_redirect_expired', 'true')) === 'true';

    // Meta & SoMe
    const metaPageId = await getSetting('meta_page_id', '');
    const metaGroupId = await getSetting('meta_group_id', '');
    const metaInstagramId = await getSetting('meta_instagram_id', '');
    const metaAccessToken = await getSetting('meta_access_token', '');

    // Google Business Profile
    const googleBusinessAccountId = await getSetting('google_business_account_id', '');
    const googleBusinessLocationId = await getSetting('google_business_location_id', '');
    const googleBusinessAccessToken = await getSetting('google_business_access_token', '');

    const effectiveOneMin = oneMinKey || process.env['1_MIN_AI'] || process.env.ONE_MIN_AI || process.env.ONE_MIN_AI_API_KEY;

    return NextResponse.json({
      success: true,
      data: {
        oneMinApiKey: maskSecret(effectiveOneMin),
        oneMinConfigured: !!effectiveOneMin,
        geminiApiKey: maskSecret(geminiKey || process.env.GEMINI_API_KEY),
        geminiConfigured: !!(geminiKey || process.env.GEMINI_API_KEY),
        braveApiKey: maskSecret(braveKey || process.env.BRAVE_API_KEY),
        braveConfigured: !!(braveKey || process.env.BRAVE_API_KEY),
        tavilyApiKey: maskSecret(tavilyKey || process.env.TAVILY_API_KEY),
        tavilyConfigured: !!(tavilyKey || process.env.TAVILY_API_KEY),
        apifyApiKey: maskSecret(apifyKey || process.env.APIFY_API_KEY),
        apifyConfigured: !!(apifyKey || process.env.APIFY_API_KEY),
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
        autonomyMode,
        autoPublishArticles,
        autoPublishEvents,
        autoRedirectExpired,
        metaPageId,
        metaGroupId,
        metaInstagramId,
        metaAccessToken: maskSecret(metaAccessToken),
        metaConfigured: !!metaAccessToken,
        googleBusinessAccountId,
        googleBusinessLocationId,
        googleBusinessAccessToken: maskSecret(googleBusinessAccessToken),
        googleBusinessConfigured: !!googleBusinessAccessToken,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Kunne ikke hente innstillinger' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();

    // 1. Enkeltnøkkel lagring ({ key, value, category })
    if (body.key && typeof body.value === 'string') {
      await setSetting(body.key, body.value, body.category || 'GENERAL');
      return NextResponse.json({ success: true, message: `Innstilling '${body.key}' er lagret!` });
    }

    // 2. Samlet form-lagring
    const {
      oneMinApiKey,
      geminiApiKey,
      braveApiKey,
      tavilyApiKey,
      apifyApiKey,
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
      autonomyMode,
      autoPublishArticles,
      autoPublishEvents,
      autoRedirectExpired,
      metaPageId,
      metaGroupId,
      metaInstagramId,
      metaAccessToken,
      googleBusinessAccountId,
      googleBusinessLocationId,
      googleBusinessAccessToken,
    } = body;

    if (oneMinApiKey && !oneMinApiKey.includes('••••')) {
      await setSetting('1_min_ai', oneMinApiKey.trim(), 'AI');
    }
    if (geminiApiKey && !geminiApiKey.includes('••••')) {
      await setSetting('gemini_api_key', geminiApiKey.trim(), 'AI');
    }
    if (braveApiKey && !braveApiKey.includes('••••')) {
      await setSetting('brave_api_key', braveApiKey.trim(), 'AI');
    }
    if (tavilyApiKey && !tavilyApiKey.includes('••••')) {
      await setSetting('tavily_api_key', tavilyApiKey.trim(), 'AI');
    }
    if (apifyApiKey && !apifyApiKey.includes('••••')) {
      await setSetting('apify_api_key', apifyApiKey.trim(), 'AI');
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
    if (autonomyMode !== undefined) {
      await setSetting('autonomy_mode', String(autonomyMode), 'AUTOMATION');
    }
    if (autoPublishArticles !== undefined) {
      await setSetting('auto_publish_articles', String(autoPublishArticles), 'AUTOMATION');
    }
    if (autoPublishEvents !== undefined) {
      await setSetting('auto_publish_events', String(autoPublishEvents), 'AUTOMATION');
    }
    if (autoRedirectExpired !== undefined) {
      await setSetting('auto_redirect_expired', String(autoRedirectExpired), 'AUTOMATION');
    }

    // Meta & SoMe
    if (metaPageId !== undefined) {
      await setSetting('meta_page_id', metaPageId.trim(), 'SOME');
    }
    if (metaGroupId !== undefined) {
      await setSetting('meta_group_id', metaGroupId.trim(), 'SOME');
    }
    if (metaInstagramId !== undefined) {
      await setSetting('meta_instagram_id', metaInstagramId.trim(), 'SOME');
    }
    if (metaAccessToken && !metaAccessToken.includes('••••')) {
      await setSetting('meta_access_token', metaAccessToken.trim(), 'SOME');
    }

    // Google Business Profile
    if (googleBusinessAccountId !== undefined) {
      await setSetting('google_business_account_id', googleBusinessAccountId.trim(), 'SOME');
    }
    if (googleBusinessLocationId !== undefined) {
      await setSetting('google_business_location_id', googleBusinessLocationId.trim(), 'SOME');
    }
    if (googleBusinessAccessToken && !googleBusinessAccessToken.includes('••••')) {
      await setSetting('google_business_access_token', googleBusinessAccessToken.trim(), 'SOME');
    }

    return NextResponse.json({ success: true, message: 'Innstillinger er lagret!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Kunne ikke lagre innstillinger' }, { status: 500 });
  }
}
