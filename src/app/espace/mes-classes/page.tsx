import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRoles, Titre } from "@/components/Guard";

export default async function MesClasses() {
  const me = await requireRoles(["formateur"]);
  const supabase = await createClient();
  const { data: t } = await supabase.from("trainers").select("id").eq("profile_id", me.id).maybeSingle();
  const { data } = t ? await supabase.from("classes").select("id,name,room,program_sessions(label,programs(title)),enrollments(count)").eq("trainer_id", t.id) : { data: [] };
  return (
    <>
      <Titre sous="Vos classes, l'appel et les apprenants.">Mes classes</Titre>
      {!t && <p className="text-pierre">Votre compte n&apos;est pas encore rattaché à une fiche formateur. Contactez l&apos;administration.</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {(data ?? []).map((c) => { const s = c.program_sessions as unknown as { label: string; programs: { title: string } }; return (
          <Link key={c.id} href={`/espace/mes-classes/${c.id}`} className="carte p-5 hover:border-rouge">
            <p className="text-sm text-rouge">{s.programs.title}</p><p className="font-serif text-2xl font-semibold">{c.name}</p>
            <p className="text-sm text-pierre">{s.label} · {(c.enrollments as unknown as { count: number }[])[0]?.count ?? 0} apprenant(s)</p>
          </Link>); })}
      </div>
    </>
  );
}
