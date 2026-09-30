import { NextResponse } from 'next/server';
import { fetchLibraryEvents } from '@/lib/libraryEvents';

export async function GET() {
  try {
    const events = await fetchLibraryEvents();
    return NextResponse.json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Kunne ikke hente biblioteksarrangementer' },
      { status: 500 }
    );
  }
}
