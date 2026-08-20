import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { prompt, agent, tone } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt er påkrevd' }, { status: 400 });
    }

    if (!apiKey) {
      // High quality local fallback response
      return NextResponse.json({
        success: true,
        text: `# 5 magiske sommerminner du må oppleve på Slottsfjellet og Brygga i 2026

Tønsberg kalles med rette Norges eldste by, men om sommeren er det en pulserende og levende kystperle. Fra historiske tårn til sydende uteserveringer ved sjøkanten – her er høydepunktene du ikke bør gå glipp av denne sesongen:

### 1. Solnedgang fra Slottsfjellstårnet
Ta turen opp gjennom de frodige stiene mot toppen av fjellet. Med 360-graders utsikt over hele byen, fjorden og innseilingen er dette Vestfolds vakreste utkikkspunkt når kveldssolen senker seg.

### 2. Kulinariske opplevelser langs Brygga
Nedre Langgate forvandles på varme dager til et pulserende møtested. Enten du har lyst på ferske reker direkte fra lokale fiskere, italiensk håndverkspizza eller forfriskende gelato, finner du det her.

### 3. Kulturvandring i de historiske trehusgatene
Gründergata og Nordbyen byr på koselige brosteinsgater, små uavhengige butikker, gallerier og skjulte bakgårdscafeer med ferske kanelsnurrer.

---
*Publisert av Tønsberglivet Redaksjon • 2 min lesetid*`,
      });
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
      { success: false, error: 'Feil ved generering av innhold' },
      { status: 500 }
    );
  }
}
