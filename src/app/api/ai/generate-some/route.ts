import { NextResponse } from 'next/server';
import { createOneMinChatCompletion } from '@/lib/onemin-client';
import { getEffectiveGeminiApiKey, getGeminiClient } from '@/lib/ai-config';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { title, text, category } = await request.json();

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Tittel er påkrevd' }, { status: 400 });
    }

    const cleanTitle = title.trim();
    const cleanCategory = (category || 'Bylivet').trim();
    const cleanText = typeof text === 'string' ? text.trim() : '';

    const systemPrompt = `Du er kommunikasjonsansvarlig for Tønsberglivet (tonsberglivet.no) i Tønsberg og Færder.
Du lager engasjerende, profesjonelt og tilpasset innhold for ulike sosiale medier og kanaler på norsk bokmål.

Formatkrav:
Returner KUN et gyldig JSON-objekt (uten markdown-formatering eller \`\`\`json kodeblokker) med nøyaktig disse 6 nøklene:
- "facebook": En folkelig, engasjerende Facebook-post for Tønsberglivets offisielle side med emojier, god stemning og oppfordring til å besøke nettsiden tonsberglivet.no.
- "facebookGroup": En uformell, fellesskapsorientert post tilpasset en lokal Facebook-gruppe med engasjerende spørsmål og invitasjon til dialog og kommentarer.
- "instagram": En visuell, stemningsfull Instagram-caption med linjeskift, emojier og relevante lokale emneknagger (#tønsberg #tonsberglivet #slottsfjellet #vestfold #bryggaitønsberg).
- "googleBusiness": En presis, lokal Google Business Profile-oppdatering (150-300 tegn) med klar oppfordring til handling (CTA).
- "linkedin": En profesjonell vinkling rettet mot næringsliv, byutvikling, verdiskaping og samarbeidspartnere i Vestfold.
- "newsletter": Et kort, innbydende avsnitt tilpasset et ukentlig nyhetsbrev til abonnenter.`;

    const userPrompt = `Lag SoMe- og kanalinnhold for følgende sak:
Tittel: "${cleanTitle}"
Kategori: "${cleanCategory}"
${cleanText ? `Ingress/Innhold: "${cleanText}"` : ''}`;

    let parsedData: {
      facebook: string;
      facebookGroup: string;
      instagram: string;
      googleBusiness: string;
      linkedin: string;
      newsletter: string;
    } | null = null;

    // 1. Forsøk 1min.AI via OpenAI-kompatibelt endepunkt (Railway 1_MIN_AI)
    try {
      const oneMinRes = await createOneMinChatCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        {
          model: 'gpt-4o-mini',
          maxTokens: 1800,
        }
      );

      if (oneMinRes.success && oneMinRes.content) {
        const rawJson = oneMinRes.content.replace(/```json|```/g, '').trim();
        const jsonMatch = rawJson.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.facebook && parsed.instagram) {
            parsedData = {
              facebook: parsed.facebook,
              facebookGroup: parsed.facebookGroup || parsed.facebook,
              instagram: parsed.instagram,
              googleBusiness: parsed.googleBusiness || parsed.facebook.slice(0, 250),
              linkedin: parsed.linkedin || parsed.facebook,
              newsletter: parsed.newsletter || parsed.facebook,
            };
          }
        }
      }
    } catch (oneMinError) {
      console.warn('[SoMe API] 1min.AI forsøk feilet:', oneMinError);
    }

    // 2. Forsøk Google Gemini som fallback
    if (!parsedData) {
      const geminiApiKey = await getEffectiveGeminiApiKey();
      if (geminiApiKey) {
        try {
          const client = await getGeminiClient();
          if (client) {
            const geminiRes = await client.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: `${systemPrompt}\n\n${userPrompt}`,
            });
            const textContent = geminiRes.text || '';
            const rawJson = textContent.replace(/```json|```/g, '').trim();
            const jsonMatch = rawJson.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              if (parsed.facebook && parsed.instagram) {
                parsedData = {
                  facebook: parsed.facebook,
                  facebookGroup: parsed.facebookGroup || parsed.facebook,
                  instagram: parsed.instagram,
                  googleBusiness: parsed.googleBusiness || parsed.facebook.slice(0, 250),
                  linkedin: parsed.linkedin || parsed.facebook,
                  newsletter: parsed.newsletter || parsed.facebook,
                };
              }
            }
          }
        } catch (geminiError) {
          console.warn('[SoMe API] Gemini fallback feilet:', geminiError);
        }
      }
    }

    // 3. Robust redaksjonell fallback hvis ingen KI-nøkkel var tilgjengelig eller begge feilet
    if (!parsedData) {
      parsedData = {
        facebook: `🎉 ${cleanTitle}!\n\nDet skjer spennende ting i Tønsberg innen ${cleanCategory.toLowerCase()}. ${cleanText ? cleanText + ' ' : ''}Les mer om saken og oppdag hva byen har å by på!\n\n👉 Les hele saken på tonsberglivet.no`,
        facebookGroup: `Hei alle sammen! ☀️ Hva tenker dere om dette? «${cleanTitle}».\n\n${cleanText ? cleanText + '\n\n' : ''}Del gjerne dine tanker og erfaringer i kommentarfeltet under! 👇`,
        instagram: `✨ ${cleanTitle} ✨\n\nNorges eldste by leverer igjen! Enten du spaserer langs Brygga, nyter Torvet eller oppdager nye perler, er Tønsberg stedet å være denne sesongen. ⚓☀️\n\nTag noen du vil ta med deg til Tønsberg! 👇\n\n#tonsberglivet #tønsberg #vestfold #visitvestfold #bryggaitønsberg #slottsfjellet #byliv`,
        googleBusiness: `Nyhet fra Tønsberglivet: ${cleanTitle}. Hold deg oppdatert på arrangementer, byliv og handel i Tønsberg og Færder. Besøk tonsberglivet.no i dag!`,
        linkedin: `Spennende utvikling for ${cleanCategory.toLowerCase()} i Tønsberg-regionen: ${cleanTitle}.\n\nTønsberglivet arbeider målrettet for å fremme næringsliv, attraktivitet og vekst i Vestfold. Les hele analysen på tonsberglivet.no.`,
        newsletter: `Ukens høydepunkt i Tønsberg: ${cleanTitle}. ${cleanText || 'Få med deg siste nytt om arrangementer og byliv i ukens utgave av Tønsberglivet-nytt.'}`,
      };
    }

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('[SoMe API] Uventet feil:', error);
    return NextResponse.json(
      { success: false, error: 'Feil ved generering av SoMe-innhold: ' + (error?.message || '') },
      { status: 500 }
    );
  }
}
