import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base = process.env.URL ?? "https://cefi-elite.netlify.app";
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/espace", "/connexion", "/reinitialiser"] }], sitemap: `${base}/sitemap.xml` };
}
