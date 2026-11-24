import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRoles, Titre } from "@/components/Guard";

async function saveSettings(form: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: rows } = await supabase.from("settings").select("key,value");
  for (const r of rows ?? []) {
    const raw = form.get(r.key);
    if (raw == null) continue;
    const str = String(raw).trim();
    const value = Array.isArray(r.value) ? str.split("\n").map((x) => x.trim()).filter(Boolean) : str;
    if (JSON.stringify(value) === JSON.stringify(r.value)) continue;
    await supabase.from("settings").update({ value, is_placeholder: false }).eq("key", r.key);
  }
  revalidatePath("/", "layout");
}

export default async function Parametres() {
  await requireRoles(["super_admin", "admin"]);
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("*").order("key");
  const groups: Record<string, string> = { site: "Identité", contact: "Coordonnées", about: "Présentation du centre", social: "Réseaux sociaux" };
  return (
    <>
      <Titre sous="Les champs marqués « provisoire » s'affichent avec un badge sur le site tant qu'ils n'ont pas été modifiés. Pour les valeurs, une valeur par ligne.">Contenus du site</Titre>
      <form action={saveSettings} className="space-y-6">
        {Object.entries(groups).map(([g, label]) => (
          <fieldset key={g} className="carte space-y-4 p-5">
            <legend className="px-1 font-serif text-2xl font-semibold">{label}</legend>
            {(data ?? []).filter((s) => s.key.startsWith(g + ".")).map((s) => {
              const val = Array.isArray(s.value) ? (s.value as string[]).join("\n") : String(s.value ?? "");
              const long = Array.isArray(s.value) || val.length > 80;
              return (
                <div key={s.key}>
                  <label className="etiquette" htmlFor={s.key}>{s.label} {s.is_placeholder && <span className="provisoire ml-1">provisoire</span>}</label>
                  {long ? <textarea id={s.key} name={s.key} defaultValue={val} rows={3} className="champ" /> : <input id={s.key} name={s.key} defaultValue={val} className="champ" />}
                </div>
              );
            })}
          </fieldset>
        ))}
        <button className="btn btn-rouge">Enregistrer les contenus</button>
      </form>
    </>
  );
}
