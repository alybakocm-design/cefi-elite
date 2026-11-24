import type { Metadata } from "next";
import { getSettings, text } from "@/lib/data";
import { PageHead } from "@/components/PageHead";
import { Provisoire } from "@/components/Provisoire";

export const metadata: Metadata = { title: "Le centre", description: "Présentation, mission, vision, valeurs et pédagogie de CEFI-ÉLITE." };

export default async function APropos() {
  const s = await getSettings();
  const values = Array.isArray(s["about.values"]?.value) ? (s["about.values"].value as string[]) : [];
  const blocs = [
    { id: "presentation", t: "Présentation", k: "site.intro" },
    { id: "mission", t: "Notre mission", k: "about.mission" },
    { id: "vision", t: "Notre vision", k: "about.vision" },
    { id: "pedagogie", t: "Notre pédagogie", k: "about.pedagogy" },
  ];
  return (
    <>
      <PageHead kicker="Le centre" title={text(s, "site.full_name", "CEFI-ÉLITE")} />
      <div className="mx-auto max-w-4xl px-5 py-10">
        {blocs.map((b) => (
          <section key={b.id} id={b.id} className="border-b border-trait py-8">
            <h2 className="flex flex-wrap items-center gap-3 text-3xl font-semibold">{b.t} <Provisoire show={s[b.k]?.is_placeholder} /></h2>
            <p className="mt-3 text-lg leading-relaxed text-pierre">{text(s, b.k)}</p>
          </section>
        ))}
        <section id="valeurs" className="py-8">
          <h2 className="flex flex-wrap items-center gap-3 text-3xl font-semibold">Nos valeurs <Provisoire show={s["about.values"]?.is_placeholder} /></h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-3">
            {values.map((v) => <li key={v} className="carte p-5 font-serif text-xl font-semibold">{v}</li>)}
          </ul>
        </section>
      </div>
    </>
  );
}
