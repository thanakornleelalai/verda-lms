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
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["education"],
    lang: "th",
  };
}
