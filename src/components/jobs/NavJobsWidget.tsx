'use client';

import { useState, useEffect } from 'react';
import { Briefcase, MapPin, Calendar, Clock, ExternalLink, GraduationCap, CheckCircle } from 'lucide-react';
import type { JobVacancy } from '@/lib/navJobs';

interface NavJobsWidgetProps {
  initialOnlyStudent?: boolean;
  title?: string;
  subtitle?: string;
  limit?: number;
}

export function NavJobsWidget({
  initialOnlyStudent = false,
  title = 'Ledige Stillinger i Tønsbergregionen',
  subtitle = 'Oppdateres live fra NAV Arbeidsplassen for Tønsberg og Færder kommune.',
  limit = 6
}: NavJobsWidgetProps) {
  const [onlyStudent, setOnlyStudent] = useState(initialOnlyStudent);
  const [jobs, setJobs] = useState<JobVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [onlyStudent, limit]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs?student=${onlyStudent}&limit=${limit}`);
      const json = await res.json();
      if (Array.isArray(json.data)) {
        setJobs(json.data);
      }
      setIsLive(json.isLive === true);
      setNote(typeof json.note === 'string' ? json.note : null);
    } catch (e) {
      console.error('Feil ved lasting av stillinger:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    /* @container: widgeten står i full bredde på /naeringslivet, men i en halv
       kolonne (~590 px) på /studentlivet og /hverdagslivet. Med viewport-baserte
       brytepunkter ble det tre ~168 px smale kort, og merkelappene rant ut. */
    <div className="@container bg-surface rounded-3xl border border-border p-6 md:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col @4xl:flex-row @4xl:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="min-w-0">
          <div
            className={`inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 max-w-full ${
              isLive
                ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span className="leading-snug break-words">
              {isLive ? 'NAV Arbeidsplassen (live)' : 'NAV Arbeidsplassen: ikke tilgjengelig'}
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-foreground break-words">{title}</h3>
          <p className="text-foreground-muted text-sm mt-1">
            {isLive ? subtitle : 'Ingen oppdiktede stillinger vises – kilden er ikke tilgjengelig.'}
          </p>
        </div>

        {/* Filter-knapp */}
        <div className="inline-flex p-1 bg-surface-muted rounded-2xl border border-border shrink-0 self-start @4xl:self-auto max-w-full overflow-x-auto scrollbar-none">
          <button
            onClick={() => setOnlyStudent(false)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              !onlyStudent ? 'bg-primary text-white shadow-xs' : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            Alle stillinger
          </button>
          <button
            onClick={() => setOnlyStudent(true)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              onlyStudent ? 'bg-primary text-white shadow-xs' : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student & Deltid</span>
          </button>
        </div>
      </div>

      {/* Stillingsrutenett */}
      <div className="grid grid-cols-1 @lg:grid-cols-2 @4xl:grid-cols-3 gap-5">
        {/* Skjelett mens NAV-feeden svarer. Oppslaget kan ta 10–15 sekunder, og
            uten dette så kortet tomt og «ødelagt» ut i mellomtiden. */}
        {loading &&
          jobs.length === 0 &&
          Array.from({ length: Math.min(limit, 3) }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="p-6 rounded-2xl bg-surface-muted/40 border border-border animate-pulse space-y-3"
              aria-hidden="true"
            >
              <div className="h-4 w-24 rounded-full bg-border" />
              <div className="h-4 w-full rounded bg-border" />
              <div className="h-4 w-3/4 rounded bg-border" />
              <div className="space-y-2 pt-1">
                <div className="h-3 w-1/2 rounded bg-border" />
                <div className="h-3 w-2/5 rounded bg-border" />
              </div>
            </div>
          ))}

        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-6 rounded-2xl bg-surface-muted/50 border border-border hover:border-primary/50 transition-all flex flex-col justify-between group hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="space-y-3 min-w-0">
              {/* flex-wrap: merkelappene bryter til neste linje i smale kort i
                  stedet for å presse raden bredere enn kortet. */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  {job.engagementType} • {job.extent}
                </span>
                {job.isStudentFriendly && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                    Studentvennlig
                  </span>
                )}
              </div>

              <h4 className="font-bold text-foreground text-base group-hover:text-primary transition-colors line-clamp-2">
                {job.title}
              </h4>

              <div className="space-y-1 text-xs text-foreground-muted">
                <p className="font-semibold text-foreground">{job.employer}</p>
                <p className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{job.location}</span>
                </p>
                {job.descriptionSnippet && (
                  <p className="line-clamp-2 text-foreground-subtle pt-1 text-[11px] leading-relaxed">
                    {job.descriptionSnippet}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs mt-4">
              <span className="text-foreground-subtle flex items-center gap-1 min-w-0 whitespace-nowrap">
                <Clock className="w-3.5 h-3.5 text-foreground-muted shrink-0" /> Frist: {job.applicationDeadline}
              </span>
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors shadow-2xs whitespace-nowrap shrink-0"
              >
                <span>Søk stilling</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}

        {jobs.length === 0 && !loading && (
          <div className="col-span-full py-12 px-6 text-center text-foreground-muted space-y-2">
            {!isLive && note ? (
              <>
                <p className="font-bold text-foreground">Stillingsfeedet fra NAV er ikke tilgjengelig</p>
                <p className="text-xs leading-relaxed max-w-2xl mx-auto">{note}</p>
                <a
                  href="https://arbeidsplassen.nav.no/stillinger"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline font-bold text-xs pt-1"
                >
                  Søk i stillinger på arbeidsplassen.nav.no
                  <ExternalLink className="w-3 h-3" />
                </a>
              </>
            ) : (
              <p>Ingen stillinger funnet i øyeblikket. Sjekk igjen snart.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
