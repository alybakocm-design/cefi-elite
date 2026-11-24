import Link from "next/link";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { getSettings, text } from "@/lib/data";

export const NAV = [
  { href: "/a-propos", label: "Le centre" },
  { href: "/formations", label: "Formations" },
  { href: "/academie", label: "Académie en ligne" },
  { href: "/formateurs", label: "Formateurs" },
  { href: "/actualites", label: "Actualités" },
  { href: "/contact", label: "Contact" },
];

export async function Header() {
  const s = await getSettings();
  const real = (k: string) => (s[k] && !s[k].is_placeholder ? text(s, k) : "");
  const infos = [
    { icon: MapPin, v: real("contact.address") || "Bamako, Mali" },
    { icon: Phone, v: real("contact.phone") },
    { icon: Mail, v: real("contact.email") },
  ].filter((i) => i.v);
  return (
    <header className="sticky top-0 z-40">
      <div className="hidden bg-encre text-[13px] text-white/75 md:block">
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-5">
          <div className="flex gap-6">{infos.map(({ icon: I, v }) => <span key={v} className="flex items-center gap-1.5"><I className="h-3.5 w-3.5 text-rouge" />{v}</span>)}</div>
          <span>Présentiel à Bamako · Formations en ligne partout</span>
        </div>
      </div>
      <div className="border-b border-trait bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-6 px-5">
          <Logo />
          <nav className="hidden items-center gap-0.5 text-[14.5px] font-semibold whitespace-nowrap xl:flex" aria-label="Navigation principale">
            {NAV.map((n) => <Link key={n.href} href={n.href} className="rounded-full px-3 py-2 text-encre/75 hover:bg-sable hover:text-encre">{n.label}</Link>)}
          </nav>
          <div className="hidden items-center gap-2 whitespace-nowrap xl:flex">
            <Link href="/connexion" className="rounded-full px-4 py-2 text-[14.5px] font-bold hover:bg-sable">Se connecter</Link>
            <Link href="/inscription" className="btn btn-rouge py-2.5">S&apos;inscrire <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
