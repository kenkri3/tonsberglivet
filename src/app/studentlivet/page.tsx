import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  GraduationCap, Home, HeartPulse, Ticket, Briefcase, 
  BookOpen, Coffee, PartyPopper, ChevronRight, ArrowRight
} from 'lucide-react';
import { StudentlivetLogo } from '@/components/brand/BrandLogos';
import { PublicTransportWidget } from '@/components/transit/PublicTransportWidget';
import { NavJobsWidget } from '@/components/jobs/NavJobsWidget';
import { PhotoGallery } from '@/components/ui/PhotoGallery';
import { BusinessCategory } from '@prisma/client';
import { hentBedrifter } from '@/lib/business-directory';
import { BusinessGrid } from '@/components/business/BusinessGrid';

// Innholdet hentes fra databasen ved hvert besøk.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Studentlivet i Tønsberg | Tønsberglivet',
  description: 'Student i Tønsberg? Finn informasjon om bolig, helse, studentrabatter og fritidstilbud.',
};

export default async function StudentlivetPage() {
  const steder = await hentBedrifter(undefined, 12);

  return (
    <main className="min-h-screen space-y-16 pb-20">
      {/* ── Bilde-Hero Banner ── */}
      <header className="relative min-h-[60vh] sm:min-h-[55vh] flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/tonsberg/studentlivet-usn.jpg"
            alt="Studenter i gangen på USN Campus Vestfold"
            fill
            priority
            sizes="100vw"
            className="object-cover img-crop-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-slate-950/75 to-slate-950/40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 relative z-10 w-full">
          <div className="max-w-3xl space-y-4">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Link href="/" className="hover:text-white transition-colors">Forside</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-amber-300">Studentlivet</span>
            </div>

            {/* Offisiell logo */}
            <div className="pt-2">
              <StudentlivetLogo className="h-9 md:h-11 w-auto text-red-400 drop-shadow-md" />
            </div>

            <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              Student i Tønsberg. <br />
              <span className="font-serif italic font-normal text-amber-300">Studiested med puls og samhold.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-light max-w-2xl drop-shadow">
              Velkommen som student ved USN Campus Vestfold i Norges eldste by! Her får du moderne fasiliteter, trygge studentboliger via SSN, rabatter i sentrum og et sprudlende uteliv på Brygga.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/studentlivet/bolig-og-rabatter"
                className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                <span>Bolig & Studentrabatter</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/eventer"
                className="px-6 py-3 bg-surface/90 hover:bg-surface text-foreground rounded-xl text-xs font-bold shadow-md border border-border transition-all"
              >
                Hva skjer for studenter?
              </Link>
            </div>

          </div>
        </div>
      </header>

      {/* ── Intro & Campus Vestfold (-mt-16) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="bg-surface rounded-3xl p-8 md:p-12 border border-border shadow-xl space-y-6 text-center max-w-4xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary mx-auto flex items-center justify-center">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground">Studer på USN Campus Vestfold</h2>
          <p className="text-sm md:text-base text-foreground-muted leading-relaxed max-w-2xl mx-auto">
            Universitetet i Sørøst-Norge (USN) sin campus i Vestfold ligger på Bakkenteigen, sentralt mellom Tønsberg og Horten. Som student her får du oppleve et intimt, inkluderende og engasjerende studentmiljø.
          </p>
        </div>
      </section>

      {/* ── Bolig, Økonomi & Helse ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Bolig */}
          <div className="bg-surface rounded-3xl p-8 border border-border space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary-light text-primary">
                <Home className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Bolig og økonomi</h3>
                <p className="text-xs text-foreground-muted">Gode bomuligheter for studenter</p>
              </div>
            </div>
            
            <p className="text-xs text-foreground-muted leading-relaxed">
              Tønsberg tilbyr mange bomuligheter. Du kan søke studentbolig gjennom Studentsamskipnaden (SSN), eller finne leiligheter i koselige sentrumsgater eller på Eik for kort reisevei til campus.
            </p>

            <ul className="space-y-3 text-xs">
              <li className="p-4 rounded-2xl bg-surface-muted border border-border space-y-1">
                <h4 className="font-bold text-foreground">Gode nabolag</h4>
                <p className="text-foreground-muted">Mange studenter velger å bo sentrumsnært eller på Eik med direkte bussforbindelser til campus.</p>
              </li>
              <li className="p-4 rounded-2xl bg-surface-muted border border-border space-y-1">
                <h4 className="font-bold text-foreground">Studentsamskipnaden (SSN)</h4>
                <p className="text-foreground-muted">Søk studenthybel, treningssenter-medlemskap og stipendordninger.</p>
              </li>
            </ul>
          </div>

          {/* Helse og Trivsel */}
          <div className="bg-surface rounded-3xl p-8 border border-border space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary-light text-primary">
                <HeartPulse className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Helse og trivsel</h3>
                <p className="text-xs text-foreground-muted">Ta vare på deg selv i studietiden</p>
              </div>
            </div>
            
            <p className="text-xs text-foreground-muted leading-relaxed">
              Det er viktig å trives i hverdagen. Regionen har et sterkt fokus på unges helse og trivsel med flere gratis lavterskeltilbud.
            </p>

            <ul className="space-y-3 text-xs">
              <li className="p-4 rounded-2xl bg-surface-muted border border-border space-y-1">
                <h4 className="font-bold text-foreground">Ung arena+ / Ungdomshelsestasjon</h4>
                <p className="text-foreground-muted">Gratis tilbud for veiledning, samtaler og helsehjelp for unge opp til 25 år.</p>
              </li>
              <li className="p-4 rounded-2xl bg-surface-muted border border-border space-y-1">
                <h4 className="font-bold text-foreground">SSN Helse refusjon</h4>
                <p className="text-foreground-muted">Som student kan du få refundert store deler av utgifter til tannlege, lege og psykolog.</p>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* ── Studentbuss til Campus & Deltidsjobber (Entur & NAV Live) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* items-start: kortene beholder sin naturlige høyde i stedet for å
            strekkes til det høyeste og få et stort tomt felt. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <PublicTransportWidget initialStop="bakkenteigen" />
          <NavJobsWidget
            initialOnlyStudent={true}
            title="Deltidsjobber for Studenter"
            subtitle="Finn deltids- og sommerjobber i Tønsberg via NAV Arbeidsplassen."
            limit={4}
          />
        </div>
      </section>

      {/* ── Livet utenfor forelesningssalen ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-border pb-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Livet utenfor forelesningssalen</h2>
          <p className="text-foreground-muted text-sm mt-0.5">Sosiale arenaer, rabatter og engasjement</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={<Ticket />} 
            title="Studentrabatter" 
            desc="Få rabatter på kafeer, kulturtilbud, trening og hos frisører rundt om i Tønsberg."
          />
          <FeatureCard 
            icon={<PartyPopper />} 
            title="Fadderuke & Uteliv" 
            desc="Delta i fadderuken, bli med i studentforeninger og opplev utelivet på Brygga."
          />
          <FeatureCard 
            icon={<BookOpen />} 
            title="Bibliotek & Lesesaler" 
            desc="Bruk Tønsberg og Færder bibliotek som et flott sted for kollokviegrupper og egenstudier."
          />
          <FeatureCard 
            icon={<Briefcase />} 
            title="Deltidsjobb" 
            desc="Gode muligheter for deltidsjobb i handel-, servering- og servicebransjen i byen."
          />
        </div>
      </section>

      {/* ── Fotogalleri for Studentlivet ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <PhotoGallery
          title="Studentlivet i Bilder"
          subtitle="Bilder fra USN Campus Vestfold, student arrangementer og utelivet på Brygga."
          photos={[
            {
              src: '/images/tonsberg/studentlivet-i-bilder-bilder-fra-u.jpg',
              alt: 'Videosamtale på et nettbrett',
              caption: 'Studentmiljøet utendørs',
              location: 'Campus Vestfold',
              category: 'Studentlivet',
              photographer: 'USN Arkiv',
            },
            {
              src: '/images/tonsberg/studentfest-med-norsk-flagg-studen.jpg',
              alt: 'Studentfest med norsk flagg',
              caption: 'Studentfellesskapet i Tønsberg',
              location: 'Tønsberg Sentrum',
              category: 'Studentlivet',
              photographer: 'Tønsberglivet',
            },
            {
              src: '/images/tonsberg/foredrag-paa-en-scene-i-tonsberg-k.jpg',
              alt: 'Foredrag på en scene i Tønsberg',
              caption: 'Kveldsstemning på Brygga',
              location: 'Tønsberg Brygge',
              category: 'Sosialt & Uteliv',
              photographer: 'Tønsberglivet Arkiv',
            },
          ]}
        />
      </section>
      {/* ── Fra bedriftsregisteret ── */}
      <section className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Steder for studenter
            </h2>
            <p className="text-sm text-foreground-muted mt-1">Et utvalg fra Tønsberglivets bedriftsregister.</p>
          </div>
          <Link
            href="/naeringslivet/bedrifter"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Se hele registeret &rarr;
          </Link>
        </div>

        <BusinessGrid
          bedrifter={steder}
          tomTekst="Ingen steder er publisert i registeret ennå."
        />
      </section>

    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 bg-surface rounded-3xl border border-border text-center space-y-3 shadow-xs hover:shadow-md transition-shadow">
      <div className="inline-flex items-center justify-center p-3 bg-primary-light text-primary rounded-2xl">
        {icon}
      </div>
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      <p className="text-xs text-foreground-muted leading-relaxed">{desc}</p>
    </div>
  );
}

