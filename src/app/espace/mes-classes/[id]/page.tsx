import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRoles, Titre } from "@/components/Guard";

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Bamako" });
const STATUTS: [string, string][] = [["present", "Présent"], ["retard", "Retard"], ["absent", "Absent"], ["excuse", "Excusé"]];

async function saveAttendance(classId: string, form: FormData) {
  "use server";
  const date = String(form.get("date") || today());
  const supabase = await createClient();
  const rows = [...form.entries()].filter(([k]) => k.startsWith("l_")).map(([k, v]) => ({ class_id: classId, learner_id: k.slice(2), session_date: date, status: String(v) }));
  if (rows.length) {
    const { error } = await supabase.from("attendance").upsert(rows, { onConflict: "class_id,learner_id,session_date" });
    if (error) throw new Error(error.message);
  }
  revalidatePath(`/espace/mes-classes/${classId}`);
}

export default async function Classe({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ date?: string }> }) {
  await requireRoles(["formateur", "super_admin", "admin", "resp_pedago"]);
  const { id } = await params;
  const date = (await searchParams).date ?? today();
  const supabase = await createClient();
  const [{ data: c }, { data: att }] = await Promise.all([
    supabase.from("classes").select("id,name,program_sessions(label,programs(title)),enrollments(learners(id,matricule,first_name,last_name))").eq("id", id).maybeSingle(),
    supabase.from("attendance").select("learner_id,status").eq("class_id", id).eq("session_date", date),
  ]);
  if (!c) notFound();
  const done = new Map((att ?? []).map((a) => [a.learner_id, a.status]));
  const learners = (c.enrollments as unknown as { learners: { id: string; matricule: string; first_name: string; last_name: string } }[]).map((e) => e.learners).sort((a, b) => a.last_name.localeCompare(b.last_name));
  const s = c.program_sessions as unknown as { label: string; programs: { title: string } };
  return (
    <>
      <Link href="/espace/mes-classes" className="text-sm text-pierre hover:text-rouge">← Mes classes</Link>
      <Titre sous={`${s.programs.title} · ${s.label}`}>{c.name}</Titre>
      <form className="mb-4 flex items-center gap-2"><label className="etiquette mb-0" htmlFor="d">Séance du</label><input id="d" type="date" name="date" defaultValue={date} className="champ w-auto" /><button className="btn btn-ligne py-2">Afficher</button></form>
      <form action={saveAttendance.bind(null, c.id)} className="carte overflow-x-auto">
        <input type="hidden" name="date" value={date} />
        <table className="table-cefi"><thead><tr><th>Apprenant</th><th>Présence</th></tr></thead><tbody>
          {learners.length === 0 && <tr><td colSpan={2} className="text-pierre">Aucun apprenant dans cette classe.</td></tr>}
          {learners.map((l) => (
            <tr key={l.id}><td>{l.last_name} {l.first_name}<br /><span className="font-mono text-xs text-pierre">{l.matricule}</span></td>
              <td><div className="flex flex-wrap gap-3">{STATUTS.map(([k, v]) => (
                <label key={k} className="flex items-center gap-1 text-sm"><input type="radio" name={`l_${l.id}`} value={k} defaultChecked={(done.get(l.id) ?? "present") === k} />{v}</label>))}</div></td></tr>
          ))}
        </tbody></table>
        {learners.length > 0 && <div className="p-4"><button className="btn btn-rouge">{done.size ? "Mettre à jour l'appel" : "Enregistrer l'appel"}</button>{done.size > 0 && <span className="ml-3 text-sm text-pierre">Appel déjà saisi pour cette date.</span>}</div>}
      </form>
    </>
  );
}
