"use client";
import { useActionState } from "react";
import { sendContact, type ContactState } from "./actions";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, {});
  if (state.ok) return <div className="carte p-6"><p className="font-serif text-2xl font-semibold">Message envoyé.</p><p className="mt-2 text-pierre">Le secrétariat vous répondra dans les meilleurs délais.</p></div>;
  return (
    <form action={action} className="carte space-y-4 p-6">
      <input type="text" name="site" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div><label className="etiquette" htmlFor="full_name">Nom complet *</label><input id="full_name" name="full_name" required className="champ" /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="etiquette" htmlFor="phone">Téléphone</label><input id="phone" name="phone" type="tel" placeholder="+223 ..." className="champ" /></div>
        <div><label className="etiquette" htmlFor="email">E-mail</label><input id="email" name="email" type="email" className="champ" /></div>
      </div>
      <div><label className="etiquette" htmlFor="subject">Objet</label><input id="subject" name="subject" className="champ" /></div>
      <div><label className="etiquette" htmlFor="message">Message *</label><textarea id="message" name="message" required rows={5} className="champ" /></div>
      {state.error && <p className="text-sm font-semibold text-rouge">{state.error}</p>}
      <button disabled={pending} className="btn btn-rouge">{pending ? "Envoi…" : "Envoyer"}</button>
    </form>
  );
}
