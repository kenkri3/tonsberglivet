import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireEditorOrAdmin } from '@/lib/auth';
import { fetchNewlyRegisteredCompanies, fetchTonsbergCompanyTotal } from '@/lib/brreg';
import { fetchLiveTicketmasterFeed, getDoOHScreenPlaylist } from '@/lib/ticketmaster';
import { fetchLiveTrafficStatus } from '@/lib/traffic';
import { fetchLiveOceanConditions } from '@/lib/ocean';
import { getUnreadChatCount, getAllChatSessions } from '@/lib/live-chat';
import { getSetting } from '@/lib/settings';

export const dynamic = 'force-dynamic';

/**
 * Dashboard-KPI-er og integrasjonsstatus er intern forretningsinformasjon.
 * Middleware dekker bare /admin/:path*, ikke /api/admin/*, så sjekken må ligge her.
 */
export async function GET(request: Request) {
  const auth = requireEditorOrAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    // 1. Artikler (fra DB eller fallback)
    let articlesCount = 0;
    let recentArticles: any[] = [];
    try {
      const arts = await prisma.article.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, category: true, published: true, createdAt: true },
      });
      articlesCount = await prisma.article.count();
      recentArticles = arts;
    } catch {
      articlesCount = 0;
    }

    // 2. Arrangementer (Ticketmaster sanntidsdata)
    let eventsCount = 0;
    let liveEvents: any[] = [];
    // Faktisk kilde-status fra Ticketmaster, ikke en antakelse. Brukes både til
    // «siste synk»-tidspunktet og til integrasjonsstatusen lenger ned, slik at
    // dashboardet ikke kan påstå «Live Sanntid» når feeden ikke svarte.
    let ticketmasterIsLive = false;
    let ticketmasterSource = 'UNAVAILABLE';
    let ticketmasterNote: string | undefined;
    try {
      const feed = await fetchLiveTicketmasterFeed();
      eventsCount = feed.events.length;
      liveEvents = feed.events.slice(0, 5);
      ticketmasterIsLive = feed.isLive;
      ticketmasterSource = feed.source;
      ticketmasterNote = feed.note;
    } catch {
      eventsCount = 0;
    }

    // 3. Bedrifter & Nystartede (fra Brønnøysundregistrene OpenAPI)
    let newCompaniesCount = 0;
    // Tidligere: let totalBrregTonsberg = 13169 (hardkodet «offisielt» tall).
    // Nå hentes det faktiske antallet fra Enhetsregisteret, og er null når
    // registeret ikke svarer — da viser vi «–» i stedet for et udokumentert tall.
    let totalBrregTonsberg: number | null = null;
    let totalBrregTonsbergIsLive = false;
    let recentNewCompanies: any[] = [];
    try {
      const [brregData, brregTotal] = await Promise.all([
        fetchNewlyRegisteredCompanies({ daysBack: 30, limit: 10 }),
        fetchTonsbergCompanyTotal(),
      ]);
      newCompaniesCount = brregData.total || brregData.companies.length;
      recentNewCompanies = brregData.companies.slice(0, 5);
      totalBrregTonsberg = brregTotal.total;
      totalBrregTonsbergIsLive = brregTotal.isLive;
    } catch {
      newCompaniesCount = 0;
    }

    // 3b. Ekstern kildehelse for integrasjonsstatusen lenger ned.
    // Hver status utledes fra kilden selv — ingen hardkodede «Live Sanntid»-påstander.
    let trafficIsLive = false;
    let trafficNote: string | undefined;
    try {
      const traffic = await fetchLiveTrafficStatus();
      trafficIsLive = traffic.isLive;
      trafficNote = traffic.note;
    } catch {
      trafficIsLive = false;
    }

    let metIsLive = false;
    try {
      const ocean = await fetchLiveOceanConditions();
      metIsLive = ocean.isLive;
    } catch {
      metIsLive = false;
    }

    // Antall konfigurerte byskjermer. Dette er en konfigurasjonstelling, ikke en
    // helsemåling — derfor ordlyden «konfigurert», ikke «i drift».
    const doohScreenCount = new Set(getDoOHScreenPlaylist().map((item) => item.screenId)).size;

    // 4. Booking & Torvleie (fra DB)
    let pendingBookingsCount = 0;
    let totalBookingsCount = 0;
    let approvedBookingsRevenue = 0;
    try {
      const bookings = await prisma.bookingRequest.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      totalBookingsCount = await prisma.bookingRequest.count();
      pendingBookingsCount = await prisma.bookingRequest.count({
        where: { status: 'NEW' },
      });
      const approved = await prisma.bookingRequest.findMany({
        where: { status: 'APPROVED' },
        select: { totalPrice: true },
      });
      approvedBookingsRevenue = approved.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    } catch {
      totalBookingsCount = 0;
      pendingBookingsCount = 0;
    }

    // 5. Meldinger & Chat (ContactMessage + Live Chat)
    let unreadMessagesCount = 0;
    let totalMessagesCount = 0;
    try {
      const unreadContact = await prisma.contactMessage.count({ where: { read: false } }).catch(() => 0);
      const totalContact = await prisma.contactMessage.count().catch(() => 0);
      const unreadChat = await getUnreadChatCount().catch(() => 0);
      const chatSessions = await getAllChatSessions().catch(() => []);
      
      unreadMessagesCount = unreadContact + unreadChat;
      totalMessagesCount = totalContact + chatSessions.length;
    } catch {
      unreadMessagesCount = 0;
      totalMessagesCount = 0;
    }

    // 6. Sjekk status på eksterne integrasjoner (Er de tilkoblet eller mangler de oppsett?)
    const ga4Id = (await getSetting('ga_measurement_id')) || process.env.NEXT_PUBLIC_GA_ID;
    const gscTag = (await getSetting('gsc_verification_tag')) || process.env.GSC_VERIFICATION_TAG;
    const duettUrl = (await getSetting('duett_webhook_url')) || process.env.DUETT_WEBHOOK_URL;
    const metaToken = (await getSetting('meta_access_token')) || process.env.META_ACCESS_TOKEN;
    const oneMinKey = (await getSetting('1_min_ai')) || process.env['1_MIN_AI'] || process.env.ONE_MIN_AI;
    const geminiKey = (await getSetting('gemini_api_key')) || process.env.GEMINI_API_KEY;

    const integrations = {
      ga4: {
        configured: Boolean(ga4Id),
        id: ga4Id ? `${ga4Id.slice(0, 4)}...` : null,
        label: 'Google Analytics 4',
        statusText: ga4Id ? 'Tilkoblet (Aktiv)' : 'Ikke tilkoblet ennå',
        actionRequired: !ga4Id,
        actionHelp: 'Må legge inn Målings-ID (G-XXXXXXXX) under Innstillinger for å spore reelle besøkstall.',
      },
      gsc: {
        configured: Boolean(gscTag),
        label: 'Google Search Console',
        statusText: gscTag ? 'Verifisert' : 'Ikke tilkoblet ennå',
        actionRequired: !gscTag,
        actionHelp: 'Må verifiseres i Google Search Console for å hente søkeord, klikk og indekseringsinnsikt.',
      },
      duett: {
        configured: Boolean(duettUrl),
        label: 'Duett ERP Økonomi',
        statusText: duettUrl ? 'Tilkoblet (Webhook)' : 'Ikke tilkoblet ennå',
        actionRequired: !duettUrl,
        actionHelp: 'Må legge inn Duett ERP Webhook/API i Innstillinger for automatisk fakturering av torvleie.',
      },
      meta: {
        configured: Boolean(metaToken),
        label: 'Meta / Instagram & Facebook',
        statusText: metaToken ? 'Tilkoblet' : 'Ikke tilkoblet ennå',
        actionRequired: !metaToken,
        actionHelp: 'Må legge inn Meta Access Token i Innstillinger for automatisk publisering og følgertall.',
      },
      ai: {
        configured: Boolean(oneMinKey || geminiKey),
        label: 'AI-motor (1min.AI / Gemini)',
        statusText: (oneMinKey || geminiKey) ? 'Tilkoblet (EU GDPR / Mistral)' : 'Mangler API-nøkkel',
        actionRequired: !(oneMinKey || geminiKey),
        actionHelp: 'Sett 1_MIN_AI i Railway eller BYOK under Admin > Innstillinger.',
      },
      brreg: {
        configured: totalBrregTonsbergIsLive,
        label: 'Brønnøysundregistrene OpenAPI',
        statusText: totalBrregTonsbergIsLive
          ? 'Live sanntid (Tønsberg 3905 + Færder 3911)'
          : 'Registeret svarte ikke — antall enheter er ukjent',
        actionRequired: !totalBrregTonsbergIsLive,
        actionHelp: totalBrregTonsbergIsLive
          ? undefined
          : 'Enhetsregisteret svarte ikke ved siste henting. Tallene vises som «–» til registeret svarer igjen.',
      },
      ticketmaster: {
        configured: ticketmasterIsLive,
        label: 'Ticketmaster OpenAPI',
        statusText: ticketmasterIsLive
          ? `Live sanntid (Tønsberg & omegn) – ${ticketmasterSource}`
          : 'Ticketmaster svarte ikke — ingen arrangementer hentet',
        actionRequired: !ticketmasterIsLive,
        actionHelp: ticketmasterIsLive
          ? undefined
          : ticketmasterNote ||
            'Ticketmaster svarte ikke ved siste henting. Vi viser ingen arrangementer i stedet for kuraterte eksempelarrangementer.',
      },
      vegvesen: {
        // Ingen nøkkelfri kilde finnes for Kanalbrua (se src/lib/traffic.ts).
        // Denne er derfor ærlig «ikke tilkoblet» helt til API-tilgang er satt opp.
        configured: trafficIsLive,
        label: 'Statens Vegvesen Trafikk',
        statusText: trafficIsLive
          ? 'Live sanntid (Kanalbrua / E18)'
          : 'Ikke tilkoblet — krever API-tilgang (DATEX II)',
        actionRequired: !trafficIsLive,
        actionHelp: trafficIsLive
          ? undefined
          : trafficNote ||
            'Statens vegvesen krever API-tilgang for trafikkdata. Kanalbrua-status vises som «ukjent» inntil den er konfigurert.',
      },
      metNo: {
        configured: metIsLive,
        label: 'Meteorologisk Institutt (Yr)',
        statusText: metIsLive
          ? 'Live sanntid (vær og havvarsel for Tønsberg)'
          : 'MET Norway svarte ikke — vær og havdata er utilgjengelige',
        actionRequired: !metIsLive,
        actionHelp: metIsLive
          ? undefined
          : 'MET Norway svarte ikke ved siste henting. Vi viser ingen oppdiktede temperaturer i stedet.',
      },
      screens: {
        configured: true,
        label: 'Byskjermnettverk (DoOH)',
        statusText: doohScreenCount > 0
          ? `${doohScreenCount} skjermer konfigurert (innhold ikke helseverifisert)`
          : 'Ingen skjermer konfigurert',
        actionRequired: doohScreenCount === 0,
        actionHelp: doohScreenCount > 0
          ? undefined
          : 'Spillelisten for byskjermene er tom. Kjør en synk for å fylle den.',
      },
    };

    // Bygg en ekte sanntids aktivitetsstrøm
    const recentActivity: Array<{
      id: string;
      type: 'Bedrift' | 'Arrangement' | 'Artikkel' | 'Booking' | 'Melding';
      title: string;
      time: string;
      status: string;
      link?: string;
    }> = [];

    // Legg til nylige bedrifter fra Brreg
    for (const c of recentNewCompanies.slice(0, 3)) {
      recentActivity.push({
        id: `brreg-${c.orgNr}`,
        type: 'Bedrift',
        title: `Nyregistrert i Tønsberg: ${c.name} (${c.industry})`,
        time: c.registrationDate ? `Reg: ${c.registrationDate}` : 'Nylig registrert',
        status: 'Brreg OpenAPI',
        link: '/admin/bedrifter',
      });
    }

    // Legg til arrangementer fra Ticketmaster
    for (const ev of liveEvents.slice(0, 2)) {
      recentActivity.push({
        id: `event-${ev.id}`,
        type: 'Arrangement',
        title: ev.title,
        time: ev.date || 'Kommende',
        status: ev.location || 'Tønsberg',
        link: '/admin/arrangementer',
      });
    }

    // Legg til artikler fra CMS
    for (const a of recentArticles.slice(0, 2)) {
      recentActivity.push({
        id: `art-${a.id}`,
        type: 'Artikkel',
        title: a.title,
        time: new Date(a.createdAt).toLocaleDateString('nb-NO'),
        status: a.published ? 'Publisert' : 'Utkast',
        link: '/admin/artikler',
      });
    }

    return NextResponse.json({
      success: true,
      stats: {
        articlesCount,
        eventsCount,
        newCompaniesCount,
        totalBrregTonsberg,
        totalBrregTonsbergIsLive,
        totalBookingsCount,
        pendingBookingsCount,
        approvedBookingsRevenue,
        unreadMessagesCount,
        totalMessagesCount,
      },
      integrations,
      recentActivity,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[DashboardStats API Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke hente dashboard-statistikk' },
      { status: 500 }
    );
  }
}
