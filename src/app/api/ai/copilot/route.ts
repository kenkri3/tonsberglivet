import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getEffectiveGeminiApiKey } from '@/lib/ai-config';

export async function POST(request: Request) {
  try {
    const { prompt, agent, tone } = await request.json();
    const apiKey = await getEffectiveGeminiApiKey();

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt er påkrevd' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Ingen aktiv Gemini API-nøkkel funnet. Vennligst legg inn egen gratis nøkkel fra Google AI Studio under Admin > Innstillinger (BYOK).',
      }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `Du er en erfaren redaksjonell skribent og kommunikasjonsrådgiver for Tønsberglivet (organisasjonen som utvikler og fremmer Tønsberg og Færder som bo-, besøks-, nærings- og studentregion).
Rolle: ${agent || 'Lokaljournalist'}.
Stemning/Tone: ${tone || 'varm og engasjerende'}.
Skriv på levende, velskrevet norsk (bokmål) med markdown-formatering, overskrifter (H1, H3) og avsnitt.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
      }
    });

    const outputText = response.text || '';
    return NextResponse.json({ success: true, text: outputText });
  } catch (error: any) {
    console.error('AI Copilot error:', error);
    return NextResponse.json(
      { success: false, error: 'Feil ved generering av innhold med Gemini: ' + (error?.message || '') },
      { status: 500 }
    );
  }
}
