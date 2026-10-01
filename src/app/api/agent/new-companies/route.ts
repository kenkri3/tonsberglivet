import { NextRequest, NextResponse } from 'next/server';
import {
  syncAndGetNewCompanies,
  updateCompanyWelcomeStatus,
  regenerateEmailForCompany,
  CompanyWelcomeStatus,
  generateWelcomeEmailDraft,
} from '@/lib/company-welcome-email';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysBack = Number(searchParams.get('daysBack')) || 30;
    const limit = Number(searchParams.get('limit')) || 50;
    const autoDraft = searchParams.get('autoDraft') !== 'false';

    const result = await syncAndGetNewCompanies({ daysBack, limit, autoDraft });

    return NextResponse.json({
      success: true,
      data: result.companies,
      stats: result.stats,
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
    const body = await request.json().catch(() => ({}));
    const { action, orgNr, status, customDraft, daysBack, limit } = body;

    // 1. Force sync fra Brønnøysundregistrene
    if (action === 'sync') {
      const result = await syncAndGetNewCompanies({
        daysBack: Number(daysBack) || 30,
        limit: Number(limit) || 50,
        autoDraft: true,
      });
      return NextResponse.json({
        success: true,
        data: result.companies,
        stats: result.stats,
        message: `Synkronisering fullført. ${result.companies.length} bedrifter registrert.`,
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
      const result = await syncAndGetNewCompanies({ autoDraft: true });
      return NextResponse.json({
        success: true,
        data: result.companies,
        stats: result.stats,
        message: 'Kladder generert for nyetablerte bedrifter.',
      });
    }

    // 4. Oppdater status eller tilpass e-postkladd
    if (action === 'update_status') {
      if (!orgNr || !status) {
        return NextResponse.json({ success: false, error: 'Mangler orgNr eller status' }, { status: 400 });
      }
      const updated = await updateCompanyWelcomeStatus(orgNr, status as CompanyWelcomeStatus, customDraft);
      return NextResponse.json({ success: true, company: updated });
    }

    // 5. Merk som sendt
    if (action === 'mark_sent') {
      if (!orgNr) {
        return NextResponse.json({ success: false, error: 'Mangler organisasjonsnummer' }, { status: 400 });
      }
      const updated = await updateCompanyWelcomeStatus(orgNr, 'SENT', customDraft);
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
