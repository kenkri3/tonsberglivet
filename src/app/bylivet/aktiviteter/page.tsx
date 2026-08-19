import { Metadata } from 'next';
import { HeroSection } from '@/components/ui/HeroSection';
import { Compass, Landmark, Music, Drama, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kultur & Aktiviteter | Tønsberglivet',
  description: 'Opplev Slottsfjellet, Oseberg Kulturhus, Tønsberg Bibliotek og spennende byaktiviteter.',
};

const activities = [
  { title: 'Slottsfjellet & Tårnet', desc: 'Norges største ruinepark fra middelalderen med fantastisk utsikt over hele byfjorden.', icon: Landmark },
  { title: 'Oseberg Kulturhus', desc: 'Teater, standup, konserter og store nasjonale forestillinger midt i sentrum.', icon: Drama },
  { title: 'Kajakk & Padling', desc: 'Padle gjennom Kanalen, rundt Kaldnes og ut mot Færder Nasjonalpark.', icon: Compass },
  { title: 'Tønsberg Bibliotek', desc: 'Bynære kulturarrangementer, språktrening, brettspillkvelder og barneaktiviteter.', icon: Users },
];

export default function AktiviteterPage() {
  return (
    <main className="min-h-screen pb-20">
      <HeroSection
        title="Kultur & Aktiviteter"
        subtitle="Historie, Teater & Opplevelser"
        description="Fra tusenårig historie på Slottsfjellet til sprudlende kulturliv og vannaktiviteter på Kanalen."
        backgroundGradient="linear-gradient(135deg, #7C3AED, #8B5CF6)"
        compact={true}
      />

      <div className="container mx-auto px-4 mt-12 space-y-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activities.map((act, idx) => {
            const Icon = act.icon;
            return (
              <div key={idx} className="bg-surface rounded-2xl border border-border p-6 space-y-3 hover:shadow-md transition-all">
                <div className="p-3 bg-purple-100 dark:bg-purple-950 text-purple-600 rounded-xl w-fit">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-foreground">{act.title}</h3>
                <p className="text-sm text-foreground-muted leading-relaxed">{act.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Billetter Live */}
        <div className="bg-surface border border-border rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full uppercase tracking-wider">
              Ticketmaster Integrert
            </span>
            <h3 className="text-2xl font-bold text-foreground mt-2">Kjøp billetter til kulturopplevelser</h3>
            <p className="text-sm text-foreground-muted mt-1">
              Se konsertprogrammet og kjøp billetter direkte fra arrangementskalenderen.
            </p>
          </div>
          <Link
            href="/eventer"
            className="px-6 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-sm shrink-0"
          >
            Se Arrangementskalender
          </Link>
        </div>
      </div>
    </main>
  );
}
