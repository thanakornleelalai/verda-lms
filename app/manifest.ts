import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VERDA — School of Practice",
    short_name: "VERDA",
    description: "แพลตฟอร์มเรียนออนไลน์สำหรับผู้สร้างและผู้เรียนชาวไทย",
    start_url: "/th",
    display: "standalone",
    background_color: "#FAF8F1",
    theme_color: "#0F5D4A",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/favicon.svg",
        sizes: "32x32",
        type: "image/svg+xml",
      },
    ],
    categories: ["education"],
    lang: "th",
  };
}
