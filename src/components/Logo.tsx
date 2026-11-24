import Image from "next/image";
import Link from "next/link";

export function Logo({ compact = false, clair = false }: { compact?: boolean; clair?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="CEFI-ÉLITE, accueil">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-trait">
        <Image src="/logo-cefi-elite.jpg" alt="" width={48} height={48} className="h-12 w-12 scale-110 object-contain" priority />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className={`block text-lg font-extrabold tracking-tight ${clair ? "text-white" : ""}`}>CEFI-<span className="text-rouge">ÉLITE</span></span>
          <span className={`block whitespace-nowrap text-[10.5px] font-semibold tracking-[0.08em] uppercase ${clair ? "text-white/60" : "text-pierre"}`}>Études &amp; formations islamiques</span>
        </span>
      )}
    </Link>
  );
}
