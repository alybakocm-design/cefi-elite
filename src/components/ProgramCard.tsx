import Link from "next/link";
import { Clock, BarChart3, ArrowUpRight } from "lucide-react";
import { fcfa, modalityLabel } from "@/lib/data";
import { disc } from "@/lib/disciplines";

export type ProgramLite = {
  slug: string; title: string; short_description: string | null; level: string | null; modality: string;
  duration_label: string | null; price_fcfa: number | null; cover_url: string | null; is_demo: boolean;
  categories?: { name: string; slug?: string } | null;
};

export function Cover({ slug, cover, className = "" }: { slug?: string | null; cover?: string | null; className?: string }) {
  const d = disc(slug);
  const Icon = d.icon;
  if (cover) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={cover} alt="" className={`h-full w-full object-cover ${className}`} />;
  }
  return (
    <div className={`motif-clair relative flex h-full w-full items-center justify-center overflow-hidden ${className}`} style={{ background: `linear-gradient(135deg, ${d.from}, ${d.to})` }}>
      <span className="absolute -right-3 -bottom-6 font-arabe text-8xl leading-none text-white/15" aria-hidden>{d.ar}</span>
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur"><Icon className="h-7 w-7 text-white" /></span>
    </div>
  );
}

export function ProgramCard({ p }: { p: ProgramLite }) {
  return (
    <Link href={`/formations/${p.slug}`} className="carte group flex flex-col overflow-hidden p-3 transition hover:-translate-y-1 hover:shadow-[var(--shadow-flottant)]">
      <div className="relative h-40 overflow-hidden rounded-xl">
        <Cover slug={p.categories?.slug} cover={p.cover_url} className="transition duration-500 group-hover:scale-105" />
        <span className="absolute top-3 left-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-encre shadow-sm">{modalityLabel[p.modality]}</span>
      </div>
      <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
        <p className="text-xs font-bold text-rouge">{p.categories?.name ?? "Formation"}</p>
        <h3 className="mt-1 text-lg leading-snug font-extrabold group-hover:text-rouge">{p.title}</h3>
        {p.short_description && <p className="mt-1.5 line-clamp-2 text-sm text-pierre">{p.short_description}</p>}
        <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-pierre">
          {p.level && <span className="flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" />{p.level}</span>}
          {p.duration_label && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{p.duration_label}</span>}
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-trait pt-3 mt-4">
          <span className="text-lg font-extrabold">{fcfa(p.price_fcfa)}</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rouge-pale text-rouge transition group-hover:bg-rouge group-hover:text-white"><ArrowUpRight className="h-4 w-4" /></span>
        </div>
        {p.is_demo && <span className="provisoire mt-3 self-start">Formation de démonstration</span>}
      </div>
    </Link>
  );
}
