type L = Partial<Record<"first_name" | "last_name" | "sex" | "birth_date" | "phone" | "email" | "address" | "emergency_contact_name" | "emergency_contact_phone" | "status", string | null>>;

export function LearnerForm({ action, l = {}, submit }: { action: (f: FormData) => Promise<void>; l?: L; submit: string }) {
  const f = (name: keyof L, label: string, type = "text") => (
    <div><label className="etiquette" htmlFor={name}>{label}</label><input id={name} name={name} type={type} defaultValue={l[name] ?? ""} className="champ" /></div>
  );
  return (
    <form action={action} className="carte grid gap-4 p-5 sm:grid-cols-2">
      {f("last_name", "Nom *")}{f("first_name", "Prénom(s) *")}
      <div><label className="etiquette" htmlFor="sex">Sexe</label><select id="sex" name="sex" defaultValue={l.sex ?? ""} className="champ"><option value="">—</option><option value="F">Femme</option><option value="M">Homme</option></select></div>
      {f("birth_date", "Date de naissance", "date")}{f("phone", "Téléphone", "tel")}{f("email", "E-mail", "email")}
      <div className="sm:col-span-2">{f("address", "Adresse")}</div>
      {f("emergency_contact_name", "Contact d'urgence")}{f("emergency_contact_phone", "Téléphone d'urgence", "tel")}
      <div><label className="etiquette" htmlFor="status">Statut</label><select id="status" name="status" defaultValue={l.status ?? "actif"} className="champ">{["actif", "suspendu", "diplome", "abandon", "archive"].map((s) => <option key={s}>{s}</option>)}</select></div>
      <div className="flex items-end"><button className="btn btn-rouge">{submit}</button></div>
    </form>
  );
}
