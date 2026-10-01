import { NextResponse } from 'next/server';
import { fetchLiveTicketmasterEvents } from '@/lib/ticketmaster';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    const events = await fetchLiveTicketmasterEvents(forceRefresh);
    const hasApiKey = Boolean(process.env.TICKETMASTER_API_KEY && process.env.TICKETMASTER_API_KEY !== 'YOUR_TICKETMASTER_KEY');

    return NextResponse.json({
      success: true,
      source: hasApiKey ? 'LIVE_API' : 'LIVE_TICKETMASTER_DIRECT',
      count: events.length,
      data: events,
    });
  } catch (error: any) {
    console.error('Error in /api/ticketmaster:', error);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke hente Ticketmaster arrangementer' },
      { status: 500 }
    );
  }
}
