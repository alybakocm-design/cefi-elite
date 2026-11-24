import { getSettings, text } from "@/lib/data";
import { PageHead } from "@/components/PageHead";
import { ContactForm } from "./ContactForm";

export const metadata = { title: "Contact" };

export default async function Contact() {
  const s = await getSettings();
  const items = ["contact.address", "contact.phone", "contact.whatsapp", "contact.email", "contact.hours"];
  return (
    <>
      <PageHead kicker="Contact" title="Nous écrire, nous rendre visite" />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1fr_1.4fr]">
        <dl className="space-y-5">
          {items.map((k) => (
            <div key={k}>
              <dt className="text-sm font-semibold uppercase tracking-wider text-rouge">{s[k]?.label}</dt>
              <dd className="mt-1 font-serif text-2xl">{text(s, k)} {s[k]?.is_placeholder && <span className="provisoire align-middle">provisoire</span>}</dd>
            </div>
          ))}
        </dl>
        <ContactForm />
      </div>
    </>
  );
}
