import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRoles, Titre } from "@/components/Guard";

async function markHandled(id: string) {
  "use server";
  const supabase = await createClient();
  await supabase.from("contact_messages").update({ is_handled: true }).eq("id", id);
  revalidatePath("/espace/messages");
}

export default async function Messages() {
  await requireRoles(["super_admin", "direction", "admin", "secretariat"]);
  const supabase = await createClient();
  const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200);
  return (
    <>
      <Titre sous="Messages envoyés depuis la page Contact.">Messages reçus</Titre>
      <div className="space-y-3">
        {(data ?? []).length === 0 && <p className="text-pierre">Aucun message.</p>}
        {(data ?? []).map((m) => (
          <article key={m.id} className={`carte p-5 ${m.is_handled ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap justify-between gap-2"><p className="font-semibold">{m.full_name} <span className="font-normal text-pierre">· {m.phone ?? ""} {m.email ?? ""}</span></p>
              <p className="text-sm text-pierre">{new Date(m.created_at).toLocaleString("fr-FR", { timeZone: "Africa/Bamako" })}</p></div>
            {m.subject && <p className="mt-1 font-serif text-xl font-semibold">{m.subject}</p>}
            <p className="mt-2 whitespace-pre-line text-pierre">{m.message}</p>
            {!m.is_handled && <form action={markHandled.bind(null, m.id)}><button className="btn btn-ligne mt-3 py-1 text-sm">Marquer comme traité</button></form>}
          </article>
        ))}
      </div>
    </>
  );
}
