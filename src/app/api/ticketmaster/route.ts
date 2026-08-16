import { NextResponse } from 'next/server';
import { fetchLiveTicketmasterEvents } from '@/lib/ticketmaster';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const events = await fetchLiveTicketmasterEvents();
    return NextResponse.json({
      success: true,
      source: process.env.TICKETMASTER_API_KEY ? 'LIVE_API' : 'TICKETMASTER_FEED',
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
