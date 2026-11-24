"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type P = { id: string; title: string; modality: string };
const MAX = 5 * 1024 * 1024;
const TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export function InscriptionForm({ programs, defaultProgram, defaultModality }: { programs: P[]; defaultProgram?: string; defaultModality?: string }) {
  const [state, setState] = useState<{ pending?: boolean; error?: string; ref?: string }>({});
  const initial = programs.find((p) => p.id === defaultProgram);
  const [modality, setModality] = useState(initial?.modality ?? defaultModality ?? "presentiel");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    if (v("site")) return;
    const files = (f.getAll("documents") as File[]).filter((x) => x.size > 0);
    if (files.length > 5) return setState({ error: "Cinq documents au maximum." });
    for (const file of files) {
      if (file.size > MAX) return setState({ error: `« ${file.name} » dépasse 5 Mo.` });
      if (!TYPES.includes(file.type)) return setState({ error: `« ${file.name} » : seuls les PDF et images sont acceptés.` });
    }
    const phone = v("phone").replace(/\s+/g, " ");
    if (phone.replace(/\D/g, "").length < 8) return setState({ error: "Numéro de téléphone incomplet." });
    setState({ pending: true });
    const supabase = createClient();
    const folder = `depots/${crypto.randomUUID()}`;
    const paths: string[] = [];
    for (const file of files) {
      const safe = file.name.normalize("NFD").replace(/[^\w.-]+/g, "_").slice(-80);
      const path = `${folder}/${safe}`;
      const { error } = await supabase.storage.from("candidatures").upload(path, file, { contentType: file.type });
      if (error) return setState({ error: "Le téléversement d'un document a échoué. Vérifiez votre connexion et réessayez." });
      paths.push(path);
    }
    const { data, error } = await supabase.rpc("submit_application", {
      p_first_name: v("first_name"), p_last_name: v("last_name"), p_birth_date: v("birth_date") || null,
      p_sex: v("sex"), p_phone: phone, p_email: v("email"), p_address: v("address"),
      p_program_id: v("program_id") || null, p_modality: modality, p_message: v("message"),
      p_document_paths: paths, p_consent: f.get("consent") === "on",
    });
    if (error) return setState({ error: error.message.includes("check") ? "Certaines informations sont invalides. Vérifiez le formulaire." : error.message });
    setState({ ref: data as string });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (state.ref) {
    return (
      <div className="carte p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-rouge">Candidature reçue</p>
        <p className="mt-2 font-serif text-4xl font-semibold">Merci !</p>
        <p className="mt-3 text-pierre">Votre numéro de dossier :</p>
        <p className="mt-1 font-mono text-2xl font-bold">{state.ref}</p>
        <p className="mt-4 text-pierre">Conservez ce numéro. Le secrétariat examine votre dossier et vous contacte par téléphone ou e-mail.</p>
        <Link href="/" className="btn btn-encre mt-6">Retour à l&apos;accueil</Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <input type="text" name="site" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <fieldset className="carte space-y-4 p-6">
        <legend className="px-1 font-serif text-2xl font-semibold">Identité</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="etiquette" htmlFor="last_name">Nom *</label><input id="last_name" name="last_name" required maxLength={80} className="champ" autoComplete="family-name" /></div>
          <div><label className="etiquette" htmlFor="first_name">Prénom(s) *</label><input id="first_name" name="first_name" required maxLength={80} className="champ" autoComplete="given-name" /></div>
          <div><label className="etiquette" htmlFor="birth_date">Date de naissance</label><input id="birth_date" name="birth_date" type="date" className="champ" /></div>
          <div><label className="etiquette" htmlFor="sex">Sexe</label>
            <select id="sex" name="sex" className="champ"><option value="">—</option><option value="F">Femme</option><option value="M">Homme</option></select></div>
        </div>
      </fieldset>
      <fieldset className="carte space-y-4 p-6">
        <legend className="px-1 font-serif text-2xl font-semibold">Coordonnées</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="etiquette" htmlFor="phone">Téléphone *</label><input id="phone" name="phone" type="tel" required placeholder="+223 70 00 00 00" maxLength={20} className="champ" autoComplete="tel" /></div>
          <div><label className="etiquette" htmlFor="email">E-mail</label><input id="email" name="email" type="email" className="champ" autoComplete="email" /></div>
        </div>
        <div><label className="etiquette" htmlFor="address">Adresse</label><input id="address" name="address" maxLength={300} placeholder="Quartier, ville, pays" className="champ" /></div>
      </fieldset>
      <fieldset className="carte space-y-4 p-6">
        <legend className="px-1 font-serif text-2xl font-semibold">Formation souhaitée</legend>
        <div><label className="etiquette" htmlFor="program_id">Formation</label>
          <select id="program_id" name="program_id" defaultValue={defaultProgram ?? ""} className="champ"
            onChange={(e) => { const p = programs.find((x) => x.id === e.target.value); if (p) setModality(p.modality); }}>
            <option value="">Je ne sais pas encore / renseignements</option>
            {programs.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select></div>
        <div>
          <span className="etiquette">Modalité</span>
          <div className="flex flex-wrap gap-2">
            {[["presentiel", "Présentiel au centre"], ["video", "Vidéo à la demande"], ["distance", "À distance accompagnée"]].map(([k, l]) => (
              <label key={k} className={`cursor-pointer rounded-lg border px-4 py-2 text-sm ${modality === k ? "border-rouge bg-rouge-pale font-semibold" : "border-trait bg-white"}`}>
                <input type="radio" name="modality" value={k} checked={modality === k} onChange={() => setModality(k)} className="sr-only" />{l}
              </label>
            ))}
          </div>
        </div>
        <div><label className="etiquette" htmlFor="documents">Documents justificatifs <span className="font-normal text-pierre">(PDF ou image, 5 Mo max chacun, 5 au plus)</span></label>
          <input id="documents" name="documents" type="file" multiple accept=".pdf,image/jpeg,image/png,image/webp" className="champ" /></div>
        <div><label className="etiquette" htmlFor="message">Informations complémentaires</label><textarea id="message" name="message" rows={4} maxLength={3000} className="champ" placeholder="Niveau actuel, disponibilités, questions…" /></div>
      </fieldset>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-[var(--color-rouge)]" />
        <span>J&apos;accepte les conditions d&apos;inscription et le traitement de mes données par CEFI-ÉLITE pour l&apos;examen de ma candidature (<Link href="/mentions" className="underline">en savoir plus</Link>). *</span>
      </label>
      {state.error && <p className="rounded-lg bg-rouge-pale p-3 text-sm font-semibold text-rouge-fonce">{state.error}</p>}
      <button disabled={state.pending} className="btn btn-rouge w-full sm:w-auto">{state.pending ? "Envoi en cours…" : "Envoyer ma candidature"}</button>
    </form>
  );
}
