import { FolderOpen, Plus } from 'lucide-react';

const demoProsjekter = [
  { title: 'Barn i byen', status: 'Aktiv', description: 'Kunstprosjekter med barnehager i sentrum' },
  { title: 'Bondens marked', status: 'Aktiv', description: 'Lokale bønder og håndverkere på Torvet' },
  { title: 'Jul i Tønsberg', status: 'Kommende', description: 'Julebelysning, vinduspynting og konserter' },
  { title: 'Nyt Tønsberg', status: 'Aktiv', description: 'Mat- og opplevelseuker i regionen' },
  { title: 'Tønsbergdagen', status: 'Kommende', description: 'Byens største handelsdag siden 1974' },
];

export default function ProsjekterAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Prosjekter</h2>
          <p className="text-foreground-muted text-sm mt-1">{demoProsjekter.length} prosjekter</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground
                           rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Nytt prosjekt
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {demoProsjekter.map((p, i) => (
          <div key={i} className="bg-surface rounded-2xl border border-border p-6
                                   hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-primary-light">
                <FolderOpen className="w-5 h-5 text-primary" />
              </div>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                p.status === 'Aktiv' ? 'bg-success-light text-success' : 'bg-accent-light text-accent'
              }`}>{p.status}</span>
            </div>
            <h3 className="font-semibold text-foreground mb-1">{p.title}</h3>
            <p className="text-sm text-foreground-muted">{p.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
