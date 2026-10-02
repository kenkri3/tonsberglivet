// NAV Arbeidsplassen Open Data API Service for Tønsberglivet
// Public open API from https://arbeidsplassen.nav.no/public-opendata/

const NAV_JOBS_URL = 'https://arbeidsplassen.nav.no/public-opendata/api/v1/ads';

export type JobsSource = 'LIVE' | 'UNAVAILABLE';

export interface JobVacancy {
  id: string;
  title: string;
  employer: string;
  location: string;
  municipality: string;
  engagementType: string; // Heltid, Deltid, Sesong, Vikariat
  extent: string; // 100%, 50%, etc.
  applicationDeadline: string;
  published: string;
  link: string;
  isStudentFriendly: boolean;
  descriptionSnippet?: string;
  sector?: string;
}

export interface JobsResult {
  jobs: JobVacancy[];
  source: JobsSource;
  isLive: boolean;
  /** Norsk forklaring når kilden ikke er tilgjengelig. */
  note?: string;
}

// NAV avviklet det nøkkelfrie åpne stillingsfeedet 1. mai 2025. Endepunktet svarer nå 404,
// og erstatteren krever Bearer JWT. Vi har derfor ingen kuratert «fallback»-liste lenger:
// å vise oppdiktede stillinger som ekte ville vært verre enn å vise at kilden mangler.
const NAV_UNAVAILABLE_NOTE =
  'NAV Arbeidsplassen avviklet det åpne stillingsfeedet 1. mai 2025, og det nye API-et krever ' +
  'Bearer-token som ikke er konfigurert. Vi viser derfor ingen stillinger i stedet for oppdiktede annonser. ' +
  'Se arbeidsplassen.nav.no/stillinger.';

export async function fetchLiveJobs(onlyStudent = false, limit = 10): Promise<JobsResult> {
  // Clamp: negative eller enorme limit-verdier skal ikke kunne gi slice(0, -1) eller enorme svar.
  const safeLimit = Math.min(Math.max(Math.trunc(limit) || 10, 1), 50);

  const unavailable: JobsResult = {
    jobs: [],
    source: 'UNAVAILABLE',
    isLive: false,
    note: NAV_UNAVAILABLE_NOTE,
  };

  try {
    const params = new URLSearchParams({
      municipalities: 'TØNSBERG,FÆRDER',
      size: String(Math.min(Math.max(safeLimit * 2, 20), 100)),
    });

    const res = await fetch(`${NAV_JOBS_URL}?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TonsberglivetPortal/1.0 (hei@tonsberglivet.no)'
      },
      cache: 'force-cache',
      next: { revalidate: 3600 }, // Cache 1 hour
      signal: AbortSignal.timeout(8000) // Bounded: a hung upstream must not park the handler
    });

    if (!res.ok) {
      console.warn(`NAV Arbeidsplassen svarte HTTP ${res.status} – ingen stillinger tilgjengelig.`);
      return unavailable;
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('json')) {
      // Et HTML-svar er en feilside, ikke stillingsdata.
      console.warn(`NAV Arbeidsplassen svarte med ikke-JSON (${contentType || 'ukjent'}) – avvises.`);
      return unavailable;
    }

    const data = await res.json();
    const content: any[] = Array.isArray(data?.content) ? data.content : [];

    const formatted: JobVacancy[] = content.map((item: any) => {
      const title = item.title || 'Ledig stilling';
      const employer = item.businessName || item.employer?.name || 'Ikke oppgitt';
      const location = item.workLocations?.[0]?.city || item.locationList?.[0]?.city || 'Tønsberg';
      const municipality = item.workLocations?.[0]?.municipal || 'Tønsberg';
      const engagementType = item.engagementType || item.properties?.engagementtype || 'Fast';
      const extent = item.extent || item.properties?.extent || '100%';
      const deadline = item.applicationDeadline || item.properties?.applicationdue || 'Snarest';
      const publishedDate = item.published ? new Date(item.published).toLocaleDateString('no-NO') : 'Nylig';

      const isStudent =
        engagementType.toLowerCase().includes('deltid') ||
        extent.toLowerCase().includes('deltid') ||
        title.toLowerCase().includes('student') ||
        title.toLowerCase().includes('sommer') ||
        title.toLowerCase().includes('ekstrahjelp');

      return {
        id: item.uuid || item.id || String(Math.random()),
        title,
        employer,
        location,
        municipality,
        engagementType,
        extent,
        applicationDeadline: deadline,
        published: publishedDate,
        link: item.link || `https://arbeidsplassen.nav.no/stillinger/stilling/${item.uuid}`,
        isStudentFriendly: isStudent,
        descriptionSnippet: typeof item.description === 'string'
          ? item.description.replace(/<[^>]*>?/gm, '').slice(0, 140) + '...'
          : undefined,
        sector: item.properties?.sector || 'Privat'
      };
    });

    const filtered = onlyStudent ? formatted.filter(j => j.isStudentFriendly) : formatted;

    // Reelt tomt svar fra NAV er «live», men uten treff – det skal ikke se ut som en feil.
    return {
      jobs: filtered.slice(0, safeLimit),
      source: 'LIVE',
      isLive: true,
    };
  } catch (error: any) {
    const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    console.warn(
      timedOut ? 'NAV Arbeidsplassen svarte ikke innen tidsfristen.' : 'NAV Arbeidsplassen API feilet:',
      error?.message || error
    );
    return unavailable;
  }
}
