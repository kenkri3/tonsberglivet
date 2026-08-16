import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Tønsberg coordinates: 59.2676, 10.4076
    const res = await fetch(
      'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.2676&lon=10.4076',
      {
        headers: {
          'User-Agent': 'TonsberglivetPortal/1.0 (hei@tonsberglivet.no)',
        },
        next: { revalidate: 1800 }, // Cache weather data for 30 minutes
      }
    );

    if (!res.ok) {
      throw new Error(`Weather API returned HTTP status ${res.status}`);
    }

    const data = await res.json();
    const timeseries = data?.properties?.timeseries?.[0];
    const instant = timeseries?.data?.instant?.details;
    const next1Hour = timeseries?.data?.next_1_hours?.summary?.symbol_code;

    return NextResponse.json({
      success: true,
      data: {
        temperature: Math.round(instant?.air_temperature ?? 18),
        windSpeed: Math.round(instant?.wind_speed ?? 3.2),
        symbolCode: next1Hour || 'clearsky_day',
        location: 'Tønsberg',
      },
    });
  } catch (error) {
    console.warn('Weather API fetch failed, returning fallback weather:', error);
    return NextResponse.json({
      success: true,
      data: {
        temperature: 19,
        windSpeed: 3,
        symbolCode: 'clearsky_day',
        location: 'Tønsberg',
      },
    });
  }
}
