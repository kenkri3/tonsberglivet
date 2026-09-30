import { NextResponse } from 'next/server';
import { fetchLiveJobs } from '@/lib/navJobs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const onlyStudent = searchParams.get('student') === 'true';
    const limit = Number(searchParams.get('limit')) || 10;

    const jobs = await fetchLiveJobs(onlyStudent, limit);

    return NextResponse.json({
      success: true,
      data: jobs,
      count: jobs.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Kunne ikke hente stillingsdata' },
      { status: 500 }
    );
  }
}
