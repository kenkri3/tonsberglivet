import { Building2, Plus, Search } from 'lucide-react';

const demoBedrifter = [
  { name: 'Kafe Nansen', category: 'Mat & drikke', area: 'Tønsberg sentrum', status: true },
  { name: 'Farmannstredet', category: 'Shopping', area: 'Tønsberg sentrum', status: true },
  { name: 'Hotel Klubben', category: 'Overnatting', area: 'Tønsberg sentrum', status: true },
  { name: 'Haugar Kunstmuseum', category: 'Kultur', area: 'Tønsberg sentrum', status: true },
  { name: 'Engø Gård', category: 'Overnatting', area: 'Færder kommune', status: true },
  { name: 'Slottsfjellsmuseet', category: 'Kultur', area: 'Tønsberg sentrum', status: false },
];

export default function BedrifterPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bedrifter</h2>
          <p className="text-foreground-muted text-sm mt-1">312 bedrifter registrert</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground
                           rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Ny bedrift
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted">
              <th className="text-left px-6 py-3 font-medium text-foreground-muted">Bedrift</th>
              <th className="text-left px-6 py-3 font-medium text-foreground-muted hidden sm:table-cell">Kategori</th>
              <th className="text-left px-6 py-3 font-medium text-foreground-muted hidden md:table-cell">Område</th>
              <th className="text-left px-6 py-3 font-medium text-foreground-muted">Synlig</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {demoBedrifter.map((b, i) => (
              <tr key={i} className="hover:bg-surface-muted transition-colors">
                <td className="px-6 py-4 font-medium text-foreground flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  {b.name}
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <span className="px-2.5 py-1 text-xs bg-accent-light text-accent rounded-full">{b.category}</span>
                </td>
                <td className="px-6 py-4 text-foreground-muted hidden md:table-cell">{b.area}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    b.status ? 'bg-success-light text-success' : 'bg-surface-muted text-foreground-muted'
                  }`}>{b.status ? 'Ja' : 'Nei'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
