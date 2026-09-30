import { NextResponse } from 'next/server';
import { fetchSsbRegionStats } from '@/lib/ssb';

export async function GET() {
  try {
    const stats = await fetchSsbRegionStats();
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Kunne ikke hente SSB-tall' },
      { status: 500 }
    );
  }
}
