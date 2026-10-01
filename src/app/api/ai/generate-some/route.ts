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
Generer 6 sosiale medier-innlegg basert på følgende sak:
Tittel: "${title}"
Kategori: "${category || 'Bylivet'}"
Innhold: "${text || ''}"

Returner et JSON-objekt med nøklene:
- "facebook": En folkelig, engasjerende Facebook-post for Tønsberglivets offisielle side med emojier og oppfordring til å besøke nettsiden.
- "facebookGroup": En uformell, fellesskapsorientert post tilpasset en lokal Facebook-gruppe med engasjerende spørsmål og dialog.
- "instagram": En visuell, stemningsfull Instagram-tekst med relevante lokale emneknagger (#tønsberg #tonsberglivet #slottsfjellet osv.).
- "googleBusiness": En presis, lokal Google Business Profile-oppdatering (150-300 tegn) med klar oppfordring til handling.
- "linkedin": En profesjonell vinkling rettet mot næringsliv, byutvikling og samarbeidspartnere.
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
        facebook: `🎉 ${title}\n\nLes hele saken på tonsberglivet.no!`,
        facebookGroup: `Hei alle sammen! ☀️ Hva tenker dere om dette? ${title}\n\nDel gjerne dine innspill!`,
        instagram: `✨ ${title}\n\n#tonsberglivet #tønsberg #vestfold`,
        googleBusiness: `Nyhet fra Tønsberglivet: ${title}. Les mer og planlegg ditt neste besøk!`,
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
