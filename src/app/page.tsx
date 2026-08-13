import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { SectionCard, EventCard, NewsCard } from '@/components/ui/Cards';
import Link from 'next/link';
import { Building2, Briefcase, GraduationCap, MapPin, Coffee, ShoppingBag, Landmark, Handshake, Users, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tønsberglivet | Norges eldste by',
  description: 'Velkommen til Tønsberglivet. Vi jobber for synlighet, stolthet, liv og kraft i Norges eldste by.',
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection
        title="Velkommen til Tønsberglivet"
        subtitle="Norges eldste by"
        description="Sammen skaper vi synlighet, stolthet, liv og kraft i byen vår. Opplev pulsen av Norges eldste by gjennom arrangementer, næringsliv, og et mangfoldig kulturtilbud."
        ctaLabel="Hva skjer?"
        ctaHref="/eventer"
        secondaryCtaLabel="Les mer om oss"
        secondaryCtaHref="/om-oss"
        backgroundGradient="linear-gradient(135deg, #0F2847 0%, #1D4ED8 50%, #0E7490 100%)"
      />

      {/* De fem livene */}
      <section className="py-20 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">De fem livene i Tønsberg</h2>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
            Tønsberglivet består av fem pilarer som sammen former byens identitet og tilbud.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SectionCard
            title="Bylivet"
            description="Shopping, spisesteder, opplevelser og arrangementer midt i hjertet av byen."
            href="/bylivet"
            gradient="linear-gradient(135deg, #1D4ED8, #3B82F6)"
            icon={<ShoppingBag className="w-8 h-8 text-white" />}
          />
          <SectionCard
            title="Hverdagslivet"
            description="Alt du trenger for å bo og leve godt i Tønsberg, fra bolig til fritidsaktiviteter."
            href="/hverdagslivet"
            gradient="linear-gradient(135deg, #059669, #10B981)"
            icon={<Coffee className="w-8 h-8 text-white" />}
          />
          <SectionCard
            title="Næringslivet"
            description="Et pulserende miljø for innovasjon, etablering og vekst."
            href="/naeringslivet"
            gradient="linear-gradient(135deg, #7C3AED, #8B5CF6)"
            icon={<Briefcase className="w-8 h-8 text-white" />}
          />
          <SectionCard
            title="Reiselivet"
            description="Opplev Tønsberg og Færder nasjonalpark. Historie, kultur og kystliv."
            href="/reiselivet"
            gradient="linear-gradient(135deg, #D97706, #F59E0B)"
            icon={<MapPin className="w-8 h-8 text-white" />}
          />
          <SectionCard
            title="Studentlivet"
            description="Et aktivt og inkluderende studentmiljø med Universitetet i Sørøst-Norge."
            href="/studentlivet"
            gradient="linear-gradient(135deg, #DC2626, #EF4444)"
            icon={<GraduationCap className="w-8 h-8 text-white" />}
          />
        </div>
      </section>

      {/* Hva skjer? */}
      <section className="py-20 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-surface rounded-3xl mb-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Hva skjer?</h2>
            <p className="text-lg text-foreground-muted">Kommende arrangementer i byen vår</p>
          </div>
          <Link href="/eventer" className="mt-4 md:mt-0 flex items-center text-primary font-medium hover:underline group">
            Se alle arrangementer <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EventCard
            title="Bondens marked"
            date="Lørdag 15. okt"
            time="10:00 - 15:00"
            location="Tønsberg Torv"
            category="Marked"
            href="/eventer/bondens-marked"
          />
          <EventCard
            title="Høstfest i Foynhagen"
            date="Fredag 21. okt"
            time="20:00 - 23:00"
            location="Foynhagen"
            category="Konsert"
            href="/eventer/hostfest"
          />
          <EventCard
            title="Barnas Bylørdag"
            date="Lørdag 29. okt"
            time="11:00 - 14:00"
            location="Sentrum"
            category="Familie"
            href="/eventer/barnas-bylordag"
          />
          <EventCard
            title="Vikingfestivalen"
            date="Tors 3. nov"
            time="Hele dagen"
            location="Slottsfjellsmuseet"
            category="Kultur"
            href="/eventer/vikingfestivalen"
          />
        </div>
      </section>

      {/* Siste nyheter */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Siste nyheter</h2>
          <Link href="/nyheter" className="mt-4 md:mt-0 flex items-center text-primary font-medium hover:underline group">
            Alle nyheter <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <NewsCard
            title="Ny gatebelysning i Storgata"
            excerpt="Til vinteren blir Storgata enda mer innbydende med ny, moderne og miljøvennlig belysning som skaper god stemning."
            date="10. Okt 2026"
            category="Byutvikling"
            href="/nyheter/ny-gatebelysning"
          />
          <NewsCard
            title="Rekordsommer for næringslivet"
            excerpt="Sommeren 2026 satte nye besøksrekorder i Tønsberg, noe som har gitt et solid oppsving for den lokale handelen."
            date="02. Okt 2026"
            category="Næring"
            href="/nyheter/rekordsommer"
          />
          <NewsCard
            title="Velkommen til ny studentuke"
            excerpt="USN-studentene inntar byen, og vi i Tønsberglivet har gleden av å bidra til en fantastisk velkomstuke for de nye studentene."
            date="25. Sep 2026"
            category="Student"
            href="/nyheter/ny-studentuke"
          />
        </div>
      </section>

      {/* Tall som teller */}
      <section className="py-20 bg-primary-light dark:bg-slate-900 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Byen i tall</h2>
            <p className="text-foreground-muted">Tønsbergregionen vokser og utvikler seg</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">33 000+</div>
              <p className="text-sm md:text-base font-medium text-foreground-muted">Arbeidsplasser</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">7 500+</div>
              <p className="text-sm md:text-base font-medium text-foreground-muted">Bedrifter</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">300+</div>
              <p className="text-sm md:text-base font-medium text-foreground-muted">Butikker & servering</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">50+</div>
              <p className="text-sm md:text-base font-medium text-foreground-muted">Samarbeidspartnere</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bli partner */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="bg-gradient-to-br from-blue-900 to-cyan-800 rounded-3xl p-8 md:p-16 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <Handshake className="w-16 h-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Vil din bedrift være med å bygge Tønsberg?</h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-blue-100">
              Bli partner i Tønsberglivet og ta del i fellesskapet som utvikler Norges eldste by for fremtiden.
            </p>
            <Link 
              href="/om-oss/partnere" 
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-full text-blue-900 bg-white hover:bg-blue-50 transition-colors duration-200"
            >
              Les om partnerskap
            </Link>
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        </div>
      </section>

      {/* Nyhetsbrev */}
      <section className="py-20 bg-surface border-t border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Users className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Få med deg det som skjer</h2>
          <p className="text-foreground-muted mb-8">
            Meld deg på vårt nyhetsbrev og få oppdateringer om arrangementer, nyheter og byutvikling.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" action="#">
            <input 
              type="email" 
              placeholder="Din e-postadresse" 
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              required
            />
            <button 
              type="submit" 
              className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
            >
              Meld meg på
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

