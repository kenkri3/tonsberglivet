import { NextResponse } from 'next/server';
import {
  fetchLiveDepartures,
  TONSBERG_STOPS,
  ENTUR_STOP_PARAM_MAP,
  ENTUR_STOP_ID_PATTERN
} from '@/lib/entur';

const KNOWN_STOPS = Object.keys(ENTUR_STOP_PARAM_MAP).join(', ');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stopParam = searchParams.get('stop');

    let stopId = TONSBERG_STOPS.TOGSTASJON; // Standard: togstasjonen (samme som ?stop=tog)

    if (stopParam !== null && stopParam.length > 0) {
      const key = stopParam.trim().toLowerCase();
      const mapped = ENTUR_STOP_PARAM_MAP[key];

      if (mapped) {
        stopId = mapped;
      } else if (ENTUR_STOP_ID_PATTERN.test(stopParam.trim())) {
        stopId = stopParam.trim();
      } else {
        // Ukjent verdi skal ikke stille bli til Tønsberg stasjon.
        return NextResponse.json(
          {
            success: false,
            source: 'UNAVAILABLE',
            isLive: false,
            error:
              `Ukjent holdeplass ${JSON.stringify(stopParam)}. Gyldige verdier: ${KNOWN_STOPS}, ` +
              'eller en Entur StopPlace-id på formen NSR:StopPlace:12345.'
          },
          { status: 400 }
        );
      }
    }

    const departures = await fetchLiveDepartures(stopId);

    return NextResponse.json({
      // success gjenspeiler om dataene faktisk kom fra Entur – ikke om kallet gjennomførtes.
      success: departures.isLive,
      source: departures.source,
      isLive: departures.isLive,
      note: departures.note,
      data: departures
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Kunne ikke hente avgangsdata fra Entur' },
      { status: 500 }
    );
  }
}
