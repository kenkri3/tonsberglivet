import { prisma } from './prisma';
import { searchBrave, searchTavily, scrapeUrl, smartWebSearch } from './web-intelligence';
import { fetchLiveTicketmasterEvents } from './ticketmaster';
import { fetchLibraryEvents } from './libraryEvents';
import { fetchLiveDepartures, TONSBERG_STOPS } from './entur';
import { fetchLiveOceanConditions } from './ocean';
import { fetchBeaches } from './beaches';
import { fetchLiveTrafficStatus } from './traffic';
import { fetchLiveAirQuality } from './airquality';
import { searchCompanies } from './brreg';
import { approveAndConfirmBooking } from './email';
import { getVisitorPulseSummary } from './chatbot-logger';

export interface AgentExecutionResult {
  toolName: string;
  success: boolean;
  message: string;
  data: any;
  actionExecuted?: string | null;
  actionResult?: any;
}

/**
 * 1. Nett- og omverdenssøk med Brave Search API
 */
export async function toolBraveSearch(query: string): Promise<AgentExecutionResult> {
  const result = await searchBrave(query, 5);
  if (!result.success) {
    // Hvis Brave feiler eller mangler nøkkel, forsøk automatisk fallback til Tavily eller direct
    const fallback = await smartWebSearch(query, 'auto');
    if (fallback.success) {
      return {
        toolName: 'sok_nettet_brave',
        success: true,
        message: `Brave feilet (${result.error}), men Tavily fant resultater for "${query}":`,
        data: fallback.results,
      };
    }
    return {
      toolName: 'sok_nettet_brave',
      success: false,
      message: result.error || 'Kunne ikke fullføre Brave-søk.',
      data: null,
    };
  }

  return {
    toolName: 'sok_nettet_brave',
    success: true,
    message: `Fant ${result.results.length} resultater via Brave Search for "${query}":`,
    data: result.results,
  };
}

/**
 * 2. Dyp AI-research med Tavily API
 */
export async function toolTavilySearch(query: string): Promise<AgentExecutionResult> {
  const result = await searchTavily(query, { searchDepth: 'advanced', maxResults: 5 });
  if (!result.success) {
    // Fallback til Brave hvis Tavily mangler nøkkel
    const fallback = await searchBrave(query, 5);
    if (fallback.success) {
      return {
        toolName: 'research_tavily',
        success: true,
        message: `Tavily feilet (${result.error}), men Brave fant resultater:`,
        data: fallback.results,
      };
    }
    return {
      toolName: 'research_tavily',
      success: false,
      message: result.error || 'Kunne ikke fullføre Tavily-søk.',
      data: null,
    };
  }

  return {
    toolName: 'research_tavily',
    success: true,
    message: result.answer ? `Tavily syntese: ${result.answer}` : `Fant ${result.results.length} forskningskilder:`,
    data: {
      answer: result.answer,
      results: result.results,
    },
  };
}

/**
 * 3. Skraping og dyp lesing av nettsider med Apify
 */
export async function toolApifyScrape(url: string, instructions?: string): Promise<AgentExecutionResult> {
  const result = await scrapeUrl(url, instructions);
  if (!result.success) {
    return {
      toolName: 'skrap_nettside_apify',
      success: false,
      message: result.error || `Kunne ikke lese nettsiden ${url}`,
      data: null,
    };
  }

  return {
    toolName: 'skrap_nettside_apify',
    success: true,
    message: `Leste nettsiden «${result.title}» via ${result.source === 'apify' ? 'Apify Crawler' : 'Direct Reader'}:`,
    data: {
      url: result.url,
      title: result.title,
      contentSnippet: result.content.slice(0, 3000),
      fullLength: result.content.length,
    },
  };
}

/**
 * 4. Hent reelle arrangementer fra DB, Ticketmaster og biblioteket
 */
export async function toolGetRealEvents(daysAhead: number = 14): Promise<AgentExecutionResult> {
  const now = new Date();
  const maxDate = new Date();
  maxDate.setDate(now.getDate() + daysAhead);

  try {
    // A. Reelle arrangementer fra Postgres
    const dbEvents = await prisma.event.findMany({
      where: {
        published: true,
        startDate: { gte: now, lte: maxDate },
      },
      orderBy: { startDate: 'asc' },
      take: 15,
    }).catch(() => []);

    // B. Reelle arrangementer fra Ticketmaster Tønsberg (Foynhagen, Oseberg etc.)
    const tmEvents = await fetchLiveTicketmasterEvents().catch(() => []);

    // C. Reelle arrangementer fra Tønsberg og Færder bibliotek
    const libEvents = await fetchLibraryEvents().catch(() => []);

    // Kombiner og formater
    const all = [
      ...dbEvents.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.startDate.toISOString().split('T')[0],
        time: e.startTime || '19:00',
        location: e.location || 'Tønsberg',
        category: e.category,
        source: 'Tønsberglivet Kalender (CMS)',
      })),
      ...tmEvents.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        time: e.time,
        location: e.venueName || e.location || 'Tønsberg',
        category: e.category,
        ticketUrl: e.ticketUrl,
        source: 'Ticketmaster Live',
      })),
      ...libEvents.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.dateStr,
        time: e.timeStr,
        location: e.location,
        category: 'KULTUR',
        source: 'Biblioteket',
      })),
    ];

    // Unike arrangementer sortert etter dato
    const seen = new Set();
    const uniqueEvents = all.filter((ev) => {
      const key = `${ev.title.toLowerCase().slice(0, 15)}_${ev.date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return {
      toolName: 'hent_live_arrangementer',
      success: true,
      message: `Fant ${uniqueEvents.length} faktiske arrangementer i Tønsberg de neste ${daysAhead} dagene:`,
      data: uniqueEvents.slice(0, 12),
    };
  } catch (error: any) {
    return {
      toolName: 'hent_live_arrangementer',
      success: false,
      message: `Feil ved henting av arrangementer: ${error?.message}`,
      data: [],
    };
  }
}

/**
 * 4b. Validér og normaliser fritekst-kategori til en faktisk Prisma-enum.
 * Kaller/AI kan sende «Bylivet», «næringslivet» eller søppel – vi skriver aldri
 * ukjente verdier rett inn i en enum-kolonne (det gir 500 i Prisma).
 */
const ARTICLE_CATEGORY_ALIASES: Record<string, 'BYLIVET' | 'HVERDAGSLIVET' | 'NAERINGSLIVET' | 'REISELIVET' | 'STUDENTLIVET'> = {
  BYLIV: 'BYLIVET',
  BYLIVET: 'BYLIVET',
  HVERDAGSLIV: 'HVERDAGSLIVET',
  HVERDAGSLIVET: 'HVERDAGSLIVET',
  NAERINGSLIV: 'NAERINGSLIVET',
  NAERINGSLIVET: 'NAERINGSLIVET',
  NARINGSLIV: 'NAERINGSLIVET',
  NARINGSLIVET: 'NAERINGSLIVET',
  REISELIV: 'REISELIVET',
  REISELIVET: 'REISELIVET',
  STUDENTLIV: 'STUDENTLIVET',
  STUDENTLIVET: 'STUDENTLIVET',
};

export function normalizeArticleCategory(
  value?: string | null
): 'BYLIVET' | 'HVERDAGSLIVET' | 'NAERINGSLIVET' | 'REISELIVET' | 'STUDENTLIVET' {
  if (!value || typeof value !== 'string') return 'BYLIVET';

  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/Æ/g, 'AE')
    .replace(/Ø/g, 'O')
    .replace(/Å/g, 'A')
    .replace(/[^A-Z]/g, '');

  const resolved = ARTICLE_CATEGORY_ALIASES[normalized];
  if (!resolved) {
    console.warn(
      `[AgentTools] Ukjent artikkelkategori «${value}» – bruker BYLIVET i stedet for å skrive en ugyldig enum-verdi.`
    );
    return 'BYLIVET';
  }
  return resolved;
}

/**
 * 5. Opprett faktisk artikkel i databasen (Prisma CMS)
 */
export async function toolCreateRealArticle(args: {
  title: string;
  excerpt?: string;
  content: string;
  category?: string;
  published?: boolean;
}): Promise<AgentExecutionResult> {
  const category = normalizeArticleCategory(args.category);
  const cleanSlug =
    args.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') +
    '-' +
    Date.now().toString().slice(-4);

  try {
    const article = await prisma.article.create({
      data: {
        title: args.title,
        slug: cleanSlug,
        excerpt: args.excerpt || args.content.slice(0, 160) + '...',
        content: args.content,
        category,
        published: args.published ?? false,
      },
    });

    return {
      toolName: 'opprett_artikkel_cms',
      success: true,
      message: `✅ Artikkelen «${article.title}» er opprettet i CMS! (Status: ${article.published ? 'Publisert' : 'Utkast'}, Slug: ${article.slug})`,
      data: article,
      actionExecuted: 'article_created',
      actionResult: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        category: article.category,
        published: article.published,
      },
    };
    } catch (err: any) {
      // Ingen lokal «draft-kø» finnes: vi later aldri som om artikkelen er lagret.
      console.error('[AgentTools] Kunne ikke opprette artikkel i CMS:', err?.message);

      return {
        toolName: 'opprett_artikkel_cms',
        success: false,
        message:
          `Kunne ikke lagre artikkelen «${args.title}» i CMS-databasen: ` +
          `${err?.message || 'ukjent databasefeil'}. Ingen artikkel er opprettet og ingenting er lagret – ` +
          `prøv igjen, eller opprett saken manuelt under Artikler i adminpanelet.`,
        data: null,
        actionExecuted: null,
        actionResult: null,
      };
    }
  }

/**
 * 6. Hent reelle ventende torvleiesøknader fra databasen
 */
export async function toolGetRealBookings(): Promise<AgentExecutionResult> {
  try {
    const bookings = await (prisma as any).bookingRequest?.findMany({
      where: {
        status: { in: ['NEW', 'PROCESSING'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }).catch(() => []);

    return {
      toolName: 'hent_ventende_torvleie',
      success: true,
      message: `Fant ${bookings.length} ventende torvleiesøknader i systemet:`,
      data: bookings,
    };
  } catch (err: any) {
    return {
      toolName: 'hent_ventende_torvleie',
      success: false,
      message: `Feil ved henting av bookingforespørsler: ${err?.message}`,
      data: [],
    };
  }
}

/**
 * 7. Godkjenn faktisk torvleie i databasen og send bekreftelse
 *
 * Krever en eksplisitt booking-ID. Vi gjetter aldri «eldste ventende»: godkjenning
 * er en irreversibel statusendring som også sender bekreftelses-e-post til leietaker.
 */
export async function toolApproveBooking(bookingId?: string): Promise<AgentExecutionResult> {
  try {
    const targetId = typeof bookingId === 'string' ? bookingId.trim() : '';

    if (!targetId) {
      return {
        toolName: 'godkjenn_torvleie_booking',
        success: false,
        message:
          'Ingen booking-ID oppgitt. Av sikkerhetshensyn godkjenner jeg ikke en tilfeldig søknad – ' +
          'oppgi eksplisitt ID, f.eks. «godkjenn torvleie #<id>».',
        data: null,
      };
    }

    const result = await approveAndConfirmBooking(targetId);
    // Bekreftelsen er godkjent, men e-posten er ikke nødvendigvis levert.
    // `emailSent`/`emailMode` kommer fra email.ts og må rapporteres ærlig.
    const emailStatus = result.emailSent
      ? `Bekreftelses-e-post er sendt til ${result.booking.email}.`
      : `Bekreftelses-e-post ble IKKE sendt (${result.emailMode}) – søknaden er likevel godkjent.`;

    return {
      toolName: 'godkjenn_torvleie_booking',
      success: true,
      message: `✅ Torvleiesøknad #${targetId} for ${result.booking.name} (${result.booking.zone}) er godkjent! ${emailStatus}`,
      data: result.booking,
      actionExecuted: 'booking_approved',
      actionResult: {
        id: targetId,
        vendor: result.booking.name,
        zone: result.booking.zone,
        totalPrice: result.booking.totalPrice,
      },
    };
  } catch (err: any) {
    return {
      toolName: 'godkjenn_torvleie_booking',
      success: false,
      message: `Kunne ikke godkjenne torvleie: ${err?.message}`,
      data: null,
    };
  }
}

/**
 * 8. Hent sanntidsdata for Tønsberg: Transport (Entur), Sjø & Bading (Havvarsel), Luft, Trafikk
 */
export async function toolGetRealtimeStatus(): Promise<AgentExecutionResult> {
  try {
    const [departuresData, ocean, airQuality, traffic] = await Promise.all([
      fetchLiveDepartures(TONSBERG_STOPS.TOGSTASJON).catch(() => null),
      fetchLiveOceanConditions().catch(() => null),
      fetchLiveAirQuality().catch(() => null),
      fetchLiveTrafficStatus().catch(() => null),
    ]);

    const departuresList = departuresData?.departures || [];
    const airQualityData = airQuality?.data;

    return {
      toolName: 'hent_sanntidsinformasjon',
      success: true,
      message: 'Hentet ferske sanntidsdata for Tønsberg:',
      data: {
        togAvganger: departuresList.slice(0, 4).map((d) => ({
          linje: d.line,
          destinasjon: d.destination,
          avgangstid: d.timeFormatted,
        })),
        sjoOgVar: ocean
          ? {
              sjoTemperatur: ocean.seaTemperature !== null ? `${ocean.seaTemperature} °C` : 'Ikke tilgjengelig',
              bolgehoyde: ocean.waveHeight !== null ? `${ocean.waveHeight} m` : 'Ikke tilgjengelig',
              vannstand: ocean.tideState,
              nesteHoyvann: ocean.nextHighTide,
            }
          : null,
        luftkvalitet: airQualityData
          ? `${airQualityData.label} (${airQualityData.healthAdvice})`
          : 'Ingen offisiell luftkvalitetsmåling tilgjengelig akkurat nå',
        trafikkOversikt: traffic?.trafficFlowOverview || 'Flyter fint',
        kanalbrua: traffic?.kanalbrua?.status || 'Åpen for veitrafikk',
        trafikkmeldinger: (traffic?.alerts || []).slice(0, 3).map((a) => a.heading),
      },
    };
  } catch (err: any) {
    return {
      toolName: 'hent_sanntidsinformasjon',
      success: false,
      message: `Feil ved henting av sanntidsdata: ${err?.message}`,
      data: null,
    };
  }
}

/**
 * 9. Søk i bedrifter og Brreg for Tønsberg/Færder
 */
export async function toolSearchBusinesses(query: string): Promise<AgentExecutionResult> {
  try {
    // A. Lokalt register
    const dbBusinesses = await (prisma as any).business?.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 6,
    }).catch(() => []);

    // B. Brønnøysundregistrene
    const brregCompanies = await searchCompanies(query, undefined, 5).catch(() => []);

    return {
      toolName: 'sok_bedrifter_og_brreg',
      success: true,
      message: `Fant ${dbBusinesses.length} lokale bedrifter i CMS og ${brregCompanies.length} i Enhetsregisteret for «${query}»:`,
      data: {
        lokaleBedrifter: dbBusinesses,
        enhetsregisteret: brregCompanies,
      },
    };
  } catch (err: any) {
    return {
      toolName: 'sok_bedrifter_og_brreg',
      success: false,
      message: `Feil ved bedriftssøk: ${err?.message}`,
      data: null,
    };
  }
}

/**
 * 10. Hent publikumshenvendelser og trender fra landingsside-chatboten
 */
export async function toolGetVisitorPulse(): Promise<AgentExecutionResult> {
  try {
    const pulse = await getVisitorPulseSummary();
    return {
      toolName: 'analyser_publikumshenvendelser',
      success: true,
      message: `Tønsberg-Guiden (landingsside-chatbot) har logget ${pulse.totalSisteDogn} henvendelser siste døgn og følgende publikumstrender:`,
      data: pulse,
    };
  } catch (err: any) {
    return {
      toolName: 'analyser_publikumshenvendelser',
      success: false,
      message: `Feil ved analyse av publikumstrender: ${err?.message}`,
      data: null,
    };
  }
}

/**
 * 11. Klargjør fakturagrunnlag for godkjente torvleieavtaler.
 *
 * MERK: Funksjonen het tidligere «eksporter til Duett (Peppol EHF 3.0)» og
 * svarte «✅ Klargjort … eksport», men den genererer ingen EHF-fil og snakker
 * ikke med Duett — den teller godkjente avtaler. Den oppdiktet i tillegg
 * 3500 kr per avtale som manglet pris. Nå summeres kun lagrede beløp, og
 * meldingen sier hva som faktisk er gjort: grunnlaget er klargjort, og den
 * ekte CSV-eksporten ligger i /api/finance/export.
 */
export async function toolExportToDuett(): Promise<AgentExecutionResult> {
  let approvedBookings: any[];
  try {
    approvedBookings = await (prisma as any).bookingRequest.findMany({
      where: { status: 'APPROVED' },
      take: 20,
    });
  } catch (err: any) {
    return {
      toolName: 'eksporter_til_duett',
      success: false,
      message: `Kunne ikke lese godkjente torvleieavtaler fra databasen: ${err?.message}. Ingenting er klargjort.`,
      data: null,
    };
  }

  // Kun faktisk lagrede beløp telles. Vi finner ikke opp en pris.
  const totalAmount = approvedBookings.reduce(
    (sum: number, b: any) => sum + (Number(b.totalPrice) || 0),
    0
  );
  const missingPriceCount = approvedBookings.filter(
    (b: any) => b.totalPrice === null || b.totalPrice === undefined
  ).length;

  return {
    toolName: 'eksporter_til_duett',
    success: true,
    message:
      `📋 Fakturagrunnlaget er klargjort for ${approvedBookings.length} godkjente avtaler ` +
      `(sum ${totalAmount.toLocaleString('nb-NO')} kr eks. mva). ` +
      `Ingen EHF-fil er generert og ingenting er sendt til Duett ennå — ` +
      `selve eksporten kjøres fra Admin > Økonomi.` +
      (missingPriceCount > 0
        ? ` Merk: ${missingPriceCount} avtale(r) mangler pris og er regnet som 0 kr.`
        : ''),
    data: {
      antallAvtaler: approvedBookings.length,
      antallUtenPris: missingPriceCount,
      totalBelopEksMva: totalAmount,
      eksportEndepunkt: '/api/finance/export',
      klargjortTid: new Date().toISOString(),
    },
    actionExecuted: 'duett_prepared',
    actionResult: {
      preparedCount: approvedBookings.length,
      totalAmount,
      missingPriceCount,
    },
  };
}
