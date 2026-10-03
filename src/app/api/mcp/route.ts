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

/** Sammenligner to hemmeligheter i konstant tid (unngår timing-lekkasje). */
function secretEquals(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Omfanget til den som kaller MCP-serveren.
 *
 * MCP-serveren skriver til CMS, bedriftsregisteret og torvleie, og godkjenning
 * av torvleie sender kontrakt på e-post. Én nøkkel som åpnet ALT gjorde det
 * umulig å gi en agent lesetilgang uten å samtidig gi den skriverett.
 *
 *   MCP_API_KEY            → 'write' (alle verktøy)
 *   MCP_READONLY_API_KEY   → 'read'  (kun verktøyene i READ_ONLY_TOOLS)
 *   innlogget administrator → 'write'
 *
 * Er ingen nøkkel satt, faller vi tilbake på admin-cookien – altså fail-closed
 * for eksterne agenter, som ikke har noen cookie.
 */
type McpScope = 'none' | 'read' | 'write';

/** Verktøy som bare leser data. Alt annet regnes som skrivende. */
const READ_ONLY_TOOLS = new Set<string>([
  'hent_tonsberg_kontekst',
  'hent_ventende_torvleier',
  'sok_steder_og_restauranter',
  'sok_bedrifter_brreg',
]);

function resolveMcpScope(req: NextRequest): McpScope {
  const authHeader = req.headers.get('authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const apiKeyHeader = (req.headers.get('x-api-key') || '').trim();
  const presented = [bearer, apiKeyHeader].filter(Boolean);

  const writeKey = (process.env.MCP_API_KEY || '').trim();
  const readKey = (process.env.MCP_READONLY_API_KEY || '').trim();

  // Skrivenøkkelen sjekkes først, så en nøkkel som ved uhell er satt til samme
  // verdi i begge variablene gir skrivetilgang – ikke en stille nedgradering.
  for (const candidate of presented) {
    if (secretEquals(candidate, writeKey)) return 'write';
  }
  for (const candidate of presented) {
    if (secretEquals(candidate, readKey)) return 'read';
  }

  return requireAdmin(req).authorized ? 'write' : 'none';
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
    name: 'hent_ventende_torvleier',
    description:
      'Lister ventende søknader om leie av standplass på Tønsberg Torv og Kaldnes Brygge, med den eksakte booking-ID-en. Bruk dette verktøyet FØR godkjenn_torvleie for å finne riktig ID – ID-er skal aldri gjettes. Returnerer personopplysninger (navn, e-post, telefon); behandles konfidensielt.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Maks antall søknader som returneres (standard 10, maks 25)' },
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

    case 'hent_ventende_torvleier': {
      const limit = Math.min(Math.max(Number(args?.limit) || 10, 1), 25);

      // Ingen .catch()-fallback her: er databasen nede, skal agenten få en feil
      // den kan rapportere – ikke en tom liste den tolker som «ingen søknader».
      const [bookings, total] = await Promise.all([
        prisma.bookingRequest.findMany({
          where: { status: { in: ['NEW', 'PROCESSING'] } },
          orderBy: { createdAt: 'asc' },
          take: limit,
        }),
        prisma.bookingRequest.count({ where: { status: { in: ['NEW', 'PROCESSING'] } } }),
      ]);

      if (bookings.length === 0) {
        return 'Ingen ventende torvleiesøknader akkurat nå.';
      }

      const linjer = bookings.map((b, i) => {
        const periode = b.startDate
          ? `${b.startDate.toLocaleDateString('nb-NO')}${
              b.endDate ? ` – ${b.endDate.toLocaleDateString('nb-NO')}` : ''
            }`
          : 'Ikke oppgitt';

        return [
          `${i + 1}. ${b.name} — booking-ID: ${b.id}`,
          `   • Type: ${b.type}${b.zone ? ` · Sone: ${b.zone}` : ''}`,
          `   • Periode: ${periode}`,
          `   • Kontakt: ${b.email}${b.phone ? ` · ${b.phone}` : ''}`,
          `   • Leiebeløp: ${typeof b.totalPrice === 'number' ? `kr ${b.totalPrice.toLocaleString('nb-NO')}` : 'ikke satt'}`,
          `   • Org.nr: ${b.orgNr || 'ikke oppgitt'} · Strøm: ${b.powerNeeded ? 'ja' : 'nei'} · Vann: ${b.waterNeeded ? 'ja' : 'nei'}`,
          `   • Mottatt: ${b.createdAt.toLocaleDateString('nb-NO')}`,
        ].join('\n');
      });

      return (
        `🏛️ Ventende torvleiesøknader (viser ${bookings.length} av ${total}, eldste først):\n\n` +
        linjer.join('\n\n') +
        `\n\nGodkjenn med \`godkjenn_torvleie\` og den eksakte booking-ID-en over. ` +
        `ID-er skal aldri gjettes.`
      );
    }

    case 'hent_tonsberg_kontekst': {
      const limit = Number(args?.antallArrangementer) || 5;

      // Uten .catch()-fallback: tidligere rapporterte dette verktøyet «0 ventende
      // torvleiesøknader» og «Ingen planlagte i dag» når databasen faktisk var
      // nede. Agenten presenterte det som fakta til brukeren.
      const [events, pendingBookings, recentArticles] = await Promise.all([
        prisma.event.findMany({
          where: { published: true, startDate: { gte: new Date() } },
          orderBy: { startDate: 'asc' },
          take: limit,
        }),
        // Samme statussett som hent_ventende_torvleier, så tallene stemmer.
        prisma.bookingRequest.count({ where: { status: { in: ['NEW', 'PROCESSING'] } } }),
        prisma.article.findMany({
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: { title: true, slug: true, category: true },
        }),
      ]);

      const formattedEvents = events.map((e) => `• ${e.title} (${e.location || 'Tønsberg'} - ${e.startDate.toLocaleDateString('nb-NO')})`).join('\n');

      return `📍 Tønsberglivet Sanntidsstatus:\n- Ventende torvleiesøknader: ${pendingBookings}\n- Kommende arrangementer:\n${formattedEvents || 'Ingen planlagte i dag'}\n- Siste nyheter: ${recentArticles.map((a) => a.title).join(', ') || 'Ingen'}`;
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
async function processRpcMessage(body: any, scope: McpScope): Promise<any> {
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
          version: '1.1.0',
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

  // 3. Tools List — en lese-only nøkkel får bare se verktøyene den kan bruke,
  //    så agenten ikke prøver å kalle noe den får avvist.
  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id: reqId,
      result: {
        tools: scope === 'read' ? MCP_TOOLS.filter((t) => READ_ONLY_TOOLS.has(t.name)) : MCP_TOOLS,
      },
    };
  }

  // 4. Tools Call — krever autentisering.
  //    Verktøyene oppretter/publiserer artikler og arrangementer, oppdaterer
  //    bedrifter og godkjenner torvleie. Uten denne sjekken kunne hvem som helst
  //    gjøre det med et anonymt POST-kall (CORS var dessuten satt til «*»).
  if (method === 'tools/call') {
    if (scope === 'none') {
      return {
        jsonrpc: '2.0',
        id: reqId,
        error: {
          code: -32001,
          message:
            'Uautorisert: verktøykall krever gyldig Bearer-token (MCP_API_KEY for skrivetilgang, ' +
            'MCP_READONLY_API_KEY for lesetilgang) eller innlogget administrator.',
        },
      };
    }

    const toolName = body.params?.name;
    const toolArgs = body.params?.arguments || {};

    // En lese-only nøkkel skal ikke kunne publisere artikler, overskrive
    // bedrifter eller godkjenne torvleie – uansett hva agenten ber om.
    if (scope === 'read' && !READ_ONLY_TOOLS.has(String(toolName))) {
      return {
        jsonrpc: '2.0',
        id: reqId,
        error: {
          code: -32003,
          message:
            `Avvist: «${toolName}» endrer data, og denne nøkkelen har bare lesetilgang. ` +
            'Bruk MCP_API_KEY for skrivende verktøy.',
        },
      };
    }

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
    const scope = resolveMcpScope(req);
    const body = await req.json().catch(() => ({}));

    // Håndter batch-kall eller enkeltkall
    if (Array.isArray(body)) {
      const responses = await Promise.all(body.map((msg) => processRpcMessage(msg, scope)));
      return NextResponse.json(responses, { headers: CORS_HEADERS });
    }

    const response = await processRpcMessage(body, scope);
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
      server: 'Tonsberglivet Remote MCP Server v1.1',
      protocolVersion: '2024-11-05',
      toolsCount: MCP_TOOLS.length,
      tools: MCP_TOOLS.map((t) => t.name),
      readOnlyTools: [...READ_ONLY_TOOLS],
      auth: {
        write: 'Authorization: Bearer <MCP_API_KEY>',
        read: 'Authorization: Bearer <MCP_READONLY_API_KEY>',
        admin: 'innlogget administrator (cookie)',
      },
      endpoint: '/api/mcp',
      openApiSchema: '/api/mcp/openapi.json',
      railwayLiveUrl: 'https://tonsberglivet-production.up.railway.app/api/mcp',
    },
    { headers: CORS_HEADERS }
  );
}
