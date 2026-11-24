import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.URL ?? "https://cefi-elite.netlify.app";
  const fixed = ["", "/a-propos", "/formations", "/academie", "/formateurs", "/actualites", "/faq", "/contact", "/inscription"].map((p) => ({ url: base + p }));
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [{ data: progs }, { data: posts }] = await Promise.all([
    sb.from("programs").select("slug,updated_at").eq("is_published", true),
    sb.from("posts").select("slug,updated_at"),
  ]);
  return [...fixed, ...(progs ?? []).map((p) => ({ url: `${base}/formations/${p.slug}`, lastModified: p.updated_at })), ...(posts ?? []).map((p) => ({ url: `${base}/actualites/${p.slug}`, lastModified: p.updated_at }))];
}
