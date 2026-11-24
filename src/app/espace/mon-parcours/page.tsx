import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRoles, Titre } from "@/components/Guard";
import { fcfa } from "@/lib/data";

export default async function MonParcours() {
  const me = await requireRoles(["apprenant"]);
  const supabase = await createClient();
  const { data: l } = await supabase.from("learners").select("id,matricule,first_name,last_name,enrollments(id,status,programs(title),program_sessions(label),classes(name))").eq("profile_id", me.id).maybeSingle();
  if (!l) return (<><Titre>Mon parcours</Titre><div className="carte p-6"><p>Votre compte n&apos;est pas encore relié à un dossier apprenant.</p><p className="mt-2 text-pierre">Si vous êtes inscrit au centre, communiquez votre e-mail au secrétariat pour qu&apos;il relie votre compte. Sinon, <Link href="/inscription" className="text-rouge underline">déposez une candidature</Link>.</p></div></>);
  const [{ data: balances }, { data: payments }, { data: att }, { data: grades }] = await Promise.all([
    supabase.from("enrollment_balances").select("*").eq("learner_id", l.id),
    supabase.from("payments").select("id,receipt_number,kind,amount_fcfa,created_at").eq("learner_id", l.id).order("created_at", { ascending: false }),
    supabase.from("attendance").select("status").eq("learner_id", l.id),
    supabase.from("grades").select("score,comment,assessments(title,max_score,held_on,subjects(name))").eq("learner_id", l.id),
  ]);
  const bal = new Map((balances ?? []).map((b) => [b.enrollment_id, b]));
  const present = (att ?? []).filter((a) => a.status !== "absent").length;
  type E = { id: string; status: string; programs: { title: string }; program_sessions: { label: string } | null; classes: { name: string } | null };
  type G = { score: number | null; comment: string | null; assessments: { title: string; max_score: number; held_on: string | null; subjects: { name: string } | null } };
  return (
    <>
      <Titre sous={<>Matricule <span className="font-mono">{l.matricule}</span></>}>Assalamou alaykoum, {l.first_name}</Titre>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="carte p-4"><p className="text-sm text-pierre">Formations suivies</p><p className="font-serif text-3xl font-semibold">{l.enrollments.length}</p></div>
        <div className="carte p-4"><p className="text-sm text-pierre">Assiduité</p><p className="font-serif text-3xl font-semibold">{att?.length ? `${Math.round((present / att.length) * 100)} %` : "—"}</p></div>
        <div className="carte p-4"><p className="text-sm text-pierre">Reste à payer</p><p className="font-serif text-3xl font-semibold">{fcfa((balances ?? []).reduce((a, b) => a + Math.max(0, b.balance_fcfa), 0))}</p></div>
      </div>
      <h2 className="mt-8 text-2xl font-semibold">Mes formations</h2>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {(l.enrollments as unknown as E[]).map((e) => { const b = bal.get(e.id); return (
          <div key={e.id} className="carte p-5"><p className="font-serif text-2xl font-semibold">{e.programs.title}</p>
            <p className="text-sm text-pierre">{e.program_sessions?.label ?? ""}{e.classes ? ` · ${e.classes.name}` : ""} · {e.status}</p>
            {b && <p className="mt-2 text-sm">Payé {fcfa(b.paid_fcfa)} sur {fcfa(b.due_fcfa)} · <strong>reste {fcfa(b.balance_fcfa)}</strong></p>}</div>); })}
      </div>
      <h2 className="mt-8 text-2xl font-semibold">Mes notes publiées</h2>
      <div className="carte mt-3 overflow-x-auto"><table className="table-cefi"><thead><tr><th>Évaluation</th><th>Matière</th><th>Note</th><th>Commentaire</th></tr></thead><tbody>
        {(grades ?? []).length === 0 && <tr><td colSpan={4} className="text-pierre">Aucune note publiée.</td></tr>}
        {((grades ?? []) as unknown as G[]).map((g, i) => <tr key={i}><td>{g.assessments.title}</td><td>{g.assessments.subjects?.name ?? "—"}</td><td className="font-semibold">{g.score ?? "—"} / {g.assessments.max_score}</td><td>{g.comment ?? ""}</td></tr>)}
      </tbody></table></div>
      <h2 className="mt-8 text-2xl font-semibold">Mes reçus</h2>
      <div className="carte mt-3 overflow-x-auto"><table className="table-cefi"><thead><tr><th>Reçu</th><th>Date</th><th>Montant</th></tr></thead><tbody>
        {(payments ?? []).length === 0 && <tr><td colSpan={3} className="text-pierre">Aucun paiement.</td></tr>}
        {(payments ?? []).map((p) => <tr key={p.id}><td><Link href={`/espace/paiements/${p.id}`} className="font-mono text-xs text-rouge">{p.receipt_number}</Link></td><td>{new Date(p.created_at).toLocaleDateString("fr-FR")}</td><td>{p.kind !== "encaissement" ? "−" : ""}{fcfa(p.amount_fcfa)}</td></tr>)}
      </tbody></table></div>
    </>
  );
}
