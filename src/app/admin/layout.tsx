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
  Bot,
  Menu,
  X,
  ChevronLeft,
  MoreVertical,
  Zap,
  Keyboard,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { TonsbergAgentChat } from '@/components/admin/TonsbergAgentChat';

const adminNav = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Autonom Agent Hub', href: '/admin/agent', icon: Bot, badge: 'Live AI' },
  { label: 'Artikler', href: '/admin/artikler', icon: FileText },
  { label: 'Torvleie & Byrom', href: '/admin/booking', icon: MapPin, badge: '5 nye' },
  { label: 'Byskjermer & Marked', href: '/admin/marketing', icon: Tv, badge: '4K' },
  { label: 'Trafikk & Innsikt', href: '/admin/insights', icon: TrendingUp, badge: 'Live' },
  { label: 'Duett ERP & Økonomi', href: '/admin/finance', icon: CreditCard, badge: 'EHF 3.0' },
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
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [showSystemModal, setShowSystemModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Bestem aktiv modul basert på url
  const currentModule = pathname.includes('/admin/artikler')
    ? 'artikler'
    : pathname.includes('/admin/booking')
    ? 'booking'
    : pathname.includes('/admin/finance')
    ? 'finance'
    : pathname.includes('/admin/marketing')
    ? 'marketing'
    : pathname.includes('/admin/arrangementer')
    ? 'arrangementer'
    : pathname.includes('/admin/bedrifter')
    ? 'bedrifter'
    : undefined;

  // Hurtigtast (Cmd+J eller Ctrl+J) for å veksle Co-Pilot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setCopilotOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setHeaderMenuOpen(false);
        setShowSystemModal(false);
        setShowShortcutsModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lukk header-meny ved klikk utenfor
  useEffect(() => {
    if (!headerMenuOpen) return;
    const handleClickOutside = () => setHeaderMenuOpen(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [headerMenuOpen]);

  const isFullAgentPage = pathname === '/admin/agent';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobiloverlegg for meny */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: Alltid på venstre side */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 lg:w-64 bg-surface border-r border-border
                     transition-transform duration-300 lg:translate-x-0 shadow-2xl lg:shadow-none
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
                const isActive =
                  pathname === item.href ||
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
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-surface-muted text-primary border border-border'
                          }`}
                        >
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
          <div className="border-t border-border p-4 pb-10 lg:pb-4 shrink-0">
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

      {/* Hovedarbeidsflate med Toppheader og Valgfri Side-om-Side Co-Pilot */}
      <div className="flex-1 min-w-0 lg:pl-64 flex flex-col min-h-screen">
        {/* Topplinje */}
        <header className="sticky top-0 z-30 h-16 bg-surface/90 backdrop-blur-xl border-b border-border w-full">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-foreground-muted hover:text-foreground rounded-lg hover:bg-surface-muted"
                aria-label="Åpne sidemeny"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-foreground">
                  {adminNav.find(
                    (n) =>
                      pathname === n.href ||
                      (n.href !== '/admin' && pathname.startsWith(n.href))
                  )?.label || 'Admin Hub'}
                </h1>
                {currentModule && (
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                    {currentModule}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* AI Co-Pilot Toggle Knappen for side-om-side arbeid */}
              {!isFullAgentPage ? (
                <button
                  type="button"
                  onClick={() => setCopilotOpen(!copilotOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    copilotOpen
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/20'
                  }`}
                  title="Åpne AI Co-Pilot ved siden av arbeidsområdet (⌘J)"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {copilotOpen ? 'Skjul Co-Pilot' : 'AI Co-Pilot'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden md:inline text-[10px] opacity-75 font-mono ml-0.5">
                    ⌘J
                  </span>
                </button>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Agent Studio Aktiv</span>
                </div>
              )}

              {/* Tre-prikker Meny (...) for sekundære funksjoner for å unngå rot */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHeaderMenuOpen(!headerMenuOpen);
                  }}
                  className="p-2 rounded-xl border border-border text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
                  title="Innstillinger og verktøy"
                  aria-label="Flere alternativer"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {headerMenuOpen && (
                  <div
                    className="absolute right-0 top-12 w-64 bg-surface border border-border rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3.5 py-1.5 border-b border-border text-[11px] font-bold text-foreground-muted uppercase tracking-wider">
                      System & Verktøy
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSystemModal(true);
                        setHeaderMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted flex items-center gap-2.5 transition-colors"
                    >
                      <Zap className="w-4 h-4 text-primary" />
                      <span>Systemintegrasjoner (Brave, Tavily, m.m)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowShortcutsModal(true);
                        setHeaderMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted flex items-center gap-2.5 transition-colors"
                    >
                      <Keyboard className="w-4 h-4 text-foreground-muted" />
                      <span>Hurtigtaster & Snarveier (⌘J, ⌘K)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHeaderMenuOpen(false);
                        window.location.reload();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted flex items-center gap-2.5 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-foreground-muted" />
                      <span>Oppdater systemdata & Hurtiglager</span>
                    </button>
                    <div className="border-t border-border mt-1 pt-1.5 px-3.5 py-1">
                      <div className="flex items-center justify-between text-[10px] text-foreground-muted font-medium">
                        <span>Tønsberglivet OS</span>
                        <span className="text-emerald-500 font-bold">PostgreSQL OK</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tema-velger (Lyst / Mørkt) */}
              <ThemeToggle />

              {/* Brukerprofil-badge */}
              <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-border">
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

        {/* Side-om-side layout: Hovedinnhold + Integrert Co-Pilot */}
        <div className="flex-1 flex min-w-0 relative">
          {/* Hovedarbeidsflate for aktiv side */}
          <main className={`flex-1 min-w-0 ${isFullAgentPage ? 'p-2 sm:p-4 lg:p-8 pb-16 lg:pb-8' : 'p-4 lg:p-8 pb-28 lg:pb-8'}`}>{children}</main>

          {/* Desktop Co-Pilot Side-Panel (Side om side i sanntid) */}
          {copilotOpen && !isFullAgentPage && (
            <aside className="hidden lg:flex w-[400px] xl:w-[450px] shrink-0 border-l border-border bg-surface flex-col h-[calc(100vh-4rem)] sticky top-16 shadow-xl z-20 overflow-hidden animate-in slide-in-from-right-4 duration-200">
              <TonsbergAgentChat
                isSidePanel
                currentModule={currentModule}
                userName="Cecilie"
                onCloseSidePanel={() => setCopilotOpen(false)}
              />
            </aside>
          )}
        </div>

        {/* Mobil Co-Pilot Slide-over Sheet (når åpnet på mobil) */}
        {copilotOpen && !isFullAgentPage && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end lg:hidden animate-in fade-in duration-200"
            onClick={() => setCopilotOpen(false)}
          >
            <div
              className="bg-surface rounded-t-3xl border-t border-border h-[88vh] max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <TonsbergAgentChat
                isSidePanel
                currentModule={currentModule}
                userName="Cecilie"
                onCloseSidePanel={() => setCopilotOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Mobil Flytende Hurtig-knapp for Co-Pilot (hvis ikke allerede åpen) */}
        {!copilotOpen && !isFullAgentPage && (
          <button
            type="button"
            onClick={() => setCopilotOpen(true)}
            className="fixed bottom-20 right-4 z-30 lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-xl active:scale-95 transition-all border border-white/20"
            aria-label="Åpne AI Co-Pilot"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Co-Pilot</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        )}

        {/* Mobil App-bunnlinje (Native iOS/Android App Feeling) */}
        <nav
          className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-surface/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_25px_rgba(0,0,0,0.08)] pb-[max(env(safe-area-inset-bottom),0.6rem)] pt-1.5 transition-all duration-200 ${
            sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          aria-label="Admin mobilapp-navigasjon"
        >
          <div className="grid grid-cols-5 items-center max-w-md mx-auto px-1.5">
            {/* 1. Dashboard */}
            <Link
              href="/admin"
              className={`flex flex-col items-center justify-center py-1 rounded-2xl transition-all select-none min-h-[48px] ${
                pathname === '/admin'
                  ? 'text-primary font-bold scale-105'
                  : 'text-foreground-muted hover:text-foreground active:scale-95'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  pathname === '/admin' ? 'bg-primary/10' : ''
                }`}
              >
                <LayoutDashboard
                  className={`w-5 h-5 ${
                    pathname === '/admin' ? 'stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">Oversikt</span>
            </Link>

            {/* 2. Autonom Agent */}
            <Link
              href="/admin/agent"
              className={`flex flex-col items-center justify-center py-1 rounded-2xl transition-all select-none min-h-[48px] relative ${
                pathname.startsWith('/admin/agent')
                  ? 'text-primary font-bold scale-105'
                  : 'text-foreground-muted hover:text-foreground active:scale-95'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors relative ${
                  pathname.startsWith('/admin/agent') ? 'bg-primary/10' : ''
                }`}
              >
                <Bot
                  className={`w-5 h-5 ${
                    pathname.startsWith('/admin/agent')
                      ? 'stroke-[2.5]'
                      : 'stroke-[1.8]'
                  }`}
                />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-surface" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">Agent Hub</span>
            </Link>

            {/* 3. Artikler */}
            <Link
              href="/admin/artikler"
              className={`flex flex-col items-center justify-center py-1 rounded-2xl transition-all select-none min-h-[48px] ${
                pathname.startsWith('/admin/artikler')
                  ? 'text-primary font-bold scale-105'
                  : 'text-foreground-muted hover:text-foreground active:scale-95'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  pathname.startsWith('/admin/artikler') ? 'bg-primary/10' : ''
                }`}
              >
                <FileText
                  className={`w-5 h-5 ${
                    pathname.startsWith('/admin/artikler')
                      ? 'stroke-[2.5]'
                      : 'stroke-[1.8]'
                  }`}
                />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">Artikler</span>
            </Link>

            {/* 4. Torvleie & Booking */}
            <Link
              href="/admin/booking"
              className={`flex flex-col items-center justify-center py-1 rounded-2xl transition-all select-none min-h-[48px] relative ${
                pathname.startsWith('/admin/booking')
                  ? 'text-primary font-bold scale-105'
                  : 'text-foreground-muted hover:text-foreground active:scale-95'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors relative ${
                  pathname.startsWith('/admin/booking') ? 'bg-primary/10' : ''
                }`}
              >
                <MapPin
                  className={`w-5 h-5 ${
                    pathname.startsWith('/admin/booking')
                      ? 'stroke-[2.5]'
                      : 'stroke-[1.8]'
                  }`}
                />
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-black text-[8px] px-1 rounded-full border border-surface leading-tight">
                  5
                </span>
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">Torvleie</span>
            </Link>

            {/* 5. Meny / Skuff */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col items-center justify-center py-1 rounded-2xl text-foreground-muted hover:text-foreground active:scale-95 transition-all select-none min-h-[48px]"
              aria-label="Åpne alle moduler"
            >
              <div className="p-1 rounded-xl hover:bg-surface-muted transition-colors">
                <Menu className="w-5 h-5 stroke-[1.8]" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">Alle</span>
            </button>
          </div>
        </nav>
      </div>

      {/* ── MODAL: Systemintegrasjoner (Fra Header Tre-Prikker) ── */}
      {showSystemModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowSystemModal(false)}
        >
          <div
            className="bg-surface border border-border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Tilkoblede Systemintegrasjoner</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSystemModal(false)}
                className="p-1 rounded-lg text-foreground-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-surface-muted flex items-center justify-between border border-border">
                <div className="flex items-center gap-2.5">
                  <span>🦁</span>
                  <div>
                    <div className="font-bold text-foreground">Brave Search API</div>
                    <div className="text-[10px] text-foreground-muted">Raskt nettsøk & faktasjekk</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Aktiv
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-muted flex items-center justify-between border border-border">
                <div className="flex items-center gap-2.5">
                  <span>🔍</span>
                  <div>
                    <div className="font-bold text-foreground">Tavily Deep Research</div>
                    <div className="text-[10px] text-foreground-muted">Dyp kildegransking og analyser</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Aktiv
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-muted flex items-center justify-between border border-border">
                <div className="flex items-center gap-2.5">
                  <span>🕷️</span>
                  <div>
                    <div className="font-bold text-foreground">Apify Web Scrapers</div>
                    <div className="text-[10px] text-foreground-muted">Henting av arrangementer og kultur</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Aktiv
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-muted flex items-center justify-between border border-border">
                <div className="flex items-center gap-2.5">
                  <span>💳</span>
                  <div>
                    <div className="font-bold text-foreground">Duett ERP (EHF 3.0)</div>
                    <div className="text-[10px] text-foreground-muted">Autonom fakturering av torvleie</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Klar
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-muted flex items-center justify-between border border-border">
                <div className="flex items-center gap-2.5">
                  <span>🗄️</span>
                  <div>
                    <div className="font-bold text-foreground">PostgreSQL & Prisma</div>
                    <div className="text-[10px] text-foreground-muted">Lokal og Railway produksjonsdatabase</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Tilkoblet
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSystemModal(false)}
              className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-hover transition-colors"
            >
              Lukk oversikt
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: Hurtigtaster (Fra Header Tre-Prikker) ── */}
      {showShortcutsModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div
            className="bg-surface border border-border rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Hurtigtaster</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-lg text-foreground-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border">
                <span className="text-foreground-muted">Åpne / Lukk AI Co-Pilot</span>
                <kbd className="px-2 py-0.5 rounded bg-surface-muted border border-border font-mono font-bold text-[11px]">
                  Cmd / Ctrl + J
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border">
                <span className="text-foreground-muted">Fokuser chat</span>
                <kbd className="px-2 py-0.5 rounded bg-surface-muted border border-border font-mono font-bold text-[11px]">
                  Cmd / Ctrl + K
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border">
                <span className="text-foreground-muted">Send melding i chat</span>
                <kbd className="px-2 py-0.5 rounded bg-surface-muted border border-border font-mono font-bold text-[11px]">
                  Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border">
                <span className="text-foreground-muted">Linjeskift</span>
                <kbd className="px-2 py-0.5 rounded bg-surface-muted border border-border font-mono font-bold text-[11px]">
                  Shift + Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-foreground-muted">Lukk menyer / paneler</span>
                <kbd className="px-2 py-0.5 rounded bg-surface-muted border border-border font-mono font-bold text-[11px]">
                  Esc
                </kbd>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowShortcutsModal(false)}
              className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-hover transition-colors"
            >
              OK, forstått
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
