"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [msg, setMsg] = useState<{ error?: string; info?: string; pending?: boolean }>({});

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim(), password = String(f.get("password") ?? "");
    const supabase = createClient();
    setMsg({ pending: true });
    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/reinitialiser` });
      return setMsg(error ? { error: "Impossible d'envoyer l'e-mail pour le moment." } : { info: "Si un compte existe pour cette adresse, un lien de réinitialisation vient d'être envoyé." });
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setMsg({ error: "E-mail ou mot de passe incorrect." });
    await supabase.from("login_history").insert({ user_id: data.user.id, user_agent: navigator.userAgent.slice(0, 250) });
    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div><label className="etiquette" htmlFor="email">E-mail</label><input id="email" name="email" type="email" required autoComplete="email" className="champ" /></div>
      {mode === "login" && (
        <div><label className="etiquette" htmlFor="password">Mot de passe</label><input id="password" name="password" type="password" required autoComplete="current-password" className="champ" /></div>
      )}
      {msg.error && <p className="text-sm font-semibold text-rouge">{msg.error}</p>}
      {msg.info && <p className="text-sm text-pierre">{msg.info}</p>}
      <button disabled={msg.pending} className="btn btn-rouge w-full">{mode === "login" ? (msg.pending ? "Connexion…" : "Se connecter") : "Recevoir le lien"}</button>
      <button type="button" onClick={() => { setMode(mode === "login" ? "forgot" : "login"); setMsg({}); }} className="w-full text-center text-sm text-pierre hover:text-rouge">
        {mode === "login" ? "Mot de passe oublié ?" : "← Retour à la connexion"}
      </button>
    </form>
  );
}
