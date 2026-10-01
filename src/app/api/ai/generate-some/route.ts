import { NextResponse } from 'next/server';
import { getSetting } from '@/lib/settings';

export async function POST(request: Request) {
  try {
    const { title, text, category } = await request.json();
    
    // Hent API-nøkkelen fra innstillinger (tidligere Gemini, nå AI-nøkkel)
    let apiKey = await getSetting('gemini_api_key');
    if (!apiKey || apiKey.trim().length === 0) {
      apiKey = process.env.GEMINI_API_KEY;
    }

    if (!title) {
      return NextResponse.json({ success: false, error: 'Tittel er påkrevd' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Ingen aktiv API-nøkkel funnet. Legg inn nøkkel under Admin > Innstillinger.',
      }, { status: 400 });
    }

    const prompt = `Du er kommunikasjonsansvarlig for Tønsberglivet AS.
Generer 6 sosiale medier-innlegg basert på følgende sak:
Tittel: "${title}"
Kategori: "${category || 'Bylivet'}"
Innhold: "${text || ''}"

Returner KUN et gyldig JSON-objekt (uten markdown) med nøklene:
- "facebook": En folkelig, engasjerende Facebook-post for Tønsberglivets offisielle side med emojier og oppfordring til å besøke nettsiden.
- "facebookGroup": En uformell, fellesskapsorientert post tilpasset en lokal Facebook-gruppe med engasjerende spørsmål og dialog.
- "instagram": En visuell, stemningsfull Instagram-tekst med relevante lokale emneknagger (#tønsberg #tonsberglivet #slottsfjellet osv.).
- "googleBusiness": En presis, lokal Google Business Profile-oppdatering (150-300 tegn) med klar oppfordring til handling.
- "linkedin": En profesjonell vinkling rettet mot næringsliv, byutvikling og samarbeidspartnere.
- "newsletter": Et kort avsnitt tilpasset et ukentlig nyhetsbrev.`;

    const response = await fetch('https://api.1min.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // 1min.ai usually routes compatible models
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('1min.ai API error:', err);
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const outputText = data.choices[0].message.content || '';

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
