"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const s = (f: FormData, k: string) => { const v = String(f.get(k) ?? "").trim(); return v || null; };
const n = (f: FormData, k: string) => { const v = s(f, k); return v == null ? null : Math.max(0, parseInt(v, 10) || 0); };
const slugify = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

export async function saveProgram(id: string | null, form: FormData) {
  const title = s(form, "title");
  if (!title) throw new Error("Intitulé obligatoire");
  const row = {
    title, slug: s(form, "slug") ? slugify(s(form, "slug")!) : slugify(title), category_id: s(form, "category_id"), modality: s(form, "modality") ?? "presentiel",
    level: s(form, "level"), short_description: s(form, "short_description"), description: s(form, "description"), objectives: s(form, "objectives"),
    prerequisites: s(form, "prerequisites"), syllabus: s(form, "syllabus"), target_audience: s(form, "target_audience"), duration_label: s(form, "duration_label"),
    hours: n(form, "hours"), price_fcfa: n(form, "price_fcfa"), registration_fee_fcfa: n(form, "registration_fee_fcfa") ?? 0, payment_terms: s(form, "payment_terms"),
    pass_mark: Number(s(form, "pass_mark") ?? 10), cover_url: s(form, "cover_url"),
    is_published: form.get("is_published") === "on", is_featured: form.get("is_featured") === "on",
  };
  const supabase = await createClient();
  const q = id ? supabase.from("programs").update(row).eq("id", id).select("id").single() : supabase.from("programs").insert(row).select("id").single();
  const { data, error } = await q;
  if (error) throw new Error(error.code === "23505" ? "Cette adresse (slug) est déjà utilisée" : error.message);
  revalidatePath("/formations");
  if (!id) redirect(`/espace/formations/${data.id}`);
  revalidatePath(`/espace/formations/${id}`);
}

export async function addSession(programId: string, form: FormData) {
  const label = s(form, "label");
  if (!label) throw new Error("Libellé obligatoire");
  const supabase = await createClient();
  const { data, error } = await supabase.from("program_sessions").insert({
    program_id: programId, label, starts_on: s(form, "starts_on"), ends_on: s(form, "ends_on"), schedule_text: s(form, "schedule_text"),
    capacity: n(form, "capacity") || null, trainer_id: s(form, "trainer_id"),
  }).select("id, trainer_id").single();
  if (error) throw new Error(error.message);
  await supabase.from("classes").insert({ session_id: data.id, name: s(form, "class_name") ?? "Groupe A", trainer_id: data.trainer_id });
  revalidatePath(`/espace/formations/${programId}`);
}

export async function addSubject(programId: string, form: FormData) {
  const name = s(form, "name");
  if (!name) throw new Error("Nom obligatoire");
  const supabase = await createClient();
  const { error } = await supabase.from("subjects").insert({ program_id: programId, name, coefficient: Number(s(form, "coefficient") ?? 1) || 1 });
  if (error) throw new Error(error.message);
  revalidatePath(`/espace/formations/${programId}`);
}
