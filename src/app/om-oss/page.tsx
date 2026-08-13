import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { Users, Target, Building2, CalendarHeart, Handshake, Link as LinkIcon, Heart } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Om Oss - Tønsberglivet',
  description: 'Bli kjent med Tønsberglivet AS, vårt samfunnsoppdrag og organisering.',
};

export default function OmOssPage() {
  return (
    <main className="min-h-screen pb-20">
      <HeroSection 
        title="Om Tønsberglivet" 
        subtitle="Hvem er vi?" 
        backgroundGradient="linear-gradient(135deg, #1E3A5F, #0F172A)"
        compact={true}
      />

      <div className="container mx-auto px-4 mt-12 space-y-16">
        
        {/* Om Selskapet & Samfunnsoppdraget */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              Selskapet
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Tønsberglivet AS er et aksjeselskap med ikke-økonomisk formål (uten utbytte). Vårt hovedmål er å utvikle regionen og skape et levende by- og næringsliv i Tønsberg.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Alt overskudd reinvesteres i aktiviteter og prosjekter som kommer byen til gode.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              Samfunnsoppdraget
            </h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-medium">Mer stolthet</span>
              </li>
              <li className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-medium">Mer synlighet</span>
              </li>
              <li className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-medium">Mer liv</span>
              </li>
              <li className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-medium">Mer kraft</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Organisering */}
        <section>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Handshake className="w-6 h-6 text-blue-600" />
              Organisering
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
              Tønsberglivet er et unikt spleiselag og samarbeidsprosjekt mellom Tønsberg kommune, det lokale næringslivet, gårdeiere og andre sentrale aktører i regionen. Sammen bygger vi fremtidens Tønsberg.
            </p>
          </div>
        </section>

        {/* Team og Styre */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Ansatte
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div>
                    <h3 className="font-semibold">Navn Navnesen</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tittel / Rolle</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Styret
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div>
                    <h3 className="font-semibold text-sm">Styremedlem</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Representerer X</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Aktiviteter */}
        <section>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CalendarHeart className="w-6 h-6 text-blue-600" />
              Våre aktiviteter
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <h3 className="font-semibold mb-2">Tønsbergdagen</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Vår store byfest som samler tusenvis av besøkende hvert år.</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <h3 className="font-semibold mb-2">Markeder</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Organisering av Bondens marked, julemarked og andre torvaktiviteter.</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <h3 className="font-semibold mb-2">Julepynting</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ansvarlig for den magiske julebelysningen i byens gater.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Lenker */}
        <section className="flex flex-wrap gap-4 justify-center py-8">
          <Link href="/om-oss/partnere" className="flex items-center gap-2 px-6 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium">
            <LinkIcon className="w-4 h-4" /> Våre partnere
          </Link>
          <Link href="/kontakt" className="flex items-center gap-2 px-6 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium">
            <LinkIcon className="w-4 h-4" /> Kontakt oss
          </Link>
          <a href="#" className="flex items-center gap-2 px-6 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium">
            <LinkIcon className="w-4 h-4" /> Presserom
          </a>
        </section>

      </div>
    </main>
  );
}
