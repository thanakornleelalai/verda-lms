"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// ── Types ──────────────────────────────────────────────────────────────────

export type Tone = "light" | "dark";

/**
 * ColorTheme maps to [data-color] on <html>.
 * "viridian" is the brand default — it has no CSS override block;
 * the :root values serve as the baseline.
 */
export type ColorTheme =
  | "viridian"
  | "red"
  | "blue"
  | "pink"
  | "amber"
  | "purple";

interface ThemeContextValue {
  tone: Tone;
  color: ColorTheme;
  toggleTone: () => void;
  setTone: (t: Tone) => void;
  setColor: (c: ColorTheme) => void;
}

// ── Context ────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue>({
  tone: "light",
  color: "viridian",
  toggleTone: () => {},
  setTone: () => {},
  setColor: () => {},
});

// ── Storage keys ───────────────────────────────────────────────────────────

const TONE_KEY  = "verda-theme";   // kept for backward compat with anti-FOUC script
const COLOR_KEY = "verda-color";

// ── DOM helpers ────────────────────────────────────────────────────────────

function applyTone(tone: Tone) {
  document.documentElement.setAttribute("data-theme", tone);
}

function applyColor(color: ColorTheme) {
  const el = document.documentElement;
  if (color === "viridian") {
    // Remove the attribute so :root defaults take over
    el.removeAttribute("data-color");
  } else {
    el.setAttribute("data-color", color);
  }
}

function persist(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private browsing or storage quota exceeded — fail silently
  }
}

// ── Provider ───────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  /*
   * Initialize to "light" + "viridian" on the server / first render.
   * The anti-FOUC inline script in layout.tsx has already set the correct
   * data-* attributes on <html> before React hydrates, so there is no flash.
   */
  const [tone, setToneState]   = useState<Tone>("light");
  const [color, setColorState] = useState<ColorTheme>("viridian");

  // On mount: sync React state with what the inline script already applied.
  useEffect(() => {
    const savedTone  = localStorage.getItem(TONE_KEY)  as Tone       | null;
    const savedColor = localStorage.getItem(COLOR_KEY) as ColorTheme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const resolvedTone:  Tone       = savedTone  ?? (prefersDark ? "dark" : "light");
    const resolvedColor: ColorTheme = savedColor ?? "viridian";

    setToneState(resolvedTone);
    setColorState(resolvedColor);
    applyTone(resolvedTone);
    applyColor(resolvedColor);
  }, []);

  // ── Setters ──────────────────────────────────────────────────────────────

  const setTone = useCallback((next: Tone) => {
    setToneState(next);
    applyTone(next);
    persist(TONE_KEY, next);
  }, []);

  const toggleTone = useCallback(() => {
    setToneState((current) => {
      const next: Tone = current === "light" ? "dark" : "light";
      applyTone(next);
      persist(TONE_KEY, next);
      return next;
    });
  }, []);

  const setColor = useCallback((next: ColorTheme) => {
    setColorState(next);
    applyColor(next);
    persist(COLOR_KEY, next);
  }, []);

  return (
    <ThemeContext.Provider value={{ tone, color, toggleTone, setTone, setColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useTheme() {
  return useContext(ThemeContext);
}
