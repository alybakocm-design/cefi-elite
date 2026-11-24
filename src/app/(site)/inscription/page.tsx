import { createClient } from "@/lib/supabase/server";
import { PageHead } from "@/components/PageHead";
import { InscriptionForm } from "./InscriptionForm";

export const metadata = { title: "Inscription", description: "Déposez votre candidature en ligne à une formation de CEFI-ÉLITE." };

export default async function Inscription({ searchParams }: { searchParams: Promise<{ formation?: string; modalite?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("programs").select("id,title,modality").eq("is_published", true).order("title");
  return (
    <>
      <PageHead kicker="Inscription" title="Déposer ma candidature">Remplissez ce formulaire : votre dossier arrive directement au secrétariat, qui vous recontacte pour la suite.</PageHead>
      <div className="mx-auto max-w-3xl px-5 py-10">
        <InscriptionForm programs={data ?? []} defaultProgram={sp.formation} defaultModality={sp.modalite} />
      </div>
    </>
  );
}
