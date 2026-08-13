'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Search, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
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
          scrolled
            ? 'bg-surface/90 backdrop-blur-xl shadow-md border-b border-border/50'
            : 'bg-transparent'
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
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground-muted
                               hover:text-foreground transition-colors rounded-lg hover:bg-surface-muted"
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
                    <div className="absolute top-full left-0 pt-2 animate-slide-down">
                      <div className="glass rounded-xl shadow-xl p-2 min-w-[220px]
                                      bg-surface border border-border">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm text-foreground-muted
                                       hover:text-foreground hover:bg-surface-muted
                                       rounded-lg transition-colors"
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
