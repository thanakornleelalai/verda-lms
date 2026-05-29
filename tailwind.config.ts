import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Enable selector-based dark mode — reads from html[data-theme="dark"]
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      // ── VERDA Color Tokens ──────────────────────────────────────────
      colors: {
        /*
         * `primary` aliases the viridian CSS vars so new components can use
         * `bg-primary`, `text-primary`, etc. and automatically respond to
         * both the color-picker and the dark/light mode toggle.
         */
        primary: {
          DEFAULT: "rgb(var(--viridian-rgb) / <alpha-value>)",
          2:       "var(--viridian-2)",
          3:       "var(--viridian-3)",
          tint:    "var(--viridian-tint)",
          wash:    "var(--viridian-wash)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          2: "var(--ink-2)",
          3: "var(--ink-3)",
          4: "var(--ink-4)",
        },
        line: {
          DEFAULT: "var(--line)",
          2: "var(--line-2)",
        },
        paper: {
          DEFAULT: "var(--paper)",
          2: "var(--paper-2)",
          3: "var(--paper-3)",
        },
        viridian: {
          DEFAULT: "rgb(var(--viridian-rgb) / <alpha-value>)",
          2: "var(--viridian-2)",
          3: "var(--viridian-3)",
          tint: "var(--viridian-tint)",
          wash: "var(--viridian-wash)",
        },
        gold: "var(--gold)",
        clay: "var(--clay)",
        plum: "var(--plum)",
        sage: "var(--sage)",
        ok: "rgb(var(--ok-rgb) / <alpha-value>)",
        warn: "rgb(var(--warn-rgb) / <alpha-value>)",
        danger: "rgb(var(--danger-rgb) / <alpha-value>)",
      },
      // ── VERDA Typography ────────────────────────────────────────────
      fontFamily: {
        display: ["var(--f-display)", "Georgia", "serif"],
        sans: ["var(--f-sans)", "system-ui", "sans-serif"],
        thai: ["var(--f-thai)", "system-ui", "sans-serif"],
        mono: ["var(--f-mono)", "ui-monospace", "monospace"],
      },
      // ── VERDA Border Radius ─────────────────────────────────────────
      borderRadius: {
        r1: "4px",
        r2: "8px",
        r3: "14px",
        r4: "22px",
        pill: "999px",
      },
      // ── VERDA Shadows ───────────────────────────────────────────────
      boxShadow: {
        sm: "0 1px 0 rgba(14,22,18,0.04), 0 1px 2px rgba(14,22,18,0.04)",
        md: "0 1px 0 rgba(14,22,18,0.04), 0 8px 24px -10px rgba(14,22,18,0.12)",
        lg: "0 1px 0 rgba(14,22,18,0.04), 0 30px 60px -24px rgba(14,22,18,0.18)",
        "card-hover": "0 20px 60px -10px rgba(14,22,18,0.20), 0 8px 20px -6px rgba(14,22,18,0.10)",
      },
      keyframes: {
        fadeInUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.55s cubic-bezier(0.4, 0, 0.2, 1) both",
      },
      maxWidth: {
        container: "1320px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
