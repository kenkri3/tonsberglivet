'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Camera, X, Maximize2, ShieldCheck, Tag } from 'lucide-react';

export interface GalleryPhoto {
  src: string;
  alt: string;
  caption: string;
  location?: string;
  photographer?: string;
  category?: string;
}

export function PhotoGallery({
  photos,
  title = 'Glimt fra Tønsberglivet',
  subtitle = 'Bilder fra Norges eldste by & Færder-skjærgården',
}: {
  photos: GalleryPhoto[];
  title?: string;
  subtitle?: string;
}) {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  return (
    <section className="space-y-8">
      {(title || subtitle) && (
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          {title && <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">{title}</h2>}
          {subtitle && <p className="text-sm md:text-base text-foreground-muted">{subtitle}</p>}
        </div>
      )}

      {/* Grid med bilder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedPhoto(photo)}
            className="group relative aspect-4/3 rounded-2xl overflow-hidden bg-surface-muted border border-border shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

            {/* Overlegg-tekst */}
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white space-y-1.5">
              {photo.category && (
                <span className="inline-block px-2.5 py-0.5 bg-primary/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {photo.category}
                </span>
              )}
              <h3 className="font-bold text-lg leading-snug drop-shadow-sm">{photo.caption}</h3>
              {photo.location && (
                <p className="text-xs text-white/80 flex items-center gap-1">
                  📍 {photo.location}
                </p>
              )}
            </div>

            {/* Forstørr-ikon */}
            <div className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative max-w-4xl w-full bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-16/9 bg-black">
              <Image
                src={selectedPhoto.src}
                alt={selectedPhoto.alt}
                fill
                className="object-contain"
              />
            </div>

            <div className="p-6 space-y-3 bg-surface">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xl font-bold text-foreground">{selectedPhoto.caption}</h3>
                {selectedPhoto.photographer && (
                  <span className="text-xs font-semibold text-foreground-muted flex items-center gap-1 bg-surface-muted px-3 py-1 rounded-full border border-border">
                    <Camera className="w-3.5 h-3.5 text-primary" /> Foto: {selectedPhoto.photographer}
                  </span>
                )}
              </div>
              {selectedPhoto.location && (
                <p className="text-sm text-foreground-muted">
                  📍 Sted: <span className="font-medium text-foreground">{selectedPhoto.location}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
