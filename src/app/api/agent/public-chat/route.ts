import { NextRequest, NextResponse } from 'next/server';
import { getEffectiveGeminiApiKey } from '@/lib/ai-config';
import { getSetting } from '@/lib/settings';
import { toolGetRealEvents, toolGetRealtimeStatus } from '@/lib/agent-tools';
import { logVisitorQuestion } from '@/lib/chatbot-logger';
import {
  getGlobalAiChatbotStatus,
  getOrCreateChatSession,
  addVisitorMessage,
  addAssistantMessage,
} from '@/lib/live-chat';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = (body.message || '').trim();
    const contactName = body.name?.trim();
    const contactEmail = body.email?.trim();
    const sessionId = (body.sessionId || `session-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`).trim();
    const visitorPrefersAi = body.aiEnabled !== false;

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

    // Registrer meldingen i den persistente live chat-sesjonen
    await addVisitorMessage(sessionId, message, topic, {
      name: contactName,
      email: contactEmail,
    });

    // Logg henvendelsen for puls og statistikk
    await logVisitorQuestion(
      message,
      topic,
      true,
      contactEmail || contactName ? { name: contactName, email: contactEmail } : undefined
    );

    // Sjekk om AI er aktivert globalt, for sesjonen og av brukeren
    const globalAiEnabled = await getGlobalAiChatbotStatus();
    const session = await getOrCreateChatSession(sessionId);
    const shouldRunAi = globalAiEnabled && session.aiEnabled && visitorPrefersAi;

    // Hvis AI er slått av: Gi beskjed om at henvendelsen er mottatt av administrasjonen
    if (!shouldRunAi) {
      const humanNotice =
        'Takk for meldingen din! 📬\n\n' +
        'AI-assistenten er for øyeblikket slått av for denne henvendelsen. ' +
        'Meldingen din er sendt direkte til administrasjonen i Tønsberglivet.\n\n' +
        'En rådgiver (f.eks. Cecilie) vil lese meldingen og svare deg her i chatten så raskt som mulig!';

      await addAssistantMessage(sessionId, humanNotice);

      return NextResponse.json({
        success: true,
        sessionId,
        aiEnabled: false,
        reply: humanNotice,
        quickReplies: [
          { title: '📞 Kontaktinfo', payload: 'Hvordan kontakter jeg Tønsberglivet?' },
          { title: '🏛️ Om Tønsberglivet', payload: 'Hva er Tønsberglivet?' },
        ],
      });
    }

    let replyText = '';
    const quickReplies: Array<{ title: string; payload: string }> = [];

    // Hent reelle data for kontekst
    const [eventsRes, realtimeRes] = await Promise.all([
      toolGetRealEvents(7).catch(() => ({ data: [] })),
      toolGetRealtimeStatus().catch(() => ({ data: null })),
    ]);

    const activeEvents = (eventsRes.data || []).slice(0, 5);
    const rt = realtimeRes.data;

    // 1. Forsøk intelligent Gemini-svar med reell sanntidskontekst
    const apiKey = await getEffectiveGeminiApiKey();

    if (apiKey) {
      try {
        
        let finalKey = apiKey;
        const fallbackKey = await getSetting('gemini_api_key');
        if (fallbackKey) finalKey = fallbackKey;

        const prompt = `Du er den vennlige, lokale byverten «Tønsberg-Guiden» for Tønsberglivet (tonsberglivet.no).
Du hjelper turister, innbyggere og gjester med å oppleve det beste av Tønsberg og Færder.
Du svarer alltid på varmt, hjelpsomt og innbydende norsk.

REELLE SANNTIDSDATA FRA TØNSBERG AKKURAT NÅ:
- Kommende arrangementer og konserter: ${JSON.stringify(activeEvents)}
- Sjøtemperatur og flo/fjære: ${JSON.stringify(rt?.sjoOgVar || 'Ikke tilgjengelig')}
- Togavganger: ${JSON.stringify(rt?.togAvganger || 'Ikke tilgjengelig')}
- Luftkvalitet: ${rt?.luftkvalitet || 'God'}

RETNINGSLINJER FOR FORMATERING OG SVAR:
1. Skriv ren, oversiktlig tekst. Bruk kulepunkter (•) for lister.
2. Ikke overdriv bruken av markdown-stjerner. Fremhev kun viktige navn med fet skrift.
3. Hvis noen spør om å leie stand på Torvet, forklar at de kan søke om torvleie på tonsberglivet.no eller legge igjen kontaktinfo her.
4. Vær kortfattet, lettlest og engasjerende med emojier.

Brukerens spørsmål: "${message}"`;

        const res = await fetch('https://api.1min.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${finalKey.trim()}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }]
          })
        });

        if (res.ok) {
          const data = await res.json();
          replyText = data.choices[0].message.content;
        } else {
          console.error("1min.ai API feil:", await res.text());
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

    // Lagre assistentens svar i live-chat-sesjonen
    await addAssistantMessage(sessionId, replyText, quickReplies.slice(0, 4));

    return NextResponse.json({
      success: true,
      sessionId,
      aiEnabled: true,
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
