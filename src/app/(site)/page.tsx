import Link from "next/link";
import Image from "next/image";
import { ArrowRight, PlayCircle, School, MonitorPlay, Video, Award, CheckCircle2, BookOpenCheck, Users, Layers, Smartphone, WifiOff, CalendarCheck, Quote } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSettings, text } from "@/lib/data";
import { disc } from "@/lib/disciplines";
import { ProgramCard, type ProgramLite } from "@/components/ProgramCard";
import { Provisoire } from "@/components/Provisoire";

export default async function Accueil() {
  const supabase = await createClient();
  const [s, { data: programs }, { data: cats }, { data: trainers }, { data: posts }, { data: testimonials }, { data: allProgs }] = await Promise.all([
    getSettings(),
    supabase.from("programs").select("slug,title,short_description,level,modality,duration_label,price_fcfa,cover_url,is_demo,categories(name,slug)")
      .eq("is_published", true).order("is_featured", { ascending: false }).limit(8),
    supabase.from("categories").select("id,name,slug").order("sort_order"),
    supabase.from("trainers").select("id,full_name,specialties,photo_url,is_demo").eq("is_public", true).limit(4),
    supabase.from("posts").select("slug,title,excerpt,kind,published_at,event_starts_at").order("published_at", { ascending: false }).limit(3),
    supabase.from("testimonials").select("id,author_name,author_detail,quote").eq("is_published", true).order("sort_order").limit(3),
    supabase.from("programs").select("category_id").eq("is_published", true),
  ]);
  const count = new Map<string, number>();
  (allProgs ?? []).forEach((p) => p.category_id && count.set(p.category_id, (count.get(p.category_id) ?? 0) + 1));
  const heroImage = text(s, "site.hero_image");
  const stats = [
    { icon: BookOpenCheck, v: allProgs?.length ?? 0, l: "formations publiées" },
    { icon: Layers, v: cats?.length ?? 0, l: "disciplines enseignées" },
    { icon: Users, v: trainers?.length ?? 0, l: "formateurs présentés" },
    { icon: School, v: 3, l: "façons d'apprendre" },
  ];
  const atouts = [
    { icon: School, t: "Présentiel à Bamako", d: "Classes, emploi du temps, suivi" },
    { icon: MonitorPlay, t: "Vidéo à la demande", d: "Partout, à votre rythme" },
    { icon: Video, t: "Classes virtuelles", d: "En direct avec un formateur" },
    { icon: Award, t: "Attestations vérifiables", d: "Délivrées après évaluation" },
  ];

  return (
    <>
      {/* ───────── Bannière ───────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rouge-pale/70 via-white to-white">
        <div className="motif pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pt-14 pb-28 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
          <div>
            <span className="pastille"><span className="h-1.5 w-1.5 rounded-full bg-rouge" />Centre d&apos;Études et de Formations Islamiques</span>
            <h1 className="mt-6 text-[2.6rem] leading-[1.08] sm:text-5xl lg:text-[3.6rem]">
              {text(s, "site.hero_title").replace(/excellence\.?$/i, "")}
              {/excellence\.?$/i.test(text(s, "site.hero_title")) && <span className="relative whitespace-nowrap text-rouge">excellence<svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none" aria-hidden><path d="M2 9c40-6 120-8 196-3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".35" /></svg></span>}
              {/excellence\.?$/i.test(text(s, "site.hero_title")) && "."}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-pierre">{text(s, "site.hero_subtitle")}</p>
            {(s["site.hero_title"]?.is_placeholder || s["site.hero_subtitle"]?.is_placeholder) && <div className="mt-3"><Provisoire>Textes de la bannière à valider</Provisoire></div>}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/formations" className="btn btn-rouge">Découvrir nos formations <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/academie" className="btn btn-ligne"><PlayCircle className="h-4 w-4 text-rouge" />Académie en ligne</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-pierre">
              {["Inscription en ligne", "Paiement Orange & Moov Money", "Suivi personnalisé"].map((t) => <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-rouge" />{t}</span>)}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="points absolute -top-6 -right-4 h-32 w-40 opacity-70" />
            <div className="relative aspect-[4/3.6] overflow-hidden sm:aspect-[4/4.4] rounded-[2.5rem] shadow-[var(--shadow-flottant)]" style={{ background: "linear-gradient(150deg,#d7191f 0%,#8f0f14 55%,#15121a 100%)" }}>
              {heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="motif-clair flex h-full w-full flex-col items-center justify-start p-10 pt-12 text-center text-white sm:items-end sm:pr-12 sm:text-right">
                  <span className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-white shadow-2xl ring-8 ring-white/15">
                    <Image src="/logo-cefi-elite.jpg" alt="Logo CEFI-ÉLITE" width={160} height={160} className="scale-110" priority />
                  </span>
                  <p className="mt-8 font-arabe text-5xl leading-none" lang="ar" dir="rtl">العلم</p>
                  <p className="mt-6 text-sm font-semibold tracking-[0.2em] text-white/70 uppercase">Bamako · Mali</p>
                </div>
              )}
            </div>
            <div className="carte flotte absolute bottom-10 -left-6 hidden w-64 p-2 sm:block lg:-left-14">
              {atouts.map(({ icon: I, t, d }) => (
                <div key={t} className="flex items-center gap-3 rounded-xl p-2.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rouge-pale text-rouge"><I className="h-5 w-5" /></span>
                  <span className="leading-tight"><span className="block text-sm font-bold">{t}</span><span className="text-xs text-pierre">{d}</span></span>
                </div>
              ))}
            </div>
            <div className="carte flotte-2 absolute -right-3 -bottom-6 flex items-center gap-3 p-4 lg:-right-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-700"><CalendarCheck className="h-5 w-5" /></span>
              <span className="leading-tight"><span className="block text-sm font-bold">Candidature en ligne</span><span className="text-xs text-pierre">Le secrétariat vous rappelle</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Disciplines (carte chevauchante) ───────── */}
      <section className="relative z-10 mx-auto -mt-16 max-w-6xl px-5">
        <div className="carte p-6 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="surtitre">Disciplines</p><h2 className="mt-1 text-2xl md:text-3xl">Les sciences enseignées</h2></div>
            <Link href="/formations" className="flex items-center gap-1 text-sm font-bold text-rouge">Tout le catalogue <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {(cats ?? []).slice(0, 10).map((c) => { const d = disc(c.slug); const I = d.icon; const n = count.get(c.id) ?? 0; return (
              <Link key={c.slug} href={`/formations?discipline=${c.slug}`} className="group rounded-2xl border border-trait p-4 transition hover:-translate-y-0.5 hover:border-transparent hover:shadow-[var(--shadow-doux)]">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl transition group-hover:scale-110" style={{ background: d.tint, color: d.ink }}><I className="h-6 w-6" /></span>
                <p className="mt-3 text-sm leading-snug font-bold">{c.name}</p>
                <p className="mt-0.5 text-xs text-pierre">{n === 0 ? "Bientôt" : `${n} formation${n > 1 ? "s" : ""}`}</p>
              </Link>); })}
          </div>
        </div>
      </section>

      {/* ───────── Formations ───────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="surtitre">Catalogue</p><h2 className="mt-2 text-3xl md:text-4xl">Formations à la une</h2><p className="mt-2 text-pierre">Choisissez votre discipline, votre niveau et votre formule.</p></div>
          <Link href="/formations" className="btn btn-ligne py-2.5">Voir toutes les formations <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {programs && programs.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(programs as unknown as ProgramLite[]).map((p) => <ProgramCard key={p.slug} p={p} />)}
          </div>
        ) : <p className="mt-8 text-pierre">Les formations seront publiées prochainement.</p>}
      </section>

      {/* ───────── Chiffres réels ───────── */}
      <section className="mx-auto max-w-6xl px-5">
        <div className="motif-clair grid gap-6 rounded-[2rem] bg-encre px-8 py-10 text-white sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ icon: I, v, l }) => (
            <div key={l} className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-rouge-pale ring-1 ring-white/10"><I className="h-7 w-7" /></span>
              <span><span className="block text-3xl font-extrabold">{v}</span><span className="text-sm text-white/65">{l}</span></span>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Trois formules ───────── */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="mx-auto max-w-2xl text-center"><p className="surtitre">Apprendre à votre rythme</p><h2 className="mt-2 text-3xl md:text-4xl">Trois formules, un même niveau d&apos;exigence</h2></div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: School, t: "En présentiel", d: "Des classes au centre à Bamako : enseignant, emploi du temps, évaluations et suivi personnel.", href: "/formations?modalite=presentiel", cta: "Voir les sessions", dark: false },
            { icon: MonitorPlay, t: "Vidéo à la demande", d: "Des formations complètes en ligne, en modules et leçons, avec supports PDF et suivi de progression.", href: "/academie", cta: "Découvrir l'académie", dark: true },
            { icon: Video, t: "À distance accompagnée", d: "Des classes virtuelles en direct avec un formateur, des devoirs et un accompagnement individuel.", href: "/formations?modalite=distance", cta: "En savoir plus", dark: false },
          ].map(({ icon: I, ...m }) => (
            <div key={m.t} className={`relative rounded-[1.75rem] p-8 ${m.dark ? "motif-clair bg-rouge text-white shadow-[var(--shadow-flottant)] md:-translate-y-4" : "carte"}`}>
              <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${m.dark ? "bg-white/15" : "bg-rouge-pale text-rouge"}`}><I className="h-7 w-7" /></span>
              <h3 className="mt-6 text-xl">{m.t}</h3>
              <p className={`mt-2 leading-relaxed ${m.dark ? "text-white/80" : "text-pierre"}`}>{m.d}</p>
              <Link href={m.href} className={`btn mt-6 py-2.5 ${m.dark ? "bg-white text-rouge hover:bg-rouge-pale" : "btn-ligne"}`}>{m.cta} <ArrowRight className="h-4 w-4" /></Link>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Espace apprenant (maquette d'écrans) ───────── */}
      <section className="bg-sable">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-24 lg:grid-cols-2">
          <div>
            <p className="surtitre">Votre espace personnel</p>
            <h2 className="mt-2 text-3xl md:text-4xl">Suivez votre parcours, où que vous soyez</h2>
            <p className="mt-4 text-lg text-pierre">Un seul compte pour vos formations en présentiel et en ligne : inscriptions, assiduité, notes, paiements et reçus.</p>
            <ul className="mt-6 space-y-3 font-semibold">
              {[[Smartphone, "Sur ordinateur, tablette et smartphone"], [WifiOff, "Pages légères, pensées pour les connexions mobiles"], [CheckCircle2, "Reçus et suivi des paiements en temps réel"]].map(([I, t]) => { const Ic = I as typeof Smartphone; return <li key={t as string} className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-rouge shadow-sm"><Ic className="h-4 w-4" /></span>{t as string}</li>; })}
            </ul>
            <Link href="/connexion" className="btn btn-rouge mt-8">Accéder à mon espace <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="relative" aria-hidden>
            <div className="rounded-2xl border-[10px] border-encre bg-white shadow-[var(--shadow-flottant)]">
              <div className="flex items-center gap-1.5 border-b border-trait px-4 py-2"><span className="h-2 w-2 rounded-full bg-rouge" /><span className="h-2 w-2 rounded-full bg-amber-400" /><span className="h-2 w-2 rounded-full bg-green-500" /><span className="ml-3 text-[10px] text-pierre">Mon parcours</span></div>
              <div className="grid grid-cols-3 gap-3 p-4">
                {[["Formations", "2"], ["Assiduité", "92 %"], ["Reste à payer", "15 000"]].map(([l, v]) => <div key={l} className="rounded-xl bg-sable p-3"><p className="text-[9px] text-pierre">{l}</p><p className="text-base font-extrabold">{v}</p></div>)}
                <div className="col-span-2 rounded-xl border border-trait p-3">
                  <p className="text-[10px] font-bold">Langue arabe · niveau 1</p>
                  {[["Lecture", 80], ["Grammaire", 64], ["Expression orale", 72]].map(([n, w]) => <div key={n} className="mt-2"><div className="flex justify-between text-[9px] text-pierre"><span>{n}</span><span>{w} %</span></div><div className="h-1.5 rounded bg-sable"><div className="h-1.5 rounded bg-rouge" style={{ width: `${w}%` }} /></div></div>)}
                </div>
                <div className="flex flex-col items-center justify-center rounded-xl bg-rouge-pale p-3">
                  <svg viewBox="0 0 36 36" className="h-14 w-14"><circle cx="18" cy="18" r="15" fill="none" stroke="#fff" strokeWidth="4" /><circle cx="18" cy="18" r="15" fill="none" stroke="#d7191f" strokeWidth="4" strokeDasharray="70 100" strokeLinecap="round" transform="rotate(-90 18 18)" /></svg>
                  <p className="mt-1 text-[9px] font-bold text-rouge-fonce">Progression</p>
                </div>
              </div>
            </div>
            <div className="mx-auto h-3 w-[70%] rounded-b-xl bg-encre/90" />
            <div className="absolute -bottom-8 -left-4 w-32 rounded-[1.4rem] border-[6px] border-encre bg-white p-2 shadow-[var(--shadow-flottant)] sm:w-36">
              <p className="text-[8px] font-bold">Reçu REC-0001</p>
              <p className="mt-1 text-sm font-extrabold">25 000 FCFA</p>
              <p className="text-[8px] text-pierre">Orange Money</p>
              <div className="mt-2 rounded-md bg-green-50 px-1.5 py-1 text-[8px] font-bold text-green-700">Paiement confirmé</div>
            </div>
            <p className="mt-12 text-center text-xs text-pierre">Illustration de l&apos;espace apprenant (valeurs d&apos;exemple)</p>
          </div>
        </div>
      </section>

      {/* ───────── Formateurs ───────── */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="surtitre">Équipe pédagogique</p><h2 className="mt-2 text-3xl md:text-4xl">Nos formateurs</h2></div>
          <Link href="/formateurs" className="flex items-center gap-1 text-sm font-bold text-rouge">Tous les formateurs <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(trainers ?? []).length === 0 && <p className="text-pierre">La présentation des formateurs arrive bientôt.</p>}
          {(trainers ?? []).map((t) => (
            <div key={t.id} className="carte overflow-hidden p-3 text-center">
              <div className="motif flex aspect-square items-center justify-center rounded-xl bg-rouge-pale text-5xl font-extrabold text-rouge">
                {t.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.photo_url} alt="" className="h-full w-full rounded-xl object-cover" />
                ) : t.full_name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
              </div>
              <p className="mt-4 font-extrabold">{t.full_name}</p>
              <p className="pb-2 text-sm text-pierre">{(t.specialties ?? []).join(" · ")}</p>
              {t.is_demo && <span className="provisoire mb-2">Démonstration</span>}
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Témoignages & actualités ───────── */}
      <section className="bg-sable">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 lg:grid-cols-2">
          <div>
            <p className="surtitre">Témoignages</p><h2 className="mt-2 text-3xl md:text-4xl">Ils ont étudié avec nous</h2>
            <div className="mt-8 space-y-4">
              {(testimonials ?? []).length === 0 && <div className="carte p-6 text-pierre"><Quote className="mb-3 h-8 w-8 text-rouge/30" />Les témoignages d&apos;apprenants seront publiés ici, avec leur accord.</div>}
              {(testimonials ?? []).map((t) => (
                <blockquote key={t.id} className="carte p-6"><Quote className="h-8 w-8 text-rouge" /><p className="mt-3 text-lg leading-relaxed">{t.quote}</p>
                  <footer className="mt-4 text-sm"><strong>{t.author_name}</strong>{t.author_detail ? <span className="text-pierre"> · {t.author_detail}</span> : ""}</footer></blockquote>
              ))}
            </div>
          </div>
          <div>
            <p className="surtitre">Actualités et événements</p><h2 className="mt-2 text-3xl md:text-4xl">La vie du centre</h2>
            <div className="mt-8 space-y-4">
              {(posts ?? []).length === 0 && <div className="carte p-6 text-pierre">Conférences, séminaires et rentrées seront annoncés ici.</div>}
              {(posts ?? []).map((p) => { const d = new Date(p.event_starts_at ?? p.published_at); return (
                <Link key={p.slug} href={`/actualites/${p.slug}`} className="carte flex gap-4 p-4 hover:border-rouge">
                  <span className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-rouge text-white"><span className="text-xl leading-none font-extrabold">{d.getDate()}</span><span className="text-[10px] uppercase">{d.toLocaleDateString("fr-FR", { month: "short" })}</span></span>
                  <span><span className="block font-bold">{p.title}</span>{p.excerpt && <span className="mt-1 line-clamp-2 text-sm text-pierre">{p.excerpt}</span>}</span>
                </Link>); })}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Appel à l'inscription ───────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="motif-clair relative overflow-hidden rounded-[2rem] px-8 py-14 text-white md:px-14" style={{ background: "linear-gradient(120deg,#d7191f,#8f0f14 60%,#15121a)" }}>
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10" />
          <div className="relative flex flex-wrap items-center justify-between gap-8">
            <div className="max-w-xl"><h2 className="text-3xl md:text-4xl">Prêt à commencer votre parcours ?</h2>
              <p className="mt-3 text-white/80">Déposez votre candidature en quelques minutes. Le secrétariat examine votre dossier et vous recontacte.</p></div>
            <div className="flex flex-wrap gap-3">
              <Link href="/inscription" className="btn bg-white text-rouge hover:bg-rouge-pale">S&apos;inscrire maintenant <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/contact" className="btn border border-white/40 text-white hover:bg-white/10">Nous contacter</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
