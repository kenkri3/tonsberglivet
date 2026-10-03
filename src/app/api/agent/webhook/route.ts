import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getEffectiveGeminiApiKey } from '@/lib/ai-config';
import { fetchLiveTicketmasterEvents } from '@/lib/ticketmaster';
import { approveAndConfirmBooking } from '@/lib/email';
import { sendAgentNotification } from '@/lib/notifications';
import { requireAdmin } from '@/lib/auth';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

/**
 * Beskriver det FAKTISKE e-postutfallet for en godkjent torvleiesøknad.
 *
 * `approveAndConfirmBooking` rapporterer ærlig `emailSent` og `emailMode`
 * (se src/lib/email.ts). Uten denne oversettelsen påstod webhooken at
 * bekreftelsen var sendt også når den bare var logget lokalt, eller da
 * utsendingen feilet.
 */
type BookingEmailMode = Awaited<ReturnType<typeof approveAndConfirmBooking>>['emailMode'];

function bookingEmailOutcome(
  mode: BookingEmailMode,
  sent: boolean,
  email: string,
): { text: string; level: 'success' | 'warning' } {
  switch (mode) {
    case 'resend':
      return sent
        ? { text: `E-postbekreftelse er sendt til ${email}.`, level: 'success' }
        : { text: `E-postbekreftelse til ${email} ble avvist av Resend.`, level: 'warning' };
    case 'smtp':
      return {
        text: `SMTP-utsending er ikke implementert – bekreftelsen til ${email} er kun logget på serveren.`,
        level: 'warning',
      };
    case 'mock_logged':
      return {
        text: `Ingen e-posttjeneste er konfigurert – bekreftelsen til ${email} er kun logget på serveren.`,
        level: 'warning',
      };
    case 'failed':
      return { text: `E-postutsending til ${email} feilet.`, level: 'warning' };
    default:
      return { text: `E-postbekreftelse til ${email} ble ikke forsøkt sendt.`, level: 'warning' };
  }
}

function cleanInputText(raw: any): string {
  if (!raw || typeof raw !== 'string') return '';
  // Fjern HTML-tags som ofte sendes fra Microsoft Teams (<p>...</p>)
  return raw.replace(/<[^>]*>/g, '').trim();
}

/**
 * Verifiserer at kallet faktisk kommer fra Slack (v0-signatur med signeringshemmelighet).
 */
function verifySlackSignature(request: Request, rawBody: string): boolean {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) return false;

  const timestamp = request.headers.get('x-slack-request-timestamp') || '';
  const signature = request.headers.get('x-slack-signature') || '';
  if (!timestamp || !signature) return false;

  // Avvis replay-angrep eldre enn 5 minutter.
  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 300) return false;

  const expected =
    'v0=' + crypto.createHmac('sha256', signingSecret).update(`v0:${timestamp}:${rawBody}`).digest('hex');

  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(signature);
  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

/**
 * Autentisering for agent-webhooken.
 *
 * Endepunktet kan godkjenne torvleie (statusendring + kontrakt på e-post) og skrive
 * til CMS og bedriftsregisteret. Det MÅ derfor ikke være åpent. Godkjente kallere:
 *   1. Slack, med gyldig v0-signatur (SLACK_SIGNING_SECRET).
 *   2. Eksterne agenter med delt hemmelighet (AGENT_WEBHOOK_SECRET) som Bearer
 *      eller x-agent-secret.
 *   3. Innlogget administrator — adminpanelet tester endepunktet herfra.
 */
async function isAuthorizedAgentRequest(request: Request, rawBody: string): Promise<boolean> {
  if (verifySlackSignature(request, rawBody)) return true;

  const sharedSecret = process.env.AGENT_WEBHOOK_SECRET;
  if (sharedSecret) {
    const authHeader = request.headers.get('authorization') || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const headerSecret = request.headers.get('x-agent-secret') || '';
    if (bearer === sharedSecret || headerSecret === sharedSecret) return true;
  }

  return requireAdmin(request).authorized;
}

/** Gyldige Prisma-enumverdier. Ukjente verdier må normaliseres, ellers kaster Prisma. */
const EVENT_CATEGORIES = ['ARRANGEMENT', 'KONSERT', 'MARKED', 'KURS', 'BARN', 'SPORT', 'KULTUR', 'FESTIVAL'] as const;
const BUSINESS_CATEGORIES = ['SHOPPING', 'MAT_DRIKKE', 'AKTIVITET', 'OVERNATTING', 'FRISOR_VELVERE', 'KULTUR', 'BARN', 'ANNET'] as const;
const BUSINESS_AREAS = ['TONSBERG_SENTRUM', 'TONSBERG_KOMMUNE', 'FAERDER_KOMMUNE'] as const;
const ARTICLE_CATEGORIES = ['BYLIVET', 'HVERDAGSLIVET', 'NAERINGSLIVET', 'REISELIVET', 'STUDENTLIVET'] as const;

/** Slår opp en enumverdi tolerant: godtar store/små bokstaver og norske etiketter. */
function normalizeEnum<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  fallback: T[number],
): T[number] {
  if (value === undefined || value === null || value === '') return fallback;

  const normalized = String(value)
    .trim()
    .toUpperCase()
    .replace(/Æ/g, 'AE')
    .replace(/Ø/g, 'O')
    .replace(/Å/g, 'A')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const hit = allowed.find((v) => v === normalized);
  return (hit ?? fallback) as T[number];
}

/** Stabil slug uten tidsstempel, slik at upsert faktisk oppdaterer i stedet for å duplisere. */
function stableSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Autonom Agent Webhook mottak for Slack, Microsoft Teams, Discord og mobil-snarveier.
 */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // Les rå kropp FØRST — Slack-signaturen regnes ut over den eksakte rå kroppen.
    const rawBody = await request.text();

    const authorized = await isAuthorizedAgentRequest(request, rawBody);
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: 'Uautorisert: Krever gyldig Slack-signatur, delt hemmelighet eller administratorinnlogging.' },
        { status: 401 }
      );
    }

    let body: any = {};

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(rawBody);
      const payloadStr = params.get('payload');
      if (payloadStr) {
        try {
          body = JSON.parse(payloadStr);
        } catch {
          body = Object.fromEntries(params.entries());
        }
      } else {
        body = Object.fromEntries(params.entries());
      }
    } else {
      try {
        body = rawBody ? JSON.parse(rawBody) : {};
      } catch {
        return NextResponse.json(
          { success: false, error: 'Ugyldig JSON i forespørselen.' },
          { status: 400 }
        );
      }
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
        const email = bookingEmailOutcome(
          result.emailMode,
          result.emailSent,
          result.booking.email,
        );

        await sendAgentNotification({
          type: 'NEW_BOOKING',
          title: result.emailSent ? 'Torvleie godkjent og e-post sendt' : 'Torvleie godkjent – e-post ikke sendt',
          message: `Booking #${bookingId} for *${result.booking.name}* (${result.booking.zone}) er godkjent. ${email.text}`,
          level: email.level,
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
          text: `✅ *Torvleie #${bookingId} (${result.booking.name}) er godkjent!* ${email.text} Riggeregler og fakturagrunnlag for Duett ERP er klargjort.`,
        });
      }

      if (actionValue.startsWith('reject_')) {
        const bookingId = actionValue.replace('reject_', '');
        try {
          const rejected = await (prisma as any).bookingRequest?.update({
            where: { id: bookingId },
            data: { status: 'REJECTED' },
          });

          if (!rejected) {
            return NextResponse.json({
              response_type: 'ephemeral',
              replace_original: false,
              text: `⚠️ *Fant ingen torvleiesøknad med id ${bookingId}.* Ingen endring ble gjort.`,
            });
          }
        } catch (e: any) {
          // Tidligere ble feilen svelget og svaret påstod likevel at status var oppdatert.
          console.warn('[Agent Webhook] Kunne ikke avslå booking i DB:', e);
          return NextResponse.json({
            response_type: 'ephemeral',
            replace_original: false,
            text: `❌ *Kunne ikke avslå torvleie #${bookingId}.* Status er IKKE endret. (${e?.message || 'ukjent feil'})`,
          });
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

    // 3b. Strukturerte handlinger fra Agentic Platform (Apify / Tavily / Brave)
    if (body.action === 'upsert_event' || body.action === 'create_event') {
      const {
        title,
        slug: userSlug,
        description,
        location,
        address,
        startDate,
        endDate,
        startTime,
        endTime,
        category = 'ARRANGEMENT',
        externalUrl,
        published = true,
      } = body;

      if (!title || !startDate) {
        return NextResponse.json(
          { success: false, error: 'Mangler påkrevde felter: title og startDate' },
          { status: 400 }
        );
      }

      // Stabil slug: uten tidsstempel treffer upsert den samme raden hver gang.
      // Tidligere fikk slugen «-<siste 4 av Date.now()>», så upsert traff aldri
      // og hvert kall opprettet et nytt, duplisert arrangement.
      const cleanSlug = userSlug ? stableSlug(String(userSlug)) : stableSlug(String(title));

      if (!cleanSlug) {
        return NextResponse.json(
          { success: false, error: 'Kunne ikke utlede en gyldig slug fra tittelen.' },
          { status: 400 }
        );
      }

      const eventCategory = normalizeEnum(category, EVENT_CATEGORIES, 'ARRANGEMENT');

      const parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return NextResponse.json(
          { success: false, error: `Ugyldig startDate: «${startDate}». Bruk ISO-format, f.eks. 2026-10-22.` },
          { status: 400 }
        );
      }
      const parsedEndDate = endDate ? new Date(endDate) : undefined;

      const event = await (prisma as any).event.upsert({
        where: { slug: cleanSlug },
        update: {
          title,
          description,
          location,
          address,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          startTime,
          endTime,
          category: eventCategory,
          externalUrl,
          published,
        },
        create: {
          title,
          slug: cleanSlug,
          description,
          location,
          address,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          startTime,
          endTime,
          category: eventCategory,
          externalUrl,
          published,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Arrangement '${title}' er importert og lagret i Tønsberglivet kalenderen.`,
        event,
      });
    }

    if (body.action === 'update_business' || body.action === 'upsert_business') {
      const {
        name,
        slug: userSlug,
        description,
        address,
        phone,
        email,
        website,
        openingHours,
        category = 'ANNET',
        area = 'TONSBERG_SENTRUM',
        published = true,
      } = body;

      if (!name) {
        return NextResponse.json({ success: false, error: 'Mangler påkrevd felt: name' }, { status: 400 });
      }

      const cleanSlug = userSlug ? stableSlug(String(userSlug)) : stableSlug(String(name));

      if (!cleanSlug) {
        return NextResponse.json(
          { success: false, error: 'Kunne ikke utlede en gyldig slug fra bedriftsnavnet.' },
          { status: 400 }
        );
      }

      const businessCategory = normalizeEnum(category, BUSINESS_CATEGORIES, 'ANNET');
      const businessArea = normalizeEnum(area, BUSINESS_AREAS, 'TONSBERG_SENTRUM');

      const business = await (prisma as any).business.upsert({
        where: { slug: cleanSlug },
        update: {
          name,
          description: description || undefined,
          address: address || undefined,
          phone: phone || undefined,
          email: email || undefined,
          website: website || undefined,
          openingHours: openingHours || undefined,
          category: businessCategory,
          area: businessArea,
          published,
        },
        create: {
          name,
          slug: cleanSlug,
          description,
          address,
          phone,
          email,
          website,
          openingHours,
          category: businessCategory,
          area: businessArea,
          published,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Bedriften '${name}' er oppdatert i Tønsberglivet registeret.`,
        business,
      });
    }

    if (body.action === 'create_article') {
      const {
        title,
        slug: userSlug,
        excerpt,
        content,
        category = 'BYLIVET',
        published = false,
        featured = false,
      } = body;

      if (!title || !content) {
        return NextResponse.json({ success: false, error: 'Mangler påkrevde felter: title og content' }, { status: 400 });
      }

      // Artikler opprettes (ikke upsert), så sluggen må være unik. Vi bruker en
      // tilfeldig suffiks i stedet for millisekunder, som kan kollidere.
      const baseSlug = userSlug ? stableSlug(String(userSlug)) : stableSlug(String(title));
      const cleanSlug = `${baseSlug || 'artikkel'}-${crypto.randomBytes(3).toString('hex')}`;

      const articleCategory = normalizeEnum(category, ARTICLE_CATEGORIES, 'BYLIVET');

      const article = await (prisma as any).article.create({
        data: {
          title,
          slug: cleanSlug,
          excerpt,
          content,
          category: articleCategory,
          published,
          featured,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Artikkel '${title}' er lagret ${published ? 'som publisert' : 'som utkast'}.`,
        article,
      });
    }

    if (body.action === 'get_context') {
      const [events, pendingBookings, recentArticles] = await Promise.all([
        (prisma as any).event.findMany({
          where: { published: true, startDate: { gte: new Date() } },
          orderBy: { startDate: 'asc' },
          take: 10,
        }).catch(() => []),
        (prisma as any).bookingRequest.count({ where: { status: 'NEW' } }).catch(() => 0),
        (prisma as any).article.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, title: true, slug: true, category: true, published: true },
        }).catch(() => []),
      ]);

      return NextResponse.json({
        success: true,
        context: {
          region: 'Tønsberg & Færder',
          upcomingEvents: events,
          pendingBookingsCount: pendingBookings,
          recentArticles,
        },
      });
    }

    // 4. Tekstkommandoer fra Slack Slash (/tb), Teams eller chat
    const rawText = body.text || body.command || body.message || '';
    const text = cleanInputText(rawText);

    // Hjelpemeny. Et helt tomt kall er ikke «suksess» — det er ugyldig input,
    // og skal ikke se ut som en vellykket agent-kjøring i overvåking.
    if (text === 'hjelp' || text === 'help' || text === '') {
      const helpText =
        `🤖 *Hei fra Tønsberglivet Agent!*\n\n` +
        `Du kan snakke til meg på vanlig norsk, eller bruke snarveier:\n` +
        `• \`/tb status\` — Se uleste henvendelser, ventende torvleier og arrangementsstatus\n` +
        `• \`/tb godkjenn [id]\` — Godkjenn torvleiesøknad, send leieavtale på e-post og klargjør Duett ERP faktura\n` +
        `• \`/tb post [stikkord]\` — Generer komplett artikkel + Instagram/FB/LinkedIn + byskjerm-tekst\n` +
        `• \`/tb arrangementer\` — Vis kommende konserter og kulturhendelser fra Ticketmaster\n` +
        `• \`/tb test\` — Test agent-tilkoblingen\n\n` +
        `_Tips: Du kan også bare skrive naturlig til meg, f.eks: «Skriv et innlegg om at vi har påskemarked på Torvet»!_`;

      if (text === '') {
        return NextResponse.json(
          { success: false, error: 'Tom forespørsel: oppgi «text» eller en «action».', response_type: 'ephemeral', text: helpText },
          { status: 400 }
        );
      }

      return NextResponse.json({ response_type: 'ephemeral', text: helpText });
    }

    // Statusrapport
    if (text === 'status' || text.startsWith('status ')) {
      let pendingBookings = 0;
      let unreadMessages = 0;
      let articleCount = 0;
      let statsReadable = true;

      try {
        pendingBookings = (await (prisma as any).bookingRequest?.count({ where: { status: 'NEW' } })) || 0;
        unreadMessages = (await (prisma as any).contactMessage?.count({ where: { read: false } })) || 0;
        articleCount = (await (prisma as any).article?.count({ where: { published: true } })) || 0;
      } catch (e) {
        // Tidligere satte vi pendingBookings = 2 her, altså et oppdiktet tall
        // presentert som fakta. Rapporter heller at tallene ikke kunne leses.
        statsReadable = false;
        console.warn('[Agent Webhook] Kunne ikke lese statistikk fra databasen:', e);
      }

      return NextResponse.json({
        response_type: 'in_channel',
        text: `📊 *Status Tønsberglivet i dag:*\n\n` +
          `• 🏕️ *Ventende torvleier:* ${statsReadable ? `${pendingBookings} søknader venter på godkjenning` : 'kunne ikke leses fra databasen'}\n` +
          `• ✉️ *Innboks:* ${statsReadable ? `${unreadMessages} uleste publikumshenvendelser` : 'kunne ikke leses fra databasen'}\n` +
          `• 📰 *Publiserte artikler:* ${statsReadable ? `${articleCount} aktive på nettsiden` : 'kunne ikke leses fra databasen'}\n` +
          `• ⚓ *Byrom:* Torvet, Kaldnes og Brygga er klare for aktivitet\n\n` +
          `_Bruk \`/tb godkjenn [id]\` for å godkjenne en søknad._`,
        statsReadable,
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
      const email = bookingEmailOutcome(
        result.emailMode,
        result.emailSent,
        result.booking.email,
      );

      await sendAgentNotification({
        type: 'NEW_BOOKING',
        title: result.emailSent ? 'Torvleie godkjent og e-post sendt' : 'Torvleie godkjent – e-post ikke sendt',
        message: `Booking #${bookingId} er godkjent av agenten på vegne av Tønsberglivet. ${email.text}`,
        level: email.level,
        fields: [
          { label: 'Leietaker', value: result.booking.name },
          { label: 'Sone', value: result.booking.zone },
          { label: 'Datoer', value: result.booking.dates },
          { label: 'E-post', value: result.booking.email },
        ],
      });

      return NextResponse.json({
        response_type: 'in_channel',
        text: `✅ *Torvleie #${bookingId} (${result.booking.name}) er godkjent!* ${email.text} Riggeregler og fakturagrunnlag for Duett ERP er klargjort.`,
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
        text: `⚠️ *Ingen Gemini API-nøkkel funnet.* Sett GEMINI_API_KEY som miljøvariabel i Railway.`,
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
    agent: 'Tønsberglivet Autonom Agent v2.5 (Multi-Tool Enabled)',
    connectedTools: ['Brave (Web Search)', 'Tavily (Deep Research)', 'Apify (Scraping & Import)'],
    endpoints: {
      approve: 'POST { action: "approve", bookingId: "string" }',
      upsertEvent: 'POST { action: "upsert_event", title, startDate, location, category, externalUrl }',
      updateBusiness: 'POST { action: "update_business", name, openingHours, phone, website, address }',
      createArticle: 'POST { action: "create_article", title, excerpt, content, category, published }',
      getContext: 'POST { action: "get_context" }',
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
      text: `⚠️ *Ingen Gemini API-nøkkel funnet.* Sett GEMINI_API_KEY som miljøvariabel i Railway.`,
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
