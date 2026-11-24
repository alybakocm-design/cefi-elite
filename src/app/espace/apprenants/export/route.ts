import { createClient } from "@/lib/supabase/server";

const esc = (v: unknown) => { const s = v == null ? "" : String(v); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("learners").select("matricule,last_name,first_name,sex,birth_date,phone,email,address,emergency_contact_name,emergency_contact_phone,status,created_at").order("last_name");
  if (error) return new Response("Accès refusé", { status: 403 });
  const head = ["Matricule", "Nom", "Prénom", "Sexe", "Naissance", "Téléphone", "E-mail", "Adresse", "Contact urgence", "Tél. urgence", "Statut", "Créé le"];
  const rows = (data ?? []).map((r) => Object.values(r).map(esc).join(";"));
  const csv = "﻿" + [head.join(";"), ...rows].join("\r\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="apprenants-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
