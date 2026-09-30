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

  useEffect(() => {
    fetchJobs();
  }, [onlyStudent, limit]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs?student=${onlyStudent}&limit=${limit}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setJobs(json.data);
      }
    } catch (e) {
      console.error('Feil ved lasting av stillinger:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>NAV Arbeidsplassen Live API</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-foreground">{title}</h3>
          <p className="text-foreground-muted text-sm mt-1">{subtitle}</p>
        </div>

        {/* Filter-knapp */}
        <div className="inline-flex p-1 bg-surface-muted rounded-2xl border border-border shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setOnlyStudent(false)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              !onlyStudent ? 'bg-primary text-white shadow-xs' : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            Alle stillinger
          </button>
          <button
            onClick={() => setOnlyStudent(true)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              onlyStudent ? 'bg-primary text-white shadow-xs' : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student & Deltid</span>
          </button>
        </div>
      </div>

      {/* Stillingsrutenett */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-6 rounded-2xl bg-surface-muted/50 border border-border hover:border-primary/50 transition-all flex flex-col justify-between group hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  {job.engagementType} • {job.extent}
                </span>
                {job.isStudentFriendly && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full">
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

            <div className="pt-4 border-t border-border flex items-center justify-between text-xs mt-4">
              <span className="text-foreground-subtle flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-foreground-muted" /> Frist: {job.applicationDeadline}
              </span>
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors shadow-2xs"
              >
                <span>Søk stilling</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}

        {jobs.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-foreground-muted">
            Ingen stillinger funnet i øyeblikket. Sjekk igjen snart.
          </div>
        )}
      </div>
    </div>
  );
}
