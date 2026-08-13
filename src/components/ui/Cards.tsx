import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionCardProps {
  title: string;
  description: string;
  href: string;
  gradient: string;
  icon?: React.ReactNode;
}

export function SectionCard({ title, description, href, gradient, icon }: SectionCardProps) {
  return (
    <Link href={href} className="group block">
      <div
        className="relative overflow-hidden rounded-2xl p-8 h-full min-h-[220px]
                    flex flex-col justify-end transition-all duration-300
                    hover:shadow-xl hover:-translate-y-1"
        style={{ background: gradient }}
      >
        {/* Dekorativt mønster */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="80" cy="20" r="40" fill="white" />
          </svg>
        </div>

        {icon && (
          <div className="mb-4 text-white/80">{icon}</div>
        )}

        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:translate-x-1 transition-transform">
          {title}
        </h3>
        <p className="text-white/75 text-sm leading-relaxed mb-4">{description}</p>

        <div className="flex items-center gap-2 text-white/90 text-sm font-medium
                        group-hover:gap-3 transition-all">
          Utforsk
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}

interface EventCardProps {
  title: string;
  date: string;
  time?: string;
  location?: string;
  category?: string;
  href: string;
}

export function EventCard({ title, date, time, location, category, href }: EventCardProps) {
  return (
    <Link href={href} className="group block">
      <article className="bg-surface rounded-2xl overflow-hidden border border-border
                          hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
        {/* Dekorativ toppstripe med dato */}
        <div className="bg-gradient-to-r from-primary to-primary-hover px-6 py-4 text-white">
          <time className="text-2xl font-bold">{date}</time>
          {time && <span className="ml-2 text-white/80 text-sm">{time}</span>}
        </div>

        <div className="p-6">
          {category && (
            <span className="inline-block px-3 py-1 text-xs font-medium bg-primary-light
                           text-primary rounded-full mb-3">
              {category}
            </span>
          )}
          <h3 className="text-lg font-semibold text-foreground mb-2
                         group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
          {location && (
            <p className="text-sm text-foreground-muted">{location}</p>
          )}
        </div>
      </article>
    </Link>
  );
}

interface NewsCardProps {
  title: string;
  excerpt: string;
  date: string;
  category?: string;
  href: string;
}

export function NewsCard({ title, excerpt, date, category, href }: NewsCardProps) {
  return (
    <Link href={href} className="group block">
      <article className="bg-surface rounded-2xl overflow-hidden border border-border
                          hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-full
                          flex flex-col">
        {/* Bildeplassholder */}
        <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-accent/10
                        flex items-center justify-center">
          <span className="text-foreground-subtle text-sm">Bilde</span>
        </div>

        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-3 mb-3">
            {category && (
              <span className="px-3 py-1 text-xs font-medium bg-primary-light text-primary rounded-full">
                {category}
              </span>
            )}
            <time className="text-xs text-foreground-subtle">{date}</time>
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-2
                         group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-foreground-muted leading-relaxed line-clamp-3 flex-1">
            {excerpt}
          </p>

          <div className="flex items-center gap-2 mt-4 text-primary text-sm font-medium
                          group-hover:gap-3 transition-all">
            Les mer
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </article>
    </Link>
  );
}

interface BusinessCardProps {
  name: string;
  category: string;
  address?: string;
  description?: string;
}

export function BusinessCard({ name, category, address, description }: BusinessCardProps) {
  return (
    <article className="bg-surface rounded-2xl p-6 border border-border
                        hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      {/* Logo-plassholder */}
      <div className="w-14 h-14 rounded-xl bg-surface-muted flex items-center justify-center mb-4">
        <span className="text-xl font-bold text-primary">
          {name.charAt(0)}
        </span>
      </div>

      <span className="inline-block px-3 py-1 text-xs font-medium bg-accent-light
                       text-accent rounded-full mb-3">
        {category}
      </span>
      <h3 className="text-lg font-semibold text-foreground mb-1">{name}</h3>
      {address && (
        <p className="text-sm text-foreground-muted mb-2">{address}</p>
      )}
      {description && (
        <p className="text-sm text-foreground-muted leading-relaxed line-clamp-2">{description}</p>
      )}
    </article>
  );
}
