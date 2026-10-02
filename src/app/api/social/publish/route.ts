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
    const body: SocialPublishRequest = await request.json().catch(() => null as any);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Ugyldig JSON i forespørselen.' }, { status: 400 });
    }
    const { targets, text, title, link, imageUrl } = body;

    if (!targets || !Array.isArray(targets) || targets.length === 0) {
      return NextResponse.json({ success: false, error: 'Minst én kanal må velges' }, { status: 400 });
    }

    // Ukjente kanalnavn skal ikke ignoreres i stillhet — da ser publiseringen ut
    // som en suksess uten at noe ble sendt noe sted.
    const VALID_TARGETS = ['facebook_page', 'facebook_group', 'instagram', 'google_business'];
    const unknownTargets = targets.filter((t: string) => !VALID_TARGETS.includes(t));
    if (unknownTargets.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Ukjent kanal: ${unknownTargets.join(', ')}. Gyldige kanaler: ${VALID_TARGETS.join(', ')}.`,
        },
        { status: 400 }
      );
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
            success: false,
            simulated: true,
            message: 'Ikke publisert — Facebook-side mangler Page ID og/eller Access Token under Innstillinger.',
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
            success: false,
            simulated: true,
            message: 'Ikke publisert — Facebook-gruppe mangler Group ID og/eller Access Token under Innstillinger.',
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
            success: false,
            simulated: true,
            message: 'Ikke publisert — Instagram mangler Business ID og/eller Access Token under Innstillinger.',
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
            success: false,
            simulated: true,
            message: 'Ikke publisert — Google Business Profile mangler Location ID og/eller OAuth-token under Innstillinger.',
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

    // En «simulert» kanal er IKKE en publisering. Kanalene over markerer derfor
    // slike tilfeller som success:false med en tydelig årsak.
    const channelResults = Object.values(results);
    const publishedCount = channelResults.filter((r) => r.success && !r.simulated).length;
    const simulatedCount = channelResults.filter((r) => r.simulated).length;
    const failedCount = channelResults.filter((r) => !r.success && !r.simulated).length;

    const summary =
      publishedCount > 0
        ? `Publisert til ${publishedCount} kanal${publishedCount === 1 ? '' : 'er'}.` +
          (simulatedCount > 0 ? ` ${simulatedCount} kanal(er) er ikke tilkoblet og ble hoppet over.` : '')
        : 'Ingenting ble publisert: ingen av de valgte kanalene er tilkoblet. ' +
          'Legg inn gyldige API-token under Innstillinger og prøv igjen.';

    return NextResponse.json({
      // success reflekterer om noe FAKTISK ble publisert.
      success: publishedCount > 0,
      publishedCount,
      simulatedCount,
      failedCount,
      message: summary,
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Feil ved publisering' }, { status: 500 });
  }
}
