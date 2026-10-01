import { NextResponse } from 'next/server';
import { getSetting, setSetting } from '@/lib/settings';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
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
    const body = await request.json();
    const { action, provider, pageId, groupId, instagramId, token, accountId, locationId } = body;

    if (action === 'connect_mock_meta') {
      await setSetting('meta_page_id', pageId || 'tonsberglivet-facebook-page-id', 'SOME');
      await setSetting('meta_group_id', groupId || 'tonsberglivet-facebook-group-id', 'SOME');
      await setSetting('meta_instagram_id', instagramId || 'tonsberglivet-instagram-business-id', 'SOME');
      await setSetting('meta_access_token', 'EAAB...mock_active_meta_token', 'SOME');
      return NextResponse.json({ success: true, message: 'Meta (Facebook & Instagram) ble koblet til!' });
    }

    if (action === 'disconnect_meta') {
      await setSetting('meta_access_token', '', 'SOME');
      return NextResponse.json({ success: true, message: 'Meta-tilkobling ble koblet fra.' });
    }

    if (action === 'connect_mock_google') {
      await setSetting('google_business_account_id', accountId || 'accounts/109823478912', 'SOME');
      await setSetting('google_business_location_id', locationId || 'locations/tonsberg-sentrum-loc', 'SOME');
      await setSetting('google_business_access_token', 'ya29...mock_active_google_token', 'SOME');
      return NextResponse.json({ success: true, message: 'Google Business Profile ble koblet til!' });
    }

    if (action === 'disconnect_google') {
      await setSetting('google_business_access_token', '', 'SOME');
      return NextResponse.json({ success: true, message: 'Google Business Profile ble koblet fra.' });
    }

    return NextResponse.json({ success: false, error: 'Ukjent handling' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Feil ved tilkobling' }, { status: 500 });
  }
}
