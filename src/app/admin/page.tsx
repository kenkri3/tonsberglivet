import {
  FileText,
  Calendar,
  Building2,
  Users,
  Image as ImageIcon,
  MessageSquare,
  TrendingUp,
  Eye,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard',
};

const stats = [
  { label: 'Artikler', value: '24', icon: FileText, href: '/admin/artikler', change: '+3 denne uken' },
  { label: 'Arrangementer', value: '18', icon: Calendar, href: '/admin/arrangementer', change: '5 kommende' },
  { label: 'Bedrifter', value: '312', icon: Building2, href: '/admin/bedrifter', change: '+8 denne måneden' },
  { label: 'Partnere', value: '52', icon: Users, href: '/admin/partnere', change: '2 nye søknader' },
  { label: 'Bilder', value: '1 247', icon: ImageIcon, href: '/admin/bildebank', change: '+42 denne uken' },
  { label: 'Meldinger', value: '7', icon: MessageSquare, href: '/admin/meldinger', change: '3 uleste' },
];

const recentActivity = [
  { type: 'Artikkel', title: 'Ny kafé åpner i Nedre Langgate', time: 'For 2 timer siden', status: 'Publisert' },
  { type: 'Arrangement', title: 'Bondens marked — August 2026', time: 'For 4 timer siden', status: 'Planlagt' },
  { type: 'Partner', title: 'Ny partnersøknad fra Sjøboden AS', time: 'I går', status: 'Venter' },
  { type: 'Bilde', title: '15 nye bilder lastet opp til "Sommer 2026"', time: 'I går', status: 'Tagget' },
  { type: 'Melding', title: 'Forespørsel om torvleie fra Tønsberg Frukt', time: 'For 2 dager siden', status: 'Ulest' },
];

const quickActions = [
  { label: 'Ny artikkel', href: '/admin/artikler/ny', icon: FileText },
  { label: 'Nytt arrangement', href: '/admin/arrangementer/ny', icon: Calendar },
  { label: 'Last opp bilder', href: '/admin/bildebank', icon: ImageIcon },
  { label: 'Se nettsiden', href: '/', icon: Eye },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Velkomst */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">God morgen, Cecilie 👋</h2>
        <p className="text-foreground-muted mt-1">
          Her er en oversikt over Tønsberglivet-portalen i dag.
        </p>
      </div>

      {/* Hurtighandlinger */}
      <div className="flex flex-wrap gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground
                       rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </Link>
        ))}
      </div>

      {/* Statistikk-kort */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group bg-surface rounded-2xl p-6 border border-border
                       hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-primary-light">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-foreground-subtle group-hover:text-primary
                                       group-hover:translate-x-0.5 group-hover:-translate-y-0.5
                                       transition-all" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm font-medium text-foreground-muted mt-1">{stat.label}</p>
            <p className="text-xs text-foreground-subtle mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-success" />
              {stat.change}
            </p>
          </Link>
        ))}
      </div>

      {/* Siste aktivitet */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Siste aktivitet</h3>
        </div>
        <div className="divide-y divide-border">
          {recentActivity.map((activity, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between
                                    hover:bg-surface-muted transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-primary bg-primary-light px-2 py-0.5 rounded-full">
                    {activity.type}
                  </span>
                  <span className="text-xs text-foreground-subtle">{activity.time}</span>
                </div>
                <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ml-4 ${
                activity.status === 'Publisert' ? 'bg-success-light text-success' :
                activity.status === 'Planlagt' ? 'bg-primary-light text-primary' :
                activity.status === 'Ulest' ? 'bg-error-light text-error' :
                'bg-accent-light text-accent'
              }`}>
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
