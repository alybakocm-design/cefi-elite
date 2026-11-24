import { redirect } from "next/navigation";
import { getMe, can, STAFF } from "@/lib/data";

export default async function Espace() {
  const me = await getMe();
  if (!me) redirect("/connexion");
  if (can(me.roles, STAFF)) redirect("/espace/tableau-de-bord");
  if (me.roles.includes("formateur")) redirect("/espace/mes-classes");
  redirect("/espace/mon-parcours");
}
