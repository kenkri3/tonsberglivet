'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Store, Calendar, Search, Menu } from 'lucide-react';

export function MobileAppNav() {
  const pathname = usePathname();

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent('tonsberg-open-search'));
  };

  const handleOpenMenu = () => {
    window.dispatchEvent(new CustomEvent('tonsberg-open-menu'));
  };

  const navItems = [
    {
      label: 'Hjem',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'Bylivet',
      href: '/bylivet',
      icon: Store,
      isActive: pathname.startsWith('/bylivet'),
    },
    {
      label: 'Hva skjer',
      href: '/eventer',
      icon: Calendar,
      isActive: pathname.startsWith('/eventer'),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-surface/95 backdrop-blur-xl border-t border-border/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 transition-all"
      aria-label="Mobil app-navigasjon"
    >
      <div className="grid grid-cols-5 items-center max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all select-none min-h-[48px] ${
                item.isActive
                  ? 'text-primary font-bold scale-105'
                  : 'text-foreground-muted hover:text-foreground active:scale-95'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${item.isActive ? 'bg-primary/10' : ''}`}>
                <Icon className={`w-5 h-5 ${item.isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </Link>
          );
        })}

        {/* Hurtigsøk-knapp */}
        <button
          type="button"
          onClick={handleOpenSearch}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-2xl text-foreground-muted hover:text-foreground active:scale-95 transition-all select-none min-h-[48px]"
          aria-label="Åpne søk"
        >
          <div className="p-1 rounded-xl hover:bg-surface-muted transition-colors">
            <Search className="w-5 h-5 stroke-[1.8]" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Søk</span>
        </button>

        {/* Hovedmeny-knapp */}
        <button
          type="button"
          onClick={handleOpenMenu}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-2xl text-foreground-muted hover:text-foreground active:scale-95 transition-all select-none min-h-[48px]"
          aria-label="Åpne meny"
        >
          <div className="p-1 rounded-xl hover:bg-surface-muted transition-colors">
            <Menu className="w-5 h-5 stroke-[1.8]" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Meny</span>
        </button>
      </div>
    </nav>
  );
}
