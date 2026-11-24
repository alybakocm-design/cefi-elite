"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Reinitialiser() {
  const router = useRouter();
  const [err, setErr] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const p = String(new FormData(e.currentTarget).get("password"));
    if (p.length < 10) return setErr("10 caractères minimum.");
    const { error } = await createClient().auth.updateUser({ password: p });
    if (error) return setErr("Le lien a expiré. Recommencez depuis la page de connexion.");
    router.replace("/espace");
  }
  return (
    <div className="motif flex min-h-screen items-center justify-center px-5">
      <form onSubmit={submit} className="carte w-full max-w-md space-y-4 p-8">
        <h1 className="text-3xl font-semibold">Nouveau mot de passe</h1>
        <input name="password" type="password" required minLength={10} autoComplete="new-password" className="champ" />
        {err && <p className="text-sm font-semibold text-rouge">{err}</p>}
        <button className="btn btn-rouge w-full">Enregistrer</button>
      </form>
    </div>
  );
}
