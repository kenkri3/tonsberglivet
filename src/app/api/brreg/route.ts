import { NextResponse } from 'next/server';
import { searchCompaniesResult } from '@/lib/brreg';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || undefined;
    const category = searchParams.get('category') || undefined;

    // Clamp limit til 1–100: ?limit=-1 ga tidligere slice(0, -1) og droppet siste rad.
    const rawLimit = Number(searchParams.get('limit'));
    const limit = Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.trunc(rawLimit), 100)
      : 15;

    const result = await searchCompaniesResult(query, category, limit);

    return NextResponse.json({
      // success gjenspeiler om Enhetsregisteret faktisk svarte – ikke om kallet gjennomførtes.
      success: result.isLive,
      source: result.source,
      isLive: result.isLive,
      note: result.note,
      data: result.companies,
      count: result.companies.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Kunne ikke hente bedriftsdata' },
      { status: 500 }
    );
  }
}
