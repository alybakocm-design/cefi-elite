import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRoles, Titre } from "@/components/Guard";
import { ProgramForm } from "@/components/ProgramForm";
import { can } from "@/lib/data";
import { saveProgram, addSession, addSubject } from "../actions";

export default async function Formation({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireRoles(["super_admin", "direction", "admin", "resp_pedago", "secretariat"]);
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: p }, { data: cats }, { data: trainers }] = await Promise.all([
    supabase.from("programs").select("*, program_sessions(id,label,starts_on,ends_on,capacity,trainers(full_name),classes(id,name)), subjects(id,name,coefficient)").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id,name").order("sort_order"),
    supabase.from("trainers").select("id,full_name").eq("is_active", true).order("full_name"),
  ]);
  if (!p) notFound();
  const edit = can(me.roles, ["super_admin", "admin", "resp_pedago"]);
  type S = { id: string; label: string; starts_on: string | null; ends_on: string | null; capacity: number | null; trainers: { full_name: string } | null; classes: { id: string; name: string }[] };
  return (
    <>
      <Link href="/espace/formations" className="text-sm text-pierre hover:text-rouge">← Formations</Link>
      <Titre sous={<Link href={`/formations/${p.slug}`} className="text-rouge underline" target="_blank">Voir la page publique</Link>}>{p.title}</Titre>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="carte p-5">
          <h2 className="text-2xl font-semibold">Sessions et classes</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(p.program_sessions as S[]).length === 0 && <li className="text-pierre">Aucune session.</li>}
            {(p.program_sessions as S[]).map((s) => <li key={s.id} className="border-b border-trait pb-2"><strong>{s.label}</strong> · {s.starts_on ?? "date à préciser"}{s.capacity ? ` · ${s.capacity} places` : ""}{s.trainers ? ` · ${s.trainers.full_name}` : ""}<br /><span className="text-pierre">Classes : {s.classes.map((c) => c.name).join(", ") || "—"}</span></li>)}
          </ul>
          {edit && (
            <form action={addSession.bind(null, p.id)} className="mt-4 grid gap-2 sm:grid-cols-2">
              <input name="label" required placeholder="Libellé (ex. Promotion 2026-2027)" className="champ sm:col-span-2" />
              <input name="starts_on" type="date" className="champ" aria-label="Début" /><input name="ends_on" type="date" className="champ" aria-label="Fin" />
              <input name="schedule_text" placeholder="Horaires" className="champ" /><input name="capacity" type="number" min={1} placeholder="Capacité" className="champ" />
              <select name="trainer_id" className="champ"><option value="">Formateur</option>{(trainers ?? []).map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}</select>
              <input name="class_name" placeholder="Nom de la 1re classe (Groupe A)" className="champ" />
              <button className="btn btn-encre sm:col-span-2">Ajouter la session</button>
            </form>
          )}
        </section>
        <section className="carte p-5">
          <h2 className="text-2xl font-semibold">Matières</h2>
          <ul className="mt-3 space-y-1 text-sm">{(p.subjects as { id: string; name: string; coefficient: number }[]).map((s) => <li key={s.id} className="flex justify-between border-b border-trait py-1"><span>{s.name}</span><span className="text-pierre">coef. {s.coefficient}</span></li>)}</ul>
          {edit && (
            <form action={addSubject.bind(null, p.id)} className="mt-4 flex gap-2"><input name="name" required placeholder="Matière" className="champ" /><input name="coefficient" type="number" step="0.5" min="0.5" defaultValue={1} className="champ w-24" /><button className="btn btn-encre">Ajouter</button></form>
          )}
        </section>
      </div>
      {edit && <><h2 className="mt-8 mb-3 text-2xl font-semibold">Fiche de la formation</h2><ProgramForm action={saveProgram.bind(null, p.id)} p={p} cats={cats ?? []} /></>}
    </>
  );
}
