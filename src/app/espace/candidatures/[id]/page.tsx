import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRoles, Titre } from "@/components/Guard";
import { statusLabel, modalityLabel, can } from "@/lib/data";
import { updateApplication, confirmApplication } from "../actions";

export default async function Candidature({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireRoles(["super_admin", "direction", "admin", "secretariat", "resp_pedago"]);
  const { id } = await params;
  const supabase = await createClient();
  const { data: a } = await supabase.from("applications").select("*, programs(id,title,program_sessions(id,label))").eq("id", id).maybeSingle();
  if (!a) notFound();
  const docs = await Promise.all((a.document_paths as string[]).map(async (p) => {
    const { data } = await supabase.storage.from("candidatures").createSignedUrl(p, 600);
    return { name: p.split("/").pop(), url: data?.signedUrl };
  }));
  const editable = can(me.roles, ["super_admin", "admin", "secretariat"]);
  const sessions = (a.programs?.program_sessions ?? []) as { id: string; label: string }[];
  const row = (l: string, v: React.ReactNode) => <div className="grid grid-cols-[160px_1fr] gap-2 border-b border-trait py-2 text-sm"><dt className="text-pierre">{l}</dt><dd>{v || "—"}</dd></div>;
  return (
    <>
      <Link href="/espace/candidatures" className="text-sm text-pierre hover:text-rouge">← Candidatures</Link>
      <Titre sous={<>Dossier <span className="font-mono">{a.reference}</span> · reçu le {new Date(a.created_at).toLocaleString("fr-FR", { timeZone: "Africa/Bamako" })}</>}>{a.last_name} {a.first_name}</Titre>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="carte p-5">
          <dl>
            {row("Statut", <strong>{statusLabel[a.status]}</strong>)}
            {row("Date de naissance", a.birth_date && new Date(a.birth_date).toLocaleDateString("fr-FR"))}
            {row("Sexe", a.sex === "F" ? "Femme" : a.sex === "M" ? "Homme" : null)}
            {row("Téléphone", a.phone)}{row("E-mail", a.email)}{row("Adresse", a.address)}
            {row("Formation", a.programs?.title)}{row("Modalité", a.modality && modalityLabel[a.modality])}
            {row("Message", a.message && <span className="whitespace-pre-line">{a.message}</span>)}
            {row("Documents", docs.length ? <ul className="space-y-1">{docs.map((d) => <li key={d.name}><a href={d.url} target="_blank" rel="noreferrer" className="text-rouge underline">{d.name}</a></li>)}</ul> : null)}
          </dl>
          {a.learner_id && <Link href={`/espace/apprenants/${a.learner_id}`} className="btn btn-encre mt-5">Ouvrir le dossier apprenant</Link>}
        </section>
        {editable && a.status !== "confirmee" && (
          <section className="space-y-6">
            <form action={updateApplication.bind(null, a.id)} className="carte space-y-3 p-5">
              <h2 className="text-2xl font-semibold">Traiter le dossier</h2>
              <select name="status" defaultValue={a.status} className="champ">
                {Object.entries(statusLabel).filter(([k]) => k !== "confirmee").map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <textarea name="staff_notes" defaultValue={a.staff_notes ?? ""} rows={3} placeholder="Notes internes (non visibles du candidat)" className="champ" />
              <button className="btn btn-encre">Enregistrer</button>
            </form>
            {a.status === "acceptee" && a.program_id && (
              <form action={confirmApplication.bind(null, a.id)} className="carte space-y-3 border-rouge p-5">
                <h2 className="text-2xl font-semibold">Confirmer l&apos;inscription</h2>
                <p className="text-sm text-pierre">Crée le dossier apprenant (ou rattache un dossier existant avec le même téléphone ou e-mail) et l&apos;inscription à la formation.</p>
                {sessions.length > 0 && (
                  <select name="session_id" className="champ"><option value="">Session à choisir plus tard</option>{sessions.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
                )}
                <button className="btn btn-rouge">Confirmer l&apos;inscription</button>
              </form>
            )}
          </section>
        )}
      </div>
    </>
  );
}
