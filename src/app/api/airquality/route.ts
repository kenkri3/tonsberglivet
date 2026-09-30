import { NextResponse } from 'next/server';
import { fetchLiveAirQuality } from '@/lib/airquality';

export async function GET() {
  try {
    const airQuality = await fetchLiveAirQuality();
    return NextResponse.json({
      success: true,
      data: airQuality
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Kunne ikke hente luftkvalitetsdata' },
      { status: 500 }
    );
  }
}
