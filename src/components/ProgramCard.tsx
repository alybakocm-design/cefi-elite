import Link from "next/link";
import { fcfa, modalityLabel } from "@/lib/data";

export type ProgramLite = {
  slug: string; title: string; short_description: string | null; level: string | null; modality: string;
  duration_label: string | null; price_fcfa: number | null; cover_url: string | null; is_demo: boolean;
  categories?: { name: string } | null;
};

export function ProgramCard({ p }: { p: ProgramLite }) {
  return (
    <Link href={`/formations/${p.slug}`} className="carte group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="motif relative flex h-36 items-end bg-sable p-4">
        {p.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="font-arabe text-4xl text-rouge/70" aria-hidden>علم</span>
        )}
        <span className="relative ml-auto rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold">{modalityLabel[p.modality]}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-rouge">{p.categories?.name ?? "Formation"}</p>
        <h3 className="mt-1 text-2xl font-semibold leading-tight group-hover:text-rouge">{p.title}</h3>
        {p.short_description && <p className="mt-2 text-sm text-pierre">{p.short_description}</p>}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-sm text-pierre">
          {p.level && <span>{p.level}</span>}
          {p.duration_label && <span>{p.duration_label}</span>}
          <span className="ml-auto font-semibold text-encre">{fcfa(p.price_fcfa)}</span>
        </div>
        {p.is_demo && <span className="provisoire mt-3 self-start">Formation de démonstration</span>}
      </div>
    </Link>
  );
}
