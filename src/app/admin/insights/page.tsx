'use client';

import { useState } from 'react';
import { 
  TrendingUp, Users, MousePointerClick, 
  ArrowUpRight, ArrowDownRight, Globe, Smartphone, Monitor,
  Compass, MapPin, Eye
} from 'lucide-react';

export default function InsightsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'ytd'>('30d');
  const [activeMetric, setActiveMetric] = useState<'visitors' | 'views'>('visitors');

  const chartData = [
    { label: '01. Aug', visitors: 1420, views: 3890 },
    { label: '04. Aug', visitors: 1890, views: 4920 },
    { label: '07. Aug', visitors: 2240, views: 6100 },
    { label: '10. Aug', visitors: 2890, views: 7800 },
    { label: '13. Aug', visitors: 3450, views: 9200 },
    { label: '16. Aug', visitors: 4120, views: 11400 },
    { label: '19. Aug', visitors: 3820, views: 10100 },
  ];

  const maxVal = Math.max(...chartData.map(d => activeMetric === 'visitors' ? d.visitors : d.views));

  return (
    <div className="space-y-12 pb-16">
      
      {/* ── Seksjon 1: Header & KPI Nøkkeltall ── */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold text-foreground tracking-tight">Sanntidsinnsikt & Trafikk</h2>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-light text-success border border-success/20 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                  38 aktive nå
                </span>
              </div>
              <p className="text-xs text-foreground-muted mt-0.5">Plausible Analytics direkte integrert uten informasjonskapsler (GDPR-safe)</p>
            </div>
          </div>

          {/* Time Selector */}
          <div className="flex items-center gap-2 bg-surface-muted p-1.5 rounded-2xl border border-border">
            {[
              { id: '7d', label: 'Siste 7 dager' },
              { id: '30d', label: 'Siste 30 dager' },
              { id: 'ytd', label: 'Hittil i år' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  timeRange === tab.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── KPI Metric Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div 
            onClick={() => setActiveMetric('visitors')}
            className={`bg-surface border rounded-2xl p-6 shadow-xs cursor-pointer transition-all space-y-4 ${
              activeMetric === 'visitors' ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-border hover:border-foreground-muted'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Unike Besøkende</span>
              <div className="w-9 h-9 rounded-xl bg-surface-muted text-foreground flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight">48 290</div>
              <div className="flex items-center gap-1 text-xs font-bold text-success mt-1">
                <ArrowUpRight className="w-4 h-4" /> +14.2% vekst
              </div>
            </div>
            <div className="pt-3 border-t border-border text-xs text-foreground-muted">
              vs. forrige 30 dager (42.2k)
            </div>
          </div>

          <div 
            onClick={() => setActiveMetric('views')}
            className={`bg-surface border rounded-2xl p-6 shadow-xs cursor-pointer transition-all space-y-4 ${
              activeMetric === 'views' ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-border hover:border-foreground-muted'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Sidevisninger</span>
              <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                <MousePointerClick className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight">142 800</div>
              <div className="flex items-center gap-1 text-xs font-bold text-success mt-1">
                <ArrowUpRight className="w-4 h-4" /> +9.8%
              </div>
            </div>
            <div className="pt-3 border-t border-border text-xs text-foreground-muted">
              2.95 sider pr. besøkende
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Gj.snittlig Besøkstid</span>
              <div className="w-9 h-9 rounded-xl bg-success-light text-success flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight">3m 12s</div>
              <div className="flex items-center gap-1 text-xs font-bold text-success mt-1">
                <ArrowUpRight className="w-4 h-4" /> +24 sekunder
              </div>
            </div>
            <div className="pt-3 border-t border-border text-xs text-foreground-muted">
              Høyest engasjement på Bylivet
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Fluktfrekvens</span>
              <div className="w-9 h-9 rounded-xl bg-surface-muted text-foreground flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight">28.4%</div>
              <div className="flex items-center gap-1 text-xs font-bold text-success mt-1">
                <ArrowDownRight className="w-4 h-4" /> -3.6% forbedring
              </div>
            </div>
            <div className="pt-3 border-t border-border text-xs text-foreground-muted">
              Sterk bruker-retensjon
            </div>
          </div>

        </div>
      </section>

      {/* ── Seksjon 2: Graf & Trafikkutvikling ── */}
      <section className="bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h3 className="text-xl font-extrabold text-foreground tracking-tight">Daglig Trafikkutvikling</h3>
            <p className="text-xs text-foreground-muted mt-0.5">Viser {activeMetric === 'visitors' ? 'unike besøkende' : 'totale sidevisninger'} i valgt periode</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMetric('visitors')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMetric === 'visitors' ? 'bg-primary text-white shadow-xs' : 'bg-surface-muted text-foreground-muted hover:text-foreground'
              }`}
            >
              Besøkende
            </button>
            <button
              onClick={() => setActiveMetric('views')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMetric === 'views' ? 'bg-foreground text-surface shadow-xs' : 'bg-surface-muted text-foreground-muted hover:text-foreground'
              }`}
            >
              Sidevisninger
            </button>
          </div>
        </div>

        {/* CSS Bar Chart */}
        <div className="h-64 flex items-end gap-3 sm:gap-6 pt-8 border-b border-border px-4">
          {chartData.map((d, i) => {
            const val = activeMetric === 'visitors' ? d.visitors : d.views;
            const heightPercent = (val / maxVal) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                <span className="text-[11px] font-mono text-foreground opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  {val.toLocaleString()}
                </span>
                <div 
                  style={{ height: `${heightPercent}%` }} 
                  className={`w-full rounded-t-xl transition-all duration-500 group-hover:scale-y-105 ${
                    activeMetric === 'visitors'
                      ? 'bg-gradient-to-t from-primary/70 to-primary'
                      : 'bg-gradient-to-t from-foreground/70 to-foreground'
                  }`}
                />
                <span className="text-xs text-foreground-muted font-semibold pt-2 truncate">{d.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Seksjon 3: Mest Besøkte Sider & Geografi ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Top Pages List (7 cols) */}
        <div className="lg:col-span-7 bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                <Compass className="w-5 h-5 text-primary" />
                <span>Mest Besøkte Sider</span>
              </h3>
              <p className="text-xs text-foreground-muted mt-0.5">Mest leste artikler og undersider siste 30 dager</p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary-light px-3 py-1 rounded-full">Topp 5</span>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { path: '/bylivet', title: 'Bylivet – Hva skjer i Tønsberg', views: '48 200', pct: 34 },
              { path: '/reiselivet', title: 'Reiselivet & Færder Nasjonalpark', views: '32 400', pct: 23 },
              { path: '/naeringslivet', title: 'Næringslivet & Gründergata', views: '26 100', pct: 18 },
              { path: '/nyheter/faerderbiennalen', title: 'Færderbiennalen 2026', views: '19 800', pct: 14 },
              { path: '/studentlivet', title: 'Studentlivet ved USN', views: '15 300', pct: 11 },
            ].map((p, idx) => (
              <div key={idx} className="space-y-2 p-3.5 rounded-2xl bg-surface-muted border border-border">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-sm text-foreground truncate pr-4">
                    <span>{p.title}</span>
                    <span className="font-mono text-xs text-foreground-muted font-normal ml-2">{p.path}</span>
                  </div>
                  <span className="font-mono font-black text-sm text-foreground">{p.views}</span>
                </div>
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                  <div style={{ width: `${p.pct}%` }} className="h-full bg-primary rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device & Geo Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Device Split */}
          <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                <span>Enhetsfordeling</span>
              </h3>
              <p className="text-xs text-foreground-muted mt-0.5">Trafikk fordelt på mobil, desktop og nettbrett</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-foreground font-bold"><Smartphone className="w-4 h-4" /> Mobiltelefoner</span>
                  <span className="font-extrabold text-foreground">74.2% (35.8k)</span>
                </div>
                <div className="w-full h-2.5 bg-surface-muted rounded-full overflow-hidden">
                  <div className="w-[74.2%] h-full bg-primary rounded-full"></div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-foreground font-bold"><Monitor className="w-4 h-4" /> Desktop / PC</span>
                  <span className="font-extrabold text-foreground">22.4% (10.8k)</span>
                </div>
                <div className="w-full h-2.5 bg-surface-muted rounded-full overflow-hidden">
                  <div className="w-[22.4%] h-full bg-foreground rounded-full"></div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-bold">Nettbrett</span>
                  <span className="font-extrabold text-foreground">3.4% (1.6k)</span>
                </div>
                <div className="w-full h-2.5 bg-surface-muted rounded-full overflow-hidden">
                  <div className="w-[3.4%] h-full bg-success rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Geo Location */}
          <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
            <div>
              <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-success" />
                <span>Topp Geografiske Områder</span>
              </h3>
              <p className="text-xs text-foreground-muted mt-0.5">Bosted for besøkende</p>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-foreground font-medium">1. Tønsberg & Færder</span>
                <span className="font-bold text-foreground">58%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-foreground font-medium">2. Oslo & Viken</span>
                <span className="font-bold text-foreground">24%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-foreground font-medium">3. Sandefjord & Larvik</span>
                <span className="font-bold text-foreground">12%</span>
              </div>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
