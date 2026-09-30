import { NextResponse } from 'next/server';
import { fetchLiveDepartures, TONSBERG_STOPS } from '@/lib/entur';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stopParam = searchParams.get('stop');

    let stopId = TONSBERG_STOPS.TOGSTASJON;
    if (stopParam === 'rutebil') stopId = TONSBERG_STOPS.RUTEBILSTASJON;
    else if (stopParam === 'bakkenteigen' || stopParam === 'campus') stopId = TONSBERG_STOPS.BAKKENTEIGEN;
    else if (stopParam === 'kanalen') stopId = TONSBERG_STOPS.KANALEN;
    else if (stopParam === 'farmandstredet') stopId = TONSBERG_STOPS.FARMANDSTREDET;
    else if (stopParam?.startsWith('NSR:')) stopId = stopParam;

    const departures = await fetchLiveDepartures(stopId);

    return NextResponse.json({
      success: true,
      data: departures
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Kunne ikke hente avgangsdata fra Entur' },
      { status: 500 }
    );
  }
}
