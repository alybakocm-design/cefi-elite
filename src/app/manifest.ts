import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CEFI-ÉLITE", short_name: "CEFI-ÉLITE",
    description: "Centre d'Études et de Formations Islamiques",
    start_url: "/espace", display: "standalone", background_color: "#faf6ee", theme_color: "#c4161c", lang: "fr",
    icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png" }],
  };
}
