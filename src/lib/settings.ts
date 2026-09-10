import { prisma } from './prisma';

// Minnebuffer dersom databasetabellen ennå ikke er migrert i produksjon
const memorySettings: Record<string, string> = {
  cron_secret: 'tonsberg_cron_secret_2026',
  notification_email: 'post@tonsberglivet.no',
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
 * Lagrer eller oppdaterer en systeminnstilling.
 */
export async function setSetting(
  key: string,
  value: string,
  category: string = 'GENERAL'
): Promise<void> {
  memorySettings[key] = value;
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
