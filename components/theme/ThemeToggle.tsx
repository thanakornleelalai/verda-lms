"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface Props {
  /** "icon" — bare 38px circle button (default). "pill" — icon + label. */
  variant?: "icon" | "pill";
  className?: string;
}

export function ThemeToggle({ variant = "icon", className = "" }: Props) {
  const { tone, toggleTone } = useTheme();
  const isDark = tone === "dark";
  const label  = isDark ? "สลับเป็นโหมดสว่าง" : "สลับเป็นโหมดมืด";

  if (variant === "pill") {
    return (
      <button
        onClick={toggleTone}
        aria-label={label}
        title={label}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-pill border border-line bg-paper-2 hover:border-viridian-3 transition-colors text-[13px] text-ink-2 font-medium ${className}`}
      >
        {isDark
          ? <Sun  size={14} className="text-amber-400" />
          : <Moon size={14} className="text-viridian" />}
        {isDark ? "Light" : "Dark"}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTone}
      aria-label={label}
      title={label}
      className={`w-[38px] h-[38px] rounded-full inline-flex items-center justify-center text-ink-2 hover:bg-paper-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-viridian focus-visible:ring-offset-2 ${className}`}
    >
      {isDark
        ? <Sun  size={18} className="text-amber-400" />
        : <Moon size={18} />}
    </button>
  );
}
