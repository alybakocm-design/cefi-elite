import Link from "next/link";
import { redirect } from "next/navigation";
import { getMe, can, STAFF } from "@/lib/data";
import { Logo } from "@/components/Logo";
import { signOut } from "./actions";

export const dynamic = "force-dynamic";

const MENU: { href: string; label: string; roles: string[] }[] = [
  { href: "/espace/tableau-de-bord", label: "Tableau de bord", roles: STAFF },
  { href: "/espace/candidatures", label: "Candidatures", roles: ["super_admin", "direction", "admin", "secretariat", "resp_pedago"] },
  { href: "/espace/apprenants", label: "Apprenants", roles: STAFF },
  { href: "/espace/formations", label: "Formations", roles: ["super_admin", "direction", "admin", "resp_pedago", "secretariat"] },
  { href: "/espace/paiements", label: "Paiements", roles: ["super_admin", "direction", "admin", "secretariat", "comptable"] },
  { href: "/espace/messages", label: "Messages reçus", roles: ["super_admin", "direction", "admin", "secretariat"] },
  { href: "/espace/parametres", label: "Contenus du site", roles: ["super_admin", "admin"] },
  { href: "/espace/mes-classes", label: "Mes classes", roles: ["formateur"] },
  { href: "/espace/mon-parcours", label: "Mon parcours", roles: ["apprenant"] },
];

const ROLE: Record<string, string> = { super_admin: "Super administrateur", direction: "Direction", admin: "Administrateur", secretariat: "Secrétariat", comptable: "Comptable", resp_pedago: "Responsable pédagogique", formateur: "Formateur", apprenant: "Apprenant" };

export default async function EspaceLayout({ children }: { children: React.ReactNode }) {
  const me = await getMe();
  if (!me) redirect("/connexion");
  const items = MENU.filter((m) => can(me.roles, m.roles));
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-trait bg-white lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between p-5"><Logo compact /><span className="text-xs font-semibold uppercase tracking-wider text-pierre lg:hidden">{me.roles.map((r) => ROLE[r]).join(", ")}</span></div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
          {items.map((m) => <Link key={m.href} href={m.href} className="whitespace-nowrap rounded-lg px-3 py-2 text-[15px] hover:bg-sable">{m.label}</Link>)}
        </nav>
        <div className="hidden border-t border-trait p-5 text-sm lg:absolute lg:bottom-0 lg:block lg:w-full">
          <p className="font-semibold">{me.name}</p>
          <p className="text-pierre">{me.roles.map((r) => ROLE[r]).join(", ")}</p>
          <div className="mt-3 flex gap-4"><Link href="/" className="text-pierre hover:text-rouge">Site public</Link>
            <form action={signOut}><button className="text-pierre hover:text-rouge">Se déconnecter</button></form></div>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="flex justify-end gap-4 border-b border-trait px-5 py-3 text-sm lg:hidden">
          <Link href="/" className="text-pierre">Site public</Link><form action={signOut}><button className="text-pierre">Se déconnecter</button></form>
        </div>
        <div className="mx-auto max-w-6xl px-5 py-8">{children}</div>
      </div>
    </div>
  );
}
