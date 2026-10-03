import { NextResponse } from 'next/server';
import { 
  fetchLiveTicketmasterEvents, 
  setCachedTicketmasterEvents, 
  setDoOHScreenPlaylist,
  DoOHPlaylistItem 
} from '@/lib/ticketmaster';
import { sendAgentNotification } from '@/lib/notifications';
import { getSetting } from '@/lib/settings';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Validerer cron-kall mot konfigurert CRON_SECRET eller bearer token.
 * Fail-closed i produksjon dersom ingen hemmelighet er satt.
 * En innlogget administrator kan også kjøre jobben manuelt fra Innstillinger.
 */
async function isAuthorizedCronRequest(request: Request): Promise<boolean> {
  const configuredSecret =
    (await getSetting('cron_secret')) ||
    process.env.CRON_SECRET ||
    (process.env.NODE_ENV === 'development' ? 'tonsberg_cron_dev_secret' : null);

  const authHeader = request.headers.get('authorization') || '';
  const xCronSecret = request.headers.get('x-cron-secret') || '';
  const url = new URL(request.url);
  const queryKey = url.searchParams.get('key') || '';

  if (configuredSecret) {
    // 1. Sjekk Bearer token
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      if (token === configuredSecret) return true;
    }

    // 2. Sjekk header x-cron-secret
    if (xCronSecret === configuredSecret) return true;

    // 3. Sjekk query parameter (?key=...)
    if (queryKey === configuredSecret) return true;
  } else {
    console.error('[Cron Security Error]: Ingen CRON_SECRET konfigurert. Krever innlogget administrator.');
  }

  // 4. Administrator som kjører jobben manuelt fra adminpanelet.
  //    Uten dette kunne «Kjør daglig synk»-knappen aldri lykkes, fordi panelet
  //    bare kjenner den maskerte verdien av cron-hemmeligheten.
  const admin = requireAdmin(request);
  return admin.authorized;
}

const NORWEGIAN_MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, mai: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, okt: 9, nov: 10, des: 11,
};

/**
 * Ticketmaster-arrangementer kommer med `date` som en VISNINGSstreng, f.eks. «22. aug 2026».
 * `new Date("22. aug 2026")` gir Invalid Date, Prisma kastet på den første raden, og
 * `catch` rundt hele løkken avbrøt resten — derfor ble 0 arrangementer skrevet til databasen.
 * Godtar ISO/RFC og det norske visningsformatet, og returnerer null for noe annet.
 */
function parseEventDate(value: unknown): Date | null {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  // 1. ISO eller annet format som Date forstår direkte.
  const direct = new Date(raw);
  if (!isNaN(direct.getTime())) return direct;

  // 2. «22. aug 2026» / «22. august 2026»
  const match = raw.match(/^(\d{1,2})\.\s*([A-Za-zÆØÅæøå]+)\.?\s*(\d{4})$/);
  if (match) {
    const day = Number(match[1]);
    const month = NORWEGIAN_MONTHS[match[2].toLowerCase().slice(0, 3)];
    const year = Number(match[3]);
    if (month !== undefined && day >= 1 && day <= 31) {
      return new Date(year, month, day, 19, 0, 0);
    }
  }

  return null;
}

/**
 * Nattlig / Daglig bakgrunnssynk for Ticketmaster og DoOH-byskjermer.
 */
async function handleDailySync(request: Request) {
  const isAuth = await isAuthorizedCronRequest(request);
  if (!isAuth) {
    return NextResponse.json(
      { success: false, error: 'Uautorisert: Ugyldig eller manglende CRON_SECRET' },
      { status: 401 }
    );
  }

  const startTime = Date.now();

  try {
    // ── 1. Hent ferske arrangementer fra Ticketmaster ──
    const liveEvents = await fetchLiveTicketmasterEvents();

    // ── 2. Oppdater hurtigbuffer slik at /eventer laster på < 50ms ──
    setCachedTicketmasterEvents(liveEvents);

    // Forsøk også å oppdatere databasen defensivt
    let eventsUpserted = 0;
    let eventsSkipped = 0;
    let eventsFailed = 0;
    for (const ev of liveEvents.slice(0, 10)) {
      // Hvert arrangement isoleres: én ugyldig rad skal ikke stoppe hele synken.
      try {
        const startDate = parseEventDate(ev.date);
        if (!startDate) {
          eventsSkipped++;
          console.warn(`[Daily Sync] Hoppet over «${ev.title}» — kunne ikke tolke dato «${ev.date}»`);
          continue;
        }

        const eventData = {
          title: ev.title,
          startDate,
          location: ev.location,
          externalUrl: ev.ticketUrl,
          description: ev.description,
          published: true,
        };

        await prisma.event.upsert({
          where: { slug: ev.id },
          update: eventData,
          create: { ...eventData, slug: ev.id },
        });
        eventsUpserted++;
      } catch (evErr) {
        eventsFailed++;
        console.warn(`[Daily Sync] Kunne ikke lagre arrangement «${ev.title}»:`, evErr);
      }
    }

    // ── 3. Klargjør dagens spilleliste for byskjermene på Torvet og Kaldnes ──
    const topConcert = liveEvents.find((e) => e.category === 'Konsert') || liveEvents[0];
    const topCulture = liveEvents.find((e) => e.category !== 'Konsert') || liveEvents[1];

    const todayPlaylist: DoOHPlaylistItem[] = [
      {
        screenId: 'torvet-storskjerm',
        screenName: 'Torvet Storskjerm (4K LED)',
        location: 'Tønsberg Torv – Sone C',
        spotTitle: topConcert ? topConcert.title : 'Kultursommer i Tønsberg',
        headline: topConcert
          ? `${topConcert.venueName} • ${topConcert.date} kl. ${topConcert.time}`
          : 'Opplev Norges eldste kystby',
        durationSeconds: 20,
        imageUrl: topConcert?.imageUrl || '/images/tonsberg/foynhagen-utendoersscene.jpg',
        eventDate: topConcert?.date,
      },
      {
        screenId: 'kanalen-brygga',
        screenName: 'Kanalen & Brygga Display (High-Bright)',
        location: 'Nedre Langgate / Bryggekanten',
        spotTitle: topCulture ? topCulture.title : 'Færderbiennalen & Havneliv',
        headline: 'Smak på byen og nyt kveldsstemningen',
        durationSeconds: 15,
        imageUrl: topCulture?.imageUrl || '/images/tonsberg/faerderbiennalen-havneliv-smak-paa.jpg',
        eventDate: topCulture?.date,
      },
      {
        screenId: 'kaldnes-gangbru',
        screenName: 'Kaldnes Gangbru Display (FHD LED)',
        location: 'Kaldnes Brygge',
        spotTitle: 'Matmarked & Torvleie i helgen',
        headline: 'Kortreist mat, håndverk og ferske bakervarer',
        durationSeconds: 15,
        imageUrl: '/images/legacy/torvet.jpg',
      },
    ];

    setDoOHScreenPlaylist(todayPlaylist);

    // ── 4. Tell aktive events og ventende torvleiesøknader ──
    // Merk: ingen oppdiktet reservverdi her. Klarer vi ikke å lese databasen,
    // rapporterer vi 0 og sier fra, i stedet for å påstå et antall vi ikke vet.
    let pendingCount = 0;
    let pendingCountReadable = true;
    try {
      pendingCount = await prisma.bookingRequest.count({
        where: { status: 'NEW' },
      });
    } catch (countErr) {
      pendingCountReadable = false;
      console.warn('[Daily Sync] Kunne ikke telle ventende torvleiesøknader:', countErr);
    }

    const activeEventsCount = liveEvents.length;

    // ── 5. GDPR Art. 5(1)(e): Automatisk lagringsbegrensning og sletting av gamle meldinger ──
    let purgedMessagesCount = 0;
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const purgeResult = await prisma.contactMessage.deleteMany({
        where: {
          createdAt: { lt: oneYearAgo },
          read: true,
        },
      });
      purgedMessagesCount = purgeResult.count;
    } catch {
      // Ignorer ved manglende tabell
    }

    // ── 6. Brønnøysundregistrene: Hent nystartede bedrifter i Tønsberg og klargjør AI-velkomstmail ──
    let newCompaniesDraftCount = 0;
    try {
      const { syncAndGetNewCompanies } = await import('@/lib/company-welcome-email');
      const brregSync = await syncAndGetNewCompanies({ daysBack: 14, limit: 25, autoDraft: true });
      newCompaniesDraftCount = brregSync.stats.draftsReady;
    } catch (brregErr) {
      console.warn('[Daily Sync Brreg Warning]:', brregErr);
    }

    // ── 7. Send morgen-sammendrag til Slack/Teams via sendAgentNotification ──
    // Antall skjermer utledes fra spillelisten som faktisk ble bygget, i stedet
    // for å påstå «3/3 i drift». Vi kan bekrefte at en skjerm har innhold –
    // ikke at den er fysisk i drift.
    const screensWithContent = new Set(todayPlaylist.map((p) => p.screenId)).size;

    const morningSummary = `God morgen! I dag er det ${activeEventsCount} aktive arrangementer i Tønsberg, ${pendingCount} ventende torvleiesøknader, ${newCompaniesDraftCount} nye bedrifter klare for velkomsthilsen, og ${screensWithContent} byskjermer har fått dagens program.${purgedMessagesCount > 0 ? ` (GDPR-rydding: ${purgedMessagesCount} eldre meldinger slettet).` : ''}`;

    await sendAgentNotification({
      title: 'Morgen-oppdatering fra Tønsberglivet',
      message: morningSummary,
      level: 'info',
      fields: {
        'Aktive Eventer': activeEventsCount,
        'Ventende Torvleie': `${pendingCount} søknader`,
        'Nystartede Bedrifter (Brreg)': `${newCompaniesDraftCount} klare til velkomstmail`,
        'Byskjermer': screensWithContent > 0
          ? `${screensWithContent} skjermer har fått innhold`
          : 'Ingen skjermer fikk innhold',
        'Spilleliste': todayPlaylist.map((p) => p.spotTitle).join(' • '),
        'GDPR Lagringsvern': `${purgedMessagesCount} utgåtte meldinger slettet`,
      },
    });

    const executionTimeMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      executionTimeMs,
      data: {
        activeEventsCount,
        eventsUpserted,
        eventsSkipped,
        eventsFailed,
        pendingBookingsCount: pendingCount,
        pendingBookingsCountReadable: pendingCountReadable,
        screensUpdated: todayPlaylist.length,
        playlist: todayPlaylist,
        message: morningSummary,
      },
    });
  } catch (error: any) {
    console.error('[Daily Sync Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Feil under nattlig bakgrunnssynk',
        details: error?.message || 'Ukjent feil',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return handleDailySync(request);
}

export async function POST(request: Request) {
  return handleDailySync(request);
}
