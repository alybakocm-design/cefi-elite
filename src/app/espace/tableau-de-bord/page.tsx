import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRoles, Titre } from "@/components/Guard";
import { fcfa, statusLabel, STAFF } from "@/lib/data";

type Stats = {
  learners_total: number; learners_presentiel: number; learners_online: number; trainers_total: number; programs_active: number;
  applications_new: number; applications_month: number; attendance_rate: number | null; revenue_month: number;
  revenue_by_stream: Record<string, number>; expenses_month: number; unpaid_total: number;
  top_programs: { title: string; n: number }[]; recent_applications: { reference: string; name: string; status: string; created_at: string; program: string | null }[];
};

const streams: Record<string, string> = { presentiel: "Présentiel", video: "Vidéo", abonnement: "Abonnements", distance: "Distance" };

export default async function TableauDeBord() {
  const me = await requireRoles(STAFF);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("dashboard_stats");
  if (error || !data) return <p className="text-rouge">Impossible de charger le tableau de bord.</p>;
  const s = data as Stats;
  const finance = me.roles.some((r) => ["super_admin", "direction", "admin", "comptable"].includes(r));
  const tiles = [
    { l: "Apprenants actifs", v: s.learners_total, d: `${s.learners_presentiel} en présentiel · ${s.learners_online} en ligne` },
    { l: "Candidatures à traiter", v: s.applications_new, d: `${s.applications_month} reçues ce mois`, href: "/espace/candidatures" },
    { l: "Formations publiées", v: s.programs_active, d: `${s.trainers_total} formateurs actifs` },
    { l: "Taux de présence (30 j)", v: s.attendance_rate == null ? "—" : `${s.attendance_rate} %`, d: "présents + retards" },
  ];
  const fin = [
    { l: "Recettes du mois", v: fcfa(s.revenue_month) },
    { l: "Dépenses du mois", v: fcfa(s.expenses_month) },
    { l: "Impayés en cours", v: fcfa(s.unpaid_total) },
  ];
  const totalStreams = Object.values(s.revenue_by_stream).reduce((a, b) => a + b, 0);
  return (
    <>
      <Titre sous="Chiffres calculés en direct depuis la base. Les données de démonstration sont exclues des effectifs.">Tableau de bord</Titre>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => {
          const body = (<><p className="text-sm text-pierre">{t.l}</p><p className="mt-1 font-serif text-5xl font-semibold">{t.v}</p><p className="mt-1 text-sm text-pierre">{t.d}</p></>);
          return t.href ? <Link key={t.l} href={t.href} className="carte p-5 hover:border-rouge">{body}</Link> : <div key={t.l} className="carte p-5">{body}</div>;
        })}
      </div>
      {finance && (
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {fin.map((t) => <div key={t.l} className="carte p-5"><p className="text-sm text-pierre">{t.l}</p><p className="mt-1 font-serif text-3xl font-semibold">{t.v}</p></div>)}
        </div>
      )}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="carte p-5">
          <div className="flex items-center justify-between"><h2 className="text-2xl font-semibold">Dernières candidatures</h2><Link href="/espace/candidatures" className="text-sm text-rouge">Tout voir</Link></div>
          {s.recent_applications.length === 0 ? <p className="mt-4 text-pierre">Aucune candidature pour le moment.</p> : (
            <table className="table-cefi mt-3"><thead><tr><th>Dossier</th><th>Candidat</th><th>Formation</th><th>Statut</th></tr></thead><tbody>
              {s.recent_applications.map((a) => <tr key={a.reference}><td className="font-mono text-xs">{a.reference}</td><td>{a.name}</td><td>{a.program ?? "—"}</td><td>{statusLabel[a.status]}</td></tr>)}
            </tbody></table>
          )}
        </section>
        <section className="space-y-6">
          <div className="carte p-5">
            <h2 className="text-2xl font-semibold">Formations les plus suivies</h2>
            {s.top_programs.length === 0 ? <p className="mt-3 text-pierre">Aucune inscription active.</p> : (
              <ul className="mt-3 space-y-3">
                {s.top_programs.map((p) => { const max = s.top_programs[0].n; return (
                  <li key={p.title}><div className="flex justify-between text-sm"><span>{p.title}</span><span className="font-semibold">{p.n}</span></div>
                    <div className="mt-1 h-2 rounded bg-sable"><div className="h-2 rounded bg-rouge" style={{ width: `${(p.n / max) * 100}%` }} /></div></li>); })}
              </ul>
            )}
          </div>
          {finance && (
            <div className="carte p-5">
              <h2 className="text-2xl font-semibold">Recettes de l&apos;année par activité</h2>
              {totalStreams === 0 ? <p className="mt-3 text-pierre">Aucun encaissement enregistré cette année.</p> : (
                <ul className="mt-3 space-y-2 text-sm">{Object.entries(s.revenue_by_stream).map(([k, v]) => <li key={k} className="flex justify-between"><span>{streams[k] ?? k}</span><span className="font-semibold">{fcfa(v)}</span></li>)}</ul>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
