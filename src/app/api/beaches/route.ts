import { NextResponse } from 'next/server';
import { fetchBeaches } from '@/lib/beaches';

export async function GET() {
  try {
    const beaches = await fetchBeaches();
    return NextResponse.json({
      success: true,
      data: beaches,
      count: beaches.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Kunne ikke hente badeplasser' },
      { status: 500 }
    );
  }
}
