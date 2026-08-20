'use client';

import { useState } from 'react';
import { 
  Users, CalendarDays, 
  MapPin, Zap, Droplets, 
  ArrowUpRight, X, Building, Check, RefreshCw
} from 'lucide-react';

interface BookingRequest {
  id: string;
  vendor: string;
  orgNr: string;
  spot: string;
  zone: string;
  dates: string;
  duration: string;
  powerNeeded: boolean;
  waterNeeded: boolean;
  pricePerDay: number;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'invoiced';
}

const initialRequests: BookingRequest[] = [
  { id: '1', vendor: 'Foodtruck Spesial AS', orgNr: '928 341 092', spot: 'A1 - Foodtruck Sone', zone: 'Tønsberg Torv', dates: '15. Aug - 18. Aug', duration: '4 dager', powerNeeded: true, waterNeeded: true, pricePerDay: 1850, totalAmount: 7400, status: 'pending' },
  { id: '2', vendor: 'Vestfold Keramikk & Kunst BA', orgNr: '812 492 110', spot: 'B2 - Salgsbod', zone: 'Tønsberg Torv', dates: '16. Aug - 17. Aug', duration: '2 dager', powerNeeded: false, waterNeeded: false, pricePerDay: 950, totalAmount: 1900, status: 'pending' },
  { id: '3', vendor: 'Tønsberg Jazzklubb', orgNr: '991 204 883', spot: 'C1 - Hovedscene', zone: 'Tønsberg Torv', dates: '22. Aug - 24. Aug', duration: '3 dager', powerNeeded: true, waterNeeded: false, pricePerDay: 4500, totalAmount: 13500, status: 'pending' },
  { id: '4', vendor: 'Kystens Ferske Reker AS', orgNr: '914 832 990', spot: 'A3 - Havnebrygga', zone: 'Brygga', dates: '19. Aug - 21. Aug', duration: '3 dager', powerNeeded: true, waterNeeded: true, pricePerDay: 2100, totalAmount: 6300, status: 'approved' },
  { id: '5', vendor: 'Farmand Bondens Marked', orgNr: '984 219 400', spot: 'Hele Torvet', zone: 'Tønsberg Torv', dates: '29. Aug', duration: '1 dag', powerNeeded: true, waterNeeded: true, pricePerDay: 12000, totalAmount: 12000, status: 'invoiced' },
];

const spotsData = [
  { id: 'A1', name: 'Plass A1', type: 'Foodtruck', zone: 'Sone A', power: true, water: true, price: '1 850,- /dag', status: 'pending', vendor: 'Foodtruck Spesial AS' },
  { id: 'A2', name: 'Plass A2', type: 'Foodtruck', zone: 'Sone A', power: true, water: true, price: '1 850,- /dag', status: 'available', vendor: null },
  { id: 'A3', name: 'Plass A3', type: 'Servering', zone: 'Sone A', power: true, water: true, price: '2 100,- /dag', status: 'booked', vendor: 'Kystens Reker' },
  { id: 'B1', name: 'Plass B1', type: 'Salgsbod', zone: 'Sone B', power: false, water: false, price: '950,- /dag', status: 'available', vendor: null },
  { id: 'B2', name: 'Plass B2', type: 'Salgsbod', zone: 'Sone B', power: false, water: false, price: '950,- /dag', status: 'pending', vendor: 'Vestfold Keramikk' },
  { id: 'B3', name: 'Plass B3', type: 'Salgsbod', zone: 'Sone B', power: true, water: false, price: '1 200,- /dag', status: 'booked', vendor: 'Håndverk BA' },
  { id: 'B4', name: 'Plass B4', type: 'Salgsbod', zone: 'Sone B', power: false, water: false, price: '950,- /dag', status: 'available', vendor: null },
  { id: 'C1', name: 'Scene Torvet', type: 'Arrangement', zone: 'Sone C', power: true, water: false, price: '4 500,- /dag', status: 'pending', vendor: 'Jazzklubben' },
  { id: 'D1', name: 'Torgcafé Sone', type: 'Uteservering', zone: 'Sone D', power: true, water: true, price: '3 200,- /dag', status: 'booked', vendor: 'Torv Bistro' },
];

export default function BookingHubPage() {
  const [selectedZone, setSelectedZone] = useState('torvet');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved' | 'invoiced'>('all');
  const [requests, setRequests] = useState<BookingRequest[]>(initialRequests);
  const [selectedSpot, setSelectedSpot] = useState<typeof spotsData[0] | null>(spotsData[0]);

  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
  };

  const filteredRequests = requests.filter(r => {
    if (filterTab === 'all') return true;
    return r.status === filterTab;
  });

  const totalRevenue = requests
    .filter(r => r.status === 'approved' || r.status === 'invoiced')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  return (
    <div className="space-y-12 pb-16">
      
      {/* ── Seksjon 1: KPI & Nøkkeltall ── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">Kapasitet & Torvstatistikk</h2>
            <p className="text-xs text-foreground-muted mt-0.5">Oversikt over leieinntekter, strøm og godkjenninger</p>
          </div>
          <span className="text-xs font-bold text-success bg-success-light px-3 py-1 rounded-full">
            Live Booking Engine
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Månedlig Leie</span>
              <div className="w-9 h-9 rounded-xl bg-success-light text-success flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight">{totalRevenue.toLocaleString('no-NO')} kr</div>
              <div className="flex items-center gap-1 text-xs font-bold text-success mt-1">
                <ArrowUpRight className="w-4 h-4" /> +24% denne mnd
              </div>
            </div>
            <div className="pt-3 border-t border-border text-xs text-foreground-muted">
              Synkronisert med Duett ERP
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Ventende Søknader</span>
              <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight">
                {requests.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-xs font-bold text-primary mt-1">
                Krever godkjenning
              </div>
            </div>
            <div className="pt-3 border-t border-border text-xs text-foreground-muted">
              Matboder, salgsboder og scener
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Kapasitetsgrad</span>
              <div className="w-9 h-9 rounded-xl bg-surface-muted text-foreground flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight">84%</div>
              <div className="text-xs font-bold text-success mt-1">
                Høy etterspørsel
              </div>
            </div>
            <div className="pt-3 border-t border-border text-xs text-foreground-muted">
              Uke 33 & 34 er fullbooket
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Strøm & Vann</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tight">12 / 14</div>
              <div className="text-xs font-bold text-amber-500 mt-1">
                Strømuttak i drift
              </div>
            </div>
            <div className="pt-3 border-t border-border text-xs text-foreground-muted">
              400V / 32A tilgjengelig
            </div>
          </div>

        </div>
      </section>

      {/* ── Seksjon 2: Interaktivt Byrom-kart ── */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span>Interaktivt Byrom-kart & Soneoversikt</span>
            </h2>
            <p className="text-xs text-foreground-muted mt-0.5">Klikk på en standplass for å inspisere fasiliteter, leietaker og status</p>
          </div>

          {/* Area switcher */}
          <div className="flex items-center gap-2 bg-surface-muted p-1.5 rounded-2xl border border-border">
            {[
              { id: 'torvet', label: 'Tønsberg Torv' },
              { id: 'brygga', label: 'Brygga & Havna' },
              { id: 'foynhagen', label: 'Foynhagen' },
            ].map(area => (
              <button
                key={area.id}
                onClick={() => setSelectedZone(area.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedZone === area.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                {area.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Layout Split */}
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-surface border border-border rounded-3xl shadow-xs">
          
          {/* Left: Interactive Grid Map (8 cols) */}
          <div className="lg:col-span-8 bg-surface-muted border border-border rounded-2xl p-6 relative space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">Soneoversikt: {selectedZone.toUpperCase()}</span>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-success font-bold"><span className="w-2.5 h-2.5 rounded-full bg-success"></span> Ledig</span>
                <span className="flex items-center gap-1.5 text-primary font-bold"><span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Venter</span>
                <span className="flex items-center gap-1.5 text-foreground font-bold"><span className="w-2.5 h-2.5 rounded-full bg-foreground"></span> Booket</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {spotsData.map(spot => {
                const isSelected = selectedSpot?.id === spot.id;
                let bgClass = 'bg-surface border-border hover:border-foreground-muted';
                if (spot.status === 'available') bgClass = 'bg-success-light/30 border-success/30 hover:border-success';
                if (spot.status === 'pending') bgClass = 'bg-primary-light/30 border-primary/30 hover:border-primary';
                if (spot.status === 'booked') bgClass = 'bg-surface border-border opacity-80';
                if (isSelected) bgClass += ' ring-2 ring-primary shadow-md';

                return (
                  <div
                    key={spot.id}
                    onClick={() => setSelectedSpot(spot)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-32 ${bgClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-foreground">{spot.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        spot.status === 'available' ? 'bg-success-light text-success' :
                        spot.status === 'pending' ? 'bg-primary-light text-primary' :
                        'bg-surface-muted text-foreground'
                      }`}>
                        {spot.status === 'available' ? 'Ledig' : spot.status === 'pending' ? 'Søknad' : 'Opptatt'}
                      </span>
                    </div>

                    <div className="text-xs text-foreground-muted truncate">
                      {spot.vendor ? spot.vendor : spot.type}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-foreground-muted pt-2 border-t border-border">
                      {spot.power && <span title="Strøm 32A"><Zap className="w-3.5 h-3.5 text-amber-500" /></span>}
                      {spot.water && <span title="Vannuttak"><Droplets className="w-3.5 h-3.5 text-sky-500" /></span>}
                      <span className="ml-auto font-mono text-[11px] font-bold text-foreground">{spot.price}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Spot Inspector (4 cols) */}
          <div className="lg:col-span-4 bg-surface-muted border border-border rounded-2xl p-6 flex flex-col justify-between space-y-6">
            {selectedSpot ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{selectedSpot.name}</h3>
                    <p className="text-xs text-foreground-muted mt-0.5">{selectedSpot.zone} • {selectedSpot.type}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                    selectedSpot.status === 'available' ? 'bg-success-light text-success' :
                    selectedSpot.status === 'pending' ? 'bg-primary-light text-primary' :
                    'bg-surface text-foreground'
                  }`}>
                    {selectedSpot.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-foreground-muted">Døgnleie:</span>
                    <span className="font-bold text-foreground">{selectedSpot.price}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-foreground-muted">Nåværende leietaker:</span>
                    <span className="font-bold text-foreground">{selectedSpot.vendor || 'Ingen (Ledig)'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-foreground-muted">Strømforsyning:</span>
                    <span className="font-bold text-foreground">{selectedSpot.power ? '400V / 32A inkludert' : 'Ikke tilgjengelig'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-foreground-muted">Vann & Avløp:</span>
                    <span className="font-bold text-foreground">{selectedSpot.water ? 'Ja, godkjent for mat' : 'Nei'}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md transition-all">
                    Reserver denne plassen
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-foreground-muted">
                Velg en plass på kartet for å se detaljer.
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ── Seksjon 3: Søknader & Godkjenning ── */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">Søknader & Plassforespørsler</h2>
            <p className="text-xs text-foreground-muted mt-0.5">Godkjenn, avslå eller overfør direkte til Duett ERP for EHF-fakturering</p>
          </div>

          <div className="flex items-center gap-2 bg-surface-muted p-1.5 rounded-2xl border border-border">
            {(['all', 'pending', 'approved', 'invoiced'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterTab === tab
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                {tab === 'all' ? 'Alle' : tab === 'pending' ? 'Venter' : tab === 'approved' ? 'Godkjent' : 'Fakturert'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-muted text-foreground uppercase font-bold border-b border-border">
                <tr>
                  <th className="px-6 py-4">Aktør / Leietaker</th>
                  <th className="px-6 py-4">Plass & Sone</th>
                  <th className="px-6 py-4">Datoer</th>
                  <th className="px-6 py-4">Fasiliteter</th>
                  <th className="px-6 py-4">Beløp (Eks. MVA)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Handling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">{req.vendor}</div>
                      <div className="text-[11px] text-foreground-muted font-mono mt-0.5">Org: {req.orgNr}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{req.spot}</div>
                      <div className="text-[11px] text-foreground-muted mt-0.5">{req.zone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{req.dates}</div>
                      <div className="text-[11px] text-foreground-muted mt-0.5">{req.duration}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {req.powerNeeded && <span title="Strøm"><Zap className="w-4 h-4 text-amber-500" /></span>}
                        {req.waterNeeded && <span title="Vann"><Droplets className="w-4 h-4 text-sky-500" /></span>}
                        {!req.powerNeeded && !req.waterNeeded && <span className="text-foreground-muted">-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-foreground">
                      {req.totalAmount.toLocaleString('no-NO')} kr
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                        req.status === 'approved' ? 'bg-success-light text-success border border-success/20' :
                        req.status === 'pending' ? 'bg-primary-light text-primary border border-primary/20' :
                        req.status === 'invoiced' ? 'bg-surface-muted text-foreground border border-border' :
                        'bg-error-light text-error border border-error/20'
                      }`}>
                        {req.status === 'approved' ? 'Godkjent' : req.status === 'pending' ? 'Venter' : req.status === 'invoiced' ? 'Fakturert' : 'Avslått'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs transition-all shadow-xs"
                          >
                            Godkjenn
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="p-1.5 bg-surface-muted hover:bg-error-light text-foreground-muted hover:text-error rounded-xl transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-foreground-muted font-mono">Fullført</span>
                      )}
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
