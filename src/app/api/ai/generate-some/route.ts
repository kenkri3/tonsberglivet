import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { title, text, category } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!title) {
      return NextResponse.json({ success: false, error: 'Tittel er påkrevd' }, { status: 400 });
    }

    if (!apiKey) {
      // Mock fallback response for local dev without key
      return NextResponse.json({
        success: true,
        data: {
          facebook: `🎉 ${title}\n\n${text || 'Det skjer spennende ting i Tønsberg! Read mer på tonsberglivet.no'}\n\n#Tønsberglivet #Tønsberg #Vestfold`,
          instagram: `✨ ${title}\n\n${text || 'Opplev stemningen i Norges eldste by!'}\n.\n.\n#tonsberglivet #tbglivet #tønsberg #bryggaitønsberg #færder #byliv`,
          linkedin: `📈 Tønsberglivet Nyheter: ${title}\n\nVi gleder oss over positiv utvikling i Tønsbergregionen. ${text || ''}\n\nLes mer om nærings- og byutvikling på tonsberglivet.no.`,
          newsletter: `Overskrift: ${title}\n\nKjære Tønsberg-venn,\n${text || ''}\n\nVelkommen til å oppleve mer av Tønsberglivet!`,
        },
      });
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
