import Link from "next/link";
import { getSettings, text } from "@/lib/data";
import { Provisoire } from "./Provisoire";

export async function Footer() {
  const s = await getSettings();
  const contact = ["contact.address", "contact.phone", "contact.email", "contact.hours"];
  return (
    <footer className="motif-clair bg-encre text-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-serif text-2xl font-bold text-white">CEFI-ÉLITE</p>
          <p className="mt-1 text-sm uppercase tracking-[0.14em] text-white/60">{text(s, "site.full_name")}</p>
          <p className="mt-5 max-w-md text-sm leading-relaxed">{text(s, "site.tagline")}</p>
        </div>
        <div>
          <p className="mb-3 font-semibold text-white">Explorer</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/formations" className="hover:text-white">Nos formations</Link></li>
            <li><Link href="/academie" className="hover:text-white">Académie en ligne</Link></li>
            <li><Link href="/actualites" className="hover:text-white">Actualités et événements</Link></li>
            <li><Link href="/faq" className="hover:text-white">Questions fréquentes</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold text-white">Nous joindre</p>
          <ul className="space-y-2 text-sm">
            {contact.filter((k) => s[k]).map((k) => (
              <li key={k}>
                <span className="text-white/50">{s[k]?.label} : </span>{text(s, k)}
                {s[k]?.is_placeholder && <span className="ml-1 text-[10px] uppercase text-amber-300">provisoire</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-5 text-xs text-white/50">
          <span>© {new Date().getFullYear()} CEFI-ÉLITE · Bamako, Mali</span>
          <span className="flex gap-4"><Link href="/mentions" className="hover:text-white">Mentions et confidentialité</Link><Link href="/connexion" className="hover:text-white">Espace personnel</Link></span>
        </div>
      </div>
    </footer>
  );
}
export { Provisoire };
