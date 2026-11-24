import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PageHead } from "@/components/PageHead";

export const metadata: Metadata = { title: "Actualités et événements" };
const kinds: Record<string, string> = { actualite: "Actualité", conference: "Conférence", seminaire: "Séminaire", evenement: "Événement", annonce: "Annonce" };

export default async function Actualites() {
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("slug,title,excerpt,kind,published_at,event_starts_at,event_place,cover_url").order("published_at", { ascending: false });
  return (
    <>
      <PageHead kicker="La vie du centre" title="Actualités, conférences et événements" />
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 md:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).length === 0 && <p className="text-pierre">Aucune publication pour le moment.</p>}
        {(data ?? []).map((p) => (
          <Link key={p.slug} href={`/actualites/${p.slug}`} className="carte block overflow-hidden hover:border-rouge">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {p.cover_url ? <img src={p.cover_url} alt="" className="h-44 w-full object-cover" /> : <div className="motif h-24 bg-sable" />}
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-rouge">{kinds[p.kind]}</p>
              <h2 className="mt-1 text-2xl font-semibold leading-tight">{p.title}</h2>
              <p className="mt-1 text-sm text-pierre">{new Date(p.event_starts_at ?? p.published_at).toLocaleDateString("fr-FR", { dateStyle: "long" })}{p.event_place ? ` · ${p.event_place}` : ""}</p>
              {p.excerpt && <p className="mt-2 text-sm text-pierre">{p.excerpt}</p>}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
