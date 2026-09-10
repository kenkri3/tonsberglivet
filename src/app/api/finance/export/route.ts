import { NextResponse } from 'next/server';
import { generateDuettInvoiceExport, triggerDuettWebhook } from '@/lib/services/finance';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'csv';
    const bookingIdsParam = url.searchParams.get('bookingIds');
    const bookingIds = bookingIdsParam ? bookingIdsParam.split(',') : undefined;

    const exportResult = await generateDuettInvoiceExport(bookingIds);

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: exportResult,
      });
    }

    // Returner CSV direkte som nedlastbar fil
    return new Response(exportResult.csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${exportResult.filename}"`,
      },
    });
  } catch (error: any) {
    console.error('[Finance Export Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Feil ved generering av fakturagrunnlag' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const bookingIds: string[] | undefined = Array.isArray(body?.bookingIds)
      ? body.bookingIds
      : undefined;

    const exportResult = await generateDuettInvoiceExport(bookingIds);
    const webhookResult = await triggerDuettWebhook(exportResult);

    return NextResponse.json({
      success: true,
      data: {
        ...exportResult,
        webhook: webhookResult,
      },
      message: webhookResult.triggered
        ? webhookResult.message
        : `Fakturagrunnlag generert med ${exportResult.items.length} linjer (Totalt: ${exportResult.totals.totalGross.toLocaleString('nb-NO')} kr).`,
    });
  } catch (error: any) {
    console.error('[Finance Export POST Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Feil under fakturaeksport' },
      { status: 500 }
    );
  }
}
