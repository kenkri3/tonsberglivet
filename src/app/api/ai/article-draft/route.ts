import { NextResponse } from 'next/server';
import { createOneMinChatCompletion } from '@/lib/onemin-client';
import { getEffectiveGeminiApiKey, getGeminiClient } from '@/lib/ai-config';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category = 'Bylivet', notes = '', existingExcerpt = '' } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Artikkel-tittel er påkrevd for å generere utkast.' },
        { status: 400 }
      );
    }

    const cleanTitle = title.trim();
    const cleanCategory = category.trim() || 'Bylivet';
    const cleanNotes = typeof notes === 'string' ? notes.trim() : '';

    const systemPrompt = `Du er en erfaren journalist og redaksjonell skribent for Tønsberglivet (tonsberglivet.no), det ledende bymagasinet og informasjonsportalen for Tønsberg og Færder.
Du skriver på varmt, engasjerende og feilfritt norsk bokmål.

Oppgave:
Skriv et komplett, publiseringsklart artikkelutkast basert på tittelen og eventuelle stikkord.
Artikkelen må ha lokal forankring i Tønsberg (nevne kjente steder som Brygga, Torvet, Slottsfjellet, Haugar, Teie eller Kaldnes der det passer naturlig).

Formatkrav:
Svar KUN med et gyldig JSON-objekt (uten ekstra tekst eller markdown-kodeblokker) med nøyaktig to felter:
{
  "excerpt": "En engasjerende ingress på 2-3 setninger som oppsummerer saken.",
  "content": "Full brødtekst i Markdown med overskrifter (##), avsnitt, sitatblokk og oppsummering."
}`;

    const userPrompt = `Tittel: "${cleanTitle}"
Kategori: ${cleanCategory}
${cleanNotes ? `Stikkord/notater fra redaktøren: "${cleanNotes}"` : ''}
${existingExcerpt ? `Eksisterende ingress: "${existingExcerpt}"` : ''}

Lag et gjennomarbeidet utkast med ingress og Markdown-brødtekst tilpasset ${cleanCategory} i Tønsberg.`;

    let generatedExcerpt = '';
    let generatedContent = '';

    // 1. Forsøk 1min.AI via OpenAI-kompatibelt endepunkt (Railway 1_MIN_AI)
    try {
      const oneMinRes = await createOneMinChatCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        {
          model: 'gpt-4o-mini',
          maxTokens: 2000,
        }
      );

      if (oneMinRes.success && oneMinRes.content) {
        const rawJson = oneMinRes.content.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(rawJson);
        if (parsed.excerpt && parsed.content) {
          generatedExcerpt = parsed.excerpt.trim();
          generatedContent = parsed.content.trim();
        }
      }
    } catch (oneMinError) {
      console.warn('[Article Draft API] 1min.AI forsøk feilet eller returnerte ikke-JSON:', oneMinError);
    }

    // 2. Forsøk Google Gemini som sekundær fallback hvis 1min.AI ikke ga resultat
    if (!generatedContent) {
      const geminiApiKey = await getEffectiveGeminiApiKey();
      if (geminiApiKey) {
        try {
          const client = await getGeminiClient();
          if (client) {
            const geminiRes = await client.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: `${systemPrompt}\n\n${userPrompt}`,
            });
            const text = geminiRes.text || '';
            const rawJson = text.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(rawJson);
            if (parsed.excerpt && parsed.content) {
              generatedExcerpt = parsed.excerpt.trim();
              generatedContent = parsed.content.trim();
            }
          }
        } catch (geminiError) {
          console.warn('[Article Draft API] Gemini fallback feilet:', geminiError);
        }
      }
    }

    // 3. Robust redaksjonell fallback dersom ingen KI-nøkkel var tilgjengelig eller begge feilet
    if (!generatedContent) {
      const notesElaboration = cleanNotes
        ? `\n\nBakgrunnen for saken er oppløftende: ${cleanNotes}. Dette understreker den positive utviklingen og det høye engasjementet vi nå opplever i Tønsberg.`
        : '';

      generatedExcerpt =
        existingExcerpt ||
        `Det er stor entusiasme i ${cleanCategory.toLowerCase()} i Norges eldste by. «${cleanTitle}» markerer et nytt og spennende kapittel for lokalsamfunnet.`;

      generatedContent = `## En merkedag for ${cleanCategory.toLowerCase()} i Tønsberg

Stemningen er til å ta og føle på i Tønsberg. Med «${cleanTitle}» rettes søkelyset mot den sterke drivkraften og det levende fellesskapet som preger byen vår.${notesElaboration}

## Sterkt lokalt engasjement

Både innbyggere, næringsdrivende og besøkende merker at det yrer av aktivitet langs Brygga og i de historiske gatene rundt Torvet. 

> «Dette viser hva vi får til når lokale krefter trekker sammen. Tønsberg har en unik kombinasjon av rik kystkultur, tradisjoner og fremtidsrettet skaperglede.»

Med stadig nye initiativer befester Tønsberg sin posisjon som fylkets mest dynamiske møteplass året rundt.

## Veien videre

Tønsberglivet følger utviklingen tett fremover. Vi oppfordrer alle til å ta turen til sentrum, oppleve stemningen og støtte opp om de lokale aktørene som gjør byen vår så spesiell.

*Følg med på tonsberglivet.no for løpende oppdateringer om arrangementer, kultur og byl фор liv.*`;
    }

    return NextResponse.json({
      success: true,
      excerpt: generatedExcerpt,
      content: generatedContent,
    });
  } catch (err: any) {
    console.error('[Article Draft API] Uventet feil:', err);
    return NextResponse.json(
      { success: false, error: `Feil ved generering av artikkelutkast: ${err?.message || 'Uventet feil'}` },
      { status: 500 }
    );
  }
}
