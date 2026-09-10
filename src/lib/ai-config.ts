import { GoogleGenAI } from '@google/genai';
import { getSetting } from './settings';

/**
 * Henter initialisert GoogleGenAI-klient med dynamisk BYOK-nøkkel fra SystemSetting eller env.
 */
export async function getGeminiClient(): Promise<GoogleGenAI | null> {
  const apiKey = await getSetting('gemini_api_key');
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
    // Fallback svar dersom API-nøkkel ikke er lagt inn
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
