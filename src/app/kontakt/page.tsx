import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { MapPin, Phone, Mail, ExternalLink, Clock, Building } from 'lucide-react';
import { ContactForm } from '@/components/forms/ContactForm';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Kontakt oss | Tønsberglivet',
  description: 'Ta kontakt med Tønsberglivet AS. Besøksadresse i Rådhusgaten 1, e-post og telefon.',
};

export default function KontaktPage() {
  return (
    <main className="min-h-screen pb-20">
      <HeroSection
        title="Kontakt oss"
        subtitle="Vi hører gjerne fra deg"
        description="Har du spørsmål om byutvikling, arrangementer, torvleie eller samarbeid? Ta kontakt med teamet vårt."
        backgroundGradient="linear-gradient(135deg, #1E3A5F, #1D4ED8)"
        backgroundImage="/images/tonsberg/kontakt-oss-vi-horer-gjerne-fra-de.jpg"
        imageAlt="Tønsberg Torv, like ved sentrumskontoret i Rådhusgaten"
        priority
        compact={true}
      />

      <div className="container mx-auto px-4 mt-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Kontaktskjema */}
          <div className="bg-surface p-8 sm:p-10 rounded-3xl shadow-sm border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-2">Send oss en melding</h2>
            <p className="text-sm text-foreground-muted mb-6">
              Fyll ut skjemaet under, så svarer vi deg vanligvis innen én arbeidsdag.
            </p>
            <ContactForm />
          </div>

          {/* Kontaktinfo & Lokasjon */}
          <div className="space-y-6">
            <div className="bg-surface rounded-3xl shadow-sm border border-border overflow-hidden">
              <div className="relative h-48 w-full overflow-hidden bg-surface-muted">
                <Image
                  src="/images/tonsberg/gatebildet-i-tonsberg-sentrum-spac.jpg"
                  alt="Gatebildet i Tønsberg sentrum"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6">
                  <span className="text-xs font-bold text-primary-light bg-primary/40 backdrop-blur-md px-3 py-1 rounded-full border border-primary/30 uppercase tracking-wider">
                    Sentrumskontor
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1.5 drop-shadow-sm">Tønsberglivet AS</h3>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-primary-light text-primary rounded-2xl flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">Besøksadresse</h4>
                    <p className="text-foreground-muted text-sm mt-0.5">Rådhusgaten 1, 3126 Tønsberg</p>
                    <p className="text-xs text-foreground-subtle mt-0.5">Inngang via sentrumskjernen</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-primary-light text-primary rounded-2xl flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">Telefon</h4>
                    <a href="tel:+4797169755" className="text-foreground-muted text-sm hover:text-primary transition-colors mt-0.5 block">
                      +47 971 69 755
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-primary-light text-primary rounded-2xl flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">E-post</h4>
                    <a href="mailto:hei@tonsberglivet.no" className="text-foreground-muted text-sm hover:text-primary transition-colors mt-0.5 block">
                      hei@tonsberglivet.no
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-primary-light text-primary rounded-2xl flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">Åpningstider kontor</h4>
                    <p className="text-foreground-muted text-sm mt-0.5">Mandag – Fredag: 08:30 – 16:00</p>
                  </div>
                </div>

                <hr className="border-border pt-2" />

                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-3">Følg Tønsberglivet i sosiale medier</h4>
                  <div className="flex gap-3">
                    <a
                      href="https://facebook.com/tonsberglivet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-surface-muted rounded-xl text-xs font-semibold text-foreground hover:bg-primary hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      Facebook <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href="https://instagram.com/tonsberglivet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-surface-muted rounded-xl text-xs font-semibold text-foreground hover:bg-primary hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      Instagram <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href="https://linkedin.com/company/tonsberglivet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-surface-muted rounded-xl text-xs font-semibold text-foreground hover:bg-primary hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      LinkedIn <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
