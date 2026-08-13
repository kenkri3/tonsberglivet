import { Users, Plus, ExternalLink } from 'lucide-react';

const demoPartnere = [
  { name: 'Tønsberg Kommune', level: 'Premium', website: 'tonsberg.kommune.no' },
  { name: 'Færder Kommune', level: 'Premium', website: 'faerder.kommune.no' },
  { name: 'SpareBank 1 BV', level: 'Premium', website: 'sparebank1.no' },
  { name: 'Farmannstredet', level: 'Standard', website: 'farmannstredet.no' },
  { name: 'Quality Hotel Tønsberg', level: 'Standard', website: 'nordicchoicehotels.no' },
  { name: 'USN', level: 'Standard', website: 'usn.no' },
];

export default function PartnerePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Partnere</h2>
          <p className="text-foreground-muted text-sm mt-1">52 aktive partnere • 2 nye søknader</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground
                           rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Ny partner
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {demoPartnere.map((p, i) => (
          <div key={i} className="bg-surface rounded-2xl border border-border p-6
                                   hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                p.level === 'Premium' ? 'bg-accent-light text-accent' : 'bg-surface-muted text-foreground-muted'
              }`}>{p.level}</span>
            </div>
            <h3 className="font-semibold text-foreground mb-1">{p.name}</h3>
            <a href={`https://${p.website}`} target="_blank" rel="noopener"
               className="text-sm text-primary flex items-center gap-1 hover:underline">
              {p.website} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
