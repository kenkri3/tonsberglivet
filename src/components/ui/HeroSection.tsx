import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  /** Gradient overlay fra venstre — standard er mørk marine */
  overlay?: 'dark' | 'light' | 'none';
  /** Bakgrunnsfarge brukes når det ikke er et bilde */
  backgroundGradient?: string;
  /** Ekte foto fra Tønsberg. Legges bak gradienten og løfter hele heroen. */
  backgroundImage?: string;
  imageAlt?: string;
  /** Sett til true for heroen øverst på siden (LCP-bilde) */
  priority?: boolean;
  children?: React.ReactNode;
  compact?: boolean;
}

export function HeroSection({
  title,
  subtitle,
  description,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  overlay = 'dark',
  backgroundGradient,
  backgroundImage,
  imageAlt = '',
  priority = false,
  children,
  compact = false,
}: HeroSectionProps) {
  return (
    <section
      className={`relative overflow-hidden ${compact ? 'py-20 md:py-28' : 'py-24 md:py-40 lg:py-52'}`}
      style={{
        background: backgroundGradient || 'linear-gradient(135deg, #1E3A5F 0%, #0F172A 50%, #1D4ED8 100%)',
      }}
    >
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt={imageAlt}
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover object-center"
        />
      )}

      {/* Overlay — lysere på desktop der bildet får mer plass, mørkere på mobil
          der teksten legger seg oppå hele bildet. */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/50 to-slate-950/25 md:bg-slate-950/25" />
      )}
      {overlay !== 'none' && (
        <div
          className={`absolute inset-0 ${
            overlay === 'dark'
              ? 'bg-gradient-to-r from-black/60 via-black/30 to-transparent'
              : 'bg-gradient-to-r from-white/80 via-white/40 to-transparent'
          }`}
        />
      )}

      {/* Ren overgang til innhold */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {subtitle && (
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-wider uppercase
                           bg-white/10 backdrop-blur-sm rounded-full text-white/90 border border-white/20">
              {subtitle}
            </span>
          )}

          <h1
            className={`font-bold tracking-tight text-white ${
              compact
                ? 'text-3xl md:text-4xl lg:text-5xl'
                : 'text-4xl md:text-5xl lg:text-6xl'
            } leading-[1.1]`}
          >
            {title}
          </h1>

          {description && (
            <p className="mt-6 text-lg md:text-xl text-white/80 leading-relaxed max-w-xl">
              {description}
            </p>
          )}

          {(ctaLabel || secondaryCtaLabel) && (
            <div className="mt-8 flex flex-wrap gap-4">
              {ctaLabel && ctaHref && (
                <Link
                  href={ctaHref}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900
                             font-semibold rounded-xl hover:bg-white/90
                             transition-all duration-200 shadow-lg hover:shadow-xl
                             hover:-translate-y-0.5 group"
                >
                  {ctaLabel}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              {secondaryCtaLabel && secondaryCtaHref && (
                <Link
                  href={secondaryCtaHref}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white
                             font-semibold rounded-xl hover:bg-white/20 backdrop-blur-sm
                             border border-white/20 transition-all duration-200"
                >
                  {secondaryCtaLabel}
                </Link>
              )}
            </div>
          )}

          {children}
        </div>
      </div>
    </section>
  );
}
