"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { statusLabel } from "@/lib/data";

export async function updateApplication(id: string, form: FormData) {
  const status = String(form.get("status"));
  if (!(status in statusLabel) || status === "confirmee") throw new Error("Statut invalide");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from("applications").update({ status, staff_notes: String(form.get("staff_notes") ?? "").slice(0, 3000) || null, reviewed_by: user?.id }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/espace/candidatures/${id}`);
}

export async function confirmApplication(id: string, form: FormData) {
  const session = String(form.get("session_id") ?? "") || null;
  const supabase = await createClient();
  const { error } = await supabase.rpc("confirm_application", { p_application_id: id, p_session_id: session });
  if (error) throw new Error(error.message);
  revalidatePath(`/espace/candidatures/${id}`);
}
