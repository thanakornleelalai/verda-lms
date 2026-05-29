import type { Metadata } from "next";
import { Instrument_Serif, Manrope, IBM_Plex_Sans_Thai, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--f-display",
  display: "swap",
});

const manrope = Manrope({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--f-sans",
  display: "swap",
});

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--f-thai",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--f-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | VERDA — School of Practice",
    default: "VERDA — School of Practice",
  },
  description:
    "แพลตฟอร์มเรียนออนไลน์สำหรับผู้สร้างและผู้เรียนชาวไทย เรียนกับผู้เชี่ยวชาญที่ทำงานจริง",
  keywords: ["เรียนออนไลน์", "คอร์สออนไลน์", "LMS", "SkillLane", "VERDA"],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
  ),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${manrope.variable} ${ibmPlexSansThai.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/*
         * Anti-FOUC: read saved theme from localStorage and apply it
         * synchronously before React hydrates, so the page never flashes.
         * Must be an inline blocking script — no async/defer.
         */}
        {/*
         * Anti-FOUC: restores both tone (dark/light) AND primary color
         * from localStorage before React hydrates — zero flash on any reload.
         * Runs synchronously; must not be async or deferred.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var el=document.documentElement;var t=localStorage.getItem('verda-theme');var c=localStorage.getItem('verda-color');var f=localStorage.getItem('verda-fontsize');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){el.setAttribute('data-theme','dark');}if(c&&c!=='viridian'){el.setAttribute('data-color',c);}if(f&&f!=='default'){el.setAttribute('data-fontsize',f);}}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
