import { redirect } from "next/navigation";
import { getMe, can } from "@/lib/data";

/** Garde d'affichage. La vraie protection des données est faite par la RLS en base. */
export async function requireRoles(roles: string[]) {
  const me = await getMe();
  if (!me) redirect("/connexion");
  if (!can(me.roles, roles)) redirect("/espace");
  return me;
}

export function Titre({ children, sous }: { children: React.ReactNode; sous?: React.ReactNode }) {
  return <div className="mb-6"><h1 className="text-4xl font-semibold">{children}</h1>{sous && <p className="mt-1 text-pierre">{sous}</p>}</div>;
}
