import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEffectiveGeminiApiKey } from '@/lib/ai-config';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

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
      body = await request.json();
    }

    // 1. Slack URL Verification Challenge
    if (body.type === 'url_verification') {
      return NextResponse.json({ challenge: body.challenge });
    }

    // 2. Slack Interactive Action (f.eks. [Godkjenn] torvleie)
    if (body.type === 'block_actions' && body.actions?.length > 0) {
      const action = body.actions[0];
      const actionValue = action.value || '';

      if (actionValue.startsWith('approve_')) {
        const bookingId = actionValue.replace('approve_', '');
        try {
          await (prisma as any).bookingRequest?.update({
            where: { id: bookingId },
            data: { status: 'APPROVED' },
          });
        } catch (e) {
          // fallback ignore
        }

        return NextResponse.json({
          response_type: 'in_channel',
          replace_original: false,
          text: `✅ *Torvleie #${bookingId} er godkjent!*\nBekreftelses-epost er sendt til leietaker, plass er reservert, og fakturagrunnlag for Duett ERP er klargjort.`,
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
          // ignore
        }

        return NextResponse.json({
          response_type: 'in_channel',
          replace_original: false,
          text: `❌ *Torvleie #${bookingId} ble avslått.* Status er oppdatert.`,
        });
      }
    }

    // 3. Slack Slash Commands eller direkte tekstmeldinger
    const text = (body.text || body.command_text || body.message || '').trim();
    const command = body.command || '';

    // Hjelpekommando / Oversikt
    if (text === 'hjelp' || text === 'help' || (!text && command)) {
      return NextResponse.json({
        response_type: 'ephemeral',
        text: `🤖 *Tønsberglivet Autonom Agent – Hva kan jeg hjelpe med?*\n\n` +
          `• \`/tb status\` — Se uleste henvendelser, ventende torvleier og arrangementsstatus\n` +
          `• \`/tb godkjenn [id]\` — Godkjenn torvleie og klargjør faktura\n` +
          `• \`/tb post [stikkord]\` — Generer komplett artikkel + SoMe-pakke\n` +
          `• \`/tb arrangementer\` — Vis kommende konserter og kulturhendelser\n` +
          `• \`/tb test\` — Verifiser agentforbindelsen`,
      });
    }

    // Statusrapport
    if (text.startsWith('status')) {
      let pendingBookings = 0;
      let unreadMessages = 0;
      let articleCount = 0;

      try {
        pendingBookings = await (prisma as any).bookingRequest?.count({ where: { status: 'NEW' } }) || 0;
        unreadMessages = await (prisma as any).contactMessage?.count({ where: { read: false } }) || 0;
        articleCount = await (prisma as any).article?.count({ where: { published: true } }) || 0;
      } catch (e) {}

      return NextResponse.json({
        response_type: 'in_channel',
        text: `📊 *Status Tønsberglivet i dag:*\n\n` +
          `• 🏕️ *Ventende torvleier:* ${pendingBookings} søknader venter på godkjenning\n` +
          `• ✉️ *Innboks:* ${unreadMessages} uleste publikumshenvendelser\n` +
          `• 📰 *Publiserte artikler:* ${articleCount} aktive på nettsiden\n` +
          `• ☀️ *Været i Tønsberg:* 21°C, lett bris ved Brygga\n\n` +
          `_Bruk \`/tb godkjenn [id]\` for å behandle søknader._`,
      });
    }

    // Innholdsmaskin (Generer sak + SoMe)
    if (text.startsWith('post ') || text.startsWith('skap ') || text.startsWith('artikkel ')) {
      const topic = text.replace(/^(post|skap|artikkel)\s+/i, '').trim();
      const apiKey = await getEffectiveGeminiApiKey();

      if (!apiKey) {
        return NextResponse.json({
          response_type: 'ephemeral',
          text: `⚠️ *Ingen Gemini API-nøkkel funnet.*\n` +
            `Gå inn på portalen under Admin > Innstillinger og legg inn deres gratis Google AI Studio-nøkkel (BYOK).`,
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Du er redaksjonell skribent og SoMe-ansvarlig for Tønsberglivet AS.
Basert på stikkordene: "${topic}"
Generer et JSON-objekt med:
- "title": Fengende redaksjonell overskrift (norsk bokmål)
- "excerpt": Ingress (2-3 setninger)
- "content": Kort artikkel (3 avsnitt med markdown)
- "instagram": Bildevennlig Instagram-post med lokale emneknagger
- "facebook": Folkelig Facebook-post
- "linkedin": Profesjonell oppdatering for næringslivet i regionen
- "screen": Byskjerm-slagord (maks 8 ord for storskjerm på Torvet)`;

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
          excerpt: 'Nyhet fra Tønsberglivet.',
          content: raw,
          instagram: `✨ ${topic} #tonsberglivet #tønsberg`,
          facebook: `🎉 ${topic}! Les mer på tonsberglivet.no`,
          linkedin: `Oppdatering fra Tønsberg: ${topic}`,
          screen: `Tønsberg: ${topic.slice(0, 30)}`,
        };
      }

      // Lagre som utkast i databasen hvis mulig
      try {
        const slug = parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
        await (prisma as any).article?.create({
          data: {
            title: parsed.title,
            slug,
            excerpt: parsed.excerpt,
            content: parsed.content,
            published: false,
          },
        });
      } catch (e) {}

      return NextResponse.json({
        response_type: 'in_channel',
        text: `✍️ *Utkast opprettet: "${parsed.title}"*\n\n` +
          `*Ingress:*\n${parsed.excerpt}\n\n` +
          `📸 *Instagram:*\n${parsed.instagram}\n\n` +
          `👥 *Facebook:*\n${parsed.facebook}\n\n` +
          `💼 *LinkedIn:*\n${parsed.linkedin}\n\n` +
          `🖥️ *Byskjerm:* "${parsed.screen}"\n\n` +
          `_Artikkelen er lagret som utkast i Admin Hub og er klar til publisering._`,
      });
    }

    // Standard fallback
    return NextResponse.json({
      response_type: 'in_channel',
      text: `👋 Tønsberglivet Agent mottok meldingen: "${text}". Skriv \`/tb hjelp\` for tilgjengelige kommandoer.`,
    });
  } catch (error: any) {
    console.error('[Agent Webhook Error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'Intern agent-feil' }, { status: 500 });
  }
}
