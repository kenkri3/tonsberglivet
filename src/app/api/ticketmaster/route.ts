import { NextResponse } from 'next/server';
import { fetchLiveTicketmasterFeed } from '@/lib/ticketmaster';

/**
 * Cache-vurdering (Next.js 16.3, docs/01-app/02-guides/caching-without-cache-components.md):
 * `dynamic = 'force-dynamic'` setter `cache: 'no-store'` på alle fetch-kall i ruten og ville
 * dermed overstyre revalidaten. Vi vil ha ferskt svar per request, men gjenbruke de tre
 * Ticketmaster-sidehentingene i opptil 1 time, så vi beholder `force-dynamic` og setter
 * `cache: 'force-cache'` + `next: { revalidate: 3600 }` eksplisitt per fetch i libben.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    const feed = await fetchLiveTicketmasterFeed(forceRefresh);

    return NextResponse.json({
      // success gjenspeiler om vi faktisk fikk arrangementer fra Ticketmaster.
      // Ingen kuratert «fallback» med oppdiktede datoer returneres lenger.
      success: feed.isLive,
      source: feed.source,
      isLive: feed.isLive,
      usedDiscoveryApi: feed.usedDiscoveryApi,
      note: feed.note,
      lastSync: feed.lastSync || null,
      count: feed.events.length,
      data: feed.events,
    });
  } catch (error: any) {
    console.error('Error in /api/ticketmaster:', error);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke hente Ticketmaster arrangementer' },
      { status: 500 }
    );
  }
}
