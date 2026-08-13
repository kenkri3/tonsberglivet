import { Settings, Globe, Palette, Bell, Shield } from 'lucide-react';

export default function InnstillingerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Innstillinger</h2>
        <p className="text-foreground-muted text-sm mt-1">Administrer portalens innstillinger</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { icon: Globe, title: 'Nettside', desc: 'SEO, metadata og generelle innstillinger' },
          { icon: Palette, title: 'Utseende', desc: 'Farger, logo og visuell profil' },
          { icon: Bell, title: 'Varsler', desc: 'E-postvarsler og nyhetsbrev' },
          { icon: Shield, title: 'Brukere & Tilgang', desc: 'Administrer brukere og roller' },
        ].map((item, i) => (
          <div key={i} className="bg-surface rounded-2xl border border-border p-6
                                   hover:shadow-md transition-all cursor-pointer">
            <div className="p-2.5 rounded-xl bg-primary-light inline-block mb-3">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
            <p className="text-sm text-foreground-muted">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
