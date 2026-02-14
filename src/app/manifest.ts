import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "3Bfreeze — Freeze Your Credit at All Three Bureaus",
    short_name: "3Bfreeze",
    description:
      "Your simple solution for proactive credit security. Freeze your credit at Equifax, TransUnion, and Experian. Free by law.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#433D8B",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
