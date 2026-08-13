'use client';

import { useState } from 'react';
import { HeroSection } from '@/components/ui/HeroSection';
import { EventCard } from '@/components/ui/Cards';
import { Calendar, Filter } from 'lucide-react';

const categories = ['Alle', 'Kultur', 'Mat & Drikke', 'Familie', 'Næring'];

const demoEvents = [
  { id: 1, title: 'Bondens marked på Torvet', date: '22. aug 2026', time: '10:00', location: 'Torvet, Tønsberg', category: 'Mat & Drikke', imageAlt: 'Bondens marked' },
  { id: 2, title: 'Konsert i Foynhagen', date: '23. aug 2026', time: '20:00', location: 'Foynhagen', category: 'Kultur', imageAlt: 'Konsert scene' },
  { id: 3, title: 'Tabletop-tirsdag', date: '26. aug 2026', time: '18:00', location: 'Tønsberg Bibliotek', category: 'Kultur', imageAlt: 'Brettspill' },
  { id: 4, title: 'Barnas museum', date: '27. aug 2026', time: '11:00', location: 'Slottsfjellsmuseet', category: 'Familie', imageAlt: 'Barn på museum' },
  { id: 5, title: 'Språktrening på biblioteket', date: '28. aug 2026', time: '17:00', location: 'Tønsberg Bibliotek', category: 'Kultur', imageAlt: 'Folk som prater sammen' },
  { id: 6, title: 'Matlagingskurs', date: '29. aug 2026', time: '16:00', location: 'Kulturhuset', category: 'Mat & Drikke', imageAlt: 'Matlaging' },
  { id: 7, title: 'Sommergøy i parken', date: '30. aug 2026', time: '12:00', location: 'Kaldnes', category: 'Familie', imageAlt: 'Parkaktivitet' },
  { id: 8, title: 'Fiksefest', date: '01. sep 2026', time: '14:00', location: 'Stasjonen', category: 'Kultur', imageAlt: 'Reparasjon av klær' },
];

export default function EventerClient() {
  const [activeCategory, setActiveCategory] = useState('Alle');

  const filteredEvents = activeCategory === 'Alle' 
    ? demoEvents 
    : demoEvents.filter(e => e.category === activeCategory);

  return (
    <main className="min-h-screen pb-20">
      <HeroSection 
        title="Hva skjer?" 
        subtitle="Arrangementer i Tønsberg" 
        backgroundGradient="linear-gradient(135deg, #1D4ED8, #7C3AED)"
        compact={true}
      />
      
      <div className="container mx-auto px-4 mt-8 md:mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm mb-8 gap-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 w-full md:w-auto">
            <Calendar className="w-5 h-5" />
            <input type="month" className="bg-transparent border-none outline-none" defaultValue="2026-08" />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <Filter className="w-5 h-5 text-gray-400 mr-2" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredEvents.map((event) => (
            <EventCard 
              key={event.id}
              title={event.title}
              date={event.date}
              time={event.time}
              location={event.location}
              category={event.category}
              href={`/eventer/${event.id}`}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
