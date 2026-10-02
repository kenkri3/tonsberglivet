import { NextResponse } from 'next/server';
import { getEffectiveGeminiApiKey, generateUnifiedAiResponse } from '@/lib/ai-config';
import { requireEditorOrAdmin } from '@/lib/auth';
import { 
  ENTERPRISE_SEO_SYSTEM_INSTRUCTION, 
  generateSafeSlug, 
  auditSeoQuality, 
  calculatePublishingTiming,
  generateEnterpriseSchemaGraph,
  EnterpriseSeoOutput 
} from '@/lib/seo-engine';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const auth = requireEditorOrAdmin(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Uautorisert' },
        { status: auth.user ? 403 : 401 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Ugyldig JSON i forespørselen' }, { status: 400 });
    }

    const { 
      prompt, 
      agent, 
      tone, 
      mode = 'standard', 
      targetDate, 
      category = 'Bylivet',
      entityType = 'Article'
    } = body;

    const apiKey = await getEffectiveGeminiApiKey();
    const oneMinKey = await (await import('@/lib/ai-config')).getEffectiveOneMinAiKey();

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt er påkrevd' }, { status: 400 });
    }

    // 1. Sjekk stoppregel for utgåtte arrangementer i Enterprise SEO modus
    if (mode === 'enterprise-seo' && targetDate) {
      const timing = calculatePublishingTiming(targetDate);
      if (timing.window === 'expired') {
        return NextResponse.json({
          success: false,
          error: 'Stoppregel aktivert: Søkemotorer og GEO-modeller straffer innhold for utgåtte datoer. Omdiriger eksisterende trafikk til /eventer med 301.',
          timing,
        }, { status: 400 });
      }
    }

    // 2. Hvis ingen nøkkel finnes, er dette en serverkonfigurasjonsfeil (ikke klientfeil)
    if (!apiKey && !oneMinKey) {
      return NextResponse.json({
        success: false,
        error: 'AI-tjenesten er ikke konfigurert på serveren: Ingen aktiv AI API-nøkkel funnet. Vennligst legg inn 1_MIN_AI i Railway eller Gemini-nøkkel under Admin > Innstillinger (BYOK).',
      }, { status: 503 });
    }

    const { generateUnifiedAiResponse } = await import('@/lib/ai-config');

    // 3. Modus: Enterprise SEO & Content Engine
    if (mode === 'enterprise-seo') {
      const timingInfo = targetDate ? calculatePublishingTiming(targetDate) : null;
      
      const fullPrompt = `Oppgave: Generer en komplett, autoritær Enterprise SEO & GEO artikkel for Tønsberglivet.
Tema / Brukerønske: "${prompt}"
Kategori: ${category}
Entitetstype: ${entityType}
${timingInfo ? `Publiseringsvindu: ${timingInfo.label} (${timingInfo.recommendation})` : ''}

HUSK KRAVENE FRA SYSTEMINSTRUKSJONEN:
- H1: Nøyaktig 50–60 tegn med stedsnavn (Tønsberg, Slottsfjellet, Brygga, osv.)
- Meta Description: Nøyaktig 145–158 tegn med tydelig handlingsappell (CTA)
- Slug: Små bokstaver, ingen æ/ø/å, 3–5 ord med bindestrek
- Minst 2–4 toveis internlenker til /bylivet, /eventer, /reiselivet, /naeringslivet eller /studentlivet
- Minst 2 konverteringsknapper/CTA i teksten
- Rik Markdown med infoboks/punktliste for GEO-faktatetthet
- Valid Schema.org @graph JSON-LD

SVAR KUN MED ET VALID JSON-OBJEKT I DET OPPGITTE FORMATET. INGEN TEKST UTENFOR JSON-OBJEKTET.`;

      const rawText = (await generateUnifiedAiResponse({
        prompt: fullPrompt,
        systemInstruction: ENTERPRISE_SEO_SYSTEM_INSTRUCTION,
        preferEu: true,
      })) || '{}';
      let parsedData: EnterpriseSeoOutput;

      try {
        parsedData = JSON.parse(rawText);
      } catch (parseError) {
        // Forsøk å hente ut JSON dersom det ligger innpakket i kodeblokker
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Kunne ikke tolke JSON fra AI-modell: ' + rawText.slice(0, 100));
        }
      }

      // Rens og valider slug
      parsedData.slug = generateSafeSlug(parsedData.slug || parsedData.title);

      // Sørg for Schema.org @graph dersom modellen glemte deler
      if (!parsedData.schema_json_ld || !parsedData.schema_json_ld['@graph']) {
        parsedData.schema_json_ld = generateEnterpriseSchemaGraph({
          type: entityType === 'Event' ? 'Event' : 'Article',
          title: parsedData.title,
          description: parsedData.meta_description || parsedData.excerpt,
          slug: parsedData.slug,
          category: parsedData.category || category,
        });
      }

      // Gjennomfør on-page SEO og GEO audit
      const audit = auditSeoQuality(parsedData);

      return NextResponse.json({
        success: true,
        data: parsedData,
        seoScore: audit,
        timing: timingInfo,
      });
    }

    // 4. Modus: Standard Copilot tekstgenerering (legacy / enkel tekst)
    const systemInstruction = `Du er en erfaren redaksjonell skribent og kommunikasjonsrådgiver for Tønsberglivet (organisasjonen som utvikler og fremmer Tønsberg og Færder som bo-, besøks-, nærings- og studentregion).
Rolle: ${agent || 'Lokaljournalist'}.
Stemning/Tone: ${tone || 'varm og engasjerende'}.
Skriv på levende, velskrevet norsk (bokmål) med markdown-formatering, overskrifter (H1, H2, H3) og avsnitt.`;

    const outputText = await generateUnifiedAiResponse({
      prompt,
      systemInstruction,
      preferEu: true,
    });

    return NextResponse.json({ success: true, text: outputText });
  } catch (error: any) {
    console.error('AI Copilot error:', error);
    return NextResponse.json(
      { success: false, error: 'Feil ved generering av innhold med Gemini: ' + (error?.message || '') },
      { status: 500 }
    );
  }
}
