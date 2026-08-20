'use client';

import { useState } from 'react';
import { 
  Building2, ArrowUpRight, 
  RefreshCw, FileText, Download, ShieldCheck,
  Zap, Clock
} from 'lucide-react';

interface InvoiceRow {
  id: string;
  invoiceNo: string;
  customer: string;
  orgNr: string;
  category: string;
  amountExVat: number;
  vat: number;
  totalAmount: number;
  ehfStatus: 'sent' | 'pending' | 'failed';
  duettSyncId: string;
  date: string;
}

const initialInvoices: InvoiceRow[] = [
  { id: '1', invoiceNo: 'F-2026-089', customer: 'Helenes Bakeri AS', orgNr: '928 411 029', category: 'Torvleie Sone A', amountExVat: 5920, vat: 1480, totalAmount: 7400, ehfStatus: 'sent', duettSyncId: 'DUE-994102', date: '18. Aug 2026' },
  { id: '2', invoiceNo: 'F-2026-088', customer: 'Vestfold Media Group AS', orgNr: '988 201 449', category: 'DoOH Skjermannonsering', amountExVat: 12000, vat: 3000, totalAmount: 15000, ehfStatus: 'sent', duettSyncId: 'DUE-994101', date: '17. Aug 2026' },
  { id: '3', invoiceNo: 'F-2026-087', customer: 'Tønsberg Jazzfestival', orgNr: '810 933 112', category: 'Kulturscene Riggleie', amountExVat: 10800, vat: 2700, totalAmount: 13500, ehfStatus: 'sent', duettSyncId: 'DUE-994098', date: '15. Aug 2026' },
  { id: '4', invoiceNo: 'F-2026-086', customer: 'Kystens Ferske Reker AS', orgNr: '914 832 990', category: 'Bryggestand Havnepromenade', amountExVat: 5040, vat: 1260, totalAmount: 6300, ehfStatus: 'pending', duettSyncId: 'DUE-994094', date: '14. Aug 2026' },
  { id: '5', invoiceNo: 'F-2026-085', customer: 'Farmand Eiendom BA', orgNr: '974 550 120', category: 'Næringspartner Medlemskap', amountExVat: 20000, vat: 5000, totalAmount: 25000, ehfStatus: 'sent', duettSyncId: 'DUE-994089', date: '10. Aug 2026' },
];

export default function DuettFinancePage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [invoices] = useState<InvoiceRow[]>(initialInvoices);
  const [filter, setFilter] = useState<'all' | 'sent' | 'pending'>('all');

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 1200);
  };

  const totalBilled = invoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalVat = invoices.reduce((acc, curr) => acc + curr.vat, 0);

  const filteredInvoices = invoices.filter(inv => {
    if (filter === 'all') return true;
    return inv.ehfStatus === filter;
  });

  return (
    <div className="space-y-12 pb-16">
      
      {/* ── Seksjon 1: KPI & Økonomistatus ── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">Økonomisk Oversikt (Duett ERP)</h2>
            <p className="text-xs text-foreground-muted mt-0.5">Sanntidsfakturering, Peppol EHF 3.0 og integrasjonsstatus</p>
          </div>
          <span className="text-xs font-bold text-success bg-success-light px-3 py-1 rounded-full">
            EHF 3.0 Live Gateway
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Total Omsetning</span>
              <div className="w-9 h-9 rounded-xl bg-success-light text-success flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight">{totalBilled.toLocaleString('no-NO')} kr</div>
              <div className="flex items-center gap-1 text-xs font-bold text-success mt-1">
                <ArrowUpRight className="w-4 h-4" /> +18.6% vekst
              </div>
            </div>
            <div className="pt-3 border-t border-border text-xs text-foreground-muted">
              Inkl. {totalVat.toLocaleString('no-NO')} kr MVA
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">EHF Fakturaer</span>
              <div className="w-9 h-9 rounded-xl bg-surface-muted text-foreground flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight">{invoices.length}</div>
              <div className="text-xs font-bold text-primary mt-1">
                100% EHF levert
              </div>
            </div>
            <div className="pt-3 border-t border-border text-xs text-foreground-muted">
              Sendt via Peppol-nettverket
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Duett Sky Status</span>
              <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight">42 ms</div>
              <div className="text-xs font-bold text-success mt-1">
                Optimal responstid
              </div>
            </div>
            <div className="pt-3 border-t border-border text-xs text-foreground-muted">
              TLS 1.3 Sikker Forbindelse
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Autobokføring</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight">10 min</div>
              <div className="text-xs font-bold text-foreground-muted mt-1">
                siden forrige synk
              </div>
            </div>
            <div className="pt-3 border-t border-border text-xs text-foreground-muted">
              Neste kjøring: om 50 min
            </div>
          </div>

        </div>
      </section>

      {/* ── Seksjon 2: Gateway Status Banner ── */}
      <section className="bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 md:gap-5">
          <div className="w-14 h-14 rounded-2xl bg-success-light text-success flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-extrabold text-foreground">Duett ERP Cloud Gateway (Aktiv)</h3>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-success-light text-success">
                Peppol EHF 3.0
              </span>
            </div>
            <p className="text-xs md:text-sm text-foreground-muted mt-1 leading-relaxed">
              Automatisk synkronisering av leieinntekter for byrom, markedsplasser og storskjermannonser.
            </p>
          </div>
        </div>

        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Kjører Duett-synk...' : syncSuccess ? 'Synkronisert!' : 'Kjør Manuell Synk'}</span>
        </button>
      </section>

      {/* ── Seksjon 3: Transaksjonsjournal ── */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">Fakturajournal & EHF-status</h2>
            <p className="text-xs text-foreground-muted mt-0.5">Siste transaksjoner overført til Duett Økonomisystem</p>
          </div>

          <div className="flex items-center gap-2 bg-surface-muted p-1.5 rounded-2xl border border-border">
            {(['all', 'sent', 'pending'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === tab ? 'bg-primary text-white shadow-xs' : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                {tab === 'all' ? 'Alle' : tab === 'sent' ? 'EHF Sendt' : 'Venter'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-muted text-foreground uppercase font-bold border-b border-border">
                <tr>
                  <th className="px-6 py-4">Fakturanr</th>
                  <th className="px-6 py-4">Kunde / Mottaker</th>
                  <th className="px-6 py-4">Tjeneste / Varelinje</th>
                  <th className="px-6 py-4">Eks. MVA</th>
                  <th className="px-6 py-4">Totalt (Inkl. MVA)</th>
                  <th className="px-6 py-4">EHF Status</th>
                  <th className="px-6 py-4 text-right">Duett ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-foreground text-sm">{inv.invoiceNo}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground text-sm">{inv.customer}</div>
                      <div className="text-[11px] text-foreground-muted font-mono mt-0.5">Org: {inv.orgNr}</div>
                    </td>
                    <td className="px-6 py-4 text-foreground-muted">{inv.category}</td>
                    <td className="px-6 py-4 font-mono text-foreground-muted">
                      {inv.amountExVat.toLocaleString('no-NO')} kr
                    </td>
                    <td className="px-6 py-4 font-mono font-black text-foreground text-sm">
                      {inv.totalAmount.toLocaleString('no-NO')} kr
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                        inv.ehfStatus === 'sent' ? 'bg-success-light text-success border border-success/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}>
                        {inv.ehfStatus === 'sent' ? 'Levert (EHF)' : 'Venter'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono text-xs text-foreground-muted flex items-center justify-end gap-1.5">
                        <Download className="w-3.5 h-3.5 text-primary" />
                        <span>{inv.duettSyncId}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
}
