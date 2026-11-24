import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getSettings, text } from "@/lib/data";
import { ProgramCard, type ProgramLite } from "@/components/ProgramCard";
import { Provisoire } from "@/components/Provisoire";

export default async function Accueil() {
  const supabase = await createClient();
  const [s, { data: programs }, { data: cats }, { data: trainers }, { data: posts }, { data: testimonials }] = await Promise.all([
    getSettings(),
    supabase.from("programs").select("slug,title,short_description,level,modality,duration_label,price_fcfa,cover_url,is_demo,categories(name)")
      .eq("is_published", true).order("is_featured", { ascending: false }).limit(6),
    supabase.from("categories").select("name,slug").order("sort_order"),
    supabase.from("trainers").select("id,full_name,specialties,photo_url,is_demo").eq("is_public", true).limit(4),
    supabase.from("posts").select("slug,title,excerpt,kind,published_at,event_starts_at").order("published_at", { ascending: false }).limit(3),
    supabase.from("testimonials").select("id,author_name,author_detail,quote").eq("is_published", true).order("sort_order").limit(3),
  ]);

  return (
    <>
      {/* Bannière */}
      <section className="motif relative overflow-hidden border-b border-trait">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[1.25fr_1fr] md:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rouge">Bamako · Mali · En ligne partout</p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.05] md:text-6xl">
              Centre d&apos;Études et de Formations Islamiques <span className="text-rouge">Élite</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-pierre">
              {text(s, "site.intro")} <Provisoire show={s["site.intro"]?.is_placeholder} />
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/formations" className="btn btn-rouge">Découvrir nos formations</Link>
              <Link href="/inscription" className="btn btn-encre">S&apos;inscrire en présentiel</Link>
              <Link href="/academie" className="btn btn-ligne">Accéder à l&apos;académie en ligne</Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-sm">
            <div className="absolute inset-6 rounded-full bg-rouge-pale" />
            <Image src="/logo-cefi-elite.jpg" alt="Logo CEFI-ÉLITE" fill sizes="384px" className="rounded-full object-contain mix-blend-multiply" priority />
          </div>
        </div>
      </section>

      {/* Disciplines */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-rouge">Disciplines</p>
            <h2 className="mt-1 text-4xl font-semibold">Les sciences enseignées</h2>
          </div>
          <Link href="/formations" className="text-sm font-semibold hover:text-rouge">Tout le catalogue →</Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {(cats ?? []).map((c) => (
            <Link key={c.slug} href={`/formations?discipline=${c.slug}`} className="rounded-full border border-trait bg-white px-4 py-2 text-sm hover:border-rouge hover:text-rouge">{c.name}</Link>
          ))}
        </div>
      </section>

      {/* Formations */}
      <section className="border-y border-trait bg-sable/60">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-rouge">Catalogue</p>
          <h2 className="mt-1 text-4xl font-semibold">Formations à la une</h2>
          {programs && programs.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(programs as unknown as ProgramLite[]).map((p) => <ProgramCard key={p.slug} p={p} />)}
            </div>
          ) : <p className="mt-6 text-pierre">Les formations seront publiées prochainement.</p>}
        </div>
      </section>

      {/* Trois modalités */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-sm font-semibold uppercase tracking-wider text-rouge">Apprendre à votre rythme</p>
        <h2 className="mt-1 text-4xl font-semibold">Trois façons de suivre nos enseignements</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { t: "En présentiel", d: "Des classes au centre à Bamako, avec un enseignant, un emploi du temps, des évaluations et un suivi personnel.", href: "/formations?modalite=presentiel", cta: "Voir les sessions" },
            { t: "Vidéo à la demande", d: "Des formations complètes en ligne, organisées en modules et leçons, accessibles partout et à tout moment.", href: "/academie", cta: "Découvrir l'académie" },
            { t: "À distance accompagnée", d: "Des classes virtuelles en direct avec un formateur, des devoirs et un accompagnement individuel.", href: "/formations?modalite=distance", cta: "En savoir plus" },
          ].map((m, i) => (
            <div key={m.t} className="carte p-6">
              <span className="font-serif text-5xl font-semibold text-rouge/80">0{i + 1}</span>
              <h3 className="mt-2 text-2xl font-semibold">{m.t}</h3>
              <p className="mt-2 text-pierre">{m.d}</p>
              <Link href={m.href} className="mt-4 inline-block text-sm font-semibold text-rouge hover:underline">{m.cta} →</Link>
            </div>
          ))}
        </div>
      </section>

      {/* Formateurs */}
      <section className="border-t border-trait bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-rouge">Équipe pédagogique</p>
              <h2 className="mt-1 text-4xl font-semibold">Nos formateurs</h2>
            </div>
            <Link href="/formateurs" className="text-sm font-semibold hover:text-rouge">Tous les formateurs →</Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(trainers ?? []).map((t) => (
              <div key={t.id} className="text-center">
                <div className="motif mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-sable font-serif text-4xl text-rouge">
                  {t.full_name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
                </div>
                <p className="mt-4 font-serif text-xl font-semibold">{t.full_name}</p>
                <p className="text-sm text-pierre">{(t.specialties ?? []).join(" · ")}</p>
                {t.is_demo && <span className="provisoire mt-2">Démonstration</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Actualités + témoignages */}
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-rouge">Actualités et événements</p>
          <h2 className="mt-1 text-4xl font-semibold">La vie du centre</h2>
          <div className="mt-6 space-y-4">
            {(posts ?? []).length === 0 && <p className="text-pierre">Aucune actualité publiée pour le moment.</p>}
            {(posts ?? []).map((p) => (
              <Link key={p.slug} href={`/actualites/${p.slug}`} className="carte block p-5 hover:border-rouge">
                <p className="text-xs uppercase tracking-wider text-pierre">{new Date(p.event_starts_at ?? p.published_at).toLocaleDateString("fr-FR", { dateStyle: "long" })}</p>
                <p className="mt-1 font-serif text-xl font-semibold">{p.title}</p>
                {p.excerpt && <p className="mt-1 text-sm text-pierre">{p.excerpt}</p>}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-rouge">Témoignages</p>
          <h2 className="mt-1 text-4xl font-semibold">Ils ont étudié avec nous</h2>
          <div className="mt-6 space-y-4">
            {(testimonials ?? []).length === 0 && <p className="text-pierre">Les témoignages d&apos;apprenants seront publiés ici, avec leur accord.</p>}
            {(testimonials ?? []).map((t) => (
              <blockquote key={t.id} className="carte p-5">
                <p className="font-serif text-xl italic">« {t.quote} »</p>
                <footer className="mt-2 text-sm text-pierre">{t.author_name}{t.author_detail ? ` · ${t.author_detail}` : ""}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Appel */}
      <section className="motif-clair bg-rouge text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 py-14">
          <div>
            <h2 className="text-4xl font-semibold">Prêt à commencer ?</h2>
            <p className="mt-2 text-white/85">Déposez votre candidature en ligne : le secrétariat vous recontacte pour finaliser votre dossier.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/inscription" className="btn bg-white text-rouge hover:bg-ivoire">S&apos;inscrire</Link>
            <Link href="/contact" className="btn btn-ligne text-white">Nous contacter</Link>
          </div>
        </div>
      </section>
    </>
  );
}
