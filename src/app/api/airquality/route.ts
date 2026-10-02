import { NextResponse } from 'next/server';
import { fetchLiveAirQuality } from '@/lib/airquality';

export async function GET() {
  try {
    const result = await fetchLiveAirQuality();
    return NextResponse.json({
      // success gjenspeiler om NILU faktisk svarte med en Tønsberg-måling.
      // Ingen oppdiktede måletall returneres lenger.
      success: result.provenance.isLive,
      source: result.provenance.source,
      isLive: result.provenance.isLive,
      note: result.provenance.note,
      data: result.data
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Kunne ikke hente luftkvalitetsdata' },
      { status: 500 }
    );
  }
}
