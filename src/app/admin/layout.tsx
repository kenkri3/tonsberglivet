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
  Bell,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { TonsbergAgentChat } from '@/components/admin/TonsbergAgentChat';
import { roleLabel } from '@/lib/roles';

const adminNav = [
  { label: 'Dashboard',           href: '/admin',                   icon: LayoutDashboard },
  { label: 'Team & Samhandling',  href: '/admin/team',              icon: UserCheck,     badge: 'team' as const },
  { label: 'Autonom Agent Hub',   href: '/admin/agent',             icon: Bot,           badge: 'live' as const },
  { label: 'Artikler',            href: '/admin/artikler',          icon: FileText },
  { label: 'Sider',               href: '/admin/sider',             icon: FileText },
  { label: 'Torvleie & Byrom',    href: '/admin/booking',           icon: MapPin },
  { label: 'Byskjermer & Marked', href: '/admin/marketing',         icon: Tv },
  { label: 'Trafikk & Innsikt',   href: '/admin/insights',          icon: TrendingUp,    badge: 'live' as const },
  { label: 'Duett ERP & Økonomi', href: '/admin/finance',           icon: CreditCard },
  { label: 'Bildebank',           href: '/admin/bildebank',         icon: ImageIcon },
  { label: 'Arrangementer',       href: '/admin/arrangementer',     icon: Calendar },
  { label: 'Kalender',            href: '/admin/arrangementer/kalender', icon: Calendar },
  { label: 'Bedrifter',           href: '/admin/bedrifter',         icon: Building2 },
  { label: 'Bedriftsregister',    href: '/admin/bedrifter/register', icon: Building2 },
  { label: 'Partnere',            href: '/admin/partnere',          icon: Users },
  { label: 'Prosjekter',          href: '/admin/prosjekter',        icon: FolderOpen },
  { label: 'Meldinger',           href: '/admin/meldinger',         icon: MessageSquare },
  { label: 'Innstillinger',       href: '/admin/innstillinger',     icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [showSystemModal, setShowSystemModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [assignedToMeCount, setAssignedToMeCount] = useState(0);
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [recentNotifText, setRecentNotifText] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string | null; email: string; role: string } | null>(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated && d.user) setCurrentUser(d.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      window.location.href = '/login?loggedOut=true';
    }
  };

  // Syntetisk lydsignal ved nye meldinger (Web Audio API uten eksterne filer)
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Ignorer hvis lyd ikke er tillatt av nettleseren
    }
  };

  // Polling for nye chat-meldinger og torvleiesøknader
  useEffect(() => {
    const checkLiveStatus = async () => {
      try {
        const res = await fetch('/api/agent/live-chat?countOnly=true');
        const data = await res.json();
        if (data.success && typeof data.unreadCount === 'number') {
          if (data.unreadCount > prevCountRef.current && prevCountRef.current !== 0) {
            playChime();
            setRecentNotifText('Ny henvendelse mottatt i Tønsberg-Guiden!');
            setTimeout(() => setRecentNotifText(null), 7000);
          }
          prevCountRef.current = data.unreadCount;
          setUnreadChatCount(data.unreadCount);
        }
        if (data.success && typeof data.assignedToMeCount === 'number') {
          setAssignedToMeCount(data.assignedToMeCount);
        }
      } catch {
        // Ignorer
      }

      try {
        const bRes = await fetch('/api/booking');
        const bData = await bRes.json();
        if (bData.success && Array.isArray(bData.data)) {
          // RequestStatus-enumet er NEW | PROCESSING | APPROVED | REJECTED – «PENDING» finnes ikke.
          const pending = bData.data.filter(
            (b: any) => b.status === 'NEW' || b.status === 'PROCESSING'
          ).length;
          setPendingBookingsCount(pending);
        }
      } catch {
        // Ignorer
      }
    };

    checkLiveStatus();
    const timer = setInterval(checkLiveStatus, 10000);
    return () => clearInterval(timer);
  }, []);

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
        setShowNotifDropdown(false);
        setShowSystemModal(false);
        setShowShortcutsModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lukk header-meny ved klikk utenfor
  useEffect(() => {
    if (!headerMenuOpen && !showNotifDropdown) return;
    const handleClickOutside = () => {
      setHeaderMenuOpen(false);
      setShowNotifDropdown(false);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [headerMenuOpen, showNotifDropdown]);

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
          <nav className="flex-1 overflow-y-auto py-3 px-3">
            <ul className="space-y-0.5">
              {adminNav.map((item, idx) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(item.href));
                const isChat = item.href === '/admin/meldinger';
                const isBooking = item.href === '/admin/booking';
                const liveCount = isChat && unreadChatCount > 0
                  ? unreadChatCount
                  : isBooking && pendingBookingsCount > 0
                  ? pendingBookingsCount
                  : (item as any).count;
                const isLivePulse = (item as any).badge === 'live';

                // Section divider before Bildebank (idx 7)
                const showDivider = idx === 7;

                return (
                  <li key={item.href}>
                    {showDivider && (
                      <div className="my-3 mx-1 border-t border-border/60" />
                    )}
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium
                                  transition-all duration-150 ${
                                    isActive
                                      ? 'bg-primary text-primary-foreground shadow-sm'
                                      : 'text-foreground-muted hover:text-foreground hover:bg-surface-muted'
                                  }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-foreground-subtle group-hover:text-foreground'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {/* Live pulse dot */}
                        {isLivePulse && (
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-white' : 'bg-emerald-500'} animate-pulse`} />
                        )}
                        {/* Numeric count bubble */}
                        {liveCount != null && liveCount > 0 && (
                          <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center leading-none ${
                            isChat && unreadChatCount > 0
                              ? 'bg-amber-500 text-white'
                              : isActive
                              ? 'bg-white/25 text-white'
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {liveCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bunn */}
          <div className="border-t border-border p-4 pb-10 lg:pb-4 shrink-0 space-y-1">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-xs text-foreground-muted
                         hover:text-foreground rounded-lg hover:bg-surface-muted transition-colors font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              Tilbake til nettsiden
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400
                         hover:text-rose-700 hover:bg-rose-500/10 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              {loggingOut ? 'Logger ut...' : 'Logg ut'}
            </button>
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

              {/* Notifikasjons-bjelle for nye henvendelser / live chat */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotifDropdown(!showNotifDropdown);
                  }}
                  className={`relative p-2 rounded-xl border transition-colors ${
                    unreadChatCount > 0
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                      : assignedToMeCount > 0
                      ? 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/20'
                      : 'border-border text-foreground-muted hover:text-foreground hover:bg-surface-muted'
                  }`}
                  title="Systemvarsler og chathenvendelser"
                  aria-label="Systemvarsler"
                >
                  <Bell className="w-4 h-4" />
                  {unreadChatCount > 0 ? (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse shadow-xs">
                      {unreadChatCount}
                    </span>
                  ) : assignedToMeCount > 0 ? (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shadow-xs">
                      {assignedToMeCount}
                    </span>
                  ) : null}
                </button>

                {showNotifDropdown && (
                  <div
                    className="absolute right-0 top-12 w-72 bg-surface border border-border rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3.5 py-1.5 border-b border-border flex items-center justify-between text-[11px] font-bold text-foreground-muted uppercase tracking-wider">
                      <span>Varsler</span>
                      {unreadChatCount > 0 && (
                        <span className="text-[10px] font-bold text-amber-500">
                          {unreadChatCount} nye
                        </span>
                      )}
                    </div>

                    <div className="p-2 space-y-1">
                      {unreadChatCount > 0 ? (
                        <Link
                          href="/admin/meldinger"
                          onClick={() => setShowNotifDropdown(false)}
                          className="w-full text-left p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-foreground flex items-start gap-2.5 transition-colors border border-amber-500/20"
                        >
                          <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0 animate-ping" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground">
                              {unreadChatCount} {unreadChatCount === 1 ? 'ny henvendelse' : 'nye henvendelser'} i chatten
                            </p>
                            <p className="text-[11px] text-foreground-muted truncate">
                              En innbygger eller turist venter på svar i Tønsberg-Guiden.
                            </p>
                          </div>
                        </Link>
                      ) : (
                        <div className="p-3 text-center text-xs text-foreground-muted">
                          Ingen nye varsler akkurat nå.
                        </div>
                      )}

                      {/* Samtaler en kollega har sendt over til deg */}
                      {assignedToMeCount > 0 && (
                        <Link
                          href="/admin/meldinger"
                          onClick={() => setShowNotifDropdown(false)}
                          className="w-full text-left p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-foreground flex items-start gap-2.5 transition-colors border border-primary/20"
                        >
                          <span className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground">
                              {assignedToMeCount} {assignedToMeCount === 1 ? 'samtale er' : 'samtaler er'} tildelt deg
                            </p>
                            <p className="text-[11px] text-foreground-muted truncate">
                              En kollega har sendt over en henvendelse du skal følge opp.
                            </p>
                          </div>
                        </Link>
                      )}

                      <Link
                        href="/admin/meldinger"
                        onClick={() => setShowNotifDropdown(false)}
                        className="w-full text-center block py-1.5 text-[11px] font-semibold text-primary hover:underline"
                      >
                        Gå til alle meldinger →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

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
                    <button
                      type="button"
                      onClick={() => {
                        setHeaderMenuOpen(false);
                        handleLogout();
                      }}
                      disabled={loggingOut}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors border-t border-border mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{loggingOut ? 'Logger ut...' : 'Logg ut av systemet'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Tema-velger (Lyst / Mørkt) */}
              <ThemeToggle />

              {/* Brukerprofil-badge & Logg ut */}
              <div className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-3 border-l border-border">
                <Link
                  href="/admin/team"
                  className="flex items-center gap-2 hover:opacity-85 transition"
                  title="Gå til Team & Brukere"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-xs">
                    <span className="text-xs font-bold text-primary-foreground">
                      {currentUser?.name
                        ? currentUser.name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)
                        : (currentUser?.email ? currentUser.email.slice(0, 2).toUpperCase() : 'TL')}
                    </span>
                  </div>
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-bold text-foreground leading-tight">
                      {currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0] : 'Tønsberglivet Admin')}
                    </span>
                    <span className="text-[10px] text-foreground-muted font-medium capitalize">
                      {roleLabel(currentUser?.role)}
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
                  title="Logg ut av administrasjonspanelet"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{loggingOut ? 'Logger ut...' : 'Logg ut'}</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Side-om-side layout: Hovedinnhold + Integrert Co-Pilot */}
        <div className="flex-1 flex min-w-0 relative">
          {/* Flytende varsel-toast for nye innbygger-henvendelser */}
          {recentNotifText && (
            <div className="fixed top-20 right-6 z-50 bg-amber-500 text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
              <div>
                <p className="font-bold text-xs">{recentNotifText}</p>
                <Link
                  href="/admin/meldinger"
                  onClick={() => setRecentNotifText(null)}
                  className="text-[11px] underline font-semibold text-white/90 hover:text-white"
                >
                  Gå til innboksen for å svare brukeren →
                </Link>
              </div>
              <button
                type="button"
                onClick={() => setRecentNotifText(null)}
                className="p-1 hover:bg-white/20 rounded-lg text-white ml-2"
                aria-label="Lukk varsel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

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
                {pendingBookingsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-black text-[8px] px-1 rounded-full border border-surface leading-tight">
                    {pendingBookingsCount}
                  </span>
                )}
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
