import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { ContactForm } from '@/components/forms/ContactForm';

export const metadata: Metadata = {
  title: 'Kontakt oss - Tønsberglivet',
  description: 'Ta kontakt med Tønsberglivet. Vi hører gjerne fra deg!',
};

export default function KontaktPage() {
  return (
    <main className="min-h-screen pb-20">
      <HeroSection 
        title="Kontakt oss" 
        subtitle="Vi hører gjerne fra deg" 
        backgroundGradient="linear-gradient(135deg, #1E3A5F, #1D4ED8)"
        compact={true}
      />

      <div className="container mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          
          {/* Kontaktskjema */}
          <div className="bg-surface p-8 rounded-3xl shadow-sm border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Send oss en melding</h2>
            <ContactForm />
          </div>

          {/* Kontaktinfo */}
          <div className="space-y-6">
            <div className="bg-surface p-8 rounded-3xl shadow-sm border border-border h-full">
              <h2 className="text-2xl font-bold mb-8 text-foreground">Kontaktinformasjon</h2>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">Besøksadresse</h3>
                    <p className="text-foreground-muted font-medium mt-1">Rådhusgaten 1<br/>3126 Tønsberg</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">Telefon</h3>
                    <a href="tel:+4797169755" className="text-foreground-muted font-medium hover:text-primary transition-colors mt-1 block">+47 971 69 755</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">E-post</h3>
                    <a href="mailto:hei@tonsberglivet.no" className="text-foreground-muted font-medium hover:text-primary transition-colors mt-1 block">hei@tonsberglivet.no</a>
                  </div>
                </div>
              </div>

              <hr className="my-8 border-border" />
              
              <div>
                <h3 className="font-semibold text-lg mb-4">Følg oss</h3>
                <div className="flex gap-4">
                  <a href="https://facebook.com/tonsberglivet" target="_blank" rel="noopener" className="w-10 h-10 bg-surface-muted rounded-full flex items-center justify-center text-foreground-muted hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Facebook">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a href="https://instagram.com/tonsberglivet" target="_blank" rel="noopener" className="w-10 h-10 bg-surface-muted rounded-full flex items-center justify-center text-foreground-muted hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Instagram">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a href="https://linkedin.com/company/tonsberglivet" target="_blank" rel="noopener" className="w-10 h-10 bg-surface-muted rounded-full flex items-center justify-center text-foreground-muted hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="LinkedIn">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
