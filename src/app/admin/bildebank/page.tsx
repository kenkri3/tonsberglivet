'use client';

import { useState } from 'react';
import {
  Upload,
  FolderPlus,
  Search,
  Grid3X3,
  List,
  MoreHorizontal,
  Tag,
  Camera,
  Shield,
  Sparkles,
  ChevronRight,
  X,
  Check,
  Folder,
  Image as ImageIcon,
} from 'lucide-react';

// Demo-mapper
const demoFolders = [
  { id: '1', name: 'Bylivet', children: ['Torvet', 'Brygga', 'Handel'] },
  { id: '2', name: 'Arrangementer', children: ['Bondens marked', 'Tønsbergdagen', 'Jul i Tønsberg'] },
  { id: '3', name: 'Presserom', children: ['Styret', 'Ansatte', 'Logoer'] },
  { id: '4', name: 'Reiselivet', children: ['Færder', 'Overnatting', 'Mat & drikke'] },
  { id: '5', name: 'Sommer 2026', children: [] },
];

// Demo-bilder
const demoImages = [
  { id: '1', name: 'torvet-sommer.jpg', folder: 'Bylivet/Torvet', photographer: 'Per Eide', tags: ['sommer', 'torvet', 'folk'], gdpr: 'approved' as const, aiTags: ['uteservering', 'torg', 'solskinn'] },
  { id: '2', name: 'brygga-kveld.jpg', folder: 'Bylivet/Brygga', photographer: 'Tønsberglivet', tags: ['kveld', 'brygga', 'sjø'], gdpr: 'approved' as const, aiTags: ['solnedgang', 'havn', 'båter'] },
  { id: '3', name: 'bondens-marked-aug.jpg', folder: 'Arrangementer/Bondens marked', photographer: 'Julie Hansen', tags: ['marked', 'grønnsaker', 'torvet'], gdpr: 'pending' as const, aiTags: ['mat', 'lokalprodusenter', 'sommer'] },
  { id: '4', name: 'blomstersykkel.jpg', folder: 'Bylivet/Torvet', photographer: 'Tønsberglivet', tags: ['blomster', 'sykkel', 'farger'], gdpr: 'approved' as const, aiTags: ['dekorasjon', 'gatekunst', 'vår'] },
  { id: '5', name: 'faerder-fyr.jpg', folder: 'Reiselivet/Færder', photographer: 'Visitnorway', tags: ['fyr', 'kyst', 'natur'], gdpr: 'approved' as const, aiTags: ['fyrtårn', 'skjærgård', 'blå himmel'] },
  { id: '6', name: 'julebelysning.jpg', folder: 'Arrangementer/Jul i Tønsberg', photographer: 'Per Eide', tags: ['jul', 'lys', 'vinter'], gdpr: 'approved' as const, aiTags: ['julepynt', 'gate', 'kveldsstemning'] },
  { id: '7', name: 'styreportrett-cecilie.jpg', folder: 'Presserom/Ansatte', photographer: 'Foto Studio', tags: ['portrett', 'daglig leder'], gdpr: 'approved' as const, aiTags: ['person', 'kontor', 'profesjonelt'] },
  { id: '8', name: 'tonsbergdagen-2025.jpg', folder: 'Arrangementer/Tønsbergdagen', photographer: 'Julie Hansen', tags: ['festival', 'folk', 'gater'], gdpr: 'approved' as const, aiTags: ['folkefest', 'handel', 'by'] },
];

export default function ImageBankPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<typeof demoImages[0] | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const filteredImages = demoImages.filter((img) => {
    const matchesSearch = searchQuery === '' ||
      img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.tags.some((t) => t.includes(searchQuery.toLowerCase())) ||
      img.photographer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = !selectedFolder || img.folder.startsWith(selectedFolder);
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="space-y-6">
      {/* Topplinje */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bildebank</h2>
          <p className="text-foreground-muted text-sm mt-1">
            {demoImages.length} bilder i {demoFolders.length} mapper
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface border border-border
                             rounded-xl text-sm font-medium text-foreground hover:bg-surface-muted transition-colors">
            <FolderPlus className="w-4 h-4" />
            Ny mappe
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground
                             rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm">
            <Upload className="w-4 h-4" />
            Last opp bilder
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Mappetre (venstre side) */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="bg-surface rounded-2xl border border-border p-4 sticky top-24">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Folder className="w-4 h-4 text-primary" />
              Mapper
            </h3>
            <button
              onClick={() => setSelectedFolder(null)}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg mb-1 transition-colors ${
                !selectedFolder ? 'bg-primary-light text-primary font-medium' : 'text-foreground-muted hover:bg-surface-muted'
              }`}
            >
              Alle bilder
            </button>
            {demoFolders.map((folder) => (
              <div key={folder.id}>
                <button
                  onClick={() => setSelectedFolder(folder.name)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                    selectedFolder === folder.name
                      ? 'bg-primary-light text-primary font-medium'
                      : 'text-foreground-muted hover:bg-surface-muted'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5" />
                  {folder.name}
                  {folder.children.length > 0 && (
                    <ChevronRight className="w-3 h-3 ml-auto" />
                  )}
                </button>
                {selectedFolder === folder.name && folder.children.length > 0 && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {folder.children.map((child) => (
                      <button
                        key={child}
                        onClick={() => setSelectedFolder(`${folder.name}/${child}`)}
                        className="w-full text-left px-3 py-1.5 text-xs text-foreground-subtle
                                   hover:text-foreground hover:bg-surface-muted rounded-lg transition-colors"
                      >
                        {child}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Hovedinnhold */}
        <div className="flex-1 min-w-0">
          {/* Søk og visning */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
              <input
                type="search"
                placeholder="Søk på filnavn, tagger, fotograf..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm
                           text-foreground placeholder:text-foreground-subtle
                           focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <div className="flex items-center bg-surface border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors ${
                  viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-foreground-muted hover:bg-surface-muted'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-colors ${
                  viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-foreground-muted hover:bg-surface-muted'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Opplastingssone */}
          <div
            className={`border-2 border-dashed rounded-2xl p-8 mb-6 text-center transition-all
                        ${dragOver
                          ? 'border-primary bg-primary-light'
                          : 'border-border hover:border-foreground-subtle'
                        }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
          >
            <Upload className="w-8 h-8 text-foreground-subtle mx-auto mb-3" />
            <p className="text-sm text-foreground-muted mb-1">
              Dra og slipp bilder hit, eller <span className="text-primary font-medium cursor-pointer">velg filer</span>
            </p>
            <p className="text-xs text-foreground-subtle">
              JPG, PNG, WebP • Maks 25 MB per fil • Støtter masseopplasting
            </p>
          </div>

          {/* Bilderutenett */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredImages.map((image) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(image)}
                  className="group relative bg-surface rounded-xl border border-border overflow-hidden
                             hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-left"
                >
                  {/* Bildeplassholder */}
                  <div className="aspect-square bg-gradient-to-br from-primary/5 to-accent/5
                                  flex items-center justify-center relative">
                    <ImageIcon className="w-8 h-8 text-foreground-subtle/50" />
                    {/* GDPR-status */}
                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                      image.gdpr === 'approved' ? 'bg-success text-white' :
                      image.gdpr === 'pending' ? 'bg-accent text-white' :
                      'bg-error text-white'
                    }`}>
                      {image.gdpr === 'approved' ? <Check className="w-3 h-3" /> :
                       <Shield className="w-3 h-3" />}
                    </div>
                    {/* AI-tagger-merke */}
                    {image.aiTags.length > 0 && (
                      <div className="absolute top-2 left-2 bg-primary/90 text-white px-2 py-0.5
                                      rounded-full text-[10px] font-medium flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium text-foreground truncate">{image.name}</p>
                    <p className="text-[10px] text-foreground-subtle mt-0.5 flex items-center gap-1">
                      <Camera className="w-2.5 h-2.5" />
                      {image.photographer}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-muted">
                    <th className="text-left px-4 py-3 font-medium text-foreground-muted">Filnavn</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground-muted hidden sm:table-cell">Mappe</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground-muted hidden md:table-cell">Fotograf</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground-muted hidden lg:table-cell">Tagger</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground-muted">GDPR</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredImages.map((image) => (
                    <tr key={image.id} className="hover:bg-surface-muted transition-colors cursor-pointer"
                        onClick={() => setSelectedImage(image)}>
                      <td className="px-4 py-3 font-medium text-foreground">{image.name}</td>
                      <td className="px-4 py-3 text-foreground-muted hidden sm:table-cell">{image.folder}</td>
                      <td className="px-4 py-3 text-foreground-muted hidden md:table-cell">{image.photographer}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex gap-1 flex-wrap">
                          {image.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 text-[10px] bg-surface-muted text-foreground-muted rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                          image.gdpr === 'approved' ? 'bg-success-light text-success' :
                          'bg-accent-light text-accent'
                        }`}>
                          {image.gdpr === 'approved' ? 'Godkjent' : 'Venter'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <MoreHorizontal className="w-4 h-4 text-foreground-subtle" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Bildedetalj-panel */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedImage(null)} />
          <div className="relative bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-2xl
                          max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">{selectedImage.name}</h3>
              <button onClick={() => setSelectedImage(null)} className="p-1 text-foreground-muted hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Bildeforhåndsvisning */}
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl
                              flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-foreground-subtle/30" />
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Mappe</label>
                  <p className="text-sm text-foreground mt-1">{selectedImage.folder}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Fotograf</label>
                  <p className="text-sm text-foreground mt-1 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" />
                    {selectedImage.photographer}
                  </p>
                </div>
              </div>

              {/* Manuelle tagger */}
              <div>
                <label className="text-xs font-medium text-foreground-muted uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-3 h-3" />
                  Manuelle tagger
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedImage.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-surface-muted
                                               text-foreground-muted text-sm rounded-full">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer hover:text-error" />
                    </span>
                  ))}
                  <button className="px-3 py-1 text-sm text-primary border border-dashed border-primary/50
                                     rounded-full hover:bg-primary-light transition-colors">
                    + Legg til
                  </button>
                </div>
              </div>

              {/* AI-tagger */}
              <div>
                <label className="text-xs font-medium text-foreground-muted uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-primary" />
                  AI-foreslåtte tagger
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedImage.aiTags.map((tag) => (
                    <button key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-light
                                                  text-primary text-sm rounded-full hover:bg-primary
                                                  hover:text-primary-foreground transition-colors"
                            title="Klikk for å godkjenne og legge til">
                      <Sparkles className="w-3 h-3" />
                      {tag}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-foreground-subtle mt-2">
                  Klikk på en AI-tagg for å legge den til som manuell tagg.
                </p>
              </div>

              {/* GDPR-status */}
              <div>
                <label className="text-xs font-medium text-foreground-muted uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  GDPR-status
                </label>
                <div className="flex gap-2 mt-2">
                  {['approved', 'pending', 'rejected'].map((status) => (
                    <button
                      key={status}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        selectedImage.gdpr === status
                          ? status === 'approved' ? 'bg-success text-white' :
                            status === 'pending' ? 'bg-accent text-white' :
                            'bg-error text-white'
                          : 'bg-surface-muted text-foreground-muted hover:bg-border'
                      }`}
                    >
                      {status === 'approved' ? 'Godkjent' : status === 'pending' ? 'Venter' : 'Avvist'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Handlinger */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button className="px-4 py-2 text-sm font-medium text-foreground-muted
                                   hover:text-foreground rounded-lg hover:bg-surface-muted transition-colors">
                  Slett bilde
                </button>
                <button className="px-6 py-2 text-sm font-medium bg-primary text-primary-foreground
                                   rounded-lg hover:bg-primary-hover transition-colors">
                  Lagre endringer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
