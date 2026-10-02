import { NextResponse } from 'next/server';

/**
 * Cache-vurdering (Next.js 16.3, docs/01-app/02-guides/caching-without-cache-components.md):
 * `dynamic = 'force-dynamic'` setter `cache: 'no-store'` på ALLE fetch-kall i ruten, og ville
 * dermed overstyre `next.revalidate`. Vi vil ha ferskt svar per request, men gjenbruke
 * MET-svaret i opptil 30 minutter, så vi beholder `force-dynamic` og setter cachingen
 * eksplisitt per fetch (`cache: 'force-cache'` + `next: { revalidate: 1800 }`).
 */
export const dynamic = 'force-dynamic';

const MET_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.2676&lon=10.4076';
const MET_NOTE = 'MET Norway (api.met.no) svarte ikke. Værvarsel er ikke tilgjengelig akkurat nå.';

export async function GET() {
  try {
    // Tønsberg coordinates: 59.2676, 10.4076
    const res = await fetch(MET_URL, {
      headers: {
        'User-Agent': 'TonsberglivetPortal/1.0 (hei@tonsberglivet.no)',
        'Accept': 'application/json',
      },
      cache: 'force-cache',
      next: { revalidate: 1800 }, // Cache weather data for 30 minutes
      signal: AbortSignal.timeout(8000), // Bounded: a hung upstream must not park the handler
    });

    if (!res.ok) {
      throw new Error(`Weather API returned HTTP status ${res.status}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('json')) {
      throw new Error(`Weather API returned non-JSON content-type "${contentType || 'unknown'}"`);
    }

    const data = await res.json();
    const timeseries = data?.properties?.timeseries?.[0];
    const instant = timeseries?.data?.instant?.details;
    const next1Hour = timeseries?.data?.next_1_hours?.summary?.symbol_code;

    if (typeof instant?.air_temperature !== 'number') {
      throw new Error('Weather API payload contained no air_temperature');
    }

    return NextResponse.json({
      success: true,
      source: 'LIVE',
      isLive: true,
      data: {
        temperature: Math.round(instant.air_temperature),
        windSpeed: Math.round(instant.wind_speed ?? 0),
        symbolCode: next1Hour || 'clearsky_day',
        location: 'Tønsberg',
      },
    });
  } catch (error) {
    // Ingen oppdiktet temperatur: vi sier ærlig at varselet mangler.
    console.warn('Weather API fetch failed:', error);
    return NextResponse.json(
      {
        success: false,
        source: 'UNAVAILABLE',
        isLive: false,
        error: MET_NOTE,
        note: MET_NOTE,
        data: null,
      },
      { status: 502 }
    );
  }
}
