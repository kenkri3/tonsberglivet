'use client';

import { useState } from 'react';
import { Plus, Search, Eye, Pencil, Calendar as CalendarIcon } from 'lucide-react';

const demoEvents = [
  { id: '1', title: 'Bondens marked på Torvet', date: '22. aug', time: '10:00–15:00', location: 'Tønsberg Torv', category: 'Marked', status: 'Publisert' },
  { id: '2', title: 'Konsert i Foynhagen', date: '23. aug', time: '19:00', location: 'Foynhagen', category: 'Konsert', status: 'Publisert' },
  { id: '3', title: 'Tabletop-tirsdag', date: '26. aug', time: '17:00–21:00', location: 'Biblioteket', category: 'Kultur', status: 'Publisert' },
  { id: '4', title: 'Barnas museum', date: '27. aug', time: '11:00–14:00', location: 'Slottsfjellsmuseet', category: 'Barn', status: 'Publisert' },
  { id: '5', title: 'Matlagingskurs — Thai', date: '29. aug', time: '18:00', location: 'Kulturhuset', category: 'Kurs', status: 'Utkast' },
  { id: '6', title: 'Fiksefest', date: '1. sep', time: '12:00–16:00', location: 'Biblioteket', category: 'Kultur', status: 'Planlagt' },
];

export default function ArrangementerPage() {
  const [search, setSearch] = useState('');
  const filtered = demoEvents.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Arrangementer</h2>
          <p className="text-foreground-muted text-sm mt-1">{demoEvents.length} arrangementer</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground
                           rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Nytt arrangement
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
        <input type="search" placeholder="Søk i arrangementer..." value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm
                          text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div className="grid gap-4">
        {filtered.map((event) => (
          <div key={event.id} className="bg-surface rounded-2xl border border-border p-5 flex items-center gap-5
                                         hover:shadow-md transition-all">
            <div className="shrink-0 w-16 h-16 rounded-xl bg-primary-light flex flex-col items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-primary mb-0.5" />
              <span className="text-xs font-bold text-primary">{event.date}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{event.title}</h3>
              <p className="text-sm text-foreground-muted">{event.time} • {event.location}</p>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-1 text-xs bg-primary-light text-primary rounded-full">
              {event.category}
            </span>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
              event.status === 'Publisert' ? 'bg-success-light text-success' :
              event.status === 'Utkast' ? 'bg-surface-muted text-foreground-muted' :
              'bg-accent-light text-accent'
            }`}>{event.status}</span>
            <div className="flex gap-1">
              <button className="p-1.5 text-foreground-subtle hover:text-foreground rounded-lg hover:bg-surface-muted">
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-foreground-subtle hover:text-foreground rounded-lg hover:bg-surface-muted">
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
