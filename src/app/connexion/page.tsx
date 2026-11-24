import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Connexion" };

export default async function Connexion({ searchParams }: { searchParams: Promise<{ suite?: string }> }) {
  const { suite } = await searchParams;
  const next = suite && suite.startsWith("/espace") ? suite : "/espace";
  return (
    <div className="motif flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="carte p-8">
          <h1 className="text-3xl font-semibold">Accéder à mon espace</h1>
          <p className="mt-1 text-sm text-pierre">Apprenants, formateurs et personnel du centre.</p>
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
