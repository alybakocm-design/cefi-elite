import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRoles } from "@/components/Guard";
import { fcfa, can, getSettings, text } from "@/lib/data";
import { refundPayment } from "../actions";
import { PrintButton } from "@/components/PrintButton";

const METHODS: Record<string, string> = { especes: "Espèces", orange_money: "Orange Money", moov_money: "Moov Money", carte: "Carte bancaire", virement: "Virement", autre: "Autre" };

export default async function Recu({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireRoles(["super_admin", "direction", "admin", "secretariat", "comptable", "apprenant"]);
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: p }, s] = await Promise.all([
    supabase.from("payments").select("*, learners(matricule,first_name,last_name), enrollments(programs(title)), profiles!received_by(full_name), original:payments!reversal_of(receipt_number)").eq("id", id).maybeSingle(),
    getSettings(),
  ]);
  if (!p) notFound();
  const l = p.learners as { matricule: string; first_name: string; last_name: string } | null;
  const title = p.kind === "encaissement" ? "Reçu de paiement" : "Avis de remboursement";
  return (
    <>
      <div className="mb-4 flex gap-3 print:hidden"><Link href="/espace/paiements" className="text-sm text-pierre hover:text-rouge">← Paiements</Link><PrintButton /></div>
      <div className="carte mx-auto max-w-2xl p-10 print:border-0">
        <div className="flex items-start justify-between border-b border-trait pb-6">
          <div className="flex items-center gap-3"><Image src="/logo-cefi-elite.jpg" alt="" width={64} height={64} className="rounded-full mix-blend-multiply" />
            <div><p className="font-serif text-2xl font-bold">CEFI-ÉLITE</p><p className="text-xs text-pierre">{text(s, "site.full_name")}</p><p className="text-xs text-pierre">{text(s, "contact.address")} · {text(s, "contact.phone")}</p></div></div>
          <div className="text-right"><p className="text-sm uppercase tracking-wider text-pierre">{title}</p><p className="font-mono text-lg font-bold">{p.receipt_number}</p>
            <p className="text-sm text-pierre">{new Date(p.created_at).toLocaleString("fr-FR", { timeZone: "Africa/Bamako", dateStyle: "long", timeStyle: "short" })}</p></div>
        </div>
        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-pierre">Apprenant</dt><dd className="font-semibold">{l ? `${l.last_name} ${l.first_name} (${l.matricule})` : "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-pierre">Formation</dt><dd>{(p.enrollments as { programs: { title: string } } | null)?.programs?.title ?? "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-pierre">Objet</dt><dd>{p.purpose}</dd></div>
          <div className="flex justify-between"><dt className="text-pierre">Moyen</dt><dd>{METHODS[p.method]}{p.provider_ref ? ` · réf. ${p.provider_ref}` : ""}</dd></div>
          {p.original && <div className="flex justify-between"><dt className="text-pierre">Annule / rembourse</dt><dd className="font-mono">{(p.original as { receipt_number: string }).receipt_number}</dd></div>}
          {p.note && <div className="flex justify-between"><dt className="text-pierre">Note</dt><dd>{p.note}</dd></div>}
          <div className="flex justify-between"><dt className="text-pierre">Enregistré par</dt><dd>{(p.profiles as unknown as { full_name: string } | null)?.full_name ?? "—"}</dd></div>
        </dl>
        <div className="mt-8 flex items-baseline justify-between rounded-lg bg-sable p-5"><span className="text-pierre">Montant</span><span className="font-serif text-4xl font-semibold">{p.kind !== "encaissement" ? "− " : ""}{fcfa(p.amount_fcfa)}</span></div>
        {s["contact.address"]?.is_placeholder && <p className="mt-4 text-xs text-amber-700 print:hidden">Les coordonnées du centre sur ce reçu sont provisoires : renseignez-les dans « Contenus du site ».</p>}
      </div>
      {p.kind === "encaissement" && can(me.roles, ["super_admin", "comptable"]) && (
        <form action={refundPayment.bind(null, p.id)} className="carte mx-auto mt-6 max-w-2xl space-y-3 p-5 print:hidden">
          <h2 className="text-xl font-semibold">Rembourser ou annuler</h2>
          <p className="text-sm text-pierre">Un paiement n&apos;est jamais modifié : un avis de remboursement lié est créé et tracé dans le journal.</p>
          <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]"><input name="amount_fcfa" type="number" min={1} max={p.amount_fcfa} defaultValue={p.amount_fcfa} className="champ" /><input name="note" required minLength={3} placeholder="Motif *" className="champ" /><button className="btn btn-encre">Valider</button></div>
        </form>
      )}
    </>
  );
}
