import { createClient } from "@/lib/supabase/server";
import { requireRoles, Titre } from "@/components/Guard";
import { ProgramForm } from "@/components/ProgramForm";
import { saveProgram } from "../actions";

export default async function Nouvelle() {
  await requireRoles(["super_admin", "admin", "resp_pedago"]);
  const supabase = await createClient();
  const { data: cats } = await supabase.from("categories").select("id,name").order("sort_order");
  return <><Titre>Nouvelle formation</Titre><ProgramForm action={saveProgram.bind(null, null)} cats={cats ?? []} /></>;
}
