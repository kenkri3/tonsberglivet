'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, RefreshCw, FileText, Download, ShieldCheck,
  AlertCircle, CheckCircle2, KeyRound, ExternalLink, Search,
  ArrowUpRight, Clock
} from 'lucide-react';
import Link from 'next/link';

interface DuettInvoiceItem {
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

export default function DuettFinancePage() {
  const [invoices, setInvoices] = useState<DuettInvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [duettConfigured, setDuettConfigured] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'READY' | 'SENT' | 'PENDING'>('all');

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      // 1. Sjekk innstillinger for Duett
      const settingsRes = await fetch('/api/settings');
      const settingsJson = await settingsRes.json();
      if (settingsJson.success && settingsJson.data) {
        setDuettConfigured(!!settingsJson.data.duettConfigured);
      }

      // 2. Hent fakturagrunnlag fra reelle bookinger
      const finRes = await fetch('/api/finance/export?format=json');
      const finJson = await finRes.json();
      if (finJson.success && finJson.data?.items) {
        setInvoices(finJson.data.items);
      }
    } catch (e) {
      console.error('Feil ved lasting av fakturagrunnlag:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const handleExportDuett = async () => {
    setIsExporting(true);
    setExportMessage(null);
    try {
      const res = await fetch('/api/finance/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingIds: invoices.map((i) => i.id) }),
      });

      const data = await res.json();

      if (data.success && data.data?.csvContent) {
        const blob = new Blob([data.data.csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', data.data.filename || `Duett_Fakturagrunnlag_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setExportMessage(data.message || `Fakturagrunnlag (${data.data.items.length} poster) er eksportert og lastet ned.`);
      } else {
        // Tidligere lastet vi bare ned CSV-en på nytt her og sa «Laster ned …»,
        // også når serveren faktisk svarte med en feil. Rapporter i stedet hva
        // som faktisk skjedde, slik at en feilslått eksport ikke ser ut som suksess.
        setExportMessage(
          data.error ||
            `Eksporten ga ingen fil (HTTP ${res.status}). Ingenting er lastet ned.`,
        );
      }
    } catch (e: any) {
      setExportMessage(`Nettverksfeil under eksport: ${e?.message || 'ukjent feil'}. Ingenting er lastet ned.`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportMessage(null), 6000);
    }
  };

  const totalGross = invoices.reduce((acc, curr) => acc + (curr.grossAmount || 0), 0);
  const totalNet = invoices.reduce((acc, curr) => acc + (curr.netAmount || 0), 0);
  const totalVat = invoices.reduce((acc, curr) => acc + (curr.vatAmount || 0), 0);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesFilter = filter === 'all' || inv.ehfStatus === filter;
    const matchesSearch =
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.orgNr.includes(search) ||
      inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      inv.lineItemDescription.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Duett ERP & Fakturering</h2>
          <p className="text-xs sm:text-sm text-foreground-muted mt-0.5">
            Fakturagrunnlag for torvleie, byrom og skjemasalg • Peppol EHF 3.0
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchFinanceData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs sm:text-sm font-semibold text-foreground hover:bg-surface-muted transition-colors shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 text-primary ${loading ? 'animate-spin' : ''}`} />
            Oppdater
          </button>
          <button
            onClick={handleExportDuett}
            disabled={isExporting || invoices.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs sm:text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
            {isExporting ? 'Genererer...' : 'Last ned EHF 3.0 CSV'}
          </button>
        </div>
      </div>

      {/* Ærlig integrasjonsstatus */}
      {duettConfigured ? (
        <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground text-sm sm:text-base">Duett ERP Webhook er konfigurert</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                Aktiv kobling
              </span>
            </div>
            <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
              Fakturagrunnlag overføres automatisk til regnskapsfører / Duett ERP via webhook ved godkjenning av bookinger.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-5 bg-surface rounded-2xl border border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground text-sm sm:text-base">
                  Duett ERP Webhook: Ikke konfigurert ennå
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  Manuell EHF-eksport aktiv
                </span>
              </div>
              <p className="text-xs text-foreground-muted mt-1 max-w-2xl leading-relaxed">
                Systemet fungerer i manuell eksportmodus. Alle godkjente torvleieavtaler konverteres automatisk til standardiserte Peppol EHF 3.0-kompatible CSV-filer med UTF-8 BOM, MVA-spesifikasjon og organisasjonsnumre, klare for import i Duett. For direkte API-overføring, legg inn regnskapskontorets webhook-URL.
              </p>
            </div>
          </div>
          <Link
            href="/admin/innstillinger"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0"
          >
            Konfigurer Duett <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {exportMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs sm:text-sm flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {exportMessage}
        </div>
      )}

      {/* KPI-kort */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground-muted font-medium">
            <span>Fakturerbart Grunnlag</span>
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground">
            {totalGross.toLocaleString('no-NO')} kr
          </div>
          <div className="text-xs text-foreground-muted pt-2 border-t border-border flex justify-between">
            <span>Netto: {totalNet.toLocaleString('no-NO')} kr</span>
            <span>MVA: {totalVat.toLocaleString('no-NO')} kr</span>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground-muted font-medium">
            <span>Antall Bilag / Linjer</span>
            <FileText className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-foreground">
            {invoices.length} bilag
          </div>
          <div className="text-xs text-foreground-muted pt-2 border-t border-border">
            Standard: Peppol BIS Billing 3.0
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground-muted font-medium">
            <span>Hovedbokskonto</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-foreground">
            Konto 3000
          </div>
          <div className="text-xs text-foreground-muted pt-2 border-t border-border">
            Salgsinntekt avgiftspliktig (25% MVA)
          </div>
        </div>
      </div>

      {/* Søk og filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
          <input
            type="search"
            placeholder="Søk i kundenavn, org.nr, fakturanr eller varelinje..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm
                       text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(['all', 'READY', 'SENT', 'PENDING'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filter === st
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-surface border border-border text-foreground-muted hover:text-foreground hover:bg-surface-muted'
              }`}
            >
              {st === 'all' ? 'Alle bilag' : st === 'READY' ? 'Klar for EHF' : st === 'SENT' ? 'Overført' : 'Venter'}
            </button>
          ))}
        </div>
      </div>

      {/* Bilagstabell */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-muted/40 font-bold text-foreground">
                <th className="py-3 px-4">Fakturanr</th>
                <th className="py-3 px-4">Kunde & Org.nr</th>
                <th className="py-3 px-4">Varebeskrivelse</th>
                <th className="py-3 px-4">Dato</th>
                <th className="py-3 px-4 text-right">Netto</th>
                <th className="py-3 px-4 text-right">MVA (25%)</th>
                <th className="py-3 px-4 text-right">Totalt</th>
                <th className="py-3 px-4 text-center">EHF Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-foreground-muted">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-primary mb-2" />
                    Laster fakturagrunnlag...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-foreground-muted">
                    <AlertCircle className="w-6 h-6 text-foreground-subtle mx-auto mb-1.5" />
                    Ingen fakturabilag funnet
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">{inv.invoiceNo}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{inv.customerName}</div>
                      <div className="text-[10px] text-foreground-muted font-mono">{inv.orgNr}</div>
                    </td>
                    <td className="py-3 px-4 text-foreground-muted">{inv.lineItemDescription}</td>
                    <td className="py-3 px-4 text-foreground-muted">{inv.invoiceDate}</td>
                    <td className="py-3 px-4 text-right font-mono">{inv.netAmount.toLocaleString('no-NO')} kr</td>
                    <td className="py-3 px-4 text-right font-mono text-foreground-muted">{inv.vatAmount.toLocaleString('no-NO')} kr</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-foreground">{inv.grossAmount.toLocaleString('no-NO')} kr</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {inv.ehfStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
