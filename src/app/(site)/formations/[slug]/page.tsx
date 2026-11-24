import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { fcfa, modalityLabel } from "@/lib/data";

async function load(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("programs")
    .select("*, categories(name), program_sessions(id,label,starts_on,ends_on,schedule_text,capacity,is_open,trainers(full_name)), subjects(name,coefficient,sort_order)")
    .eq("slug", slug).eq("is_published", true).maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await load((await params).slug);
  return p ? { title: p.title, description: p.short_description ?? undefined } : {};
}

const Bloc = ({ titre, children }: { titre: string; children: React.ReactNode }) => (
  <section className="border-t border-trait py-8"><h2 className="text-3xl font-semibold">{titre}</h2><div className="prose-cefi mt-3 whitespace-pre-line text-pierre">{children}</div></section>
);

export default async function Formation({ params }: { params: Promise<{ slug: string }> }) {
  const p = await load((await params).slug);
  if (!p) notFound();
  const sessions = (p.program_sessions ?? []).filter((s: { is_open: boolean }) => s.is_open);
  return (
    <>
      <section className="motif border-b border-trait">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <Link href="/formations" className="text-sm text-pierre hover:text-rouge">← Toutes les formations</Link>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-rouge">{p.categories?.name} · {modalityLabel[p.modality]}</p>
          <h1 className="mt-2 max-w-3xl text-5xl font-semibold leading-tight">{p.title}</h1>
          {p.short_description && <p className="mt-4 max-w-2xl text-lg text-pierre">{p.short_description}</p>}
          {p.is_demo && <p className="provisoire mt-4">Formation de démonstration — contenu fictif</p>}
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-6 lg:grid-cols-[1fr_320px]">
        <div>
          {p.description && <Bloc titre="Présentation">{p.description}</Bloc>}
          {p.objectives && <Bloc titre="Objectifs pédagogiques">{p.objectives}</Bloc>}
          {p.target_audience && <Bloc titre="Public visé">{p.target_audience}</Bloc>}
          {p.prerequisites && <Bloc titre="Prérequis">{p.prerequisites}</Bloc>}
          {p.syllabus && <Bloc titre="Programme">{p.syllabus}</Bloc>}
          {p.subjects?.length > 0 && (
            <Bloc titre="Matières">
              <ul className="grid gap-2 sm:grid-cols-2">
                {[...p.subjects].sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order).map((s: { name: string; coefficient: number }) => (
                  <li key={s.name} className="carte flex justify-between px-4 py-2 text-encre"><span>{s.name}</span><span className="text-pierre">coef. {s.coefficient}</span></li>
                ))}
              </ul>
            </Bloc>
          )}
          {p.modality === "presentiel" && (
            <Bloc titre="Sessions">
              {sessions.length === 0 ? <p>Aucune session ouverte pour le moment.</p> : (
                <div className="space-y-3">
                  {sessions.map((s: { id: string; label: string; starts_on: string | null; ends_on: string | null; schedule_text: string | null; capacity: number | null; trainers: { full_name: string } | null }) => (
                    <div key={s.id} className="carte p-4 text-encre">
                      <p className="font-semibold">{s.label}</p>
                      <p className="text-sm text-pierre">
                        {s.starts_on ? `Du ${new Date(s.starts_on).toLocaleDateString("fr-FR")}${s.ends_on ? ` au ${new Date(s.ends_on).toLocaleDateString("fr-FR")}` : ""}` : "Dates à préciser"}
                        {s.schedule_text ? ` · ${s.schedule_text}` : ""}{s.capacity ? ` · ${s.capacity} places` : ""}{s.trainers ? ` · ${s.trainers.full_name}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Bloc>
          )}
        </div>
        <aside className="lg:pt-8">
          <div className="carte sticky top-24 p-6">
            <p className="text-sm text-pierre">Tarif</p>
            <p className="font-serif text-4xl font-semibold">{fcfa(p.price_fcfa)}</p>
            {p.registration_fee_fcfa > 0 && <p className="text-sm text-pierre">+ frais d&apos;inscription : {fcfa(p.registration_fee_fcfa)}</p>}
            <dl className="mt-5 space-y-2 text-sm">
              {p.level && <div className="flex justify-between"><dt className="text-pierre">Niveau</dt><dd>{p.level}</dd></div>}
              {p.duration_label && <div className="flex justify-between"><dt className="text-pierre">Durée</dt><dd>{p.duration_label}</dd></div>}
              {p.hours && <div className="flex justify-between"><dt className="text-pierre">Volume horaire</dt><dd>{p.hours} h</dd></div>}
            </dl>
            {p.payment_terms && <p className="mt-4 text-sm text-pierre">{p.payment_terms}</p>}
            {p.modality === "video" ? (
              <p className="mt-6 rounded-lg bg-sable p-3 text-sm">L&apos;achat en ligne ouvrira avec l&apos;académie numérique. Inscrivez-vous pour être prévenu.</p>
            ) : null}
            <Link href={`/inscription?formation=${p.id}`} className="btn btn-rouge mt-6 w-full">
              {p.modality === "video" ? "Être prévenu de l'ouverture" : "S'inscrire à cette formation"}
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
