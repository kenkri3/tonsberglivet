import { NextResponse } from 'next/server';
import { getSetting, setSetting } from '@/lib/settings';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/social/connect — status for SoMe-tilkoblinger.
 * Krever ADMIN: svaret inneholder kanal-ID-er og hvorvidt et tilgangstoken finnes,
 * som er intern konfigurasjonsinformasjon (middleware dekker ikke /api/*).
 */
export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const metaPageId = await getSetting('meta_page_id', '');
    const metaGroupId = await getSetting('meta_group_id', '');
    const metaInstagramId = await getSetting('meta_instagram_id', '');
    const metaAccessToken = await getSetting('meta_access_token', '');

    const googleAccountId = await getSetting('google_business_account_id', '');
    const googleLocationId = await getSetting('google_business_location_id', '');
    const googleAccessToken = await getSetting('google_business_access_token', '');

    return NextResponse.json({
      success: true,
      data: {
        meta: {
          connected: !!metaAccessToken,
          pageId: metaPageId,
          groupId: metaGroupId,
          instagramId: metaInstagramId,
          hasToken: !!metaAccessToken,
        },
        googleBusiness: {
          connected: !!googleAccessToken,
          accountId: googleAccountId,
          locationId: googleLocationId,
          hasToken: !!googleAccessToken,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Kunne ikke hente SoMe-status' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Ugyldig JSON i forespørselen.' }, { status: 400 });
    }
    const { action, provider, pageId, groupId, instagramId, token, accountId, locationId } = body;

    if (action === 'save_meta_token' || action === 'connect_meta') {
      if (!token || !token.trim()) {
        return NextResponse.json({ success: false, error: 'Mangler gyldig Meta User/Page Access Token' }, { status: 400 });
      }
      if (pageId) await setSetting('meta_page_id', pageId.trim(), 'SOME');
      if (groupId) await setSetting('meta_group_id', groupId.trim(), 'SOME');
      if (instagramId) await setSetting('meta_instagram_id', instagramId.trim(), 'SOME');
      await setSetting('meta_access_token', token.trim(), 'SOME');
      return NextResponse.json({ success: true, message: 'Meta (Facebook & Instagram) API-nøkkel lagret!' });
    }

    if (action === 'disconnect_meta') {
      await setSetting('meta_access_token', '', 'SOME');
      return NextResponse.json({ success: true, message: 'Meta-tilkobling ble koblet fra.' });
    }

    if (action === 'save_google_token' || action === 'connect_google') {
      if (!token || !token.trim()) {
        return NextResponse.json({ success: false, error: 'Mangler gyldig Google Business OAuth Token' }, { status: 400 });
      }
      if (accountId) await setSetting('google_business_account_id', accountId.trim(), 'SOME');
      if (locationId) await setSetting('google_business_location_id', locationId.trim(), 'SOME');
      await setSetting('google_business_access_token', token.trim(), 'SOME');
      return NextResponse.json({ success: true, message: 'Google Business Profile OAuth-token lagret!' });
    }

    if (action === 'disconnect_google') {
      await setSetting('google_business_access_token', '', 'SOME');
      return NextResponse.json({ success: true, message: 'Google Business Profile ble koblet fra.' });
    }

    // Ukjent handling: svar eksplisitt med hva som faktisk støttes, slik at en
    // kallende knapp ikke feiler i stillhet (adminpanelet så bare på data.success).
    return NextResponse.json(
      {
        success: false,
        error:
          `Ukjent handling «${action ?? '(mangler)'}». Gyldige handlinger: ` +
          'connect_meta, save_meta_token, disconnect_meta, connect_google, save_google_token, disconnect_google. ' +
          'Merk: en tilkobling krever en ekte API-token — det finnes ingen simuleringshandling.',
      },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Feil ved tilkobling' }, { status: 500 });
  }
}
