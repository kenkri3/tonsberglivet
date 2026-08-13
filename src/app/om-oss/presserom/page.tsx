import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { FileText, Download, Mail, Phone, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Presserom | Tønsberglivet',
  description: 'Presseresurser, mediekontakt, bildelogoer og pressemeldinger fra Tønsberglivet AS.',
};

export default function PresseromPage() {
  return (
    <main className="min-h-screen pb-20">
      <HeroSection
        compact={true}
        title="Presserom"
        subtitle="Mediekontakt & Pressemeldinger"
        description="Her finner du oppdaterte pressemeldinger, bildefiler, logoer og kontaktinformasjon for pressen."
        backgroundGradient="linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Pressekontakt */}
        <section className="bg-surface border border-border p-8 rounded-3xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">Pressekontakt</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Cecilie Bækken Sørumshagen</h3>
              <p className="text-primary font-medium text-sm mb-4">Daglig leder, Tønsberglivet AS</p>
              <p className="text-foreground-muted text-sm leading-relaxed mb-6">
                For uttalelser, spørsmål om byutvikling, prosjekter eller arrangementer i Tønsberg, ta gjerne direkte kontakt.
              </p>
              <div className="space-y-3 text-sm">
                <a href="tel:+4797169755" className="flex items-center gap-3 text-foreground font-medium hover:text-primary transition-colors">
                  <Phone className="w-4 h-4 text-primary" /> +47 971 69 755
                </a>
                <a href="mailto:hei@tonsberglivet.no" className="flex items-center gap-3 text-foreground font-medium hover:text-primary transition-colors">
                  <Mail className="w-4 h-4 text-primary" /> hei@tonsberglivet.no
                </a>
              </div>
            </div>
            <div className="bg-surface-muted p-6 rounded-2xl border border-border text-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 text-primary font-bold text-2xl flex items-center justify-center mx-auto mb-4">
                CB
              </div>
              <p className="font-bold text-foreground">Bildebank for pressen</p>
              <p className="text-xs text-foreground-muted mt-1 mb-4">Høyoppløselige bilder av Tønsberg, styret og arrangementer kan lastes ned i vår bildebank.</p>
              <Link href="/admin/bildebank" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-xl text-xs hover:bg-primary-hover transition-colors">
                Gå til Bildebank <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Pressemeldinger */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Siste pressemeldinger</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface border border-border p-6 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
              <span className="text-xs font-semibold px-2.5 py-1 bg-primary-light text-primary rounded-full">Pressemelding</span>
              <span className="text-xs text-foreground-subtle ml-3">12. august 2026</span>
              <h3 className="text-lg font-bold text-foreground">Tønsberglivet lanserer ny digital plattform for byen</h3>
              <p className="text-sm text-foreground-muted leading-relaxed">
                Ny innovativ portal samler byliv, næringsliv, reiseliv, hverdagsliv og studentliv på et sted.
              </p>
              <button className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                <Download className="w-4 h-4" /> Last ned PDF
              </button>
            </div>

            <div className="bg-surface border border-border p-6 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
              <span className="text-xs font-semibold px-2.5 py-1 bg-primary-light text-primary rounded-full">Pressemelding</span>
              <span className="text-xs text-foreground-subtle ml-3">1. juni 2026</span>
              <h3 className="text-lg font-bold text-foreground">Rekordsommer i Tønsberg: Over 300 000 besøkende</h3>
              <p className="text-sm text-foreground-muted leading-relaxed">
                Sommersesongen 2026 setter nye rekorder for både handel, hotell og kulturarrangementer.
              </p>
              <button className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                <Download className="w-4 h-4" /> Last ned PDF
              </button>
            </div>
          </div>
        </section>

        {/* Profil og Logo */}
        <section className="bg-surface border border-border p-8 rounded-3xl space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Profil og logoer</h2>
          <p className="text-foreground-muted text-sm max-w-2xl">
            Tønsberglivet AS gir tillatelse til bruk av vår logo og pressebilder i forbindelse med redaksjonell omtale av Tønsberglivet eller arrangementer på vår portal.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-surface-muted text-foreground font-medium rounded-xl text-sm hover:bg-border transition-colors inline-flex items-center gap-2">
              <Download className="w-4 h-4 text-primary" /> Last ned logo-pakke (PNG, SVG, EPS)
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
