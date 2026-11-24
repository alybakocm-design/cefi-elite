import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRoles, Titre } from "@/components/Guard";
import { LearnerForm } from "@/components/LearnerForm";
import { STAFF, can, fcfa } from "@/lib/data";
import { saveLearner, enroll } from "../actions";

export default async function Apprenant({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireRoles(STAFF);
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: l }, { data: balances }, { data: payments }, { data: programs }, { data: att }] = await Promise.all([
    supabase.from("learners").select("*, enrollments(id,status,enrolled_at,source,programs(title),program_sessions(label),classes(name))").eq("id", id).maybeSingle(),
    supabase.from("enrollment_balances").select("*").eq("learner_id", id),
    supabase.from("payments").select("id,receipt_number,kind,amount_fcfa,method,created_at,status").eq("learner_id", id).order("created_at", { ascending: false }),
    supabase.from("programs").select("id,title,program_sessions(id,label,classes(id,name))").order("title"),
    supabase.from("attendance").select("status").eq("learner_id", id),
  ]);
  if (!l) notFound();
  const bal = new Map((balances ?? []).map((b) => [b.enrollment_id, b]));
  const edit = can(me.roles, ["super_admin", "admin", "secretariat"]);
  const present = (att ?? []).filter((a) => a.status !== "absent").length;
  type E = { id: string; status: string; enrolled_at: string; source: string; programs: { title: string } | null; program_sessions: { label: string } | null; classes: { name: string } | null };
  return (
    <>
      <Link href="/espace/apprenants" className="text-sm text-pierre hover:text-rouge">← Apprenants</Link>
      <Titre sous={<><span className="font-mono">{l.matricule}</span> · {l.status}{l.is_demo ? " · dossier de démonstration" : ""}</>}>{l.last_name} {l.first_name}</Titre>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="carte p-4"><p className="text-sm text-pierre">Formations</p><p className="font-serif text-3xl font-semibold">{l.enrollments.length}</p></div>
        <div className="carte p-4"><p className="text-sm text-pierre">Présence</p><p className="font-serif text-3xl font-semibold">{att?.length ? `${Math.round((present / att.length) * 100)} %` : "—"}</p></div>
        <div className="carte p-4"><p className="text-sm text-pierre">Solde restant</p><p className="font-serif text-3xl font-semibold">{fcfa((balances ?? []).reduce((a, b) => a + Math.max(0, b.balance_fcfa), 0))}</p></div>
      </div>
      <h2 className="mt-8 text-2xl font-semibold">Inscriptions</h2>
      <div className="carte mt-3 overflow-x-auto"><table className="table-cefi"><thead><tr><th>Formation</th><th>Session / classe</th><th>Depuis</th><th>Dû</th><th>Payé</th><th>Reste</th></tr></thead><tbody>
        {(l.enrollments as E[]).length === 0 && <tr><td colSpan={6} className="text-pierre">Aucune inscription.</td></tr>}
        {(l.enrollments as E[]).map((e) => { const b = bal.get(e.id); return (
          <tr key={e.id}><td>{e.programs?.title}<br /><span className="text-xs text-pierre">{e.status} · {e.source}</span></td><td>{e.program_sessions?.label ?? "—"}{e.classes ? ` · ${e.classes.name}` : ""}</td>
            <td>{new Date(e.enrolled_at).toLocaleDateString("fr-FR")}</td><td>{b ? fcfa(b.due_fcfa) : "—"}</td><td>{b ? fcfa(b.paid_fcfa) : "—"}</td><td className="font-semibold">{b ? fcfa(b.balance_fcfa) : "—"}</td></tr>); })}
      </tbody></table></div>
      {edit && (
        <form action={enroll.bind(null, l.id)} className="carte mt-3 grid gap-3 p-4 sm:grid-cols-[2fr_2fr_1fr_auto]">
          <select name="program_id" required className="champ"><option value="">Inscrire à une formation…</option>{(programs ?? []).map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select>
          <select name="class_id" className="champ"><option value="">Classe (facultatif)</option>
            {(programs ?? []).flatMap((p) => (p.program_sessions as { id: string; label: string; classes: { id: string; name: string }[] }[]).flatMap((s) => s.classes.map((c) => <option key={c.id} value={c.id}>{p.title} · {s.label} · {c.name}</option>)))}</select>
          <input name="agreed_price_fcfa" type="number" min={0} placeholder="Prix convenu (FCFA)" className="champ" />
          <button className="btn btn-encre">Inscrire</button>
        </form>
      )}
      <div className="mt-8 flex items-center justify-between"><h2 className="text-2xl font-semibold">Paiements</h2>
        {can(me.roles, ["super_admin", "admin", "secretariat", "comptable"]) && <Link href={`/espace/paiements?apprenant=${l.id}`} className="btn btn-rouge">Encaisser</Link>}</div>
      <div className="carte mt-3 overflow-x-auto"><table className="table-cefi"><thead><tr><th>Reçu</th><th>Date</th><th>Type</th><th>Moyen</th><th>Montant</th></tr></thead><tbody>
        {(payments ?? []).length === 0 && <tr><td colSpan={5} className="text-pierre">Aucun paiement.</td></tr>}
        {(payments ?? []).map((p) => <tr key={p.id}><td><Link href={`/espace/paiements/${p.id}`} className="font-mono text-xs text-rouge">{p.receipt_number}</Link></td><td>{new Date(p.created_at).toLocaleDateString("fr-FR")}</td><td>{p.kind}</td><td>{p.method}</td><td>{fcfa(p.amount_fcfa)}</td></tr>)}
      </tbody></table></div>
      {edit && (<><h2 className="mt-8 mb-3 text-2xl font-semibold">Fiche</h2><LearnerForm action={saveLearner.bind(null, l.id)} l={l} submit="Enregistrer" /></>)}
    </>
  );
}
