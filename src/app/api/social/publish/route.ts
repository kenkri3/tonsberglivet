import { NextResponse } from 'next/server';
import { getSetting } from '@/lib/settings';
import { requireEditorOrAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export interface SocialPublishRequest {
  targets: Array<'facebook_page' | 'facebook_group' | 'instagram' | 'google_business'>;
  text: string;
  title?: string;
  link?: string;
  imageUrl?: string;
}

export async function POST(request: Request) {
  const auth = requireEditorOrAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const body: SocialPublishRequest = await request.json();
    const { targets, text, title, link, imageUrl } = body;

    if (!targets || !Array.isArray(targets) || targets.length === 0) {
      return NextResponse.json({ success: false, error: 'Minst én kanal må velges' }, { status: 400 });
    }

    if (!text || text.trim() === '') {
      return NextResponse.json({ success: false, error: 'Innhold/tekst er påkrevd' }, { status: 400 });
    }

    // Hent konfigurasjoner
    const metaPageId = await getSetting('meta_page_id');
    const metaGroupId = await getSetting('meta_group_id');
    const metaInstagramId = await getSetting('meta_instagram_id');
    const metaAccessToken = await getSetting('meta_access_token');

    const googleAccountId = await getSetting('google_business_account_id');
    const googleLocationId = await getSetting('google_business_location_id');
    const googleAccessToken = await getSetting('google_business_access_token');

    const results: Record<string, { success: boolean; message: string; id?: string; simulated?: boolean }> = {};

    for (const target of targets) {
      if (target === 'facebook_page') {
        if (!metaAccessToken || !metaPageId) {
          results.facebook_page = {
            success: true,
            simulated: true,
            message: 'Simulert publisering til Facebook-side (Koble til Meta Page ID & Token under Innstillinger for live API)',
          };
          continue;
        }

        try {
          const res = await fetch(`https://graph.facebook.com/v19.0/${metaPageId}/feed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: text,
              link: link || 'https://tonsberglivet.no',
              access_token: metaAccessToken,
            }),
          });
          const json = await res.json();
          if (json.id) {
            results.facebook_page = { success: true, message: 'Publisert direkte til Facebook-side!', id: json.id };
          } else {
            results.facebook_page = { success: false, message: json.error?.message || 'Kunne ikke publisere til Facebook-side' };
          }
        } catch (e: any) {
          results.facebook_page = { success: false, message: e.message || 'Nettverksfeil mot Meta API' };
        }
      }

      if (target === 'facebook_group') {
        if (!metaAccessToken || !metaGroupId) {
          results.facebook_group = {
            success: true,
            simulated: true,
            message: 'Simulert publisering til Facebook-gruppe (Koble til Meta Group ID & Token under Innstillinger for live API)',
          };
          continue;
        }

        try {
          const res = await fetch(`https://graph.facebook.com/v19.0/${metaGroupId}/feed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: text,
              link: link || 'https://tonsberglivet.no',
              access_token: metaAccessToken,
            }),
          });
          const json = await res.json();
          if (json.id) {
            results.facebook_group = { success: true, message: 'Publisert direkte til Facebook-gruppe!', id: json.id };
          } else {
            results.facebook_group = { success: false, message: json.error?.message || 'Kunne ikke publisere til Facebook-gruppe' };
          }
        } catch (e: any) {
          results.facebook_group = { success: false, message: e.message || 'Nettverksfeil mot Meta Group API' };
        }
      }

      if (target === 'instagram') {
        if (!metaAccessToken || !metaInstagramId) {
          results.instagram = {
            success: true,
            simulated: true,
            message: 'Simulert publisering til Instagram (Koble til Instagram Business ID & Token under Innstillinger for live API)',
          };
          continue;
        }

        try {
          const effectiveImageUrl = imageUrl || 'https://tonsberglivet.no/images/og-default.jpg';
          const containerRes = await fetch(`https://graph.facebook.com/v19.0/${metaInstagramId}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image_url: effectiveImageUrl,
              caption: text,
              access_token: metaAccessToken,
            }),
          });
          const containerJson = await containerRes.json();

          if (containerJson.id) {
            const publishRes = await fetch(`https://graph.facebook.com/v19.0/${metaInstagramId}/media_publish`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                creation_id: containerJson.id,
                access_token: metaAccessToken,
              }),
            });
            const publishJson = await publishRes.json();
            if (publishJson.id) {
              results.instagram = { success: true, message: 'Publisert direkte til Instagram!', id: publishJson.id };
            } else {
              results.instagram = { success: false, message: publishJson.error?.message || 'Feil ved endelig Instagram-publisering' };
            }
          } else {
            results.instagram = { success: false, message: containerJson.error?.message || 'Feil ved opprettelse av Instagram-mediecontainer' };
          }
        } catch (e: any) {
          results.instagram = { success: false, message: e.message || 'Nettverksfeil mot Instagram Graph API' };
        }
      }

      if (target === 'google_business') {
        if (!googleAccessToken || !googleLocationId) {
          results.google_business = {
            success: true,
            simulated: true,
            message: 'Simulert oppdatering til Google Business Profile (Koble til Google Location ID & OAuth under Innstillinger for live API)',
          };
          continue;
        }

        try {
          const account = googleAccountId || 'accounts/me';
          const postPayload = {
            languageCode: 'nb-NO',
            summary: text,
            callToAction: {
              actionType: 'LEARN_MORE',
              url: link || 'https://tonsberglivet.no',
            },
            topicType: 'STANDARD',
          };

          const res = await fetch(`https://mybusiness.googleapis.com/v4/${account}/${googleLocationId}/localPosts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${googleAccessToken}`,
            },
            body: JSON.stringify(postPayload),
          });
          const json = await res.json();
          if (json.name) {
            results.google_business = { success: true, message: 'Publisert direkte som Google Business Profile-oppdatering!', id: json.name };
          } else {
            results.google_business = { success: false, message: json.error?.message || 'Kunne ikke publisere til Google Business Profile' };
          }
        } catch (e: any) {
          results.google_business = { success: false, message: e.message || 'Nettverksfeil mot Google Business API' };
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Behandling av sosiale medier fullført',
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Feil ved publisering' }, { status: 500 });
  }
}
