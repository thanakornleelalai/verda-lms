"use client";

import { useState, useEffect } from "react";

const FONT_KEY = "verda-fontsize";
type FontSize = "sm" | "default" | "lg";

function applyFontSize(size: FontSize) {
  const el = document.documentElement;
  if (size === "default") {
    el.removeAttribute("data-fontsize");
  } else {
    el.setAttribute("data-fontsize", size);
  }
}

export function FontSizeControl() {
  const [size, setSize] = useState<FontSize>("default");

  useEffect(() => {
    const saved = localStorage.getItem(FONT_KEY) as FontSize | null;
    if (saved && ["sm", "default", "lg"].includes(saved)) {
      setSize(saved);
    }
  }, []);

  function change(next: FontSize) {
    setSize(next);
    applyFontSize(next);
    if (next === "default") {
      localStorage.removeItem(FONT_KEY);
    } else {
      localStorage.setItem(FONT_KEY, next);
    }
  }

  return (
    <div
      className="flex items-center bg-paper-2 border border-line rounded-r2 overflow-hidden"
      title="ขนาดตัวอักษร"
      aria-label="เลือกขนาดตัวอักษร"
      role="group"
    >
      {(
        [
          { id: "sm" as const, label: "A−", title: "ขนาดเล็ก", cls: "text-[11px]" },
          { id: "default" as const, label: "A", title: "ขนาดปกติ", cls: "text-[13px]" },
          { id: "lg" as const, label: "A+", title: "ขนาดใหญ่", cls: "text-[15px]" },
        ] as const
      ).map(({ id, label, title, cls }) => (
        <button
          key={id}
          onClick={() => change(id)}
          aria-pressed={size === id}
          title={title}
          className={`w-7 h-7 flex items-center justify-center font-mono font-medium transition-colors ${cls} ${
            size === id
              ? "bg-viridian text-white"
              : "text-ink-3 hover:text-ink hover:bg-paper-3"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
