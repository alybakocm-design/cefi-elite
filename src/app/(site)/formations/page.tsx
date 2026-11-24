import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProgramCard, type ProgramLite } from "@/components/ProgramCard";
import { PageHead } from "@/components/PageHead";
import { modalityLabel } from "@/lib/data";

export const metadata: Metadata = { title: "Nos formations", description: "Catalogue des formations islamiques de CEFI-ÉLITE : présentiel, vidéo et à distance." };

export default async function Formations({ searchParams }: { searchParams: Promise<{ discipline?: string; modalite?: string; q?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: cats } = await supabase.from("categories").select("id,name,slug").order("sort_order");
  let q = supabase.from("programs").select("slug,title,short_description,level,modality,duration_label,price_fcfa,cover_url,is_demo,categories!inner(name,slug)").eq("is_published", true);
  if (sp.discipline) q = q.eq("categories.slug", sp.discipline);
  if (sp.modalite && sp.modalite in modalityLabel) q = q.eq("modality", sp.modalite);
  if (sp.q) q = q.ilike("title", `%${sp.q.replace(/[%_]/g, "")}%`);
  const { data: programs } = await q.order("title");
  const href = (k: string, v?: string) => {
    const p = new URLSearchParams(Object.entries(sp).filter(([, x]) => x) as [string, string][]);
    if (v) p.set(k, v); else p.delete(k);
    return `/formations${p.size ? "?" + p : ""}`;
  };
  return (
    <>
      <PageHead kicker="Catalogue" title="Nos formations">Présentiel au centre, vidéo à la demande ou à distance avec un formateur : choisissez la formule qui vous convient.</PageHead>
      <div className="mx-auto max-w-6xl px-5 py-10">
        <form className="flex flex-wrap gap-3" action="/formations">
          <input name="q" defaultValue={sp.q} placeholder="Rechercher une formation" className="champ max-w-xs" />
          {sp.discipline && <input type="hidden" name="discipline" value={sp.discipline} />}
          {sp.modalite && <input type="hidden" name="modalite" value={sp.modalite} />}
          <button className="btn btn-encre">Rechercher</button>
        </form>
        <div className="mt-6 flex flex-wrap gap-2 text-sm">
          <span className="py-1.5 font-semibold text-pierre">Modalité :</span>
          <Link href={href("modalite")} className={`rounded-full border px-3 py-1.5 ${!sp.modalite ? "border-encre bg-encre text-white" : "border-trait bg-white"}`}>Toutes</Link>
          {Object.entries(modalityLabel).map(([k, v]) => (
            <Link key={k} href={href("modalite", k)} className={`rounded-full border px-3 py-1.5 ${sp.modalite === k ? "border-encre bg-encre text-white" : "border-trait bg-white"}`}>{v}</Link>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <span className="py-1.5 font-semibold text-pierre">Discipline :</span>
          <Link href={href("discipline")} className={`rounded-full border px-3 py-1.5 ${!sp.discipline ? "border-rouge bg-rouge text-white" : "border-trait bg-white"}`}>Toutes</Link>
          {(cats ?? []).map((c) => (
            <Link key={c.slug} href={href("discipline", c.slug)} className={`rounded-full border px-3 py-1.5 ${sp.discipline === c.slug ? "border-rouge bg-rouge text-white" : "border-trait bg-white"}`}>{c.name}</Link>
          ))}
        </div>
        {programs && programs.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(programs as unknown as ProgramLite[]).map((p) => <ProgramCard key={p.slug} p={p} />)}
          </div>
        ) : <p className="mt-10 text-pierre">Aucune formation ne correspond à ces critères pour le moment.</p>}
      </div>
    </>
  );
}
