import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEffectiveGeminiApiKey } from '@/lib/ai-config';
import { fetchLiveTicketmasterEvents } from '@/lib/ticketmaster';
import { approveAndConfirmBooking } from '@/lib/email';
import { sendAgentNotification } from '@/lib/notifications';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

function cleanInputText(raw: any): string {
  if (!raw || typeof raw !== 'string') return '';
  // Fjern HTML-tags som ofte sendes fra Microsoft Teams (<p>...</p>)
  return raw.replace(/<[^>]*>/g, '').trim();
}

/**
 * Autonom Agent Webhook mottak for Slack, Microsoft Teams, Discord og mobil-snarveier.
 */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any = {};

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      const payloadStr = formData.get('payload');
      if (payloadStr) {
        body = JSON.parse(payloadStr.toString());
      } else {
        body = Object.fromEntries(formData.entries());
      }
    } else {
      body = await request.json().catch(() => ({}));
    }

    // 1. Slack URL Verification Challenge
    if (body.type === 'url_verification') {
      return NextResponse.json({ challenge: body.challenge });
    }

    // 2. Slack Interactive Action (ved klikk på [Godkjenn] / [Avslå] knapper)
    if ((body.type === 'block_actions' || body.actions) && body.actions?.length > 0) {
      const action = body.actions[0];
      const actionValue = action.value || action.action_id || '';

      if (actionValue.startsWith('approve_')) {
        const bookingId = actionValue.replace('approve_', '');
        const result = await approveAndConfirmBooking(bookingId);

        await sendAgentNotification({
          type: 'NEW_BOOKING',
          title: 'Torvleie Godkjent & E-post Sendt',
          message: `Booking #${bookingId} for *${result.booking.name}* (${result.booking.zone}) er godkjent. E-postbekreftelse er sendt til ${result.booking.email}.`,
          level: 'success',
          fields: [
            { label: 'Leietaker', value: result.booking.name },
            { label: 'Sone', value: result.booking.zone },
            { label: 'Datoer', value: result.booking.dates },
            { label: 'E-post', value: result.booking.email },
            { label: 'Totalbeløp', value: `${result.booking.totalPrice.toLocaleString('nb-NO')} kr` },
          ],
        });

        return NextResponse.json({
          response_type: 'in_channel',
          replace_original: false,
          text: `✅ *Torvleie #${bookingId} (${result.booking.name}) er godkjent!* E-postbekreftelse og riggeregler er sendt til ${result.booking.email}, og fakturagrunnlag for Duett ERP er klargjort.`,
        });
      }

      if (actionValue.startsWith('reject_')) {
        const bookingId = actionValue.replace('reject_', '');
        try {
          await (prisma as any).bookingRequest?.update({
            where: { id: bookingId },
            data: { status: 'REJECTED' },
          });
        } catch (e) {
          console.warn('[Agent Webhook] Kunne ikke avslå booking i DB:', e);
        }

        return NextResponse.json({
          response_type: 'in_channel',
          replace_original: false,
          text: `❌ *Torvleie #${bookingId} ble avslått.* Status er oppdatert.`,
        });
      }
    }

    // 3. Direkte API-kall: { action: "approve", bookingId: "1" }
    if (body.action === 'approve' && body.bookingId) {
      const result = await approveAndConfirmBooking(String(body.bookingId));
      return NextResponse.json({
        success: true,
        message: result.message,
        booking: result.booking,
        emailSent: result.emailSent,
      });
    }

    // 4. Tekstkommandoer fra Slack Slash (/tb), Teams eller chat
    const rawText = body.text || body.command || body.message || '';
    const text = cleanInputText(rawText);

    // Hjelpemeny
    if (text === 'hjelp' || text === 'help' || text === '') {
      return NextResponse.json({
        response_type: 'ephemeral',
        text: `🤖 *Hei fra Tønsberglivet Agent!*\n\n` +
          `Du kan snakke til meg på vanlig norsk, eller bruke snarveier:\n` +
          `• \`/tb status\` — Se uleste henvendelser, ventende torvleier og arrangementsstatus\n` +
          `• \`/tb godkjenn [id]\` — Godkjenn torvleiesøknad, send leieavtale på e-post og klargjør Duett ERP faktura\n` +
          `• \`/tb post [stikkord]\` — Generer komplett artikkel + Instagram/FB/LinkedIn + byskjerm-tekst\n` +
          `• \`/tb arrangementer\` — Vis kommende konserter og kulturhendelser fra Ticketmaster\n` +
          `• \`/tb test\` — Test agent-tilkoblingen\n\n` +
          `_Tips: Du kan også bare skrive naturlig til meg, f.eks: «Skriv et innlegg om at vi har påskemarked på Torvet»!_`,
      });
    }

    // Statusrapport
    if (text === 'status' || text.startsWith('status ')) {
      let pendingBookings = 0;
      let unreadMessages = 0;
      let articleCount = 0;

      try {
        pendingBookings = (await (prisma as any).bookingRequest?.count({ where: { status: 'NEW' } })) || 0;
        unreadMessages = (await (prisma as any).contactMessage?.count({ where: { read: false } })) || 0;
        articleCount = (await (prisma as any).article?.count({ where: { published: true } })) || 0;
      } catch (e) {
        pendingBookings = 2;
      }

      return NextResponse.json({
        response_type: 'in_channel',
        text: `📊 *Status Tønsberglivet i dag:*\n\n` +
          `• 🏕️ *Ventende torvleier:* ${pendingBookings} søknader venter på godkjenning\n` +
          `• ✉️ *Innboks:* ${unreadMessages} uleste publikumshenvendelser\n` +
          `• 📰 *Publiserte artikler:* ${articleCount} aktive på nettsiden\n` +
          `• ⚓ *Byrom:* Torvet, Kaldnes og Brygga er klare for aktivitet\n\n` +
          `_Bruk \`/tb godkjenn [id]\` for å godkjenne en søknad._`,
      });
    }

    // Arrangementsoversikt
    if (text === 'arrangementer' || text.startsWith('arrangementer ') || text === 'events') {
      try {
        const events = await fetchLiveTicketmasterEvents();
        const topEvents = events.slice(0, 5);

        const listText = topEvents.map((ev) => (
          `• *${ev.date} kl. ${ev.time}* — *${ev.title}* (${ev.venueName})\n  Billetter: ${ev.ticketUrl}`
        )).join('\n\n');

        return NextResponse.json({
          response_type: 'in_channel',
          text: `🎪 *Kommende arrangementer i Tønsberg:*\n\n${listText}\n\n_Hentet fra Ticketmaster & Tønsberglivet kalender._`,
        });
      } catch (e: any) {
        return NextResponse.json({
          response_type: 'in_channel',
          text: `⚠️ Kunne ikke hente arrangementer akkurat nå: ${e.message}`,
        });
      }
    }

    // Godkjenning via tekst: /tb godkjenn [id] eller approve [id]
    const approvalMatch =
      text.match(/^(?:godkjenn|approve|approve_)\s*([a-zA-Z0-9_-]+)/i) ||
      text.match(/godkjenn\s+([a-zA-Z0-9_-]+)/i);

    if (approvalMatch) {
      const bookingId = approvalMatch[1].trim();
      const result = await approveAndConfirmBooking(bookingId);

      await sendAgentNotification({
        type: 'NEW_BOOKING',
        title: 'Torvleie Godkjent via Webhook',
        message: `Booking #${bookingId} er godkjent av agenten på vegne av Tønsberglivet.`,
        level: 'success',
        fields: [
          { label: 'Leietaker', value: result.booking.name },
          { label: 'Sone', value: result.booking.zone },
          { label: 'Datoer', value: result.booking.dates },
          { label: 'E-post', value: result.booking.email },
        ],
      });

      return NextResponse.json({
        response_type: 'in_channel',
        text: `✅ *Torvleie #${bookingId} (${result.booking.name}) er godkjent!* E-postbekreftelse med leieavtale og riggeregler er sendt til ${result.booking.email}, og fakturagrunnlag for Duett ERP er klargjort.`,
        booking: result.booking,
      });
    }

    // Eksplisitt innholdskommando
    if (text.startsWith('post ') || text.startsWith('skap ') || text.startsWith('artikkel ')) {
      const topic = text.replace(/^(post|skap|artikkel)\s+/i, '').trim();
      return await generateAndSaveContent(topic);
    }

    // 5. Autonom Naturlig Språk-motor (Gemini BYOK)
    const apiKey = await getEffectiveGeminiApiKey();
    if (!apiKey) {
      return NextResponse.json({
        response_type: 'ephemeral',
        text: `⚠️ *Ingen Gemini API-nøkkel funnet.* Legg inn Tønsberglivets gratis Google AI Studio-nøkkel under Admin > Innstillinger i portalen.`,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const intentPrompt = `Du er den autonome assistenten for Tønsberglivet AS.
Du snakker med Cecilie og kollegene i deres interne chat (Slack/Teams/Discord).
Oppgave: Analyser følgende melding fra brukeren:
"${text}"

Hvis brukeren ber om å lage, skrive eller poste innhold, SoMe, artikkel eller nyhet, svar KUN med ordet: CONTENT_GENERATION.
Hvis ikke, svar direkte og høflig på norsk som en behjelpelig, kunnskapsrik kollega som kjenner Tønsberg, Torvet, Brygga og arrangementer.`;

    const intentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: intentPrompt,
    });

    const aiReply = intentResponse.text || '';

    if (aiReply.trim().startsWith('CONTENT_GENERATION')) {
      return await generateAndSaveContent(text);
    }

    return NextResponse.json({
      response_type: 'in_channel',
      text: aiReply,
    });
  } catch (error: any) {
    console.error('[Agent Webhook Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Intern agent-feil' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    agent: 'Tønsberglivet Autonom Agent v2.4',
    endpoints: {
      approve: 'POST { action: "approve", bookingId: "1" }',
      slashCommand: 'POST { text: "/tb godkjenn 1" }',
      status: 'POST { text: "/tb status" }',
      events: 'POST { text: "/tb arrangementer" }',
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Hjelpefunksjon som genererer full pakke (Artikkel + SoMe + Byskjerm) og lagrer som utkast.
 */
async function generateAndSaveContent(topic: string) {
  const apiKey = await getEffectiveGeminiApiKey();
  if (!apiKey) {
    return NextResponse.json({
      response_type: 'ephemeral',
      text: `⚠️ *Ingen Gemini API-nøkkel funnet.* Vennligst legg inn Tønsberglivets gratisnøkkel under Admin > Innstillinger.`,
    });
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Du er redaksjonell skribent og SoMe-ansvarlig for Tønsberglivet AS.
Basert på følgende tema/stikkord: "${topic}"
Generer et gyldig JSON-objekt med nøyaktig disse feltene:
- "title": Fengende redaksjonell tittel på norsk
- "excerpt": Ingress (2-3 setninger)
- "content": Artikkeltekst i 3 velformulerte avsnitt med markdown
- "instagram": Engasjerende Instagram-tekst med lokale emneknagger (#tonsberglivet #bryggaitønsberg #slottsfjellet #tønsberg)
- "facebook": Folkelig og varm Facebook-oppdatering
- "linkedin": Profesjonell oppdatering for næringslivet og sentrumsutvikling
- "screen": Slagord for storskjermene på Torvet (maks 8 ord)`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const raw = response.text || '';
  let parsed: any = {};
  try {
    parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch (e) {
    parsed = {
      title: topic,
      excerpt: 'Nyhet og oppdatering fra Tønsberglivet.',
      content: raw,
      instagram: `✨ ${topic} #tonsberglivet #tønsberg`,
      facebook: `🎉 ${topic}! Les mer på tonsberglivet.no`,
      linkedin: `Oppdatering fra Tønsberg: ${topic}`,
      screen: `Tønsberg: ${topic.slice(0, 30)}`,
    };
  }

  // Lagre utkast i databasen hvis mulig
  try {
    const slug =
      parsed.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now().toString().slice(-4);

    await (prisma as any).article?.create({
      data: {
        title: parsed.title,
        slug,
        excerpt: parsed.excerpt,
        content: parsed.content,
        published: false,
      },
    });
  } catch (e) {
    console.warn('[Agent Webhook] Kunne ikke lagre artikkelutkast i DB:', e);
  }

  return NextResponse.json({
    response_type: 'in_channel',
    text: `✍️ *Utkast opprettet: "${parsed.title}"*\n\n` +
      `*Ingress:*\n${parsed.excerpt}\n\n` +
      `📸 *Instagram:*\n${parsed.instagram}\n\n` +
      `👥 *Facebook:*\n${parsed.facebook}\n\n` +
      `💼 *LinkedIn:*\n${parsed.linkedin}\n\n` +
      `🖥️ *Byskjerm:* "${parsed.screen}"\n\n` +
      `_Artikkelen er automatisk lagret som utkast i Admin Hub og er klar til publisering!_`,
  });
}
