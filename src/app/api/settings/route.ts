import { NextResponse } from 'next/server';
import { setSetting, getSetting, getAllSettings } from '@/lib/settings';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Nøkkelnavn som historisk har vært skrevet/leset under to ulike navn.
 * Dashboardet leser ga_measurement_id / gsc_verification_tag, mens
 * innstillingssiden har brukt ga4_measurement_id / gsc_verification_code.
 * Vi skriver begge og leser begge, slik at ingen allerede lagret verdi går tapt.
 */
const GA4_SETTING_KEYS = ['ga_measurement_id', 'ga4_measurement_id'];
const GSC_SETTING_KEYS = ['gsc_verification_tag', 'gsc_verification_code'];

async function readFirstSetting(keys: string[], fallback = ''): Promise<string> {
  for (const key of keys) {
    const value = await getSetting(key);
    if (value && value.trim() !== '') return value;
  }
  return fallback;
}

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
    const ticketmasterKey = await getSetting('ticketmaster_api_key');
    const resendKey = await getSetting('resend_api_key');
    const smtpUrl = await getSetting('smtp_url');
  // Ingen standardverdi: en hardkodet reserveverdi ville rapportert cron som
  // «konfigurert» selv når den ikke er det, og den gamle verdien ligger i den
  // offentlige repo-historikken. Er den ikke satt, skal feltet være tomt.
  const cronSecret = await getSetting('cron_secret');
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

    // Google Business Profile & Analytics
    const googleBusinessAccountId = await getSetting('google_business_account_id', '');
    const googleBusinessLocationId = await getSetting('google_business_location_id', '');
    const googleBusinessAccessToken = await getSetting('google_business_access_token', '');
    const ga4MeasurementId = (await readFirstSetting(GA4_SETTING_KEYS)) || process.env.NEXT_PUBLIC_GA_ID || '';
    const gscSiteUrl = (await getSetting('gsc_site_url', '')) || 'https://tonsberglivet.no';
    const gscVerificationCode = await readFirstSetting(GSC_SETTING_KEYS);

    return NextResponse.json({
      success: true,
      data: {
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
        ga4MeasurementId,
        ga4Configured: !!ga4MeasurementId,
        gscSiteUrl,
        gscVerificationCode,
        gscConfigured: !!gscVerificationCode,
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

    // setSetting svelger DB-feil (den skriver til minnebuffer først). Vi leser
    // derfor verdien tilbake fra databasen og rapporterer ærlig dersom den ikke
    // faktisk ble lagret, i stedet for å returnere suksess på en tapt skriving.
    const failedSettings: string[] = [];
    const persist = async (key: string, value: string, category: string = 'GENERAL') => {
      await setSetting(key, value, category);
      try {
        const stored = await (prisma as any).systemSetting?.findUnique({ where: { key } });
        if (!stored || stored.value !== value) {
          failedSettings.push(key);
        }
      } catch (verifyError) {
        console.error(`[Settings] Kunne ikke verifisere lagring av '${key}':`, verifyError);
        failedSettings.push(key);
      }
    };

    const respondToSave = (message: string) => {
      if (failedSettings.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Kunne ikke lagre følgende innstillinger: ${failedSettings.join(', ')}. Verdiene er ikke lagret i databasen.`,
            failedKeys: failedSettings,
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true, message });
    };

    // 1. Enkeltnøkkel lagring ({ key, value, category })
    if (body.key && typeof body.value === 'string') {
      await persist(body.key, body.value, body.category || 'GENERAL');
      return respondToSave(`Innstilling '${body.key}' er lagret!`);
    }

    // 2. Samlet form-lagring
    // KI-noeklene (1_MIN_AI, GEMINI_API_KEY, BRAVE_API_KEY, TAVILY_API_KEY,
    // APIFY_API_KEY) har ikke lenger felt i panelet. De settes som
    // miljoevariabler i Railway, og leses derfra i ai-config.ts og
    // web-intelligence.ts. Allerede lagrede verdier i databasen beholdes.
    const {
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

    if (ticketmasterApiKey && !ticketmasterApiKey.includes('••••')) {
      await persist('ticketmaster_api_key', ticketmasterApiKey.trim(), 'INTEGRATIONS');
    }
    if (resendApiKey && !resendApiKey.includes('••••')) {
      await persist('resend_api_key', resendApiKey.trim(), 'EMAIL');
    }
    if (smtpUrl && !smtpUrl.includes('••••')) {
      await persist('smtp_url', smtpUrl.trim(), 'EMAIL');
    }
    if (cronSecret && !cronSecret.includes('••••')) {
      await persist('cron_secret', cronSecret.trim(), 'INTEGRATIONS');
    }
    if (duettWebhookUrl !== undefined && !duettWebhookUrl.includes('••••')) {
      await persist('duett_webhook_url', duettWebhookUrl.trim(), 'FINANCE');
    }
    if (slackWebhookUrl !== undefined && !slackWebhookUrl.includes('••••')) {
      await persist('slack_webhook_url', slackWebhookUrl.trim(), 'NOTIFICATIONS');
    }
    if (teamsWebhookUrl !== undefined && !teamsWebhookUrl.includes('••••')) {
      await persist('teams_webhook_url', teamsWebhookUrl.trim(), 'NOTIFICATIONS');
    }
    if (discordWebhookUrl !== undefined && !discordWebhookUrl.includes('••••')) {
      await persist('discord_webhook_url', discordWebhookUrl.trim(), 'NOTIFICATIONS');
    }
    if (notificationEmail) {
      await persist('notification_email', notificationEmail.trim(), 'GENERAL');
    }
    if (autoApproveBookings !== undefined) {
      await persist('auto_approve_bookings', String(autoApproveBookings), 'AUTOMATION');
    }
    if (autonomyMode !== undefined) {
      await persist('autonomy_mode', String(autonomyMode), 'AUTOMATION');
    }
    if (autoPublishArticles !== undefined) {
      await persist('auto_publish_articles', String(autoPublishArticles), 'AUTOMATION');
    }
    if (autoPublishEvents !== undefined) {
      await persist('auto_publish_events', String(autoPublishEvents), 'AUTOMATION');
    }
    if (autoRedirectExpired !== undefined) {
      await persist('auto_redirect_expired', String(autoRedirectExpired), 'AUTOMATION');
    }

    // Meta & SoMe
    if (metaPageId !== undefined) {
      await persist('meta_page_id', metaPageId.trim(), 'SOME');
    }
    if (metaGroupId !== undefined) {
      await persist('meta_group_id', metaGroupId.trim(), 'SOME');
    }
    if (metaInstagramId !== undefined) {
      await persist('meta_instagram_id', metaInstagramId.trim(), 'SOME');
    }
    if (metaAccessToken && !metaAccessToken.includes('••••')) {
      await persist('meta_access_token', metaAccessToken.trim(), 'SOME');
    }

    // Google Business Profile
    if (googleBusinessAccountId !== undefined) {
      await persist('google_business_account_id', googleBusinessAccountId.trim(), 'SOME');
    }
    if (googleBusinessLocationId !== undefined) {
      await persist('google_business_location_id', googleBusinessLocationId.trim(), 'SOME');
    }
    if (googleBusinessAccessToken && !googleBusinessAccessToken.includes('••••')) {
      await persist('google_business_access_token', googleBusinessAccessToken.trim(), 'SOME');
    }

    // Google Analytics 4 & Search Console
    // Begge nøkkelnavn skrives, slik at dashboardet (ga_measurement_id /
    // gsc_verification_tag) og innstillingssiden (ga4_measurement_id /
    // gsc_verification_code) alltid ser samme verdi.
    if (body.ga4MeasurementId !== undefined) {
      const ga4Value = String(body.ga4MeasurementId).trim();
      for (const key of GA4_SETTING_KEYS) {
        await persist(key, ga4Value, 'ANALYTICS');
      }
    }
    if (body.gscSiteUrl !== undefined) {
      await persist('gsc_site_url', String(body.gscSiteUrl).trim(), 'ANALYTICS');
    }
    if (body.gscVerificationCode !== undefined) {
      const gscValue = String(body.gscVerificationCode).trim();
      for (const key of GSC_SETTING_KEYS) {
        await persist(key, gscValue, 'ANALYTICS');
      }
    }

    return respondToSave('Innstillinger er lagret!');
  } catch (error: any) {
    console.error('[Settings] Kunne ikke lagre innstillinger:', error);
    return NextResponse.json({ success: false, error: 'Kunne ikke lagre innstillinger' }, { status: 500 });
  }
}
