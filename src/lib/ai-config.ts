import { getSetting } from './settings';

/**
 * Henter kundens egen Gemini API-nøkkel (BYOK - Bring Your Own Key).
 * Sjekker først databaseinnstillinger for Tønsberglivet.
 * Faller deretter tilbake til prosess-miljøvariabel dersom satt i deres eget Railway-prosjekt.
 * Returnerer null hvis ingen nøkkel er satt.
 */
export async function getEffectiveGeminiApiKey(): Promise<string | null> {
  const customKey = await getSetting('gemini_api_key');
  if (customKey && customKey.trim().length > 0) {
    return customKey.trim();
  }

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0) {
    return process.env.GEMINI_API_KEY.trim();
  }

  return null;
}
