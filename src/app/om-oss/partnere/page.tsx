import { Metadata } from 'next';
import Link from 'next/link';
import { HeroSection } from '@/components/ui/HeroSection';
import { CheckCircle2, TrendingUp, Users, CalendarDays, BadgeCheck, Tent, Building, ArrowRight, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Våre partnere | Tønsberglivet',
  description: 'Bli partner med Tønsberglivet og ta del i utviklingen av Tønsberg.',
};

const partners = [
  { name: 'Tønsberg Kommune', category: 'Offentlig sektor & Samfunn', type: 'Hovedpartner' },
  { name: 'SpareBank 1 Sør-Norge', category: 'Bank & Finans', type: 'Strategisk partner' },
  { name: 'Alti Farmandstredet', category: 'Handel & Shopping', type: 'Strategisk partner' },
  { name: 'Tønsberg Næringsforening', category: 'Næringsliv', type: 'Samarbeidspartner' },
  { name: 'Quality Hotel Tønsberg', category: 'Hotell & Reiseliv', type: 'Medlem' },
  { name: 'Hotel Klubben', category: 'Hotell & Konferanse', type: 'Medlem' },
  { name: 'Foynhagen & Brygga', category: 'Kultur & Uteliv', type: 'Medlem' },
  { name: 'Oseberg Kulturhus', category: 'Kultur & Scene', type: 'Medlem' },
  { name: 'USN Campus Vestfold', category: 'Utdanning & Forskning', type: 'Kunnskapspartner' },
  { name: 'DNB Bank ASA', category: 'Bank & Finans', type: 'Samarbeidspartner' },
  { name: 'Tønsbergs Blad', category: 'Mediehus & Nyheter', type: 'Mediepartner' },
  { name: 'Vestfold Fylkeskommune', category: 'Regional utvikling', type: 'Samarbeidspartner' },
];

export default function PartnerePage() {
  return (
    <main className="min-h-screen pb-20 bg-background">
      <HeroSection 
        title="Våre partnere" 
        subtitle="Sammen for Tønsberg" 
        description="Et forpliktende partnerskap mellom kommunen, gårdeiere og næringslivet for å styrke Tønsbergs posisjon som fylkets handels- og opplevelseshovedstad."
        backgroundGradient="linear-gradient(135deg, #065f46 0%, #0d9488 50%, #16193d 100%)"
        compact={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-16 space-y-16 sm:space-y-20">
        
        {/* Intro */}
        <section className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-primary block">
            Verdien av partnerskap
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Hvorfor bli partner?</h2>
          <p className="text-base sm:text-lg text-foreground-muted leading-relaxed font-light">
            Som partner i Tønsberglivet bidrar du direkte til å skape en mer levende, renere og mer attraktiv by. Samtidig får din bedrift prioritert profilering og tilgang til felles markedsføringsarenaer.
          </p>
        </section>

        {/* Fordeler */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-surface p-7 sm:p-8 rounded-3xl border border-border/80 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
              <TrendingUp className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-xl text-foreground mb-2">Maksimal synlighet</h3>
            <p className="text-foreground-muted text-sm leading-relaxed">
              Profilering i bybildet, på nettsiden og i sosiale kampanjer under Tønsbergdagen, julemarked og sommersesongen.
            </p>
          </div>

          <div className="bg-surface p-7 sm:p-8 rounded-3xl border border-border/80 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-xl text-foreground mb-2">Strategisk nettverk</h3>
            <p className="text-foreground-muted text-sm leading-relaxed">
              Delta på frokostmøter, næringstreff og workshops hvor byutvikling og felles satsinger formes direkte.
            </p>
          </div>

          <div className="bg-surface p-7 sm:p-8 rounded-3xl border border-border/80 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
              <BadgeCheck className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-xl text-foreground mb-2">Offisielt kvalitetsstempel</h3>
            <p className="text-foreground-muted text-sm leading-relaxed">
              Bruk Tønsberglivet-partnerlogoen på egne flater for å vise at din bedrift tar samfunnsansvar for lokalsamfunnet.
            </p>
          </div>
        </section>

        {/* Partner Logo Grid */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-primary block">
              Fellesskapet
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Noen av våre nøkkelpartnere
            </h2>
            <p className="text-xs sm:text-sm text-foreground-muted">
              Over 50 bedrifter, gårdeiere og offentlige aktører støtter opp om Tønsberglivet.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {partners.map((partner, i) => (
              <div 
                key={i} 
                className="bg-surface p-5 rounded-2xl border border-border/80 shadow-2xs hover:shadow-md hover:border-primary/30 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-muted text-foreground-muted">
                    {partner.type}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm leading-snug">{partner.name}</h4>
                  <p className="text-xs text-foreground-muted mt-1">{partner.category}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Lag og Foreninger */}
        <section className="bg-gradient-to-br from-emerald-950/20 via-surface to-teal-950/20 p-8 sm:p-12 rounded-3xl border border-emerald-500/20 shadow-md">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Tent className="w-4 h-4" />
                <span>Frivillighetsstøtte</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                Gratis torgbod for lag og foreninger
              </h2>
              <p className="text-foreground-muted text-sm sm:text-base leading-relaxed">
                Vi heier på frivilligheten! Registrerte lag og foreninger i Tønsberg og Færder kan låne gratis standplass og torgbod på Torvet for loddsalg, profilering og vaffelsteking.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Kostnadsfritt for ideelle formål</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Strøm og bord inkludert</span>
              </div>
            </div>
            <Link
              href="/bylivet/torvleie"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all shrink-0 inline-flex items-center gap-2"
            >
              <span>Søk om gratis torgbod</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Bli partner skjema */}
        <section className="max-w-2xl mx-auto bg-surface rounded-3xl p-8 sm:p-10 border border-border/80 shadow-md space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Bli partner med oss</h2>
            <p className="text-xs sm:text-sm text-foreground-muted">
              Fyll ut skjemaet under, så tar daglig leder kontakt for en uforpliktende kaffeprat om hvordan vi kan løfte bedriften din.
            </p>
          </div>

          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Ditt Navn</label>
                <input 
                  type="text" 
                  className="w-full p-3.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-foreground text-sm" 
                  placeholder="Ola Nordmann" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Bedriftsnavn</label>
                <input 
                  type="text" 
                  className="w-full p-3.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-foreground text-sm" 
                  placeholder="Firma AS" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">E-postadresse</label>
                <input 
                  type="email" 
                  className="w-full p-3.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-foreground text-sm" 
                  placeholder="ola@firma.no" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Telefonnummer</label>
                <input 
                  type="tel" 
                  className="w-full p-3.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-foreground text-sm" 
                  placeholder="+47 900 00 000" 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Hva ønsker dere ut av partnerskapet?</label>
              <textarea 
                rows={4} 
                className="w-full p-3.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-foreground text-sm" 
                placeholder="Fortell oss litt om bedriften din og ambisjonene..."
              ></textarea>
            </div>
            <button 
              type="button" 
              className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl shadow-md transition-all text-sm"
            >
              Send partnerskapshenvendelse
            </button>
          </form>
        </section>

      </div>
    </main>
  );
}
