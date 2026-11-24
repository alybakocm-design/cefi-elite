"use client";
import Link from "next/link";
import { useState } from "react";

const NAV = [
  { href: "/a-propos", label: "Le centre" },
  { href: "/formations", label: "Formations" },
  { href: "/academie", label: "Académie en ligne" },
  { href: "/formateurs", label: "Formateurs" },
  { href: "/actualites", label: "Actualités" },
  { href: "/faq", label: "Questions fréquentes" },
  { href: "/contact", label: "Contact" },
  { href: "/connexion", label: "Mon espace" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu" className="rounded-md border border-trait p-2">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full border-b border-trait bg-ivoire px-5 pb-5 shadow-sm">
          <nav className="flex flex-col py-2">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="border-b border-trait py-3 text-lg">{n.label}</Link>
            ))}
          </nav>
          <Link href="/inscription" onClick={() => setOpen(false)} className="btn btn-rouge mt-3 w-full">S&apos;inscrire</Link>
        </div>
      )}
    </div>
  );
}
