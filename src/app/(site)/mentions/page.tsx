import { PageHead } from "@/components/PageHead";
import { Provisoire } from "@/components/Provisoire";
export const metadata = { title: "Mentions et confidentialité" };
export default function Mentions() {
  return (
    <>
      <PageHead kicker="Informations légales" title="Mentions et confidentialité" />
      <div className="prose-cefi mx-auto max-w-3xl px-5 py-10 text-pierre">
        <p><Provisoire>Texte à valider par la direction</Provisoire></p>
        <p>Les informations transmises par les formulaires (inscription, contact) servent uniquement au traitement de votre demande par CEFI-ÉLITE. Elles sont conservées sur des serveurs sécurisés et ne sont ni vendues ni cédées.</p>
        <p>Vous pouvez demander l&apos;accès, la correction ou la suppression de vos données en contactant le secrétariat.</p>
        <p>Les documents justificatifs déposés ne sont accessibles qu&apos;au personnel habilité.</p>
      </div>
    </>
  );
}
