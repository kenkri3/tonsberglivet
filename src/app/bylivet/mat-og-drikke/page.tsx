import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { Utensils, Coffee, Sun, Wine, Star } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mat & Drikke i Tønsberg | Tønsberglivet',
  description: 'Bryggeservering, koselige kaffebarer og prisvinnende restauranter i Tønsberg.',
};

const venues = [
  { name: 'Kafé Nansen', category: 'Kafé & Lunsj', desc: 'Nyåpnet hyggelig møteplass midt på Torvet med fantastisk kaffe og bakevarer.', area: 'Torvet' },
  { name: 'Esmeralda', category: 'Restaurant & Uteservering', desc: 'Italiensk gastronomi og klassiske retter rett ved Bryggekanten.', area: 'Tønsberg Brygge' },
  { name: 'Havariet', category: 'Bar & Gastropub', desc: 'Levende stemning, god mat og drikke hele uken.', area: 'Brygga' },
  { name: 'Foynhagen', category: 'Uteservering & Konsert', desc: 'Byens mest kjente sommerarena for utendørs konsertopplevelser og god mat.', area: 'Brygga' },
  { name: 'Papirhuset', category: 'Kultur & Spisested', desc: 'Koselig atmosfære og deilige lunsjretter.', area: 'Sentrum' },
  { name: 'Roar i Bua', category: 'Sjømat', desc: 'Fersk sjømat, reker og fiskekaker direkte fra bryggekanten.', area: 'Kaldnes / Brygga' },
];

export default function MatOgDrikkePage() {
  return (
    <main className="min-h-screen pb-20">
      <HeroSection
        title="Mat & Drikke"
        subtitle="Uteservering på Brygga & Lokale Smaker"
        description="Nyt nydelig mat fra byens beste restauranter, slapp av på koselige kaffebarer eller opplev den unike bryggestemningen i Tønsberg."
        backgroundGradient="linear-gradient(135deg, #D97706, #F59E0B)"
        compact={true}
      />

      <div className="container mx-auto px-4 mt-12 space-y-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {venues.map((v, idx) => (
            <div key={idx} className="bg-surface rounded-2xl border border-border p-6 space-y-3 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {v.category}
                </span>
                <span className="text-xs font-semibold text-foreground-subtle">{v.area}</span>
              </div>
              <h3 className="font-bold text-lg text-foreground">{v.name}</h3>
              <p className="text-sm text-foreground-muted leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA for Arrangementer */}
        <div className="bg-gradient-to-r from-primary to-blue-700 text-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-2xl font-bold mb-2">Hva skjer på matfronten?</h3>
            <p className="text-blue-100 text-sm max-w-lg">
              Sjekk arrangementskalenderen for matfestivaler, vin-smakinger og konserter i Foynhagen.
            </p>
          </div>
          <Link
            href="/eventer"
            className="px-6 py-3.5 bg-white text-primary font-bold rounded-xl hover:bg-blue-50 transition-colors shrink-0 shadow-md"
          >
            Se Arrangementer
          </Link>
        </div>
      </div>
    </main>
  );
}
