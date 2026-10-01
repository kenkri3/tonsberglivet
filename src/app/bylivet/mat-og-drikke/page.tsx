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
    <main className="min-h-screen pb-20 bg-background">
      <HeroSection
        title="Mat & Drikke"
        subtitle="Uteservering på Brygga & Lokale Smaker"
        description="Nyt nydelig mat fra byens beste restauranter, slapp av på koselige kaffebarer eller opplev den unike bryggestemningen i Tønsberg."
        backgroundGradient="linear-gradient(135deg, #b45309 0%, #d97706 50%, #16193d 100%)"
        compact={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-16 space-y-12 sm:space-y-16">
        
        {/* Featured Photo Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-surface rounded-3xl p-6 sm:p-10 border border-border/80 shadow-md">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
              Gastronomi & Bryggeliv
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Uteservering i Norges eldste by
            </h2>
            <p className="text-foreground-muted text-sm sm:text-base leading-relaxed font-light">
              Tønsberg Brygge er kjent som en av landets mest pulserende mat- og utelivsstriper. Enten du ønsker ferske reker på bryggekanten, italiensk steinovnspizza eller gourmetopplevelser i historiske omgivelser, har byen noe for enhver gane.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-muted text-foreground-muted">
                <Utensils className="w-3.5 h-3.5 text-amber-500" /> Over 40 serveringssteder
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-muted text-foreground-muted">
                <Sun className="w-3.5 h-3.5 text-amber-500" /> Kveldssol på brygga
              </span>
            </div>
          </div>
          <div className="lg:col-span-5 relative aspect-[16/10] rounded-2xl overflow-hidden shadow-lg border border-border">
            <img 
              src="/images/tonsberg/mat_og_drikke_tonsberg.jpg" 
              alt="Matopplevelser og uteservering på Tønsberg Brygge" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((v, idx) => (
            <div key={idx} className="bg-surface rounded-3xl border border-border/80 p-6 sm:p-7 space-y-3 hover:shadow-xl hover:border-amber-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                    {v.category}
                  </span>
                  <span className="text-xs font-semibold text-foreground-subtle">{v.area}</span>
                </div>
                <h3 className="font-bold text-xl text-foreground mb-2">{v.name}</h3>
                <p className="text-sm text-foreground-muted leading-relaxed font-light">{v.desc}</p>
              </div>
              <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs text-foreground-subtle">
                <span>Sentrum / Brygga</span>
                <span className="text-primary font-semibold">Tønsberglivet partner</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA for Arrangementer */}
        <div className="bg-gradient-to-r from-primary via-blue-700 to-indigo-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Hva skjer på matfronten?</h3>
            <p className="text-blue-100 text-sm sm:text-base max-w-xl font-light">
              Sjekk arrangementskalenderen for Spis Ute Uka, matmarkeder, vin-smakinger og sommerens konserter i Foynhagen.
            </p>
          </div>
          <Link
            href="/eventer"
            className="px-8 py-4 bg-white text-slate-900 font-bold text-sm rounded-2xl hover:bg-slate-100 transition-all shrink-0 shadow-lg"
          >
            Se Arrangementer
          </Link>
        </div>
      </div>
    </main>
  );
}
