import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PageHead } from "@/components/PageHead";

export const metadata: Metadata = { title: "Questions fréquentes" };

export default async function Faq() {
  const supabase = await createClient();
  const { data } = await supabase.from("faqs").select("id,question,answer,is_demo").order("sort_order");
  return (
    <>
      <PageHead kicker="Aide" title="Questions fréquentes" />
      <div className="mx-auto max-w-3xl px-5 py-10">
        {(data ?? []).map((f) => (
          <details key={f.id} className="group border-b border-trait py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between font-serif text-2xl font-semibold">
              {f.question}<span className="text-rouge transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-pierre">{f.answer}</p>
            {f.is_demo && <span className="provisoire mt-2">Réponse provisoire</span>}
          </details>
        ))}
      </div>
    </>
  );
}
