import { prisma } from '@/lib/prisma';

// Minnebuffer dersom databasetabellen ennå ikke er migrert i produksjon
const memorySettings: Record<string, string> = {};

export async function getSetting(key: string, defaultValue?: string): Promise<string | undefined> {
  try {
    const setting = await (prisma as any).systemSetting?.findUnique({
      where: { key },
    });
    if (setting && setting.value) {
      return setting.value;
    }
  } catch (error) {
    // Hvis tabell ikke eksisterer ennå i DB, fall tilbake til minnebuffer
  }

  if (memorySettings[key] !== undefined) {
    return memorySettings[key];
  }

  return defaultValue;
}

export async function setSetting(key: string, value: string, category = 'GENERAL'): Promise<void> {
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
  return result;
}
