import Image from "next/image";
import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="CEFI-ELITE, accueil">
      <Image src="/logo-cefi-elite.jpg" alt="" width={48} height={48} className="h-12 w-12 rounded-full mix-blend-multiply" priority />
      {!compact && (
        <span className="leading-tight">
          <span className="block font-serif text-xl font-bold tracking-wide">CEFI-ÉLITE</span>
          <span className="block text-[11px] uppercase tracking-[0.14em] text-pierre">Études et formations islamiques</span>
        </span>
      )}
    </Link>
  );
}
