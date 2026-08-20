'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Search, ChevronDown, LayoutDashboard, ArrowUpRight, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { WeatherWidget } from '@/components/ui/WeatherWidget';
import { navigation, secondaryNavigation, type NavItem } from '@/lib/navigation';

const searchableItems = [
  { title: 'Færderbiennalen & Sommerkultur', category: 'Bylivet', href: '/nyheter/faerderbiennalen' },
  { title: 'Slottsfjellet & Slottsfjelltårnet', category: 'Reiselivet', href: '/reiselivet/opplevelser' },
  { title: 'Torvleie & Standplass', category: 'Bylivet', href: '/bylivet/torvleie' },
  { title: 'Gründergata & Bedriftsetablering', category: 'Næringslivet', href: '/naeringslivet/etablering' },
  { title: 'USN Campus Vestfold & Studentrabatter', category: 'Studentlivet', href: '/studentlivet/bolig-og-rabatter' },
  { title: 'Mat & Drikke på Brygga', category: 'Bylivet', href: '/bylivet/mat-og-drikke' },
  { title: 'Shopping i Tønsberg Sentrum', category: 'Bylivet', href: '/bylivet/shopping' },
  { title: 'Overnatting & Hoteller', category: 'Reiselivet', href: '/reiselivet/overnatting' },
  { title: 'Arrangementskalender & Konserter', category: 'Eventer', href: '/eventer' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (mobileOpen || searchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen, searchOpen]);

  const filteredResults = searchableItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Top Notification / Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Norges eldste kystby • 1155 års levende historie
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/eventer" className="hover:text-white transition-colors">
              Hva skjer i byen?
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/bylivet/torvleie" className="hover:text-white transition-colors">
              Leie plass på Torvet
            </Link>
            <span className="text-slate-600">|</span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 font-semibold"
            >
              <LayoutDashboard className="w-3 h-3" />
              Tønsberg OS Admin
            </Link>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || activeDropdown
            ? 'bg-surface/98 backdrop-blur-xl shadow-md border-b border-border'
            : 'bg-surface/90 backdrop-blur-md border-b border-border/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[var(--header-height)]">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
              aria-label="Tønsberglivet — Hjem"
            >
              <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-all">
                T
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  tønsberglivet
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground-subtle -mt-1 hidden sm:block">
                  Offisiell Byportal
                </span>
              </div>
            </Link>

            {/* Desktop-navigasjon */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Hovedmeny">
              {navigation.map((item) => (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-foreground
                               hover:text-primary transition-colors rounded-xl hover:bg-surface-muted"
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          activeDropdown === item.label ? 'rotate-180 text-primary' : 'text-foreground-subtle'
                        }`}
                      />
                    )}
                  </Link>

                  {/* Dropdown */}
                  {item.children && activeDropdown === item.label && (
                    <div className="absolute top-full left-0 pt-2 animate-slide-down z-50">
                      <div className="rounded-2xl shadow-2xl p-2 min-w-[240px] bg-surface border border-border">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm font-medium text-foreground
                                       hover:text-primary hover:bg-surface-muted
                                       rounded-xl transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Høyre side — verktøy */}
            <div className="flex items-center gap-2">
              <WeatherWidget />

              {/* Søk-knapp med Cmd+K badge */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-border bg-surface hover:bg-surface-muted text-xs font-medium text-foreground-muted transition-all shadow-xs"
                aria-label="Søk i portalen"
              >
                <Search className="w-4 h-4 text-foreground-subtle" />
                <span className="hidden sm:inline">Søk...</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-surface-muted border border-border rounded text-foreground-subtle">
                  ⌘K
                </kbd>
              </button>

              <ThemeToggle />

              {/* Admin Hub — Direkteknapp til backend */}
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-primary bg-primary-light hover:bg-primary hover:text-white rounded-xl transition-all shadow-xs"
                title="Gå direkte til Tønsberg OS Admin"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Admin OS
              </Link>

              {/* Mobilmeny-knapp */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full
                           hover:bg-surface-muted transition-colors text-foreground"
                aria-label={mobileOpen ? 'Lukk meny' : 'Åpne meny'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal (⌘K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={() => setSearchOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-surface rounded-3xl shadow-2xl border border-border overflow-hidden z-10 animate-slide-down">
            <div className="p-4 border-b border-border flex items-center gap-3 bg-surface-muted/50">
              <Search className="w-5 h-5 text-foreground-subtle shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Hva leter du etter i Tønsberg? (f.eks. Slottsfjellet, mat, torvleie, arrangement...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm font-medium bg-transparent text-foreground placeholder-foreground-subtle focus:outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="px-2 py-1 bg-surface border border-border rounded-lg text-xs font-mono text-foreground-subtle hover:bg-surface-muted"
              >
                ESC
              </button>
            </div>

            <div className="p-3 max-h-96 overflow-y-auto divide-y divide-border/50">
              {filteredResults.length > 0 ? (
                filteredResults.map((res, i) => (
                  <Link
                    key={i}
                    href={res.href}
                    onClick={() => setSearchOpen(false)}
                    className="p-3 rounded-2xl hover:bg-surface-muted flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors block">
                        {res.title}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-subtle">
                        {res.category}
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-foreground-subtle group-hover:text-primary transition-colors" />
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-foreground-muted">
                  Ingen resultater for &quot;{searchQuery}&quot;. Prøv et annet søkeord som &quot;brygga&quot; eller &quot;konsert&quot;.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobil fullskjermmeny */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />
          <nav
            className="relative pt-[calc(var(--header-height)+1rem)] px-6 pb-8 h-full overflow-y-auto"
            aria-label="Mobilmeny"
          >
            {navigation.map((item) => (
              <MobileNavGroup key={item.href} item={item} onClose={() => setMobileOpen(false)} />
            ))}

            <div className="border-t border-border mt-6 pt-6">
              {secondaryNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-foreground-muted hover:text-foreground transition-colors font-medium text-sm"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 mt-2 border-t border-border">
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold text-primary bg-primary-light rounded-2xl"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Gå til Tønsberg OS Admin
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

function MobileNavGroup({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border/60">
      <div className="flex items-center justify-between">
        <Link
          href={item.href}
          onClick={onClose}
          className="flex-1 py-4 text-base font-bold text-foreground hover:text-primary transition-colors"
        >
          {item.label}
        </Link>
        {item.children && (
          <button
            onClick={() => setOpen(!open)}
            className="p-2 -mr-2 text-foreground-muted"
            aria-label={`Vis undersider for ${item.label}`}
          >
            <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${open ? 'rotate-180 text-primary' : ''}`} />
          </button>
        )}
      </div>
      {item.children && open && (
        <div className="pb-4 pl-4 space-y-1 animate-slide-down">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onClose}
              className="block py-2 text-sm text-foreground-muted hover:text-foreground font-medium transition-colors"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
