import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PageHead } from "@/components/PageHead";

export const metadata: Metadata = { title: "Nos formateurs" };

export default async function Formateurs() {
  const supabase = await createClient();
  const { data } = await supabase.from("trainers").select("id,full_name,bio,specialties,declared_qualifications,photo_url,is_demo").eq("is_public", true).order("full_name");
  return (
    <>
      <PageHead kicker="Équipe pédagogique" title="Nos formateurs">Les qualifications indiquées sont celles déclarées par chaque formateur.</PageHead>
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 md:grid-cols-2">
        {(data ?? []).length === 0 && <p className="text-pierre">La présentation des formateurs sera publiée prochainement.</p>}
        {(data ?? []).map((t) => (
          <article key={t.id} className="carte flex gap-5 p-6">
            {t.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.photo_url} alt="" className="h-24 w-24 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="motif flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-sable font-serif text-3xl text-rouge">{t.full_name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}</div>
            )}
            <div>
              <h2 className="text-2xl font-semibold">{t.full_name}</h2>
              <p className="text-sm font-semibold text-rouge">{(t.specialties ?? []).join(" · ")}</p>
              {t.bio && <p className="mt-2 text-pierre">{t.bio}</p>}
              {t.declared_qualifications && <p className="mt-2 text-sm"><span className="text-pierre">Qualifications déclarées : </span>{t.declared_qualifications}</p>}
              {t.is_demo && <span className="provisoire mt-3">Profil de démonstration</span>}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
