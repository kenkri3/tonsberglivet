import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { approveAndConfirmBooking } from '@/lib/email';
import { searchCompanies } from '@/lib/brreg';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With, X-API-Key',
};

/**
 * Autorisasjon for MCP-verktøykall.
 *
 * MCP-serveren skriver til CMS, bedriftsregisteret og torvleie. Verktøylisten og
 * `initialize` er åpne for oppdagelse, men selve kallene krever en av:
 *   1. Bearer-token / X-API-Key som matcher MCP_API_KEY (eksterne agenter).
 *   2. Innlogget administrator (cookie) — for manuell testing i adminpanelet.
 * Er ingen nøkkel konfigurert, nekter vi kall i stedet for å stå åpne.
 */
function isAuthorizedMcpCaller(req: NextRequest): boolean {
  const configuredKey = process.env.MCP_API_KEY;
  if (configuredKey) {
    const authHeader = req.headers.get('authorization') || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const apiKeyHeader = req.headers.get('x-api-key') || '';
    if (bearer === configuredKey || apiKeyHeader === configuredKey) return true;
  }

  return requireAdmin(req).authorized;
}

/** Gyldige Prisma-enumverdier — ukjente verdier må normaliseres, ellers kaster Prisma. */
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

/**
 * Stabil slug UTEN tidsstempel. Den gamle varianten la på «-<siste 4 av Date.now()>»,
 * så `upsert({ where: { slug } })` traff aldri en eksisterende rad og hvert kall
 * opprettet et nytt, duplisert arrangement i stedet for å oppdatere.
 */
function stableSlug(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Tolker ISO og norsk visningsformat («22. aug 2026»). Returnerer null for noe annet. */
function parseFlexibleDate(value: unknown): Date | null {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  const direct = new Date(raw);
  if (!isNaN(direct.getTime())) return direct;

  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, mai: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, okt: 9, nov: 10, des: 11,
  };
  const match = raw.match(/^(\d{1,2})\.\s*([A-Za-zÆØÅæøå]+)\.?\s*(\d{4})$/);
  if (match) {
    const day = Number(match[1]);
    const month = months[match[2].toLowerCase().slice(0, 3)];
    const year = Number(match[3]);
    if (month !== undefined && day >= 1 && day <= 31) {
      return new Date(year, month, day, 19, 0, 0);
    }
  }
  return null;
}

// 🛠️ Definisjon av verktøy i Model Context Protocol (MCP) format
const MCP_TOOLS = [
  {
    name: 'opprett_eller_oppdater_arrangement',
    description:
      'Oppretter eller oppdaterer et arrangement i Tønsberglivets offisielle arrangementskalender (f.eks. konserter på Foynhagen, teater, festivaler og markeder).',
    inputSchema: {
      type: 'object',
      properties: {
        tittel: { type: 'string', description: 'Tittel på arrangementet' },
        startDato: { type: 'string', description: 'Startdato i format YYYY-MM-DD eller ISO-streng' },
        sluttDato: { type: 'string', description: 'Valgfri sluttdato' },
        klokkeslett: { type: 'string', description: 'Starttidspunkt (f.eks. "19:00")' },
        sted: { type: 'string', description: 'Arrangementssted (f.eks. "Foynhagen", "Slottsfjellet", "Torvet")' },
        adresse: { type: 'string', description: 'Gateadresse for arrangementet' },
        beskrivelse: { type: 'string', description: 'Detaljert arrangementsbeskrivelse' },
        kategori: {
          type: 'string',
          enum: ['ARRANGEMENT', 'KONSERT', 'MARKED', 'KURS', 'BARN', 'SPORT', 'KULTUR', 'FESTIVAL'],
          description: 'Kategori',
        },
        billettlenke: { type: 'string', description: 'Lenke til billettkjøp eller offisiell side' },
        publiser: { type: 'boolean', description: 'Om arrangementet skal publiseres direkte (standard true)' },
      },
      required: ['tittel', 'startDato'],
    },
  },
  {
    name: 'oppdater_bedrift_eller_apningstider',
    description:
      'Oppdaterer informasjon, åpningstider, sesongmenyer og kontaktinfo for en butikk, restaurant eller partner i Tønsberg og Færder.',
    inputSchema: {
      type: 'object',
      properties: {
        navn: { type: 'string', description: 'Navn på bedriften/stedet' },
        apningstider: { type: 'string', description: 'Oppdaterte åpningstider (f.eks. "Man-Fre 10-18, Lør 10-16")' },
        telefon: { type: 'string', description: 'Telefonnummer' },
        epost: { type: 'string', description: 'E-postadresse' },
        nettside: { type: 'string', description: 'Nettside-URL' },
        adresse: { type: 'string', description: 'Gateadresse i Tønsberg/Færder' },
        beskrivelse: { type: 'string', description: 'Kort oppdatert beskrivelse' },
        kategori: {
          type: 'string',
          enum: ['SHOPPING', 'MAT_DRIKKE', 'AKTIVITET', 'OVERNATTING', 'FRISOR_VELVERE', 'KULTUR', 'BARN', 'ANNET'],
          description: 'Bransjekategori',
        },
      },
      required: ['navn'],
    },
  },
  {
    name: 'opprett_artikkel_eller_helgeguide',
    description:
      'Oppretter en redaksjonell artikkel eller helgeguide i Tønsberglivet CMS (lagres som utkast for godkjenning eller publiseres direkte).',
    inputSchema: {
      type: 'object',
      properties: {
        tittel: { type: 'string', description: 'Artikkeltittel på norsk' },
        ingress: { type: 'string', description: 'Kort ingress (2-3 setninger)' },
        innhold: { type: 'string', description: 'Hovedinnhold i markdown-format' },
        kategori: {
          type: 'string',
          enum: ['BYLIVET', 'HVERDAGSLIVET', 'NAERINGSLIVET', 'REISELIVET', 'STUDENTLIVET'],
          description: 'Hovedpilar/kategori',
        },
        publiser: { type: 'boolean', description: 'True for direkte publisering, false for kladd/utkast (standard false)' },
      },
      required: ['tittel', 'innhold'],
    },
  },
  {
    name: 'godkjenn_torvleie',
    description:
      'Godkjenner en leiesøknad for stand eller bod på Tønsberg Torv, sender leiekontrakt på e-post og klargjør faktura.',
    inputSchema: {
      type: 'object',
      properties: {
        bookingId: { type: 'string', description: 'ID på bookingforespørselen som skal godkjennes' },
      },
      required: ['bookingId'],
    },
  },
  {
    name: 'hent_tonsberg_kontekst',
    description:
      'Henter sanntidsstatus fra Tønsberglivet: kommende arrangementer, antall ventende torvleier og nylig publiserte nyheter.',
    inputSchema: {
      type: 'object',
      properties: {
        antallArrangementer: { type: 'number', description: 'Maks antall arrangementer som returneres (standard 5)' },
      },
    },
  },
  {
    name: 'sok_steder_og_restauranter',
    description:
      'Søker i Tønsberglivets register etter restauranter, butikker, overnattingssteder og opplevelser i Tønsberg og Færder.',
    inputSchema: {
      type: 'object',
      properties: {
        sokeord: { type: 'string', description: 'Søkeord (f.eks. "pizza", "uteservering", "hotell", "kaffe")' },
        kategori: { type: 'string', description: 'Valgfri kategori' },
      },
    },
  },
  {
    name: 'sok_bedrifter_brreg',
    description:
      'Søker etter bedrifter, SMB (små og mellomstore bedrifter), næringsdrivende, aksjeselskaper (AS), enkeltpersonforetak og bransjer i Tønsberg og Færder direkte i det offisielle Enhetsregisteret (Brønnøysundregistrene). Returnerer organisasjonsnummer, selskapsnavn, bransje, adresse og kildelenker.',
    inputSchema: {
      type: 'object',
      properties: {
        sokeord: { type: 'string', description: 'Bedriftsnavn, bransje eller søkeord (f.eks. "SMB", "teknologi", "bygg", "regnskap", "revisjon", "konsulent")' },
        limit: { type: 'number', description: 'Maks antall treff (standard 6)' },
      },
    },
  },
];

// 🚀 Utførelse av verktøykall
async function executeToolCall(toolName: string, args: any) {
  switch (toolName) {
    case 'opprett_eller_oppdater_arrangement': {
      const cleanSlug = stableSlug(args.tittel);
      if (!cleanSlug) {
        throw new Error('Mangler «tittel» — kan ikke opprette arrangement uten en gyldig slug.');
      }

      const parsedStartDate = parseFlexibleDate(args.startDato);
      if (!parsedStartDate) {
        throw new Error(`Ugyldig «startDato»: «${args.startDato}». Bruk ISO-format, f.eks. 2026-10-22.`);
      }
      const parsedEndDate = args.sluttDato ? parseFlexibleDate(args.sluttDato) ?? undefined : undefined;
      const eventCategory = normalizeEnum(args.kategori, EVENT_CATEGORIES, 'ARRANGEMENT');

      const event = await (prisma as any).event.upsert({
        where: { slug: cleanSlug },
        update: {
          title: args.tittel,
          description: args.beskrivelse,
          location: args.sted,
          address: args.adresse,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          startTime: args.klokkeslett,
          category: eventCategory,
          externalUrl: args.billettlenke,
          published: args.publiser ?? true,
        },
        create: {
          title: args.tittel,
          slug: cleanSlug,
          description: args.beskrivelse,
          location: args.sted,
          address: args.adresse,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          startTime: args.klokkeslett,
          category: eventCategory,
          externalUrl: args.billettlenke,
          published: args.publiser ?? true,
        },
      });

      return `✅ Arrangementet «${event.title}» er lagret i kalenderen for ${args.startDato} på ${args.sted || 'Tønsberg'}. (Slug: ${event.slug})`;
    }

    case 'oppdater_bedrift_eller_apningstider': {
      const cleanSlug = stableSlug(args.navn);
      if (!cleanSlug) {
        throw new Error('Mangler «navn» — kan ikke oppdatere bedrift uten et gyldig navn.');
      }

      const businessCategory = normalizeEnum(args.kategori, BUSINESS_CATEGORIES, 'ANNET');
      const businessArea = normalizeEnum(args.omrade ?? args.area, BUSINESS_AREAS, 'TONSBERG_SENTRUM');

      const business = await (prisma as any).business.upsert({
        where: { slug: cleanSlug },
        update: {
          name: args.navn,
          description: args.beskrivelse || undefined,
          address: args.adresse || undefined,
          phone: args.telefon || undefined,
          email: args.epost || undefined,
          website: args.nettside || undefined,
          openingHours: args.apningstider || undefined,
          category: businessCategory,
          area: businessArea,
          published: true,
        },
        create: {
          name: args.navn,
          slug: cleanSlug,
          description: args.beskrivelse,
          address: args.adresse,
          phone: args.telefon,
          email: args.epost,
          website: args.nettside,
          openingHours: args.apningstider,
          category: businessCategory,
          area: businessArea,
          published: true,
        },
      });

      return `🏪 Bedriften «${business.name}» er oppdatert med åpningstider: ${business.openingHours || 'standard'} og kontaktinfo.`;
    }

    case 'opprett_artikkel_eller_helgeguide': {
      if (!args.tittel || !args.innhold) {
        throw new Error('Mangler «tittel» og/eller «innhold» — artikkelen kan ikke lagres.');
      }

      const article = await (prisma as any).article.create({
        data: {
          title: args.tittel,
          slug: `${stableSlug(args.tittel) || 'artikkel'}-${crypto.randomBytes(3).toString('hex')}`,
          excerpt: args.ingress,
          content: args.innhold,
          category: normalizeEnum(args.kategori, ARTICLE_CATEGORIES, 'BYLIVET'),
          published: args.publiser ?? false,
        },
      });

      return `📰 Artikkelen «${article.title}» er lagret i CMS ${article.published ? 'og publisert' : 'som utkast for redaksjonell godkjenning'}. (Slug: ${article.slug})`;
    }

    case 'godkjenn_torvleie': {
      const result = await approveAndConfirmBooking(String(args.bookingId));
      // Rapporter faktisk e-postutfall – ikke en påstand om at den er sendt.
      const emailStatus = result.emailSent
        ? `Leieavtale er sendt til ${result.booking.email}`
        : `Leieavtalen ble IKKE sendt (${result.emailMode}) – se serverloggen`;
      return `✅ Torvleie #${args.bookingId} (${result.booking.name}) er godkjent! ${emailStatus}, og fakturagrunnlag er klargjort.`;
    }

    case 'hent_tonsberg_kontekst': {
      const limit = Number(args?.antallArrangementer) || 5;
      const [events, pendingBookings, recentArticles] = await Promise.all([
        (prisma as any).event.findMany({
          where: { published: true, startDate: { gte: new Date() } },
          orderBy: { startDate: 'asc' },
          take: limit,
        }).catch(() => []),
        (prisma as any).bookingRequest.count({ where: { status: 'NEW' } }).catch(() => 0),
        (prisma as any).article.findMany({
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: { title: true, slug: true, category: true },
        }).catch(() => []),
      ]);

      const formattedEvents = events.map((e: any) => `• ${e.title} (${e.location || 'Tønsberg'} - ${new Date(e.startDate).toLocaleDateString('nb-NO')})`).join('\n');

      return `📍 Tønsberglivet Sanntidsstatus:\n- Ventende torvleiesøknader: ${pendingBookings}\n- Kommende arrangementer:\n${formattedEvents || 'Ingen planlagte i dag'}\n- Siste nyheter: ${recentArticles.map((a: any) => a.title).join(', ') || 'Ingen'}`;
    }

    case 'sok_steder_og_restauranter': {
      const query = (args.sokeord || '').toLowerCase().trim();
      const places = await (prisma as any).business.findMany({
        where: {
          published: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 8,
      }).catch(() => []);

      if (places.length === 0) {
        // Fallback til Brønnøysundregistrene dersom det ikke er treff i portalens lokale database
        const brregHits = await searchCompanies(query, undefined, 6).catch(() => []);
        if (brregHits.length > 0) {
          return (
            `Ingen direkte treff i portal-katalogen for «${args.sokeord}», men fant følgende bedrifter i Brønnøysundregistrene for Tønsberg:\n\n` +
            brregHits
              .map(
                (c, i) =>
                  `${i + 1}. **${c.name}** (${c.orgForm})\n` +
                  `   • Bransje: ${c.industry}\n` +
                  `   • Org.nr: ${c.orgNr}\n` +
                  `   • Adresse: ${c.address || c.city || 'Tønsberg'}\n` +
                  `   • Kilde: https://virksomhet.brreg.no/nb/oppslag/enheter/${c.orgNr}`
              )
              .join('\n\n')
          );
        }
        return `Ingen steder funnet for søket «${args.sokeord}».`;
      }

      return JSON.stringify(
        places.map((p: any) => ({
          navn: p.name,
          adresse: p.address,
          apningstider: p.openingHours,
          telefon: p.phone,
          nettside: p.website,
          kategori: p.category,
        })),
        null,
        2
      );
    }

    case 'sok_bedrifter_brreg': {
      const query = (args.sokeord || '').trim();
      const limit = Number(args.limit) || 6;
      const companies = await searchCompanies(query, undefined, limit);

      if (companies.length === 0) {
        return `Ingen registrerte bedrifter funnet i Brønnøysundregistrene for «${query}».`;
      }

      return (
        `🏢 Registrerte bedrifter i Brønnøysundregistrene for Tønsberg:\n\n` +
        companies
          .map(
            (c, i) =>
              `${i + 1}. **${c.name}** (${c.orgForm})\n` +
              `   • Org.nr: ${c.orgNr}\n` +
              `   • Bransje: ${c.industry}\n` +
              `   • Adresse: ${c.address || c.city || 'Tønsberg'}\n` +
              `   • Kilde: https://virksomhet.brreg.no/nb/oppslag/enheter/${c.orgNr}`
          )
          .join('\n\n')
      );
    }

    default:
      throw new Error(`Ukjent verktøy: ${toolName}`);
  }
}

// ⚙️ Behandler JSON-RPC 2.0 meldinger iht. MCP-standarden
async function processRpcMessage(body: any, isAuthorizedToolCaller: boolean): Promise<any> {
  const reqId = body.id !== undefined ? body.id : 1;
  const method = body.method;

  // 1. Initialize
  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id: reqId,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: { listChanged: false },
          resources: { subscribe: false, listChanged: false },
          prompts: { listChanged: false },
          logging: {},
        },
        serverInfo: {
          name: 'Tonsberglivet_MCP_Server',
          version: '1.0.0',
        },
      },
    };
  }

  // 2. Notifications
  if (
    method === 'notifications/initialized' ||
    method === 'initialized' ||
    method === 'notifications/cancelled' ||
    (typeof method === 'string' && method.startsWith('notifications/'))
  ) {
    return { jsonrpc: '2.0', id: reqId, result: {} };
  }

  // 3. Tools List
  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id: reqId,
      result: {
        tools: MCP_TOOLS,
      },
    };
  }

  // 4. Tools Call — krever autentisering.
  //    Verktøyene oppretter/publiserer artikler og arrangementer, oppdaterer
  //    bedrifter og godkjenner torvleie. Uten denne sjekken kunne hvem som helst
  //    gjøre det med et anonymt POST-kall (CORS var dessuten satt til «*»).
  if (method === 'tools/call') {
    if (!isAuthorizedToolCaller) {
      return {
        jsonrpc: '2.0',
        id: reqId,
        error: {
          code: -32001,
          message:
            'Uautorisert: verktøykall krever gyldig Bearer-token (MCP_API_KEY) eller innlogget administrator.',
        },
      };
    }

    const toolName = body.params?.name;
    const toolArgs = body.params?.arguments || {};

    try {
      const resultText = await executeToolCall(toolName, toolArgs);
      return {
        jsonrpc: '2.0',
        id: reqId,
        result: {
          content: [{ type: 'text', text: resultText }],
          isError: false,
        },
      };
    } catch (err: any) {
      return {
        jsonrpc: '2.0',
        id: reqId,
        result: {
          content: [{ type: 'text', text: `Feil ved utførelse av ${toolName}: ${err.message}` }],
          isError: true,
        },
      };
    }
  }

  // Fallback for andre metoder
  return {
    jsonrpc: '2.0',
    id: reqId,
    error: {
      code: -32601,
      message: `Metode '${method}' er ikke implementert.`,
    },
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const isAuthorizedToolCaller = isAuthorizedMcpCaller(req);
    const body = await req.json().catch(() => ({}));

    // Håndter batch-kall eller enkeltkall
    if (Array.isArray(body)) {
      const responses = await Promise.all(body.map((msg) => processRpcMessage(msg, isAuthorizedToolCaller)));
      return NextResponse.json(responses, { headers: CORS_HEADERS });
    }

    const response = await processRpcMessage(body, isAuthorizedToolCaller);
    return NextResponse.json(response, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error('MCP Server POST feil:', err);
    return NextResponse.json(
      { jsonrpc: '2.0', id: null, error: { code: -32603, message: err.message || 'Intern MCP-feil' } },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// Støtte for SSE (Server-Sent Events) og direkte status på GET
export async function GET(req: NextRequest) {
  const acceptHeader = req.headers.get('accept') || '';

  if (acceptHeader.includes('text/event-stream')) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`event: open\ndata: ${JSON.stringify({ status: 'connected', server: 'Tonsberglivet_MCP_Server' })}\n\n`));
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        ...CORS_HEADERS,
      },
    });
  }

  return NextResponse.json(
    {
      status: 'online',
      server: 'Tonsberglivet Remote MCP Server v1.0',
      protocolVersion: '2024-11-05',
      toolsCount: MCP_TOOLS.length,
      tools: MCP_TOOLS.map((t) => t.name),
      endpoint: '/api/mcp',
      openApiSchema: '/api/mcp/openapi.json',
      railwayLiveUrl: 'https://tonsberglivet-production.up.railway.app/api/mcp',
    },
    { headers: CORS_HEADERS }
  );
}
