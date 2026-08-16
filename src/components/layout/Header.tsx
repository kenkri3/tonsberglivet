'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Search, ChevronDown, LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { WeatherWidget } from '@/components/ui/WeatherWidget';
import { navigation, secondaryNavigation, type NavItem } from '@/lib/navigation';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || activeDropdown
            ? 'bg-surface shadow-md border-b border-border'
            : 'bg-surface/95 backdrop-blur-md border-b border-border/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[var(--header-height)]">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group"
              aria-label="Tønsberglivet — Hjem"
            >
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  tønsberglivet
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
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground
                               hover:text-primary transition-colors rounded-lg hover:bg-surface-muted"
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        activeDropdown === item.label ? 'rotate-180' : ''
                      }`} />
                    )}
                  </Link>

                  {/* Dropdown */}
                  {item.children && activeDropdown === item.label && (
                    <div className="absolute top-full left-0 pt-2 animate-slide-down z-50">
                      <div className="rounded-2xl shadow-2xl p-2 min-w-[240px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100
                                       hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800
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

              {/* Søk */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full
                           hover:bg-surface-muted transition-colors"
                aria-label="Søk"
              >
                <Search className="w-5 h-5 text-foreground-muted" />
              </button>

              <ThemeToggle />

              {/* Admin Hub — Direkteknapp til backend */}
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary-light hover:bg-primary hover:text-primary-foreground rounded-full transition-all shadow-sm"
                title="Gå direkte til Admin Hub / Backend"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Admin Hub
              </Link>

              {/* Mobilmeny-knapp */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full
                           hover:bg-surface-muted transition-colors"
                aria-label={mobileOpen ? 'Lukk meny' : 'Åpne meny'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? (
                  <X className="w-5 h-5 text-foreground" />
                ) : (
                  <Menu className="w-5 h-5 text-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Søkefelt */}
        {searchOpen && (
          <div className="border-t border-border bg-surface/95 backdrop-blur-xl animate-slide-down">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-subtle" />
                <input
                  type="search"
                  placeholder="Søk etter arrangementer, bedrifter, nyheter..."
                  className="w-full pl-12 pr-4 py-3 bg-surface-muted border border-border rounded-xl
                             text-foreground placeholder:text-foreground-subtle
                             focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                             transition-all"
                  autoFocus
                />
              </div>
            </div>
          </div>
        )}
      </header>

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
                  className="block py-3 text-foreground-muted hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 mt-2 border-t border-border">
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-primary bg-primary-light rounded-xl"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Gå til Admin Hub / Backend
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
    <div className="border-b border-border-muted">
      <div className="flex items-center justify-between">
        <Link
          href={item.href}
          onClick={onClose}
          className="flex-1 py-4 text-lg font-semibold text-foreground hover:text-primary transition-colors"
        >
          {item.label}
        </Link>
        {item.children && (
          <button
            onClick={() => setOpen(!open)}
            className="p-2 -mr-2 text-foreground-muted"
            aria-label={`Vis undersider for ${item.label}`}
          >
            <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
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
              className="block py-2 text-foreground-muted hover:text-foreground transition-colors"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
