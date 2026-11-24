type P = Record<string, string | number | boolean | null>;
export function ProgramForm({ action, p = {}, cats }: { action: (f: FormData) => Promise<void>; p?: P; cats: { id: string; name: string }[] }) {
  const t = (k: string, l: string, type = "text") => <div><label className="etiquette" htmlFor={k}>{l}</label><input id={k} name={k} type={type} defaultValue={(p[k] as string) ?? ""} className="champ" /></div>;
  const a = (k: string, l: string) => <div className="md:col-span-2"><label className="etiquette" htmlFor={k}>{l}</label><textarea id={k} name={k} rows={4} defaultValue={(p[k] as string) ?? ""} className="champ" /></div>;
  return (
    <form action={action} className="carte grid gap-4 p-5 md:grid-cols-2">
      <div className="md:col-span-2">{t("title", "Intitulé *")}</div>
      <div><label className="etiquette">Discipline</label><select name="category_id" defaultValue={(p.category_id as string) ?? ""} className="champ"><option value="">—</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div><label className="etiquette">Modalité</label><select name="modality" defaultValue={(p.modality as string) ?? "presentiel"} className="champ"><option value="presentiel">Présentiel</option><option value="video">Vidéo à la demande</option><option value="distance">À distance accompagnée</option></select></div>
      {t("level", "Niveau")}{t("duration_label", "Durée (ex. 9 mois)")}{t("hours", "Volume horaire (h)", "number")}{t("pass_mark", "Moyenne de réussite (/20)", "number")}
      {t("price_fcfa", "Tarif (FCFA) — vide = « à définir »", "number")}{t("registration_fee_fcfa", "Frais d'inscription (FCFA)", "number")}
      <div className="md:col-span-2">{t("short_description", "Description courte (carte du catalogue)")}</div>
      {a("description", "Présentation")}{a("objectives", "Objectifs pédagogiques")}{a("target_audience", "Public visé")}{a("prerequisites", "Prérequis")}{a("syllabus", "Programme")}
      <div className="md:col-span-2">{t("payment_terms", "Modalités de paiement")}</div>
      {t("cover_url", "Image de couverture (URL)")}{t("slug", "Adresse de la page (slug, facultatif)")}
      <label className="flex items-center gap-2"><input type="checkbox" name="is_published" defaultChecked={!!p.is_published} /> Publiée sur le site</label>
      <label className="flex items-center gap-2"><input type="checkbox" name="is_featured" defaultChecked={!!p.is_featured} /> À la une</label>
      <div><button className="btn btn-rouge">Enregistrer</button></div>
    </form>
  );
}
