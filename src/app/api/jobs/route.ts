import { NextResponse } from 'next/server';
import { fetchLiveJobs } from '@/lib/navJobs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const onlyStudent = searchParams.get('student') === 'true';

    // Clamp limit til 1–50: ?limit=-1 ga tidligere slice(0, -1) og droppet siste stilling.
    const rawLimit = Number(searchParams.get('limit'));
    const limit = Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.trunc(rawLimit), 50)
      : 10;

    const result = await fetchLiveJobs(onlyStudent, limit);

    return NextResponse.json({
      // success gjenspeiler om NAV faktisk svarte – ikke om kallet gjennomførtes.
      success: result.isLive,
      source: result.source,
      isLive: result.isLive,
      note: result.note,
      data: result.jobs,
      count: result.jobs.length,
      // Hvor tallene kom fra, og hvor mange aktive stillinger vi kjenner totalt.
      origin: result.origin,
      totalActive: result.totalActive
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Kunne ikke hente stillingsdata' },
      { status: 500 }
    );
  }
}
