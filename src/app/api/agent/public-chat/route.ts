import { NextRequest, NextResponse } from 'next/server';
import { getEffectiveGeminiApiKey } from '@/lib/ai-config';
import { GoogleGenAI } from '@google/genai';
import { toolGetRealEvents, toolGetRealtimeStatus, toolSearchBusinesses } from '@/lib/agent-tools';
import { logVisitorQuestion } from '@/lib/chatbot-logger';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = (body.message || '').trim();
    const contactName = body.name?.trim();
    const contactEmail = body.email?.trim();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Ingen melding oppgitt' },
        { status: 400 }
      );
    }

    const lower = message.toLowerCase();
    let topic: 'ARRANGEMENT' | 'MAT_DRIKKE' | 'TORVLEIE' | 'STRAND_SJO' | 'TRANSPORT' | 'PARKERING' | 'GENERELT' = 'GENERELT';

    if (lower.includes('konsert') || lower.includes('arrangement') || lower.includes('hva skjer') || lower.includes('helg') || lower.includes('foynhagen')) {
      topic = 'ARRANGEMENT';
    } else if (lower.includes('mat') || lower.includes('restaurant') || lower.includes('spise') || lower.includes('brygga') || lower.includes('pizza') || lower.includes('kaffe')) {
      topic = 'MAT_DRIKKE';
    } else if (lower.includes('torv') || lower.includes('stand') || lower.includes('bod') || lower.includes('leie') || lower.includes('selge')) {
      topic = 'TORVLEIE';
    } else if (lower.includes('bade') || lower.includes('strand') || lower.includes('vann') || lower.includes('temperatur') || lower.includes('sjø')) {
      topic = 'STRAND_SJO';
    } else if (lower.includes('tog') || lower.includes('buss') || lower.includes('reise') || lower.includes('rute')) {
      topic = 'TRANSPORT';
    } else if (lower.includes('parker') || lower.includes('bil') || lower.includes('lader')) {
      topic = 'PARKERING';
    }

    // Logg henvendelsen inn i visitor pulse og eventuell lead-fangst
    const leadCaptured = !!(contactEmail || contactName);
    await logVisitorQuestion(
      message,
      topic,
      true,
      leadCaptured ? { name: contactName, email: contactEmail } : undefined
    );

    let replyText = '';
    const quickReplies: Array<{ title: string; payload: string }> = [];

    // 1. Forsøk intelligent Gemini-svar med reell sanntidskontekst
    const apiKey = await getEffectiveGeminiApiKey();

    // Hent reelle data for kontekst
    const [eventsRes, realtimeRes] = await Promise.all([
      toolGetRealEvents(7).catch(() => ({ data: [] })),
      toolGetRealtimeStatus().catch(() => ({ data: null })),
    ]);

    const activeEvents = (eventsRes.data || []).slice(0, 5);
    const rt = realtimeRes.data;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `Du er den vennlige, lokale byverten «Tønsberg-Guiden» for Tønsberglivet (tonsberglivet.no).
Du hjelper turister, innbyggere og gjester med å oppleve det beste av Tønsberg og Færder.
Du svarer alltid på varmt, hjelpsomt og innbydende norsk.

REELLE SANNTIDSDATA FRA TØNSBERG AKKURAT NÅ:
- Kommende arrangementer og konserter: ${JSON.stringify(activeEvents)}
- Sjøtemperatur og flo/fjære: ${JSON.stringify(rt?.sjoOgVar || 'Ikke tilgjengelig')}
- Togavganger: ${JSON.stringify(rt?.togAvganger || 'Ikke tilgjengelig')}
- Luftkvalitet: ${rt?.luftkvalitet || 'God'}

RETNINGSLINJER:
1. Gi konkrete tips om Tønsberg (Brygga, Slottsfjellet, Foynhagen, Haugar, Tønsberg Torv, Ringshaugstranda).
2. Hvis noen spør om å leie stand på Torvet, forklar at de kan søke om torvleie på tonsberglivet.no eller legge igjen kontaktinfo her.
3. Vær kortfattet, lettlest og engasjerende med emojier.

Brukerens spørsmål: "${message}"`;

        const res = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        if (res && res.text) {
          replyText = res.text;
        }
      } catch (err: any) {
        console.warn('[Public Chat API] Gemini feilet:', err?.message);
      }
    }

    // 2. Regelbasert fallback med 100% reelle data hvis AI-nøkkel mangler
    if (!replyText) {
      if (topic === 'ARRANGEMENT') {
        replyText = `Velkommen til Tønsberg! Her er noen av de kommende arrangementene i byen:\n\n` +
          (activeEvents.length > 0
            ? activeEvents.map((e: any) => `• **${e.title}** (${e.location}) — ${e.date} kl. ${e.time}`).join('\n')
            : 'Sjekk vår fullstendige arrangementskalender på nettsiden for oppdaterte tider.') +
          `\n\nEr det noe spesielt du ser etter, som konserter, teater eller barneaktiviteter?`;
        quickReplies.push({ title: '🍽️ Spisesteder på Brygga', payload: 'Hvilke restauranter anbefales på Brygga?' });
        quickReplies.push({ title: '🌊 Badevannstemperatur', payload: 'Hva er badevannstemperaturen i dag?' });
      } else if (topic === 'STRAND_SJO') {
        replyText = `☀️ **Badeforhold & Sjø i Tønsberg:**\n\n` +
          (rt?.sjoOgVar
            ? `• **Vanntemperatur:** ${rt.sjoOgVar.sjoTemperatur}\n• **Bølgehøyde:** ${rt.sjoOgVar.bolgehoyde}\n• **Vannstand:** ${rt.sjoOgVar.vannstand}\n\n`
            : '') +
          `Populære badeperler:\n` +
          `• **Ringshaugstranda:** Langgrunn sandstrand, stupebrett og kiosk.\n` +
          `• **Skallevold:** Sandstrand med gresslette og lekeapparater.\n` +
          `• **Fjærholmen:** Seilerhavn og svaberg på Nøtterøy.`;
        quickReplies.push({ title: '🎉 Hva skjer i helgen?', payload: 'Hva skjer i Tønsberg i helgen?' });
        quickReplies.push({ title: '🚆 Neste tog', payload: 'Når går neste tog fra Tønsberg?' });
      } else if (topic === 'TORVLEIE') {
        replyText = `🏛️ **Leie av standplass på Tønsberg Torv:**\n\n` +
          `Vil du selge varer, håndverk eller mat på Torvet?\n` +
          `• **Dagplass (3x3 m):** kr 350,- per dag\n` +
          `• **Helgeplass:** kr 750,-\n` +
          `• **Mat/Foodtruck:** Krever næringsmiddelgodkjenning fra Mattilsynet.\n\n` +
          `Du kan legge igjen navn og e-post her i chatten, så kontakter Cecilie og administrasjonen deg for tildeling av plass!`;
        quickReplies.push({ title: '✍️ Søk om torvleie', payload: 'Jeg vil søke om torvleie' });
        quickReplies.push({ title: '📞 Kontaktinfo', payload: 'Hvordan kontakter jeg Tønsberglivet?' });
      } else {
        replyText = `Hei! Jeg er **Tønsberg-Guiden**, din digitale assistent for Tønsberglivet. ☀️\n\n` +
          `Jeg kan hjelpe deg med:\n` +
          `• Finne arrangementer og konserter\n` +
          `• Restauranter og uteservering langs Brygga\n` +
          `• Badeplasser og vanntemperatur\n` +
          `• Tog- og bussruter\n` +
          `• Leie av standplass på Tønsberg Torv\n\n` +
          `Hva lurer du på i dag?`;
        quickReplies.push({ title: '🎉 Hva skjer i dag?', payload: 'Hva skjer i Tønsberg i dag?' });
        quickReplies.push({ title: '🍽️ Restauranter Brygga', payload: 'Hvor kan man spise på Brygga?' });
        quickReplies.push({ title: '🌊 Badetemperatur', payload: 'Hva er badetemperaturen?' });
        quickReplies.push({ title: '🏛️ Leie stand på Torvet', payload: 'Hvordan leie stand på Torvet?' });
      }
    }

    if (quickReplies.length === 0) {
      quickReplies.push({ title: '🎉 Hva skjer i Tønsberg?', payload: 'Hva skjer i Tønsberg i helgen?' });
      quickReplies.push({ title: '🍽️ Brygga spisesteder', payload: 'Restauranter langs Brygga' });
      quickReplies.push({ title: '🌊 Badetemperatur', payload: 'Hva er vanntemperaturen?' });
    }

    return NextResponse.json({
      success: true,
      reply: replyText,
      quickReplies: quickReplies.slice(0, 4),
    });
  } catch (error: any) {
    console.error('[Public Chat API] Feil:', error);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke hente svar akkurat nå' },
      { status: 500 }
    );
  }
}
