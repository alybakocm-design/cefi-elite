import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRoles, Titre } from "@/components/Guard";
import { fcfa, can } from "@/lib/data";
import { recordPayment } from "./actions";

const METHODS: Record<string, string> = { especes: "Espèces", orange_money: "Orange Money", moov_money: "Moov Money", carte: "Carte bancaire", virement: "Virement", autre: "Autre" };

export default async function Paiements({ searchParams }: { searchParams: Promise<{ apprenant?: string }> }) {
  const me = await requireRoles(["super_admin", "direction", "admin", "secretariat", "comptable"]);
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: payments }, { data: balances }] = await Promise.all([
    supabase.from("payments").select("id,receipt_number,kind,amount_fcfa,method,channel,created_at,learners(first_name,last_name)").order("created_at", { ascending: false }).limit(100),
    supabase.from("enrollment_balances").select("enrollment_id,balance_fcfa,learner_id").order("balance_fcfa", { ascending: false }),
  ]);
  const ids = [...new Set((balances ?? []).map((b) => b.enrollment_id))];
  const { data: enr } = ids.length ? await supabase.from("enrollments").select("id,learner_id,learners(matricule,first_name,last_name),programs(title)").in("id", ids) : { data: [] };
  const balance = new Map((balances ?? []).map((b) => [b.enrollment_id, b.balance_fcfa]));
  type En = { id: string; learner_id: string; learners: { matricule: string; first_name: string; last_name: string }; programs: { title: string } };
  const options = ((enr ?? []) as unknown as En[]).filter((e) => !sp.apprenant || e.learner_id === sp.apprenant)
    .sort((a, b) => a.learners.last_name.localeCompare(b.learners.last_name));
  const canWrite = can(me.roles, ["super_admin", "admin", "secretariat", "comptable"]);
  return (
    <>
      <Titre sous="Encaissements au guichet. Les paiements en ligne (V2) ne seront enregistrés qu'après confirmation du prestataire.">Paiements</Titre>
      {canWrite && (
        <form action={recordPayment} className="carte mb-8 grid gap-3 p-5 md:grid-cols-2">
          <h2 className="text-2xl font-semibold md:col-span-2">Nouvel encaissement</h2>
          <div className="md:col-span-2"><label className="etiquette">Apprenant et formation *</label>
            <select name="enrollment_id" required className="champ"><option value="">Choisir…</option>
              {options.map((e) => <option key={e.id} value={e.id}>{e.learners.last_name} {e.learners.first_name} ({e.learners.matricule}) — {e.programs.title} — reste {fcfa(balance.get(e.id))}</option>)}
            </select></div>
          <div><label className="etiquette">Montant (FCFA) *</label><input name="amount_fcfa" type="number" min={1} step={1} required className="champ" /></div>
          <div><label className="etiquette">Objet</label><select name="purpose" className="champ"><option value="formation">Frais de formation</option><option value="inscription">Frais d&apos;inscription</option><option value="autre">Autre</option></select></div>
          <div><label className="etiquette">Moyen de paiement *</label><select name="method" required className="champ">{Object.entries(METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div><label className="etiquette">Référence de transaction</label><input name="provider_ref" placeholder="N° Orange/Moov Money, chèque…" className="champ" /></div>
          <div className="md:col-span-2"><label className="etiquette">Note</label><input name="note" className="champ" /></div>
          <div><button className="btn btn-rouge">Enregistrer et éditer le reçu</button></div>
        </form>
      )}
      <h2 className="mb-3 text-2xl font-semibold">Derniers mouvements</h2>
      <div className="carte overflow-x-auto"><table className="table-cefi"><thead><tr><th>Reçu</th><th>Date</th><th>Apprenant</th><th>Type</th><th>Moyen</th><th className="text-right">Montant</th></tr></thead><tbody>
        {(payments ?? []).length === 0 && <tr><td colSpan={6} className="text-pierre">Aucun paiement enregistré.</td></tr>}
        {(payments ?? []).map((p) => { const l = p.learners as unknown as { first_name: string; last_name: string } | null; return (
          <tr key={p.id}><td><Link href={`/espace/paiements/${p.id}`} className="font-mono text-xs text-rouge">{p.receipt_number}</Link></td>
            <td>{new Date(p.created_at).toLocaleString("fr-FR", { timeZone: "Africa/Bamako", dateStyle: "short", timeStyle: "short" })}</td>
            <td>{l ? `${l.last_name} ${l.first_name}` : "—"}</td><td>{p.kind}</td><td>{METHODS[p.method]}</td>
            <td className={`text-right font-semibold ${p.kind !== "encaissement" ? "text-rouge" : ""}`}>{p.kind !== "encaissement" ? "−" : ""}{fcfa(p.amount_fcfa)}</td></tr>); })}
      </tbody></table></div>
    </>
  );
}
