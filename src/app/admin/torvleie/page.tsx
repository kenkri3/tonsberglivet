import { MapPin, Clock, Check, X as XIcon, AlertCircle } from 'lucide-react';

const demoBookings = [
  { id: '1', name: 'Tønsberg Frukt AS', email: 'post@tonsbergfrukt.no', type: 'Sesong', dates: 'Jun–Aug 2026', status: 'Ny' },
  { id: '2', name: 'Vestfold Håndverk', email: 'info@vh.no', type: 'Dagplass', dates: '22. aug 2026', status: 'Godkjent' },
  { id: '3', name: 'Lokale Bønder Tønsberg', email: 'lbt@gmail.com', type: 'Helår', dates: '2026–2027', status: 'Under behandling' },
  { id: '4', name: 'Røde Kors Tønsberg', email: 'tonsberg@rodekors.no', type: 'Dagplass', dates: '15. sep 2026', status: 'Godkjent' },
];

export default function TorvleiePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Torvleie-forespørsler</h2>
        <p className="text-foreground-muted text-sm mt-1">{demoBookings.length} forespørsler</p>
      </div>

      <div className="grid gap-4">
        {demoBookings.map((b) => (
          <div key={b.id} className="bg-surface rounded-2xl border border-border p-5
                                     flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{b.name}</h3>
              <p className="text-sm text-foreground-muted">{b.email}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-foreground-subtle">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.dates}</span>
                <span className="px-2 py-0.5 bg-accent-light text-accent rounded-full">{b.type}</span>
              </div>
            </div>
            <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${
              b.status === 'Godkjent' ? 'bg-success-light text-success' :
              b.status === 'Ny' ? 'bg-primary-light text-primary' :
              'bg-accent-light text-accent'
            }`}>{b.status}</span>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg bg-success-light text-success hover:bg-success hover:text-white transition-colors"
                      title="Godkjenn">
                <Check className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg bg-error-light text-error hover:bg-error hover:text-white transition-colors"
                      title="Avslå">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
