"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function recordPayment(form: FormData) {
  const enrollment_id = String(form.get("enrollment_id") ?? "");
  const amount = parseInt(String(form.get("amount_fcfa") ?? ""), 10);
  const method = String(form.get("method"));
  const purpose = String(form.get("purpose") ?? "formation");
  if (!enrollment_id || !Number.isFinite(amount) || amount <= 0) throw new Error("Inscription et montant obligatoires");
  if (!["especes", "orange_money", "moov_money", "carte", "virement", "autre"].includes(method)) throw new Error("Moyen invalide");
  const supabase = await createClient();
  const { data: e } = await supabase.from("enrollments").select("learner_id, programs(modality)").eq("id", enrollment_id).single();
  if (!e) throw new Error("Inscription introuvable");
  const modality = (e.programs as unknown as { modality: string }).modality;
  const { data, error } = await supabase.from("payments").insert({
    enrollment_id, learner_id: e.learner_id, amount_fcfa: amount, method, purpose,
    channel: "guichet", status: "confirme", kind: "encaissement",
    revenue_stream: modality === "presentiel" ? "presentiel" : modality === "video" ? "video" : "distance",
    provider_ref: String(form.get("provider_ref") ?? "").trim().slice(0, 100) || null,
    note: String(form.get("note") ?? "").trim().slice(0, 500) || null,
  }).select("id").single();
  if (error) throw new Error(error.message);
  redirect(`/espace/paiements/${data.id}`);
}

export async function refundPayment(paymentId: string, form: FormData) {
  const supabase = await createClient();
  const { data: p } = await supabase.from("payments").select("*").eq("id", paymentId).single();
  if (!p || p.kind !== "encaissement") throw new Error("Paiement introuvable");
  const amount = parseInt(String(form.get("amount_fcfa") ?? ""), 10);
  if (!Number.isFinite(amount) || amount <= 0 || amount > p.amount_fcfa) throw new Error("Montant invalide");
  const note = String(form.get("note") ?? "").trim();
  if (note.length < 3) throw new Error("Motif obligatoire");
  const { data, error } = await supabase.from("payments").insert({
    kind: "remboursement", reversal_of: p.id, enrollment_id: p.enrollment_id, learner_id: p.learner_id, amount_fcfa: amount,
    method: p.method, purpose: p.purpose, channel: "guichet", status: "confirme", revenue_stream: p.revenue_stream, note: note.slice(0, 500),
  }).select("id").single();
  if (error) throw new Error(error.message);
  redirect(`/espace/paiements/${data.id}`);
}
