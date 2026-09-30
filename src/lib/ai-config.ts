import { GoogleGenAI } from '@google/genai';
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

/**
 * Henter initialisert GoogleGenAI-klient med dynamisk BYOK-nøkkel fra SystemSetting eller env.
 */
export async function getGeminiClient(): Promise<GoogleGenAI | null> {
  const apiKey = await getEffectiveGeminiApiKey();
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Genererer svar fra Gemini for agenten og redaksjonelle verktøy.
 */
export async function generateAgentResponse(
  prompt: string,
  systemInstruction?: string,
  modelName: string = 'gemini-2.5-flash'
): Promise<string> {
  const ai = await getGeminiClient();

  if (!ai) {
    return `[Lokal Agent Fallback] Hei! Tønsberg-agenten er aktiv, men ingen Gemini API-nøkkel er konfigurert i innstillinger (/admin/innstillinger).`;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: systemInstruction
        ? {
            systemInstruction,
          }
        : undefined,
    });

    return response.text || 'Ingen tekst generert.';
  } catch (error: any) {
    console.error('[Gemini Agent Error]:', error);
    return `Beklager, det oppstod en feil ved kontakt med Gemini API: ${error?.message || 'Ukjent feil'}`;
  }
}
