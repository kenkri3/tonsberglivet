import { getSetting } from './settings';

/**
 * Henter 1min.AI API-nøkkel fra Railway miljøvariabel eller databasen.
 * I Railway er den lagt inn som variabelen: 1_MIN_AI
 */
export async function getEffectiveOneMinApiKey(): Promise<string | null> {
  const envVal =
    process.env['1_MIN_AI'] ||
    process.env['ONEMIN_API_KEY'] ||
    process.env['ONE_MIN_AI'] ||
    process.env['ONE_MIN_AI_API_KEY'] ||
    process.env['ONE_MIN_AI_KEY'];

  if (envVal && envVal.trim()) {
    return envVal.trim();
  }

  const customKey = (await getSetting('1_min_ai')) || (await getSetting('one_min_ai_key'));
  if (customKey && customKey.trim()) {
    return customKey.trim();
  }

  return null;
}

/**
 * GDPR & Norsk personvern-sanitering:
 * Vasker automatisk bort sensitive norske personopplysninger (fødselsnummer 11 siffer, kredittkort)
 * før tekst sendes til eksterne KI-modeller.
 */
export function sanitizeGdprText(input: string): string {
  if (!input) return '';

  return input
    // Norsk fødselsnummer (11 siffer) -> [PERSONNUMMER SKJERMET]
    .replace(/\b\d{6}\s?\d{5}\b/g, '[SKJERMET FNR I HENHOLD TIL GDPR]')
    // Kredittkortnummer (16 siffer)
    .replace(/\b(?:\d{4}[ -]?){3}\d{4}\b/g, '[KORTNUMMER SKJERMET]')
    // Sensitiv helseopplysning markør
    .replace(/\b(?:diagnose|pasientjournal)\b/gi, '[HELSEDATA]');
}

export interface OneMinChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  tool_call_id?: string;
}

export interface OneMinChatOptions {
  model?:
    | 'gpt-4o-mini'
    | 'gpt-4.1-mini'
    | 'gpt-4o'
    | 'gpt-4.1'
    | 'o3-mini'
    | 'deepseek-flash'
    | 'deepseek-v4-pro'
    | 'qwen-flash'
    | 'mistral-large-latest';
  temperature?: number;
  maxTokens?: number;
  tools?: any[];
  toolChoice?: any;
}

/**
 * Kaller 1min.AI via deres offisielle OpenAI-kompatible endepunkt:
 * https://api.1min.ai/openai/v1/chat/completions
 * Dokumentasjon: https://docs.1min.ai/docs/api/openai-compatible
 */
export async function createOneMinChatCompletion(
  messages: OneMinChatMessage[],
  options: OneMinChatOptions = {}
): Promise<{
  success: boolean;
  content: string;
  toolCalls?: any[];
  model: string;
  error?: string;
}> {
  const apiKey = await getEffectiveOneMinApiKey();
  if (!apiKey) {
    return {
      success: false,
      content: '',
      model: options.model || 'gpt-4o-mini',
      error: 'Ingen 1min.AI API-nøkkel (1_MIN_AI) funnet i Railway eller innstillinger.',
    };
  }

  // GDPR-saniter alle meldinger før avsending
  const sanitizedMessages = messages.map((m) => ({
    role: m.role,
    content: sanitizeGdprText(m.content),
    ...(m.name ? { name: m.name } : {}),
    ...(m.tool_call_id ? { tool_call_id: m.tool_call_id } : {}),
  }));

  const primaryModel = options.model || 'gpt-4o-mini';

  const sendRequest = async (modelName: string) => {
    const payload: any = {
      model: modelName,
      messages: sanitizedMessages,
      max_completion_tokens: options.maxTokens || 2048,
    };

    if (options.temperature !== undefined) {
      payload.temperature = options.temperature;
    }

    if (options.tools && options.tools.length > 0) {
      payload.tools = options.tools;
      if (options.toolChoice) {
        payload.tool_choice = options.toolChoice;
      }
    }

    const res = await fetch('https://api.1min.ai/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(28000),
    });

    return res;
  };

  try {
    let res = await sendRequest(primaryModel);

    // Hvis primærmodell returnerer 400 (f.eks. ukjent modellnavn hos leverandør), forsøk gpt-4.1-mini
    if (!res.ok && res.status === 400 && primaryModel !== 'gpt-4.1-mini') {
      console.warn(`[1min.AI] Primærmodell ${primaryModel} feilet med 400, prøver gpt-4.1-mini...`);
      res = await sendRequest('gpt-4.1-mini');
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        success: false,
        content: '',
        model: primaryModel,
        error: `1min.AI status ${res.status}: ${errText.slice(0, 200)}`,
      };
    }

    const data = await res.json();
    const choice = data?.choices?.[0];

    return {
      success: true,
      content: choice?.message?.content || '',
      toolCalls: choice?.message?.tool_calls || undefined,
      model: data?.model || primaryModel,
    };
  } catch (err: any) {
    return {
      success: false,
      content: '',
      model: primaryModel,
      error: `Feil ved kontakt med 1min.AI: ${err?.message || 'Nettverksfeil'}`,
    };
  }
}

/**
 * Rask test-funksjon for å verifisere 1min.AI forbindelsen
 */
export async function testOneMinAiConnection(): Promise<{ success: boolean; message: string }> {
  const result = await createOneMinChatCompletion(
    [
      { role: 'system', content: 'Svar på ett ord på norsk: "Operativ".' },
      { role: 'user', content: 'Status?' },
    ],
    { model: 'gpt-4o-mini', maxTokens: 10 }
  );

  if (result.success) {
    return {
      success: true,
      message: `✅ 1min.AI er 100% operativ via ${result.model}!`,
    };
  }

  return {
    success: false,
    message: result.error || 'Kunne ikke koble til 1min.AI',
  };
}
