import { prisma } from './prisma';

// Minnebuffer dersom databasetabellen ennå ikke er migrert i produksjon.
// MERK: Ingen hemmeligheter her. En hardkodet cron_secret gjorde at
// «fail-closed»-sjekken i /api/cron/daily-sync aldri slo inn, siden
// getSetting('cron_secret') alltid returnerte en kjent, offentlig verdi.
// Cron-hemmeligheten må settes via CRON_SECRET i miljøet eller i Innstillinger.
const memorySettings: Record<string, string> = {
  notification_email: 'post@tonsberglivet.no',
  autonomy_mode: 'manual',
  auto_publish_articles: 'false',
  auto_publish_events: 'true',
  auto_redirect_expired: 'true',
};

/**
 * Henter en systeminnstilling fra databasen (eller minne/env som fallback).
 * Følger BYOK-prinsippet: DB -> process.env -> minne -> defaultValue.
 */
export async function getSetting(key: string, defaultValue?: string): Promise<string | undefined> {
  try {
    const setting = await (prisma as any).systemSetting?.findUnique({
      where: { key },
    });
    if (setting && setting.value && setting.value.trim() !== '') {
      return setting.value;
    }
  } catch (error) {
    // Hvis tabell ikke eksisterer ennå i DB, fall tilbake til minne/env
  }

  // Sjekk prosess-miljøvariabel (f.eks. GEMINI_API_KEY for gemini_api_key)
  const envKeyUpper = key.toUpperCase();
  const envVal = process.env[envKeyUpper] || process.env[key];
  if (envVal && envVal.trim() !== '') {
    return envVal;
  }

  if (memorySettings[key] !== undefined && memorySettings[key].trim() !== '') {
    return memorySettings[key];
  }

  return defaultValue;
}

/**
 * Leser en innstilling UTEN å skjule feil.
 *
 * `getSetting` over svelger databasefeil med vilje: den skal falle tilbake til
 * miljø/minne og alltid gi et brukbart svar. Men den som skal RAPPORTERE om noe
 * er konfigurert, kan ikke bruke den – da ville «databasen svarte ikke» blitt
 * til «nøkkelen finnes ikke», som er en usann påstand i motsatt retning.
 *
 * Denne varianten skiller de tre tilfellene: funnet, ikke funnet, og feil.
 */
export type SettingProbe =
  | { status: 'found'; value: string }
  | { status: 'missing' }
  | { status: 'error'; message: string };

export async function probeSetting(key: string): Promise<SettingProbe> {
  try {
    const setting = await (prisma as any).systemSetting?.findUnique({
      where: { key },
    });
    if (setting && typeof setting.value === 'string' && setting.value.trim() !== '') {
      return { status: 'found', value: setting.value };
    }
    return { status: 'missing' };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'ukjent databasefeil',
    };
  }
}
/**
 * Lagrer eller oppdaterer en systeminnstilling.
 */
export async function setSetting(
  key: string,
  value: string,
  category: string = 'GENERAL'
): Promise<void> {  memorySettings[key] = value;
  try {
    await (prisma as any).systemSetting?.upsert({
      where: { key },
      update: { value, category },
      create: { key, value, category },
    });
  } catch (error) {
    console.warn('[Settings] Lagret i minnebuffer:', error);
  }
}

/**
 * Henter alle innstillinger som en nøkkel-verdi ordbok.
 */
export async function getAllSettings(): Promise<Record<string, string>> {
  const result: Record<string, string> = { ...memorySettings };
  try {
    const list = await (prisma as any).systemSetting?.findMany();
    if (list && Array.isArray(list)) {
      for (const item of list) {
        result[item.key] = item.value;
      }
    }
  } catch (error) {
    // fallback til memorySettings
  }

  // Fyll inn fra env dersom ikke satt i DB/minne
  const knownKeys = [
    'gemini_api_key',
    'brave_api_key',
    'tavily_api_key',
    'apify_api_key',
    'resend_api_key',
    'smtp_url',
    'ticketmaster_api_key',
    'cron_secret',
    'slack_webhook_url',
    'teams_webhook_url',
    'discord_webhook_url',
    'agent_webhook_url',
    'duett_webhook_url',
    'notification_email',
    'autonomy_mode',
    'auto_publish_articles',
    'auto_publish_events',
    'auto_redirect_expired',
    'meta_page_id',
    'meta_group_id',
    'meta_instagram_id',
    'meta_access_token',
    'google_business_account_id',
    'google_business_location_id',
    'google_business_access_token',
  ];

  for (const k of knownKeys) {
    if (!result[k]) {
      const envVal = process.env[k.toUpperCase()] || process.env[k];
      if (envVal) {
        result[k] = envVal;
      }
    }
  }

  return result;
}
