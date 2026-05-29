"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  text: string;
}

interface QuestionCardProps {
  index: number;
  total: number;
  text: string;
  options: Option[];
  selected: string[];
  onSelect: (optionId: string) => void;
  isMultiple?: boolean;
}

const KEYS = ["A", "B", "C", "D"] as const;

export function QuestionCard({
  index,
  total,
  text,
  options,
  selected,
  onSelect,
  isMultiple = false,
}: QuestionCardProps) {
  // A/B/C/D keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const idx = KEYS.indexOf(e.key.toUpperCase() as (typeof KEYS)[number]);
      if (idx >= 0 && idx < options.length) {
        onSelect(options[idx].id);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [options, onSelect]);

  return (
    <div className="bg-paper-3 border border-line rounded-r3 p-7 shadow-sm">
      {/* Progress */}
      <div className="flex items-center justify-between mb-5">
        <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-ink-3">
          ข้อ {index + 1} / {total}
        </p>
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full transition-all",
                i < index ? "bg-ok w-4" : i === index ? "bg-viridian w-6" : "bg-line w-4"
              )}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <p className="text-[17px] text-ink leading-[1.55] mb-6 font-thai">{text}</p>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {options.map((opt, i) => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-r2 border text-left transition-all w-full",
                isSelected
                  ? "border-viridian bg-viridian/5 text-ink"
                  : "border-line bg-paper-2 text-ink-2 hover:border-viridian-3 hover:text-ink"
              )}
            >
              <span
                className={cn(
                  "w-7 h-7 rounded-full border flex items-center justify-center font-mono text-[11px] shrink-0 transition-all",
                  isSelected
                    ? "bg-viridian border-viridian text-white"
                    : "border-line text-ink-3"
                )}
              >
                {KEYS[i]}
              </span>
              <span className="text-[14px] font-thai leading-snug">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {isMultiple && (
        <p className="mt-4 text-[12px] text-ink-4 font-mono">เลือกได้หลายตัวเลือก</p>
      )}
    </div>
  );
}
