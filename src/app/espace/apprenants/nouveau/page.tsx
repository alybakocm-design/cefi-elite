import { requireRoles, Titre } from "@/components/Guard";
import { LearnerForm } from "@/components/LearnerForm";
import { saveLearner } from "../actions";

export default async function Nouveau() {
  await requireRoles(["super_admin", "admin", "secretariat"]);
  return (<><Titre sous="Pour une inscription faite directement au guichet.">Nouveau dossier apprenant</Titre><LearnerForm action={saveLearner.bind(null, null)} submit="Créer le dossier" /></>);
}
