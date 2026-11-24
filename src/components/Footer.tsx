import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { getSettings, text } from "@/lib/data";
import { Logo } from "./Logo";

export async function Footer() {
  const s = await getSettings();
  const contact = [
    { k: "contact.address", icon: MapPin }, { k: "contact.phone", icon: Phone }, { k: "contact.email", icon: Mail }, { k: "contact.hours", icon: Clock },
  ].filter(({ k }) => s[k]);
  const cols = [
    { t: "Formations", l: [["/formations", "Catalogue"], ["/formations?modalite=presentiel", "En présentiel"], ["/academie", "Académie en ligne"], ["/formations?modalite=distance", "À distance"]] },
    { t: "Le centre", l: [["/a-propos", "Présentation"], ["/formateurs", "Formateurs"], ["/actualites", "Actualités"], ["/faq", "Questions fréquentes"]] },
  ];
  return (
    <footer className="motif-clair bg-encre text-white/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1.5fr_1fr_1fr_1.4fr]">
        <div>
          <Logo clair />
          <p className="mt-5 max-w-xs text-sm leading-relaxed">{text(s, "site.tagline")}</p>
          <Link href="/inscription" className="btn btn-rouge mt-6 py-2.5">Déposer ma candidature</Link>
        </div>
        {cols.map((c) => (
          <div key={c.t}>
            <p className="mb-4 font-bold text-white">{c.t}</p>
            <ul className="space-y-2.5 text-sm">{c.l.map(([h, l]) => <li key={h}><Link href={h} className="hover:text-white">{l}</Link></li>)}</ul>
          </div>
        ))}
        <div>
          <p className="mb-4 font-bold text-white">Nous joindre</p>
          <ul className="space-y-3 text-sm">
            {contact.map(({ k, icon: I }) => (
              <li key={k} className="flex gap-2.5"><I className="mt-0.5 h-4 w-4 shrink-0 text-rouge" />
                <span>{text(s, k)}{s[k].is_placeholder && <span className="ml-1 text-[10px] font-bold uppercase text-amber-300">provisoire</span>}</span></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-5 text-xs text-white/45">
          <span>© {new Date().getFullYear()} CEFI-ÉLITE · Bamako, Mali</span>
          <span className="flex gap-5"><Link href="/mentions" className="hover:text-white">Mentions et confidentialité</Link><Link href="/connexion" className="hover:text-white">Espace personnel</Link></span>
        </div>
      </div>
    </footer>
  );
}
