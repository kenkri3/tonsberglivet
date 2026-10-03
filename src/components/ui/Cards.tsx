import Link from 'next/link';
import Image from 'next/image';
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
    <Link href={href} className="group block h-full">
      <div
        className="relative overflow-hidden rounded-3xl p-7 sm:p-8 h-full min-h-[220px] flex flex-col justify-between transition-all duration-300 bg-surface border border-border/80 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1"
      >
        <div>
          {icon && (
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform"
              style={{ background: gradient }}
            >
              {icon}
            </div>
          )}

          <h3 className="text-xl sm:text-2xl font-extrabold text-foreground mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-foreground-muted text-sm leading-relaxed font-light">{description}</p>
        </div>

        <div className="pt-6 flex items-center gap-2 text-xs font-semibold text-primary group-hover:gap-3 transition-all">
          <span>Utforsk</span>
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
  imageUrl?: string;
  /** Beskriver bildet for skjermlesere. Uten den brukes kortets tittel. */
  imageAlt?: string;
  priceRange?: string;
  /**
   * Alle forestillinger når samme produksjon går flere ganger. Settes den,
   * viser kortet antall forestillinger og en kompakt dato-liste i stedet for
   * å fylle rutenettet med nesten identiske kort.
   */
  performances?: Array<{ date: string; time?: string }>;
}

export function EventCard({ title, date, time, location, category, href, imageUrl, imageAlt, priceRange, performances }: EventCardProps) {
  const isExternal = href.startsWith('http');
  const performanceList = performances ?? [];
  const isMulti = performanceList.length > 1;
  const visiblePerformances = performanceList.slice(0, 5);
  const hiddenCount = performanceList.length - visiblePerformances.length;
  return (
    <Link
      href={href}
      className="group block h-full"
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
    >
      <article className="bg-surface rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
        {imageUrl ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
            <Image
              src={imageUrl}
              alt={imageAlt ?? title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover img-crop-top group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-md rounded-xl px-2.5 py-1 text-center shadow-md border border-border">
              <span className="text-xs font-bold text-foreground block leading-none">{date}</span>
            </div>
            {time && (
              <div className="absolute bottom-2.5 left-3 text-white text-xs font-medium drop-shadow">
                {time}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-r from-primary to-primary-hover px-6 py-4 text-white">
            <time className="text-xl font-bold">{date}</time>
            {time && <span className="ml-2 text-white/80 text-sm">{time}</span>}
          </div>
        )}

        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center flex-wrap gap-1.5 min-w-0">
                {category && (
                  <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold bg-primary-light text-primary rounded-full">
                    {category}
                  </span>
                )}
                {isMulti && (
                  <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-full whitespace-nowrap">
                    {performanceList.length} forestillinger
                  </span>
                )}
              </div>
              {priceRange && (
                <span className="text-xs font-bold text-foreground-muted shrink-0">
                  {priceRange}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </h3>
            {location && (
              <p className="text-xs text-foreground-muted line-clamp-1">{location}</p>
            )}
            {isMulti && (
              <div className="mt-2.5">
                <span className="block text-[10px] font-bold uppercase tracking-wide text-foreground-subtle mb-1">
                  Alle forestillinger
                </span>
                <div className="flex flex-wrap gap-1">
                  {visiblePerformances.map((p, idx) => (
                    <span
                      key={idx}
                      className="inline-block text-[10px] font-semibold bg-surface-muted border border-border text-foreground-muted px-2 py-0.5 rounded-full whitespace-nowrap"
                    >
                      {p.date}
                      {p.time ? ` ${p.time}` : ''}
                    </span>
                  ))}
                  {hiddenCount > 0 && (
                    <span className="inline-block text-[10px] font-semibold text-foreground-subtle px-2 py-0.5">
                      +{hiddenCount} flere
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-border flex items-center justify-between text-xs font-semibold text-primary">
            <span>{isExternal ? 'Kjøp billett' : 'Les mer'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
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
  imageUrl?: string;
  /** Beskriver bildet for skjermlesere. Uten den brukes kortets tittel. */
  imageAlt?: string;
}

export function NewsCard({ title, excerpt, date, category, href, imageUrl, imageAlt }: NewsCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <article className="bg-surface rounded-2xl overflow-hidden border border-border/80 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
        {/* Nyhetsbilde eller dekorativ gradient */}
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt ?? title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover img-crop-top group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-surface-muted to-accent/20 flex items-center justify-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Tønsberglivet</span>
            </div>
          )}
          {category && (
            <span className="absolute top-3 left-3 px-3 py-1 text-xs font-bold bg-surface/90 backdrop-blur-md text-primary rounded-full shadow-sm">
              {category}
            </span>
          )}
        </div>

        <div className="p-5 sm:p-6 flex flex-col flex-1">
          <time className="text-xs font-medium text-foreground-subtle mb-2.5 block">{date}</time>

          <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {title}
          </h3>
          <p className="text-sm text-foreground-muted leading-relaxed line-clamp-3 flex-1 mb-4">
            {excerpt}
          </p>

          <div className="flex items-center gap-2 text-primary text-sm font-semibold group-hover:gap-3 transition-all pt-2 border-t border-border/40">
            Les hele saken
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
    <article className="bg-surface rounded-2xl p-6 border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      {/* Logo-plassholder */}
      <div className="w-14 h-14 rounded-xl bg-surface-muted flex items-center justify-center mb-4">
        <span className="text-xl font-bold text-primary">
          {name.charAt(0)}
        </span>
      </div>

      <span className="inline-block px-3 py-1 text-xs font-medium bg-accent-light text-accent rounded-full mb-3">
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
