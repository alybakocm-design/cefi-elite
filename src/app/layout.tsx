import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/source-sans-3";
import "@fontsource/amiri/400.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.URL ?? "https://cefi-elite.netlify.app"),
  title: { default: "CEFI-ÉLITE — Centre d'Études et de Formations Islamiques", template: "%s · CEFI-ÉLITE" },
  description: "Formations islamiques en présentiel à Bamako et en ligne : Coran, langue arabe, fiqh, aqida, sira.",
  manifest: "/manifest.webmanifest",
  openGraph: { type: "website", locale: "fr_ML", siteName: "CEFI-ÉLITE", images: ["/icon-512.png"] },
};

export const viewport: Viewport = { themeColor: "#c4161c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
