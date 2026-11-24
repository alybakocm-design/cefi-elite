import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRoles, Titre } from "@/components/Guard";
import { statusLabel, modalityLabel } from "@/lib/data";

export default async function Candidatures({ searchParams }: { searchParams: Promise<{ statut?: string; q?: string }> }) {
  await requireRoles(["super_admin", "direction", "admin", "secretariat", "resp_pedago"]);
  const sp = await searchParams;
  const supabase = await createClient();
  let q = supabase.from("applications").select("id,reference,first_name,last_name,phone,modality,status,created_at,programs(title)").order("created_at", { ascending: false }).limit(200);
  if (sp.statut && sp.statut in statusLabel) q = q.eq("status", sp.statut);
  if (sp.q) { const t = sp.q.replace(/[%_,()]/g, ""); q = q.or(`last_name.ilike.%${t}%,first_name.ilike.%${t}%,reference.ilike.%${t}%,phone.ilike.%${t}%`); }
  const { data } = await q;
  return (
    <>
      <Titre sous="Les candidatures déposées sur le site arrivent ici automatiquement.">Candidatures</Titre>
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={sp.q} placeholder="Nom, téléphone, n° de dossier" className="champ max-w-xs" />
        <select name="statut" defaultValue={sp.statut ?? ""} className="champ max-w-[220px]"><option value="">Tous les statuts</option>{Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <button className="btn btn-encre">Filtrer</button>
      </form>
      <div className="carte overflow-x-auto">
        <table className="table-cefi"><thead><tr><th>Dossier</th><th>Candidat</th><th>Téléphone</th><th>Formation</th><th>Reçue le</th><th>Statut</th></tr></thead><tbody>
          {(data ?? []).length === 0 && <tr><td colSpan={6} className="text-pierre">Aucune candidature.</td></tr>}
          {(data ?? []).map((a) => (
            <tr key={a.id}>
              <td><Link href={`/espace/candidatures/${a.id}`} className="font-mono text-xs text-rouge hover:underline">{a.reference}</Link></td>
              <td>{a.last_name} {a.first_name}</td><td>{a.phone}</td>
              <td>{(a.programs as unknown as { title: string } | null)?.title ?? "—"}<br /><span className="text-xs text-pierre">{a.modality ? modalityLabel[a.modality] : ""}</span></td>
              <td>{new Date(a.created_at).toLocaleDateString("fr-FR")}</td><td>{statusLabel[a.status]}</td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </>
  );
}
