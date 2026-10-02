import { NextResponse } from 'next/server';
import { fetchSsbRegionStats } from '@/lib/ssb';

export async function GET() {
  try {
    const stats = await fetchSsbRegionStats();
    return NextResponse.json({
      // success gjenspeiler om SSB faktisk svarte for begge tabellene.
      success: stats.isLive,
      source: stats.source,
      isLive: stats.isLive,
      note: stats.note,
      data: stats
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Kunne ikke hente SSB-tall' },
      { status: 500 }
    );
  }
}
