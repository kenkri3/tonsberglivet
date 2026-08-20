'use client';

import { useState } from 'react';
import { 
  Plus, ArrowUpRight, Megaphone, Camera, Users, 
  Tv, Send, Play
} from 'lucide-react';

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'screens' | 'social'>('campaigns');

  const screens = [
    { id: '1', name: 'Torvet Storskjerm', location: 'Tønsberg Torv (Sone C)', resolution: '3840 x 2160 (4K LED)', status: 'online', currentSpot: 'Sommer i Tønsberg 2026', loopInterval: '180 sek', image: '/images/hero.jpg' },
    { id: '2', name: 'Kanalen & Brygga Display', location: 'Nedre Langgate / Brygga', resolution: '1920 x 1080 (FHD High-Bright)', status: 'online', currentSpot: 'Færderbiennalen Kulturinfo', loopInterval: '120 sek', image: '/images/brygge.jpg' },
    { id: '3', name: 'Kaldnes Gangbru Display', location: 'Kaldnes Brygge', resolution: '1920 x 1080 (FHD LED)', status: 'online', currentSpot: 'Matmarked & Torvleie', loopInterval: '90 sek', image: '/images/food.jpg' },
  ];

  const campaigns = [
    { name: 'Sommer i Tønsberg 2026', channels: ['Instagram', 'Meta Ads', 'Byskjermer'], status: 'Aktiv', budget: '25 000 kr', spent: '16 400 kr', reach: '84 200', ctr: '3.8%' },
    { name: 'Spis Ute Uka – Smak på Byen', channels: ['Nyhetsbrev', 'Facebook', 'Nettside'], status: 'Aktiv', budget: '8 000 kr', spent: '6 100 kr', reach: '32 900', ctr: '5.2%' },
    { name: 'Studentvelkomst & Campus Vestfold', channels: ['Snapchat', 'Instagram Reels'], status: 'Planlagt', budget: '15 000 kr', spent: '0 kr', reach: '–', ctr: '–' },
    { name: 'Gründergata Handlekampanje', channels: ['Facebook', 'Byskjermer'], status: 'Aktiv', budget: '12 000 kr', spent: '9 800 kr', reach: '41 500', ctr: '4.1%' },
  ];

  return (
    <div className="space-y-12 pb-16">
      
      {/* ── Seksjon 1: KPI & Nøkkeltall ── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">Markedsføring & Distribusjon</h2>
            <p className="text-xs text-foreground-muted mt-0.5">Samlet oversikt over rekkevidde, følgere og byskjermnettverk</p>
          </div>
          <span className="text-xs font-bold text-primary bg-primary-light px-3 py-1 rounded-full">
            Omni-Channel Engine
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Digital Rekkevidde</span>
              <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                <Megaphone className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight">184 200</div>
              <div className="flex items-center gap-1 text-xs font-bold text-success mt-1">
                <ArrowUpRight className="w-4 h-4" /> +16.4% denne mnd
              </div>
            </div>
            <div className="pt-3 border-t border-border text-xs text-foreground-muted">
              På tvers av alle kanaler
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Instagram Følgere</span>
              <div className="w-9 h-9 rounded-xl bg-surface-muted text-foreground flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight">28.4k</div>
              <div className="flex items-center gap-1 text-xs font-bold text-success mt-1">
                <ArrowUpRight className="w-4 h-4" /> +840 nye
              </div>
            </div>
            <div className="pt-3 border-t border-border text-xs text-foreground-muted">
              6.4% gj.snittlig engasjement
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Byskjermnettverk</span>
              <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                <Tv className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight">3 / 3</div>
              <div className="text-xs font-bold text-success mt-1">
                100% Oppetid
              </div>
            </div>
            <div className="pt-3 border-t border-border text-xs text-foreground-muted">
              Torvet, Kanalen og Kaldnes
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Nyhetsbrev Abonnenter</span>
              <div className="w-9 h-9 rounded-xl bg-success-light text-success flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight">8 450</div>
              <div className="text-xs font-bold text-success mt-1">
                48.2% åpningsrate
              </div>
            </div>
            <div className="pt-3 border-t border-border text-xs text-foreground-muted">
              Utsending hver torsdag kl. 10
            </div>
          </div>

        </div>
      </section>

      {/* ── Seksjon 2: Kanalstyring & Moduler ── */}
      <section className="space-y-6">
        
        {/* Navigation Tabs & Quick Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-border">
          <div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">Kampanjer & Kanaler</h2>
            <p className="text-xs text-foreground-muted mt-0.5">Administrer DoOH byskjermer, annonser og sosiale medier</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-surface-muted p-1.5 rounded-2xl border border-border">
              {[
                { id: 'campaigns', label: 'Aktive Kampanjer (4)' },
                { id: 'screens', label: 'Digitalt Skjermnettverk (3)' },
                { id: 'social', label: 'Sosiale Medier & Nyhetsbrev' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md transition-all shrink-0">
              <Plus className="w-4 h-4" />
              <span>Ny Kampanje</span>
            </button>
          </div>
        </div>

        {/* ── Tab View: Screens Network ── */}
        {activeTab === 'screens' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {screens.map(screen => (
              <div key={screen.id} className="bg-surface border border-border rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all space-y-6">
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img src={screen.image} alt={screen.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-surface/95 backdrop-blur-md border border-border text-[10px] font-black text-success flex items-center gap-2 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                    STREAMER LIVE
                  </div>
                  <div className="absolute bottom-4 right-4 px-3 py-1 rounded-lg bg-slate-900/85 backdrop-blur-md text-white text-xs font-mono font-bold">
                    {screen.resolution}
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-4">
                  <div>
                    <h3 className="font-extrabold text-lg text-foreground">{screen.name}</h3>
                    <p className="text-xs text-foreground-muted mt-0.5">{screen.location}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-muted border border-border space-y-1.5 text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">Aktiv Spot i Rotasjon:</div>
                    <div className="font-extrabold text-sm text-foreground truncate flex items-center gap-2">
                      <Play className="w-3.5 h-3.5 text-primary" />
                      <span>{screen.currentSpot}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-border">
                    <span className="text-foreground-muted">Rotasjonstid:</span>
                    <span className="font-mono font-bold text-foreground">{screen.loopInterval}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab View: Campaigns ── */}
        {activeTab === 'campaigns' && (
          <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted text-foreground uppercase font-bold border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Kampanjenavn</th>
                    <th className="px-6 py-4">Kanaler</th>
                    <th className="px-6 py-4">Budsjett / Brukt</th>
                    <th className="px-6 py-4">Rekkevidde</th>
                    <th className="px-6 py-4">CTR</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {campaigns.map((c, i) => (
                    <tr key={i} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground text-sm">{c.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {c.channels.map((ch, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-surface-muted text-foreground rounded-lg text-xs font-semibold border border-border">
                              {ch}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-foreground">
                        {c.spent} / {c.budget}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-foreground">{c.reach}</td>
                      <td className="px-6 py-4 font-mono font-bold text-success">{c.ctr}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                          c.status === 'Aktiv' ? 'bg-success-light text-success border border-success/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab View: Social Media & Newsletter ── */}
        {activeTab === 'social' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  <span>Instagram & Meta Kanaler</span>
                </h3>
                <p className="text-xs text-foreground-muted mt-0.5">Direkte publiseringsplan for @tonsberglivet</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-surface-muted border border-border flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-sm text-foreground">Slottsfjellet Kveldsvandring</div>
                    <div className="text-[11px] text-foreground-muted mt-0.5">Reels / Video • I morgen kl. 18:00</div>
                  </div>
                  <span className="px-3 py-1 rounded-lg text-[10px] font-bold bg-primary-light text-primary">Klar</span>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                  <Send className="w-5 h-5 text-success" />
                  <span>Ukentlig Nyhetsbrev</span>
                </h3>
                <p className="text-xs text-foreground-muted mt-0.5">Sendes til 8 450 abonnenter hver torsdag</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-surface-muted border border-border flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-sm text-foreground">«Dette skjer i helgen i Tønsberg»</div>
                    <div className="text-[11px] text-foreground-muted mt-0.5">Utsending: Torsdag kl. 10:00</div>
                  </div>
                  <span className="px-3 py-1 rounded-lg text-[10px] font-bold bg-success-light text-success border border-success/20">Klargjort</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </section>

    </div>
  );
}
