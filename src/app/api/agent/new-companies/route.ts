import { NextRequest, NextResponse } from 'next/server';
import {
  syncAndGetNewCompanies,
  updateCompanyWelcomeStatus,
  regenerateEmailForCompany,
  CompanyWelcomeStatus,
  CompanyWelcomeRecord,
  generateWelcomeEmailDraft,
} from '@/lib/company-welcome-email';
import { requireEditorOrAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const VALID_STATUSES: CompanyWelcomeStatus[] = ['PENDING', 'DRAFT', 'APPROVED', 'SENT', 'SKIPPED'];

/**
 * Endepunktet koster AI-kreditter (kladdgenerering) og skriver til SystemSetting,
 * så det krever innlogget redaktør/admin.
 */
function authorize(request: NextRequest): NextResponse | null {
  const auth = requireEditorOrAdmin(request);
  if (auth.authorized) return null;
  return NextResponse.json(
    { success: false, error: auth.error || 'Uautorisert' },
    { status: auth.user ? 403 : 401 }
  );
}

/**
 * Klipper listen til `limit` og lar statistikken beskrive NØYAKTIG det som
 * faktisk returneres (UI-et viser stats.total som antall rader i visningen).
 */
function buildPage(companies: CompanyWelcomeRecord[], limit: number) {
  const page = companies.slice(0, limit);
  return {
    companies: page,
    stats: {
      total: page.length,
      withEmail: page.filter((c) => Boolean(c.email)).length,
      draftsReady: page.filter((c) => c.status === 'DRAFT').length,
      approved: page.filter((c) => c.status === 'APPROVED').length,
      sent: page.filter((c) => c.status === 'SENT').length,
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const denied = authorize(request);
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const daysBack = Number(searchParams.get('daysBack')) || 30;
    const limit = Number(searchParams.get('limit')) || 50;
    // Dyr AI-generering + DB-skriving skal være eksplisitt opt-in (?autoDraft=true),
    // ikke en bieffekt av en ren lesning.
    const autoDraft = searchParams.get('autoDraft') === 'true';

    const result = await syncAndGetNewCompanies({ daysBack, limit, autoDraft });
    const page = buildPage(result.companies, limit);

    return NextResponse.json({
      success: true,
      data: page.companies,
      stats: page.stats,
    });
  } catch (error: any) {
    console.error('[NewCompanies API GET Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Kunne ikke hente nyetablerte bedrifter' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const denied = authorize(request);
    if (denied) return denied;

    const body = await request.json().catch(() => ({}));
    const { action, orgNr, status, customDraft, daysBack, limit } = body;

    // 1. Force sync fra Brønnøysundregistrene
    if (action === 'sync') {
      const syncLimit = Number(limit) || 50;
      const result = await syncAndGetNewCompanies({
        daysBack: Number(daysBack) || 30,
        limit: syncLimit,
        autoDraft: true,
      });
      const page = buildPage(result.companies, syncLimit);
      return NextResponse.json({
        success: true,
        data: page.companies,
        stats: page.stats,
        message: `Synkronisering fullført. ${page.companies.length} bedrifter registrert.`,
      });
    }

    // 2. Generer / Regenerer e-post for en spesifikk bedrift
    if (action === 'generate') {
      if (!orgNr) {
        return NextResponse.json({ success: false, error: 'Mangler organisasjonsnummer' }, { status: 400 });
      }
      const updated = await regenerateEmailForCompany(orgNr);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Fant ikke bedrift' }, { status: 404 });
      }
      return NextResponse.json({ success: true, company: updated });
    }

    // 3. Batch-generering for alle som venter
    if (action === 'batch_generate') {
      const batchLimit = Number(limit) || 50;
      const result = await syncAndGetNewCompanies({ autoDraft: true });
      const page = buildPage(result.companies, batchLimit);
      return NextResponse.json({
        success: true,
        data: page.companies,
        stats: page.stats,
        message: 'Kladder generert for nyetablerte bedrifter.',
      });
    }

    // 4. Oppdater status eller tilpass e-postkladd
    if (action === 'update_status') {
      if (!orgNr || !status) {
        return NextResponse.json({ success: false, error: 'Mangler orgNr eller status' }, { status: 400 });
      }
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { success: false, error: `Ugyldig status «${status}». Gyldige verdier: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }
      const updated = await updateCompanyWelcomeStatus(orgNr, status as CompanyWelcomeStatus, customDraft);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Fant ikke bedrift' }, { status: 404 });
      }
      return NextResponse.json({ success: true, company: updated });
    }

    // 5. Merk som sendt
    if (action === 'mark_sent') {
      if (!orgNr) {
        return NextResponse.json({ success: false, error: 'Mangler organisasjonsnummer' }, { status: 400 });
      }
      const updated = await updateCompanyWelcomeStatus(orgNr, 'SENT', customDraft);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Fant ikke bedrift' }, { status: 404 });
      }
      return NextResponse.json({ success: true, company: updated });
    }

    return NextResponse.json({ success: false, error: 'Ukjent handling' }, { status: 400 });
  } catch (error: any) {
    console.error('[NewCompanies API POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Handling feilet' },
      { status: 500 }
    );
  }
}
