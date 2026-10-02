import { prisma } from '../prisma';
import { getSetting } from '../settings';

export interface DuettInvoiceItem {
  id: string;
  invoiceNo: string;
  customerName: string;
  orgNr: string;
  invoiceDate: string;
  dueDate: string;
  lineItemDescription: string;
  netAmount: number;
  vatRate: number;
  vatAmount: number;
  grossAmount: number;
  currency: string;
  glAccount: string;
  ehfStatus: 'READY' | 'SENT' | 'PENDING';
  peppolId: string;
}

export interface DuettExportResult {
  csvContent: string;
  filename: string;
  items: DuettInvoiceItem[];
  totals: {
    totalNet: number;
    totalVat: number;
    totalGross: number;
    count: number;
  };
  ehfBatchId: string;
}

/**
 * CSV-helper: kvoterer felt, escaper innebygde anførselstegn og nøytraliserer
 * formelinjeksjon (=, +, -, @, tab og CR) slik at Excel/Duett ikke tolker
 * kundenavn eller varelinjer som formler.
 */
function csvTextField(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value);
  // Linjeskift i et felt ville brutt radstrukturen i enkle ERP-importører
  text = text.replace(/\r\n|\r|\n/g, ' ');
  if (/^[=+\-@\t]/.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replace(/"/g, '""')}"`;
}

/**
 * Genererer standardisert fakturagrunnlag for Duett ERP og Peppol EHF 3.0.
 * Inneholder KUN rader som faktisk finnes i databasen – aldri oppdiktet
 * eksempeldata. Finner vi ingen bookinger, er eksporten tom.
 */
export async function generateDuettInvoiceExport(bookingIds?: string[]): Promise<DuettExportResult> {
  const today = new Date();
  const invoiceDateStr = today.toISOString().split('T')[0];

  // Forfallsdato er +14 dager
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 14);
  const dueDateStr = dueDate.toISOString().split('T')[0];

  const items: DuettInvoiceItem[] = [];

  // 1. Oppslag mot Prisma databasen (eneste kilde til fakturagrunnlag)
  const query: any = {};
  if (bookingIds && bookingIds.length > 0) {
    query.where = { id: { in: bookingIds } };
  }
  const dbBookings = await prisma.bookingRequest.findMany(query);

  dbBookings.forEach((b, idx) => {
    // Kun lagrede beløp. Mangler prisen, faktureres 0 – vi finner ikke på et beløp.
    const net = typeof b.totalPrice === 'number' && Number.isFinite(b.totalPrice) ? b.totalPrice : 0;
    const vat = Math.round(net * 0.25);
    const gross = net + vat;
    const cleanOrg = (b.orgNr || '').replace(/\s+/g, '');

    items.push({
      id: b.id,
      invoiceNo: `F-2026-${String(idx + 90).padStart(3, '0')}`,
      customerName: b.name,
      orgNr: b.orgNr || '',
      invoiceDate: invoiceDateStr,
      dueDate: dueDateStr,
      lineItemDescription: b.zone ? `Leie av ${b.zone}` : 'Leie av byrom/standplass',
      netAmount: net,
      vatRate: 25,
      vatAmount: vat,
      grossAmount: gross,
      currency: 'NOK',
      glAccount: '3000',
      ehfStatus: 'READY',
      peppolId: cleanOrg ? `0192:${cleanOrg}` : '',
    });
  });

  // Beregn totaler
  const totalNet = items.reduce((acc, curr) => acc + curr.netAmount, 0);
  const totalVat = items.reduce((acc, curr) => acc + curr.vatAmount, 0);
  const totalGross = items.reduce((acc, curr) => acc + curr.grossAmount, 0);

  // Bygg standardisert CSV med UTF-8 BOM for direkte åpning i Excel og Duett
  const csvHeaders = [
    'Fakturanr',
    'Kundenavn',
    'Organisasjonsnummer',
    'Fakturadato',
    'Forfallsdato',
    'Varelinje',
    'Netto_Belop_NOK',
    'MVA_Sats',
    'MVA_Belop_NOK',
    'Brutto_Belop_NOK',
    'Valuta',
    'Hovedbokskonto',
    'EHF_Peppol_ID',
    'EHF_Status',
  ].join(';');

  const csvRows = items.map((i) =>
    [
      csvTextField(i.invoiceNo),
      csvTextField(i.customerName),
      csvTextField(i.orgNr),
      csvTextField(i.invoiceDate),
      csvTextField(i.dueDate),
      csvTextField(i.lineItemDescription),
      i.netAmount.toFixed(2),
      `${i.vatRate}%`,
      i.vatAmount.toFixed(2),
      i.grossAmount.toFixed(2),
      csvTextField(i.currency),
      csvTextField(i.glAccount),
      csvTextField(i.peppolId),
      csvTextField(i.ehfStatus),
    ].join(';')
  );

  const csvContent = '\uFEFF' + [csvHeaders, ...csvRows].join('\r\n');
  const filename = `Duett_ERP_Fakturagrunnlag_${invoiceDateStr}.csv`;
  const ehfBatchId = `DUE-BATCH-${Date.now()}`;

  return {
    csvContent,
    filename,
    items,
    totals: {
      totalNet,
      totalVat,
      totalGross,
      count: items.length,
    },
    ehfBatchId,
  };
}

/**
 * Trigger webhook til regnskapsfører / Duett ERP API dersom URL er konfigurert.
 */
export async function triggerDuettWebhook(exportResult: DuettExportResult): Promise<{ success: boolean; triggered: boolean; message: string }> {
  const webhookUrl = await getSetting('duett_webhook_url');

  if (!webhookUrl || webhookUrl.trim() === '') {
    return {
      success: true,
      triggered: false,
      message: 'Ingen Duett ERP webhook URL konfigurert i innstillinger. Eksportfil generert for manuell nedlasting.',
    };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Duett-Batch-Id': exportResult.ehfBatchId,
      },
      body: JSON.stringify({
        batchId: exportResult.ehfBatchId,
        source: 'Tønsberglivet Byrom & Portal',
        exportedAt: new Date().toISOString(),
        totals: exportResult.totals,
        invoices: exportResult.items,
      }),
    });

    if (res.ok) {
      return {
        success: true,
        triggered: true,
        message: `Fakturagrunnlag (${exportResult.items.length} poster) overført til regnskapsfører via Duett webhook.`,
      };
    } else {
      return {
        success: false,
        triggered: true,
        message: `Duett webhook svarte med status ${res.status}. CSV-fil er likevel tilgjengelig.`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      triggered: true,
      message: `Feil ved sending til Duett webhook: ${err?.message || 'Nettverksfeil'}`,
    };
  }
}
