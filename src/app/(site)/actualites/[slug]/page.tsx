import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

async function load(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("*").eq("slug", slug).maybeSingle();
  return data;
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await load((await params).slug);
  return p ? { title: p.title, description: p.excerpt ?? undefined } : {};
}
export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const p = await load((await params).slug);
  if (!p) notFound();
  return (
    <article className="mx-auto max-w-3xl px-5 py-14">
      <Link href="/actualites" className="text-sm text-pierre hover:text-rouge">← Actualités</Link>
      <h1 className="mt-4 text-5xl font-semibold leading-tight">{p.title}</h1>
      <p className="mt-3 text-pierre">{new Date(p.event_starts_at ?? p.published_at).toLocaleString("fr-FR", { dateStyle: "full", timeStyle: p.event_starts_at ? "short" : undefined, timeZone: "Africa/Bamako" })}{p.event_place ? ` · ${p.event_place}` : ""}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {p.cover_url && <img src={p.cover_url} alt="" className="mt-8 w-full rounded-xl" />}
      <div className="prose-cefi mt-8 whitespace-pre-line text-lg">{p.body}</div>
    </article>
  );
}
