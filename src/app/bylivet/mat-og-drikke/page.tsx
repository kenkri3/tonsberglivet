import { Metadata } from 'next';
import Image from 'next/image';
import { HeroSection } from '@/components/ui/HeroSection';
import { Utensils, Coffee, Sun, Wine, Star } from 'lucide-react';
import Link from 'next/link';
import { BusinessCategory } from '@prisma/client';
import { hentBedrifter } from '@/lib/business-directory';
import { BusinessGrid } from '@/components/business/BusinessGrid';

export const metadata: Metadata = {
  title: 'Mat & Drikke i Tønsberg | Tønsberglivet',
  description: 'Bryggeservering, koselige kaffebarer og prisvinnende restauranter i Tønsberg.',
};

// Serveringsstedene hentes fra databasen ved hvert besøk, så nye og endrede
// bedrifter vises med en gang uten ny deploy.
export const dynamic = 'force-dynamic';

export default async function MatOgDrikkePage() {
  const bedrifter = await hentBedrifter(BusinessCategory.MAT_DRIKKE, 90);

  return (
    <main className="min-h-screen pb-20 bg-background">
      <HeroSection
        title="Mat & Drikke"
        subtitle="Uteservering på Brygga & Lokale Smaker"
        description="Nyt nydelig mat fra byens beste restauranter, slapp av på koselige kaffebarer eller opplev den unike bryggestemningen i Tønsberg."
        backgroundGradient="linear-gradient(135deg, #b45309 0%, #d97706 50%, #16193d 100%)"
        backgroundImage="/images/tonsberg/mat-drikke-uteservering-paa-brygga.jpg"
        imageAlt="Barn ved bordet utenfor en rød sjøbod"
        priority
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
                <Utensils className="w-3.5 h-3.5 text-amber-500" />
                {bedrifter.length > 0
                  ? `${bedrifter.length} serveringssteder i registeret`
                  : 'Serveringssteder i Tønsberg'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-muted text-foreground-muted">
                <Sun className="w-3.5 h-3.5 text-amber-500" /> Kveldssol på brygga
              </span>
            </div>
          </div>
          <div className="lg:col-span-5 relative aspect-[16/10] rounded-2xl overflow-hidden shadow-lg border border-border">
            <Image 
              src="/images/tonsberg/langbord-med-folk-paa-matfestival-.jpg" 
              alt="Langbord med folk på matfestival i Tønsberg" 
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover img-crop-top"
            />
          </div>
        </div>

        {/* Smakebiter fra byens matliv */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {[
            { src: '/images/tonsberg/barista-som-lager-kaffe-paa-kaf-i-.jpg', alt: 'Barista som lager kaffe på kafé i Tønsberg', caption: 'Kaffebarer' },
            { src: '/images/tonsberg/barista-som-lager-kaffe-paa-kaf-i--2.jpg', alt: 'Servering av lokal mat på marked i Tønsberg', caption: 'Matmarkeder' },
            { src: '/images/tonsberg/barista-som-lager-kaffe-paa-kaf-i--3.jpg', alt: 'Burger og pommes frites på kafé i Tønsberg', caption: 'Lokale råvarer' },
            { src: '/images/tonsberg/barista-som-lager-kaffe-paa-kaf-i--4.jpg', alt: 'Makroner i disken på en kafé i Tønsberg', caption: 'Utearrangementer' },          ].map((p) => (
            <figure key={p.src} className="group relative aspect-square rounded-2xl overflow-hidden border border-border shadow-sm">
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover img-crop-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <figcaption className="absolute bottom-2.5 left-3 right-3 text-white text-xs sm:text-sm font-semibold">
                {p.caption}
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Venues Grid */}
        <BusinessGrid
          bedrifter={bedrifter}
          visKategori={false}
          aksent="text-amber-600"
          tomTekst="Ingen serveringssteder er publisert ennå. De dukker opp her så snart de legges inn i bedriftsregisteret."
        />

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
