import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProgramCard, type ProgramLite } from "@/components/ProgramCard";

export const metadata: Metadata = { title: "Académie en ligne", description: "Formations islamiques en vidéo, accessibles partout et à tout moment." };

export default async function Academie() {
  const supabase = await createClient();
  const { data } = await supabase.from("programs").select("slug,title,short_description,level,modality,duration_label,price_fcfa,cover_url,is_demo,categories(name)")
    .eq("is_published", true).in("modality", ["video", "distance"]).order("title");
  return (
    <>
      <section className="motif-clair bg-encre text-white">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-rouge-pale">Académie en ligne</p>
          <h1 className="mt-2 max-w-3xl text-5xl font-semibold leading-tight md:text-6xl">Apprenez où que vous soyez.</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/75">Pour celles et ceux que la distance, le travail ou les contraintes personnelles empêchent de venir au centre : des formations complètes en vidéo, avec supports, exercices et suivi de progression.</p>
          <p className="mt-6 inline-block rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm">
            L&apos;achat en ligne et le lecteur vidéo ouvrent avec la version 2 de la plateforme. Le catalogue ci-dessous présente les formations prévues.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-6 md:grid-cols-4">
          {["Modules, chapitres et leçons", "Vidéos adaptées aux connexions mobiles", "PDF, audios et exercices", "Reprise là où vous vous êtes arrêté"].map((t) => (
            <div key={t} className="border-l-2 border-rouge pl-4 font-serif text-xl font-semibold">{t}</div>
          ))}
        </div>
        <h2 className="mt-14 text-4xl font-semibold">Formations en ligne</h2>
        {data && data.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(data as unknown as ProgramLite[]).map((p) => <ProgramCard key={p.slug} p={p} />)}
          </div>
        ) : <p className="mt-4 text-pierre">Les premières formations en ligne seront annoncées ici.</p>}
        <div className="carte mt-12 flex flex-wrap items-center justify-between gap-4 p-6">
          <p className="font-serif text-2xl font-semibold">Être prévenu à l&apos;ouverture de l&apos;académie</p>
          <Link href="/inscription?modalite=video" className="btn btn-rouge">Laisser mes coordonnées</Link>
        </div>
      </div>
    </>
  );
}
