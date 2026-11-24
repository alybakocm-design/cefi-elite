import { createClient } from "@/lib/supabase/server";

export type Setting = { value: unknown; is_placeholder: boolean; label: string | null };
export type Settings = Record<string, Setting>;

export async function getSettings(): Promise<Settings> {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("key, value, is_placeholder, label");
  const out: Settings = {};
  (data ?? []).forEach((s) => (out[s.key] = { value: s.value, is_placeholder: s.is_placeholder, label: s.label }));
  return out;
}

export function text(s: Settings, key: string, fallback = "") {
  const v = s[key]?.value;
  return typeof v === "string" ? v : fallback;
}

export const fcfa = (n: number | null | undefined) =>
  n == null ? "Tarif à définir" : new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

export const modalityLabel: Record<string, string> = {
  presentiel: "Présentiel",
  video: "Vidéo à la demande",
  distance: "À distance accompagnée",
};

export const statusLabel: Record<string, string> = {
  nouvelle: "Nouvelle candidature",
  en_attente: "En attente",
  incomplet: "Dossier incomplet",
  en_examen: "En cours d'examen",
  acceptee: "Acceptée",
  refusee: "Refusée",
  confirmee: "Inscription confirmée",
};

export async function getMe() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("full_name, email").eq("id", user.id).single(),
    supabase.rpc("my_roles"),
  ]);
  return { id: user.id, email: user.email, name: profile?.full_name || user.email, roles: (roles ?? []) as string[] };
}

export const STAFF = ["super_admin", "direction", "admin", "secretariat", "comptable", "resp_pedago"];
export const can = (roles: string[], allowed: string[]) => roles.some((r) => allowed.includes(r));
