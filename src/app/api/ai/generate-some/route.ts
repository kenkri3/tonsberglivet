import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getEffectiveGeminiApiKey } from '@/lib/ai-config';

export async function POST(request: Request) {
  try {
    const { title, text, category } = await request.json();
    const apiKey = await getEffectiveGeminiApiKey();

    if (!title) {
      return NextResponse.json({ success: false, error: 'Tittel er påkrevd' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Ingen aktiv Gemini API-nøkkel funnet. Legg inn egen nøkkel under Admin > Innstillinger (BYOK).',
      }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Du er kommunikasjonsansvarlig for Tønsberglivet AS.
Generer 4 sosiale medier-innlegg basert på følgende sak:
Tittel: "${title}"
Kategori: "${category || 'Bylivet'}"
Innhold: "${text || ''}"

Returner et JSON-objekt med nøklene:
- "facebook": En folkelig, engasjerende Facebook-post med emojier og oppfordring til å besøke nettsiden.
- "instagram": En visuell, stemningsfull Instagram-post med relevante emneknagger.
- "linkedin": En profesjonell vinkling rettet mot næringsliv og samarbeidspartnere.
- "newsletter": Et kort avsnitt tilpasset et ukentlig nyhetsbrev.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const outputText = response.text || '';
    let parsedData;
    try {
      parsedData = JSON.parse(outputText.replace(/```json|```/g, '').trim());
    } catch (e) {
      parsedData = {
        facebook: `🎉 ${title}\n\nLes saken på tonsberglivet.no!`,
        instagram: `✨ ${title}\n\n#tonsberglivet #tønsberg`,
        linkedin: `Tønsberglivet: ${title}`,
        newsletter: title,
      };
    }

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('AI SoMe generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Feil ved generering av SoMe-innhold' },
      { status: 500 }
    );
  }
}
