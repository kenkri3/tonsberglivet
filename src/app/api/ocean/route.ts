import { NextResponse } from 'next/server';
import { fetchLiveOceanConditions } from '@/lib/ocean';

export async function GET() {
  try {
    const conditions = await fetchLiveOceanConditions();
    return NextResponse.json({
      success: conditions.source === 'LIVE',
      source: conditions.source,
      isLive: conditions.isLive,
      note: conditions.note,
      data: conditions
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Kunne ikke hente sjø- og badetemperatur' },
      { status: 500 }
    );
  }
}
