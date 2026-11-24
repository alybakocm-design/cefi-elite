"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const pick = (f: FormData, k: string) => { const v = String(f.get(k) ?? "").trim(); return v || null; };

export async function saveLearner(id: string | null, form: FormData) {
  const row = {
    first_name: pick(form, "first_name"), last_name: pick(form, "last_name"), sex: pick(form, "sex"), birth_date: pick(form, "birth_date"),
    phone: pick(form, "phone"), email: pick(form, "email"), address: pick(form, "address"),
    emergency_contact_name: pick(form, "emergency_contact_name"), emergency_contact_phone: pick(form, "emergency_contact_phone"),
    status: pick(form, "status") ?? "actif",
  };
  if (!row.first_name || !row.last_name) throw new Error("Nom et prénom obligatoires");
  const supabase = await createClient();
  if (id) {
    const { error } = await supabase.from("learners").update(row).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath(`/espace/apprenants/${id}`);
    return;
  }
  const { data, error } = await supabase.from("learners").insert(row).select("id").single();
  if (error) throw new Error(error.message);
  redirect(`/espace/apprenants/${data.id}`);
}

export async function enroll(learnerId: string, form: FormData) {
  const program_id = pick(form, "program_id");
  if (!program_id) throw new Error("Formation obligatoire");
  const price = pick(form, "agreed_price_fcfa");
  const supabase = await createClient();
  const { error } = await supabase.from("enrollments").insert({
    learner_id: learnerId, program_id, session_id: pick(form, "session_id"), class_id: pick(form, "class_id"),
    agreed_price_fcfa: price ? Math.max(0, parseInt(price, 10)) : null, source: "guichet",
  });
  if (error) throw new Error(error.code === "23505" ? "Déjà inscrit à cette session" : error.message);
  revalidatePath(`/espace/apprenants/${learnerId}`);
}
