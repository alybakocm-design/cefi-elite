import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRoles, Titre } from "@/components/Guard";
import { fcfa, modalityLabel, can } from "@/lib/data";

export default async function FormationsAdmin() {
  const me = await requireRoles(["super_admin", "direction", "admin", "resp_pedago", "secretariat"]);
  const supabase = await createClient();
  const { data } = await supabase.from("programs").select("id,title,modality,price_fcfa,is_published,is_demo,categories(name),enrollments(count)").order("title");
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4"><Titre>Formations</Titre>
        {can(me.roles, ["super_admin", "admin", "resp_pedago"]) && <Link href="/espace/formations/nouvelle" className="btn btn-rouge">Nouvelle formation</Link>}</div>
      <div className="carte overflow-x-auto"><table className="table-cefi"><thead><tr><th>Intitulé</th><th>Discipline</th><th>Modalité</th><th>Tarif</th><th>Inscrits</th><th>Publiée</th></tr></thead><tbody>
        {(data ?? []).map((p) => (
          <tr key={p.id}><td><Link href={`/espace/formations/${p.id}`} className="text-rouge hover:underline">{p.title}</Link> {p.is_demo && <span className="provisoire ml-1">démo</span>}</td>
            <td>{(p.categories as unknown as { name: string } | null)?.name ?? "—"}</td><td>{modalityLabel[p.modality]}</td><td>{fcfa(p.price_fcfa)}</td>
            <td>{(p.enrollments as unknown as { count: number }[])[0]?.count ?? 0}</td><td>{p.is_published ? "Oui" : "Non"}</td></tr>
        ))}
      </tbody></table></div>
    </>
  );
}
