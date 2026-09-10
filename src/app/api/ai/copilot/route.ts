import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getEffectiveGeminiApiKey } from '@/lib/ai-config';
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
    const body = await request.json();
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

    // 2. Hvis ingen nøkkel finnes, returner feil eller pedagogisk instruksjon
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Ingen aktiv Gemini API-nøkkel funnet. Vennligst legg inn egen gratis nøkkel fra Google AI Studio under Admin > Innstillinger (BYOK).',
      }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

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

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
          systemInstruction: ENTERPRISE_SEO_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
        },
      });

      const rawText = response.text || '{}';
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
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
