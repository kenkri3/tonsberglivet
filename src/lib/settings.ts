import { prisma } from './prisma';

export interface SystemSettingItem {
  key: string;
  value: string;
  description?: string | null;
  isSecret?: boolean;
  updatedAt?: Date;
}

// In-memory fallback if database table is not migrated or unavailable
const memorySettings = new Map<string, SystemSettingItem>([
  ['resend_api_key', { key: 'resend_api_key', value: '', description: 'Resend API Key for e-postutsending', isSecret: true }],
  ['smtp_url', { key: 'smtp_url', value: '', description: 'SMTP URL fallback (f.eks. smtp://user:pass@host:587)', isSecret: true }],
  ['gemini_api_key', { key: 'gemini_api_key', value: '', description: 'Google Gemini API Key for AI-agent og Copilot', isSecret: true }],
  ['ticketmaster_api_key', { key: 'ticketmaster_api_key', value: '', description: 'Ticketmaster Discovery API Key', isSecret: true }],
  ['cron_secret', { key: 'cron_secret', value: 'tonsberg_cron_secret_2026', description: 'Hemmelig nøkkel for nattlig cron-synk', isSecret: true }],
  ['agent_webhook_url', { key: 'agent_webhook_url', value: '', description: 'Slack / Teams / Discord Webhook URL for agentvarsling', isSecret: false }],
  ['duett_webhook_url', { key: 'duett_webhook_url', value: '', description: 'Webhook til regnskapsfører / Duett ERP', isSecret: false }],
]);

/**
 * Henter en systeminnstilling fra databasen (eller env/memory som fallback).
 * Følger BYOK-prinsippet: DB -> process.env -> fallback.
 */
export async function getSetting(key: string, defaultValue?: string): Promise<string | undefined> {
  try {
    const record = await prisma.systemSetting.findUnique({
      where: { key },
    });
    if (record && record.value && record.value.trim() !== '') {
      return record.value;
    }
  } catch {
    // Database utilgjengelig i test/bygg – fortsett til fallback
  }

  // Sjekk environment variables
  const envKeyUpper = key.toUpperCase();
  const envVal = process.env[envKeyUpper] || process.env[key];
  if (envVal && envVal.trim() !== '') {
    return envVal;
  }

  // Sjekk minne-fallback
  const memoryVal = memorySettings.get(key)?.value;
  if (memoryVal && memoryVal.trim() !== '') {
    return memoryVal;
  }

  return defaultValue;
}

/**
 * Lagrer eller oppdaterer en systeminnstilling.
 */
export async function setSetting(
  key: string,
  value: string,
  description?: string,
  isSecret: boolean = false
): Promise<void> {
  memorySettings.set(key, { key, value, description, isSecret, updatedAt: new Date() });

  try {
    await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value,
        description: description || undefined,
        isSecret,
      },
      create: {
        key,
        value,
        description: description || null,
        isSecret,
      },
    });
  } catch (error) {
    console.warn(`[SystemSetting] Kunne ikke persistere innstilling '${key}' til databasen, lagret i minnet:`, error);
  }
}

/**
 * Henter alle innstillinger for admin-grensesnittet.
 * Skjuler hemmeligheter dersom maskSecrets er satt til true.
 */
export async function getAllSettings(maskSecrets: boolean = true): Promise<SystemSettingItem[]> {
  const result = new Map<string, SystemSettingItem>(memorySettings);

  try {
    const dbSettings = await prisma.systemSetting.findMany();
    for (const item of dbSettings) {
      result.set(item.key, {
        key: item.key,
        value: item.value,
        description: item.description,
        isSecret: item.isSecret,
        updatedAt: item.updatedAt,
      });
    }
  } catch {
    // Fallback til default verdier
  }

  // Overstyr med env dersom satt og DB er tom
  for (const [key, item] of result.entries()) {
    if (!item.value) {
      const envVal = process.env[key.toUpperCase()] || process.env[key];
      if (envVal) {
        result.set(key, { ...item, value: envVal });
      }
    }
  }

  return Array.from(result.values()).map((s) => {
    if (maskSecrets && s.isSecret && s.value) {
      const len = s.value.length;
      if (len > 8) {
        return {
          ...s,
          value: `${s.value.slice(0, 4)}••••••••${s.value.slice(-4)}`,
        };
      }
      return { ...s, value: '••••••••' };
    }
    return s;
  });
}
