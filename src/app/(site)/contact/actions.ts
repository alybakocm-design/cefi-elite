"use server";
import { createClient } from "@/lib/supabase/server";

export type ContactState = { ok?: boolean; error?: string };

export async function sendContact(_: ContactState, form: FormData): Promise<ContactState> {
  const v = (k: string) => String(form.get(k) ?? "").trim();
  if (v("site")) return { ok: true }; // champ piège anti-robots
  const full_name = v("full_name"), message = v("message"), email = v("email"), phone = v("phone");
  if (full_name.length < 2) return { error: "Indiquez votre nom." };
  if (!email && !phone) return { error: "Indiquez un e-mail ou un téléphone pour que nous puissions vous répondre." };
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Adresse e-mail invalide." };
  if (message.length < 5) return { error: "Votre message est trop court." };
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    full_name: full_name.slice(0, 120), email: email || null, phone: phone.slice(0, 30) || null,
    subject: v("subject").slice(0, 200) || null, message: message.slice(0, 5000),
  });
  if (error) return { error: "L'envoi a échoué. Réessayez dans un instant." };
  return { ok: true };
}
