// Entur JourneyPlanner v3 GraphQL Public Transport Service for Tønsberglivet
// Open data from https://api.entur.io

const ENTUR_GRAPHQL_URL = 'https://api.entur.io/journey-planner/v3/graphql';
const CLIENT_HEADER = 'tonsberglivet-portal';

export const TONSBERG_STOPS = {
  TOGSTASJON: 'NSR:StopPlace:58876',
  RUTEBILSTASJON: 'NSR:StopPlace:17693',
  BAKKENTEIGEN: 'NSR:StopPlace:18534', // USN Campus Vestfold
  KANALEN: 'NSR:StopPlace:18998',
  FARMANDSTREDET: 'NSR:StopPlace:18942'
};

/**
 * Tillatte `stop`-parametre for /api/entur. Et ukjent stop-nummer avvises med 400
 * i stedet for å falle tilbake til Tønsberg stasjon.
 * Merk: 'tog' peker eksplisitt på togstasjonen og er standardverdien.
 */
export const ENTUR_STOP_PARAM_MAP: Record<string, string> = {
  tog: TONSBERG_STOPS.TOGSTASJON,
  togstasjon: TONSBERG_STOPS.TOGSTASJON,
  rutebil: TONSBERG_STOPS.RUTEBILSTASJON,
  rutebilstasjon: TONSBERG_STOPS.RUTEBILSTASJON,
  bakkenteigen: TONSBERG_STOPS.BAKKENTEIGEN,
  campus: TONSBERG_STOPS.BAKKENTEIGEN,
  kanalen: TONSBERG_STOPS.KANALEN,
  farmandstredet: TONSBERG_STOPS.FARMANDSTREDET
};

/** Gyldig Entur StopPlace-id, f.eks. NSR:StopPlace:58876 */
export const ENTUR_STOP_ID_PATTERN = /^NSR:StopPlace:\d+$/;

export type EnturSource = 'LIVE' | 'UNAVAILABLE';

export interface Departure {
  line: string;
  mode: string;
  modeNorwegian: string;
  destination: string;
  timeFormatted: string;
  minutesUntil: string;
  isRealtime: boolean;
  platform?: string;
}

export interface StopDepartures {
  stopId: string;
  stopName: string;
  departures: Departure[];
  updatedAt: string;
  source: EnturSource;
  isLive: boolean;
  /** Satt når kilden ikke kunne brukes, med norsk forklaring. */
  note?: string;
}

const DEPARTURES_QUERY = `
  query GetStopDepartures($stopId: String!) {
    stopPlace(id: $stopId) {
      id
      name
      estimatedCalls(numberOfDepartures: 8) {
        realtime
        aimedDepartureTime
        expectedDepartureTime
        quay {
          publicCode
        }
        destinationDisplay {
          frontText
        }
        serviceJourney {
          journeyPattern {
            line {
              publicCode
              transportMode
            }
          }
        }
      }
    }
  }
`;

/** Norsk navn på holdeplassen når Entur ikke svarer (kun etikett, ingen oppdiktede avganger). */
const STOP_LABELS: Record<string, string> = {
  [TONSBERG_STOPS.TOGSTASJON]: 'Tønsberg Stasjon',
  [TONSBERG_STOPS.RUTEBILSTASJON]: 'Tønsberg Rutebilstasjon',
  [TONSBERG_STOPS.BAKKENTEIGEN]: 'Campus Vestfold (Bakkenteigen)',
  [TONSBERG_STOPS.KANALEN]: 'Kanalen',
  [TONSBERG_STOPS.FARMANDSTREDET]: 'Farmandstredet'
};

export async function fetchLiveDepartures(stopId = TONSBERG_STOPS.TOGSTASJON): Promise<StopDepartures> {
  const now = Date.now();

  const unavailable = (note: string): StopDepartures => ({
    stopId,
    stopName: STOP_LABELS[stopId] || 'Ukjent holdeplass',
    departures: [],
    updatedAt: new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' }),
    source: 'UNAVAILABLE',
    isLive: false,
    note
  });

  try {
    const res = await fetch(ENTUR_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ET-Client-Name': CLIENT_HEADER
      },
      body: JSON.stringify({
        query: DEPARTURES_QUERY,
        variables: { stopId }
      }),
      cache: 'force-cache',
      next: { revalidate: 60 }, // Cache 60 seconds
      signal: AbortSignal.timeout(8000) // Bounded: a hung upstream must not park the handler
    });

    if (!res.ok) {
      console.warn(`Entur svarte HTTP ${res.status} for ${stopId}.`);
      return unavailable(`Entur svarte HTTP ${res.status}. Avgangene er ikke tilgjengelige akkurat nå.`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('json')) {
      console.warn(`Entur svarte med ikke-JSON (${contentType || 'ukjent'}) for ${stopId}.`);
      return unavailable('Entur svarte med et uventet format. Avgangene er ikke tilgjengelige akkurat nå.');
    }

    const json = await res.json();

    // GraphQL-feil er ikke «ingen avganger» – de må skilles fra et reelt tomt resultat.
    if (Array.isArray(json?.errors) && json.errors.length > 0) {
      const first = json.errors[0]?.message || 'ukjent GraphQL-feil';
      console.warn(`Entur GraphQL-feil for ${stopId}: ${first}`);
      return unavailable(`Entur avviste forespørselen (${first}).`);
    }

    const stopPlace = json?.data?.stopPlace;
    if (!stopPlace) {
      console.warn(`Entur fant ingen holdeplass med id ${stopId}.`);
      return unavailable('Entur fant ingen holdeplass med denne id-en.');
    }

    // Reelt tomt resultat: holdeplassen finnes, men har ingen avganger nå.
    const calls = Array.isArray(stopPlace.estimatedCalls) ? stopPlace.estimatedCalls : [];
    const formatted: Departure[] = calls.map((call: any) => {
      const line = call.serviceJourney?.journeyPattern?.line || {};
      const expectedDate = new Date(call.expectedDepartureTime || call.aimedDepartureTime);
      const validDate = !isNaN(expectedDate.getTime());
      const diffMinutes = validDate ? Math.max(0, Math.round((expectedDate.getTime() - now) / (1000 * 60))) : 0;

      let modeNorwegian = 'Buss';
      if (line.transportMode === 'rail') modeNorwegian = 'Tog';
      if (line.transportMode === 'water' || line.transportMode === 'ferry') modeNorwegian = 'Båt/Ferge';

      return {
        line: line.publicCode || '–',
        mode: line.transportMode || 'bus',
        modeNorwegian,
        destination: call.destinationDisplay?.frontText || 'Ukjent destinasjon',
        timeFormatted: validDate
          ? expectedDate.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
          : '–',
        minutesUntil: diffMinutes === 0 ? 'Nå' : `${diffMinutes} min`,
        isRealtime: Boolean(call.realtime),
        platform: call.quay?.publicCode || undefined
      };
    });

    return {
      stopId: stopPlace.id || stopId,
      stopName: stopPlace.name || STOP_LABELS[stopId] || 'Tønsberg',
      departures: formatted,
      updatedAt: new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' }),
      source: 'LIVE',
      isLive: true
    };
  } catch (error: any) {
    const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    console.warn(`Entur API feilet for ${stopId}:`, error?.message || error);
    return unavailable(
      timedOut
        ? 'Entur svarte ikke innen tidsfristen. Avgangene er ikke tilgjengelige akkurat nå.'
        : 'Kunne ikke kontakte Entur. Avgangene er ikke tilgjengelige akkurat nå.'
    );
  }
}
