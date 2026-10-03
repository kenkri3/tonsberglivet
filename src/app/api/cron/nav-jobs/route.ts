import { NextResponse } from 'next/server';
import { syncNavVacancies } from '@/lib/navJobs';
import { getSetting } from '@/lib/settings';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Synkroniserer stillinger fra NAV Arbeidsplassen til databasen.
 *
 * NAVs stillingsfeed er en endringsstrøm, ikke et søk: første kjøring gjør en
 * backfill over 182 dager, og deretter holder det med korte inkrementelle
 * kjøringer. Backfillen kan deles over flere kall – vi lagrer en kursor og
 * fortsetter der vi slapp.
 *
 * Autorisasjon følger samme mønster som /api/cron/daily-sync: CRON_SECRET
 * (Bearer, x-cron-secret eller ?key=), eller en innlogget administrator.
 */
async function isAuthorizedCronRequest(request: Request): Promise<boolean> {
  const configuredSecret =
    (await getSetting('cron_secret')) ||
    process.env.CRON_SECRET ||
    (process.env.NODE_ENV === 'development' ? 'tonsberg_cron_dev_secret' : null);

  const authHeader = request.headers.get('authorization') || '';
  const xCronSecret = request.headers.get('x-cron-secret') || '';
  const queryKey = new URL(request.url).searchParams.get('key') || '';

  if (configuredSecret) {
    if (authHeader.startsWith('Bearer ') && authHeader.replace('Bearer ', '').trim() === configuredSecret) {
      return true;
    }
    if (xCronSecret === configuredSecret) return true;
    if (queryKey === configuredSecret) return true;
  } else {
    console.error('[Nav Jobs Cron] Ingen CRON_SECRET konfigurert. Krever innlogget administrator.');
  }

  return requireAdmin(request).authorized;
}

/**
 * Leser et heltall fra query, med fornuftig grense så et kall ikke kan be om
 * uendelig arbeid.
 *
 * MERK: `Number(null)` er 0, ikke NaN. Uten den eksplisitte null-sjekken ble en
 * utelatt parameter tolket som 0 og deretter klemt opp til `min` – så
 * `maxDetails` endte på 1 og hver synk beriket nøyaktig én annonse.
 */
function readInt(value: string | null, fallback: number, min: number, max: number): number {
  if (value === null || value.trim() === '') return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), min), max);
}

async function handleSync(request: Request) {
  if (!(await isAuthorizedCronRequest(request))) {
    return NextResponse.json(
      { success: false, error: 'Uautorisert: Ugyldig eller manglende CRON_SECRET' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);

  try {
    const stats = await syncNavVacancies({
      maxPages: readInt(searchParams.get('pages'), 60, 1, 400),
      maxDetails: readInt(searchParams.get('details'), 400, 1, 1000),
      forceBackfill: searchParams.get('backfill') === 'true',
    });

    return NextResponse.json({ success: true, timestamp: new Date().toISOString(), data: stats });
  } catch (error: any) {
    console.error('[Nav Jobs Cron Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Feil under synk av stillinger', details: error?.message || 'Ukjent feil' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return handleSync(request);
}

export async function POST(request: Request) {
  return handleSync(request);
}
