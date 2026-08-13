import { MessageSquare, Mail, Eye, Trash2 } from 'lucide-react';

const demoMeldinger = [
  { id: '1', name: 'Erik Larsen', email: 'erik@gmail.com', subject: 'Forespørsel om annonsering', date: '12. aug', read: false },
  { id: '2', name: 'Maria Johansen', email: 'maria@firma.no', subject: 'Interesse for partnerskap', date: '11. aug', read: false },
  { id: '3', name: 'Tønsberg Turistkontor', email: 'info@tourist.no', subject: 'Samarbeid om reiselivsguide', date: '10. aug', read: false },
  { id: '4', name: 'Vestfold Avis', email: 'tips@va.no', subject: 'Presseforespørsel – Tønsbergdagen', date: '8. aug', read: true },
  { id: '5', name: 'Lise Berg', email: 'lise.berg@hotmail.com', subject: 'Spørsmål om gavekort', date: '6. aug', read: true },
];

export default function MeldingerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Meldinger</h2>
        <p className="text-foreground-muted text-sm mt-1">
          {demoMeldinger.filter((m) => !m.read).length} uleste av {demoMeldinger.length} totalt
        </p>
      </div>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden divide-y divide-border">
        {demoMeldinger.map((m) => (
          <div key={m.id} className={`px-6 py-4 flex items-center gap-4 hover:bg-surface-muted transition-colors cursor-pointer ${
            !m.read ? 'bg-primary-light/30' : ''
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              !m.read ? 'bg-primary text-primary-foreground' : 'bg-surface-muted text-foreground-muted'
            }`}>
              <Mail className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${!m.read ? 'font-bold text-foreground' : 'font-medium text-foreground'}`}>
                  {m.name}
                </span>
                <span className="text-xs text-foreground-subtle">{m.date}</span>
              </div>
              <p className={`text-sm truncate ${!m.read ? 'text-foreground' : 'text-foreground-muted'}`}>
                {m.subject}
              </p>
              <p className="text-xs text-foreground-subtle">{m.email}</p>
            </div>
            {!m.read && (
              <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
