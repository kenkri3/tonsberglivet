import { NextResponse } from 'next/server';
import { fetchHeritageSites } from '@/lib/heritage';

export async function GET() {
  try {
    const sites = await fetchHeritageSites();
    return NextResponse.json({
      success: true,
      data: sites,
      count: sites.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Kunne ikke hente kulturarvdata' },
      { status: 500 }
    );
  }
}
