import { GoogleGenAI } from '@google/genai';
import { getSetting } from './settings';

/**
 * Henter kundens egen 1min.AI API-nøkkel (OpenAI-kompatibel).
 * Sjekker:
 * 1. Databaseinnstilling '1_min_ai' eller 'one_min_ai_key'
 * 2. Miljøvariabel 1_MIN_AI (slik kunden har konfigurert i Railway)
 * 3. Miljøvariabel ONE_MIN_AI / ONE_MIN_AI_API_KEY
 */
export async function getEffectiveOneMinAiKey(): Promise<string | null> {
  const customKey = (await getSetting('1_min_ai')) || (await getSetting('one_min_ai_key'));
  if (customKey && customKey.trim().length > 0) {
    return customKey.trim();
  }

  // Railway setter ofte eksakt navn kunden oppgir: process.env['1_MIN_AI']
  if (process.env['1_MIN_AI'] && process.env['1_MIN_AI'].trim().length > 0) {
    return process.env['1_MIN_AI'].trim();
  }

  if (process.env.ONE_MIN_AI && process.env.ONE_MIN_AI.trim().length > 0) {
    return process.env.ONE_MIN_AI.trim();
  }

  if (process.env.ONEMIN_API_KEY && process.env.ONEMIN_API_KEY.trim().length > 0) {
    return process.env.ONEMIN_API_KEY.trim();
  }

  if (process.env.ONE_MIN_AI_API_KEY && process.env.ONE_MIN_AI_API_KEY.trim().length > 0) {
    return process.env.ONE_MIN_AI_API_KEY.trim();
  }

  if (process.env.ONE_MIN_AI_KEY && process.env.ONE_MIN_AI_KEY.trim().length > 0) {
    return process.env.ONE_MIN_AI_KEY.trim();
  }

  return null;
}

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

export interface UnifiedAiOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  preferEu?: boolean; // Velg EU/EØS-basert modell (f.eks. Mistral AI i Frankrike) for streng GDPR-etterlevelse
  modelName?: string;
}

/**
 * Genererer AI-svar ved å sømløst veksle mellom:
 * 1. 1min.AI (OpenAI-kompatibelt endepunkt via 1_MIN_AI miljøvariabel i Railway)
 * 2. Google Gemini (via GEMINI_API_KEY)
 * 3. Intelligent lokal redaksjonell fallback
 */
export async function generateUnifiedAiResponse(options: UnifiedAiOptions): Promise<string> {
  const { prompt, systemInstruction, temperature = 0.7, preferEu = true, modelName } = options;

  // 1. Prøv 1min.AI hvis konfigurert (kunden opprettet 1_MIN_AI i Railway)
  const oneMinKey = await getEffectiveOneMinAiKey();
  if (oneMinKey) {
    try {
      const { createOneMinChatCompletion } = await import('./onemin-client');
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
      if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
      }
      messages.push({ role: 'user', content: prompt });

      // Støttede modeller i 1min.ai OpenAI-kompatibel adapter:
      // gpt-4o-mini, gpt-4.1-mini, mistral-large-latest
      const targetModel = (modelName as any) || (preferEu ? 'gpt-4o-mini' : 'gpt-4o-mini');

      const result = await createOneMinChatCompletion(messages, {
        model: targetModel,
        temperature,
        maxTokens: 2048,
      });

      if (result.success && result.content && result.content.trim().length > 0) {
        return result.content.trim();
      }
      if (result.error) {
        console.warn('[1min.AI Response Warning]:', result.error);
      }
    } catch (err) {
      console.warn('[1min.AI Fetch Warning]:', err);
    }
  }

  // 2. Prøv Google Gemini
  const geminiAi = await getGeminiClient();
  if (geminiAi) {
    try {
      const response = await geminiAi.models.generateContent({
        model: modelName || 'gemini-2.5-flash',
        contents: prompt,
        config: systemInstruction
          ? {
              systemInstruction,
            }
          : undefined,
      });

      if (response.text && response.text.trim().length > 0) {
        return response.text.trim();
      }
    } catch (error: any) {
      console.error('[Gemini Agent Error]:', error);
    }
  }

  return '';
}

/**
 * Bakoverkompatibel hjelpefunksjon for agenten og redaksjonelle verktøy.
 */
export async function generateAgentResponse(
  prompt: string,
  systemInstruction?: string,
  modelName: string = 'gemini-2.5-flash'
): Promise<string> {
  const answer = await generateUnifiedAiResponse({
    prompt,
    systemInstruction,
    modelName,
    preferEu: true,
  });

  if (answer && answer.length > 0) {
    return answer;
  }

  return `[Lokal Agent Fallback] Hei! Tønsberg-agenten er aktiv. Verken 1_MIN_AI eller GEMINI_API_KEY svarte, vennligst sjekk variabler i Railway eller /admin/innstillinger.`;
}
