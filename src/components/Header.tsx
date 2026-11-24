import Link from "next/link";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

export const NAV = [
  { href: "/a-propos", label: "Le centre" },
  { href: "/formations", label: "Formations" },
  { href: "/academie", label: "Académie en ligne" },
  { href: "/formateurs", label: "Formateurs" },
  { href: "/actualites", label: "Actualités" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-trait bg-ivoire/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-6 px-5 py-3">
        <Logo />
        <nav className="hidden items-center gap-6 text-[15px] lg:flex" aria-label="Navigation principale">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-encre/80 hover:text-rouge">{n.label}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/connexion" className="text-[15px] font-semibold hover:text-rouge">Mon espace</Link>
          <Link href="/inscription" className="btn btn-rouge">S&apos;inscrire</Link>
        </div>
        <MobileMenu />
      </div>
    </header>
  );
}
