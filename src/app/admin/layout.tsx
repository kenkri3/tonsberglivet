'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Building2,
  Users,
  FolderOpen,
  Image as ImageIcon,
  MessageSquare,
  MapPin,
  Settings,
  Tv,
  TrendingUp,
  CreditCard,
  Sparkles,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const adminNav = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Artikler', href: '/admin/artikler', icon: FileText },
  { label: 'Torvleie & Byrom', href: '/admin/booking', icon: MapPin, badge: '5 nye' },
  { label: 'Byskjermer & Marked', href: '/admin/marketing', icon: Tv, badge: '4K' },
  { label: 'Trafikk & Innsikt', href: '/admin/insights', icon: TrendingUp, badge: 'Live' },
  { label: 'Duett ERP & Økonomi', href: '/admin/finance', icon: CreditCard, badge: 'EHF 3.0' },
  { label: 'AI Copilot Studio', href: '/admin/copilot', icon: Sparkles, badge: 'Gemini' },
  { label: 'Bildebank', href: '/admin/bildebank', icon: ImageIcon },
  { label: 'Arrangementer', href: '/admin/arrangementer', icon: Calendar },
  { label: 'Bedrifter', href: '/admin/bedrifter', icon: Building2 },
  { label: 'Partnere', href: '/admin/partnere', icon: Users },
  { label: 'Prosjekter', href: '/admin/prosjekter', icon: FolderOpen },
  { label: 'Meldinger', href: '/admin/meldinger', icon: MessageSquare },
  { label: 'Innstillinger', href: '/admin/innstillinger', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobiloverlegg */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border
                     transition-transform duration-300 lg:translate-x-0
                     ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo-linje */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">tønsberglivet</span>
              <span className="text-xs font-medium text-primary bg-primary-light px-2 py-0.5 rounded-full">
                OS
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-foreground-muted hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigasjon */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {adminNav.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold
                                  transition-all duration-200 ${
                                    isActive
                                      ? 'bg-primary text-primary-foreground shadow-sm'
                                      : 'text-foreground-muted hover:text-foreground hover:bg-surface-muted'
                                  }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-surface-muted text-primary border border-border'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bunn */}
          <div className="border-t border-border p-4 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-xs text-foreground-muted
                         hover:text-foreground rounded-lg hover:bg-surface-muted transition-colors font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              Tilbake til nettsiden
            </Link>
          </div>
        </div>
      </aside>

      {/* Hovedinnhold og Admin Header (Side om side på desktop) */}
      <div className="flex-1 min-w-0 lg:pl-64 flex flex-col min-h-screen">
        {/* Topplinje */}
        <header className="sticky top-0 z-30 h-16 bg-surface/90 backdrop-blur-xl border-b border-border w-full">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-foreground-muted hover:text-foreground rounded-lg
                           hover:bg-surface-muted"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-base font-bold text-foreground">
                {adminNav.find((n) => 
                  pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href))
                )?.label || 'Admin Hub'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="flex items-center gap-3 pl-3 border-l border-border">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-xs">
                  <span className="text-xs font-bold text-primary-foreground">TL</span>
                </div>
                <span className="hidden sm:block text-xs font-bold text-foreground">
                  Tønsberglivet Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Sideinnhold */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}


