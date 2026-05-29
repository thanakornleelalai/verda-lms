"use client";

import { useState, useEffect, useRef } from "react";
import { Palette, Sun, Moon, Check } from "lucide-react";
import { useTheme, type ColorTheme } from "./ThemeProvider";

// ── Color palette catalog ──────────────────────────────────────────────────

interface ColorConfig {
  id: ColorTheme;
  label: string;
  /** Swatch shown in light mode */
  light: string;
  /** Swatch shown in dark mode (the lighter, vibrant variant) */
  dark: string;
}

const COLOR_CATALOG: ColorConfig[] = [
  { id: "viridian", label: "Viridian",  light: "#0F5D4A", dark: "#2FA87A" },
  { id: "red",      label: "Red",       light: "#C0392B", dark: "#F87171" },
  { id: "blue",     label: "Blue",      light: "#2563EB", dark: "#60A5FA" },
  { id: "pink",     label: "Pink",      light: "#DB2777", dark: "#F472B6" },
  { id: "amber",    label: "Amber",     light: "#C2570A", dark: "#FCD34D" },
  { id: "purple",   label: "Purple",    light: "#7C3AED", dark: "#A78BFA" },
];

// ── Component ─────────────────────────────────────────────────────────────

export function ThemeCustomizer() {
  const { tone, color, setTone, setColor } = useTheme();
  const [open, setOpen] = useState(false);

  const isDark     = tone === "dark";
  const panelRef   = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // ── Close handlers ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (
        !panelRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="relative">

      {/* ── Trigger button ───────────────────────────────────────────── */}
      <button
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        aria-label="ปรับแต่ง Theme และสี"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Theme & Color"
        className="w-[38px] h-[38px] rounded-full inline-flex items-center justify-center text-ink-2 hover:bg-paper-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-viridian focus-visible:ring-offset-2"
      >
        <Palette size={18} />
      </button>

      {/* ── Dropdown panel ───────────────────────────────────────────── */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="ตัวปรับแต่ง Theme และสี"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-[264px] bg-paper-3 border border-line rounded-r3 shadow-lg overflow-hidden"
        >
          {/* Viridian accent bar — updates automatically when color changes */}
          <div className="h-[3px] bg-viridian" />

          <div className="p-4 flex flex-col gap-5">

            {/* ── Tone (dark / light) section ─────────────────────────── */}
            <div>
              <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-ink-4 mb-2.5 select-none">
                โหมดการแสดงผล
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { value: "light" as const, icon: <Sun  size={14} />, label: "สว่าง" },
                    { value: "dark"  as const, icon: <Moon size={14} />, label: "มืด"   },
                  ] as const
                ).map(({ value, icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setTone(value)}
                    aria-pressed={tone === value}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-r2 text-[13px] font-medium border transition-colors ${
                      tone === value
                        ? "bg-viridian-wash border-viridian text-viridian"
                        : "bg-paper-2 border-line text-ink-3 hover:border-viridian-3 hover:text-ink"
                    }`}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Primary color section ────────────────────────────────── */}
            <div>
              <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-ink-4 mb-2.5 select-none">
                สีหลัก
              </p>
              <div className="flex flex-wrap gap-2.5">
                {COLOR_CATALOG.map((cfg) => {
                  const isActive = color === cfg.id;
                  const swatch   = isDark ? cfg.dark : cfg.light;
                  return (
                    <button
                      key={cfg.id}
                      onClick={() => setColor(cfg.id)}
                      aria-label={`เลือกสี ${cfg.label}`}
                      aria-pressed={isActive}
                      title={cfg.label}
                      className="relative w-8 h-8 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-viridian transition-transform hover:scale-110 active:scale-95"
                      style={{
                        background: swatch,
                        // Active: white ring around the swatch
                        boxShadow: isActive
                          ? `0 0 0 2px var(--paper-3), 0 0 0 4px ${swatch}`
                          : undefined,
                      }}
                    >
                      {isActive && (
                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <Check size={13} strokeWidth={3} className="text-white drop-shadow-sm" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active selection label */}
              <p className="font-mono text-[10px] text-ink-4 mt-2.5 select-none">
                {COLOR_CATALOG.find((c) => c.id === color)?.label ?? "Viridian"}
                {" · "}
                {isDark ? "Dark" : "Light"}
              </p>
            </div>

            {/* ── Reset link ───────────────────────────────────────────── */}
            {(tone !== "light" || color !== "viridian") && (
              <button
                onClick={() => { setTone("light"); setColor("viridian"); }}
                className="self-start font-mono text-[10px] tracking-[0.08em] uppercase text-ink-4 hover:text-viridian transition-colors"
              >
                ↩ รีเซ็ตค่าเริ่มต้น
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
