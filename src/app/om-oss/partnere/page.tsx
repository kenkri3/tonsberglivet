import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { CheckCircle2, TrendingUp, Users, CalendarDays, BadgeCheck, Tent } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Våre partnere - Tønsberglivet',
  description: 'Bli partner med Tønsberglivet og ta del i utviklingen av Tønsberg.',
};

export default function PartnerePage() {
  return (
    <main className="min-h-screen pb-20">
      <HeroSection 
        title="Våre partnere" 
        subtitle="Sammen for Tønsberg" 
        backgroundGradient="linear-gradient(135deg, #059669, #0E7490)"
        compact={true}
      />

      <div className="container mx-auto px-4 mt-12 space-y-16">
        
        {/* Intro */}
        <section className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Hvorfor bli partner?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Som partner i Tønsberglivet bidrar du direkte til å skape en mer levende og attraktiv by. Samtidig får din bedrift en rekke fordeler og økt synlighet i regionen.
          </p>
        </section>

        {/* Fordeler */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm flex flex-col items-center text-center">
            <TrendingUp className="w-10 h-10 text-emerald-600 mb-4" />
            <h3 className="font-bold text-xl mb-2">Synlighet</h3>
            <p className="text-gray-600 dark:text-gray-400">Profilering på våre flater, i bybildet og under store arrangementer.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm flex flex-col items-center text-center">
            <Users className="w-10 h-10 text-emerald-600 mb-4" />
            <h3 className="font-bold text-xl mb-2">Nettverk</h3>
            <p className="text-gray-600 dark:text-gray-400">Tilgang til et eksklusivt nettverk av lokale bedrifter og beslutningstakere.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm flex flex-col items-center text-center">
            <BadgeCheck className="w-10 h-10 text-emerald-600 mb-4" />
            <h3 className="font-bold text-xl mb-2">Digitalt merke</h3>
            <p className="text-gray-600 dark:text-gray-400">Et kvalitetsstempel som viser at dere støtter byutviklingen.</p>
          </div>
        </section>

        {/* Partner Logo Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-8 text-center">Våre nåværende partnere</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800/50 aspect-video rounded-xl flex items-center justify-center p-4">
                <span className="text-gray-400 dark:text-gray-500 font-medium text-sm">Partner Logo</span>
              </div>
            ))}
          </div>
        </section>

        {/* Lag og Foreninger */}
        <section className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-3xl border border-emerald-100 dark:border-emerald-800/30">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Tent className="w-7 h-7 text-emerald-600" />
                Gratis torgbod for lag og foreninger
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Vi ønsker å legge til rette for frivilligheten i Tønsberg! Frivillige lag og foreninger kan låne gratis plass og bod på torvet for å promotere sine aktiviteter.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" /> Perfekt for vaffelsalg og loddsalg
                </li>
                <li className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" /> Rekruttering av nye medlemmer
                </li>
              </ul>
            </div>
            <div className="w-full md:w-auto">
              <button className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-full transition-colors">
                Søk om torgbod
              </button>
            </div>
          </div>
        </section>

        {/* Bli partner skjema */}
        <section className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Bli partner</h2>
            <form className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Navn</label>
                  <input type="text" className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent" placeholder="Ditt navn" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bedrift</label>
                  <input type="text" className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent" placeholder="Bedriftsnavn" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">E-post</label>
                  <input type="email" className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent" placeholder="din@epost.no" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefon</label>
                  <input type="tel" className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent" placeholder="+47" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Melding</label>
                <textarea rows={4} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent" placeholder="Fortell oss litt om bedriften din..."></textarea>
              </div>
              <button type="button" className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
                Send henvendelse
              </button>
            </form>
          </div>
        </section>

      </div>
    </main>
  );
}
