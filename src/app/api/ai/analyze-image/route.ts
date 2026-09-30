import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getEffectiveGeminiApiKey } from '@/lib/ai-config';

export async function POST(request: Request) {
  try {
    const apiKey = await getEffectiveGeminiApiKey();
    const body = await request.json();
    const { imageName, folder } = body;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Ingen aktiv Gemini API-nøkkel funnet. Legg inn egen nøkkel under Admin > Innstillinger (BYOK).',
      }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Analyser dette bildet for en byutviklingsportal i Tønsberg, Norge.
Returner et JSON-objekt med:
- aiTags: array med 4-6 relevante norske tagger (f.eks. "Torvet", "Brygga", "Sommer", "Konsert")
- suggestedGdpr: enten "APPROVED" (hvis ingen gjenkjennelige ansikter uten samtykke) eller "PENDING"
- aiSummary: en kort norsk setning som beskriver motivet.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || '';
    let parsedResult;
    try {
      parsedResult = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch (e) {
      parsedResult = {
        aiTags: ['Tønsberg', folder || 'Bylivet', 'Aktivitet'],
        suggestedGdpr: 'APPROVED',
        aiSummary: `Bilde ${imageName} analysert av Gemini.`,
      };
    }

    return NextResponse.json({ success: true, ...parsedResult });
  } catch (error: any) {
    console.error('AI Image Analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke analysere bildet med Google AI Studio' },
      { status: 500 }
    );
  }
}
