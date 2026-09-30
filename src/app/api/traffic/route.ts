import { NextResponse } from 'next/server';
import { fetchLiveTrafficStatus } from '@/lib/traffic';

export async function GET() {
  try {
    const traffic = await fetchLiveTrafficStatus();
    return NextResponse.json({
      success: true,
      data: traffic
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Kunne ikke hente trafikkstatus' },
      { status: 500 }
    );
  }
}
