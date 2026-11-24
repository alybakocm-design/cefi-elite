import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRoles, Titre } from "@/components/Guard";
import { STAFF, can } from "@/lib/data";

export default async function Apprenants({ searchParams }: { searchParams: Promise<{ q?: string; statut?: string }> }) {
  const me = await requireRoles(STAFF);
  const sp = await searchParams;
  const supabase = await createClient();
  let q = supabase.from("learners").select("id,matricule,first_name,last_name,phone,email,status,is_demo,enrollments(programs(title))").order("last_name").limit(300);
  if (sp.statut) q = q.eq("status", sp.statut);
  if (sp.q) { const t = sp.q.replace(/[%_,()]/g, ""); q = q.or(`last_name.ilike.%${t}%,first_name.ilike.%${t}%,matricule.ilike.%${t}%,phone.ilike.%${t}%`); }
  const { data } = await q;
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Titre sous={`${data?.length ?? 0} dossier(s)`}>Apprenants</Titre>
        <div className="flex gap-2">
          <Link href="/espace/apprenants/export" prefetch={false} className="btn btn-ligne">Exporter (CSV Excel)</Link>
          {can(me.roles, ["super_admin", "admin", "secretariat"]) && <Link href="/espace/apprenants/nouveau" className="btn btn-rouge">Nouveau dossier</Link>}
        </div>
      </div>
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={sp.q} placeholder="Nom, matricule, téléphone" className="champ max-w-xs" />
        <select name="statut" defaultValue={sp.statut ?? ""} className="champ max-w-[180px]"><option value="">Tous statuts</option>{["actif", "suspendu", "diplome", "abandon", "archive"].map((s) => <option key={s}>{s}</option>)}</select>
        <button className="btn btn-encre">Filtrer</button>
      </form>
      <div className="carte overflow-x-auto"><table className="table-cefi"><thead><tr><th>Matricule</th><th>Nom</th><th>Contact</th><th>Formations</th><th>Statut</th></tr></thead><tbody>
        {(data ?? []).map((l) => (
          <tr key={l.id}>
            <td><Link href={`/espace/apprenants/${l.id}`} className="font-mono text-xs text-rouge hover:underline">{l.matricule}</Link></td>
            <td>{l.last_name} {l.first_name} {l.is_demo && <span className="provisoire ml-1">démo</span>}</td>
            <td>{l.phone}<br /><span className="text-xs text-pierre">{l.email}</span></td>
            <td className="text-sm">{(l.enrollments as unknown as { programs: { title: string } }[]).map((e) => e.programs?.title).join(", ") || "—"}</td>
            <td>{l.status}</td>
          </tr>
        ))}
      </tbody></table></div>
    </>
  );
}
