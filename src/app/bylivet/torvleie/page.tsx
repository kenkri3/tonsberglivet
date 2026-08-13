import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { Mail, Phone, MapPin, Info, Calendar, Clock, Sun } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Torvleie | Tønsberglivet',
  description: 'Lei plass på Tønsberg Torv. Vi tilbyr dagplass, sesongplass og helårsplass for selgere og utstillere.',
};

export default function TorvleiePage() {
  return (
    <main className="min-h-screen">
      <HeroSection
        compact={true}
        title="Torvleie"
        subtitle="Tønsberg Torv"
        description="Tønsberg Torv er hjertet av byen og en fantastisk arena for handel, utstillinger og profilering. Her møtes byens befolkning til hverdags og fest."
        backgroundGradient="linear-gradient(135deg, #0F2847 0%, #1D4ED8 100%)"
      />

      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Informasjon om plasser */}
          <div className="lg:col-span-7 space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Leiealternativer</h2>
              <p className="text-foreground-muted mb-8">
                Vi har fleksible løsninger som passer de fleste behov, enten du vil teste ut et produkt en enkelt dag, eller ønsker en fast tilstedeværelse over lengre tid.
              </p>
              
              <div className="space-y-6">
                {/* Dagplass */}
                <div className="bg-surface border border-border p-6 rounded-2xl flex gap-4">
                  <div className="bg-primary-light dark:bg-primary/20 p-3 rounded-xl h-fit shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Dagplass</h3>
                    <p className="text-foreground-muted">
                      Perfekt for pop-up salg, kampanjer eller deg som vil prøve ut konseptet ditt. Enkelt og uforpliktende.
                    </p>
                  </div>
                </div>

                {/* Sesongplass */}
                <div className="bg-surface border border-border p-6 rounded-2xl flex gap-4">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl h-fit shrink-0">
                    <Sun className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Sesongplass</h3>
                    <p className="text-foreground-muted">
                      Gunstig for deg som for eksempel selger sesongvarer som bær, blomster, is eller juletrær, og trenger fast plass over en periode.
                    </p>
                  </div>
                </div>

                {/* Helårsplass */}
                <div className="bg-surface border border-border p-6 rounded-2xl flex gap-4">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl h-fit shrink-0">
                    <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Helårsplass</h3>
                    <p className="text-foreground-muted">
                      For faste torvhandlere som ønsker forutsigbarhet og en fast base for sin virksomhet gjennom hele året.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Frivillige / Lag */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-6 rounded-2xl flex gap-4 items-start">
              <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">Lag og foreninger</h3>
                <p className="text-sm text-foreground-muted">
                  Veldedige organisasjoner, idrettslag og andre frivillige foreninger kan benytte torvet gratis til profilering eller inntektsbringende arbeid (f.eks. loddsalg). Ta kontakt for å reservere plass!
                </p>
              </div>
            </div>
          </div>

          {/* Booking / Kontakt */}
          <div className="lg:col-span-5">
            <div className="bg-surface border border-border rounded-3xl p-8 sticky top-24">
              <h2 className="text-2xl font-bold text-foreground mb-2">Send forespørsel</h2>
              <p className="text-sm text-foreground-muted mb-6">
                Fyll ut skjemaet under, så tar vi kontakt med deg for å finne en løsning. Du kan også nå oss på <a href="mailto:torvet@tonsberglivet.no" className="text-primary hover:underline">torvet@tonsberglivet.no</a>.
              </p>

              <form className="space-y-4" action="#">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Fornavn *</label>
                    <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Etternavn *</label>
                    <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none" required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">E-post *</label>
                  <input type="email" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none" required />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Telefon</label>
                  <input type="tel" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Type leie *</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none" required>
                    <option value="">Velg type...</option>
                    <option value="dag">Dagplass</option>
                    <option value="sesong">Sesongplass</option>
                    <option value="helår">Helårsplass</option>
                    <option value="lag">Lag/forening (Gratis)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Ønsket dato/periode</label>
                  <input type="text" placeholder="F.eks. 15. august" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Hva skal du selge/stille ut?</label>
                  <textarea rows={3} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none resize-none"></textarea>
                </div>

                <button type="submit" className="w-full py-3 mt-2 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors">
                  Send forespørsel
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}

