"use client";

import { useState } from "react";
import { Check, ImagePlus, Loader2 } from "lucide-react";

// ── Gradient presets ───────────────────────────────────────────────────────

interface GradientPreset {
  id: string;
  label: string;
  css: string;
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  { id: "viridian", label: "Viridian", css: "linear-gradient(135deg,#0F5D4A 0%,#1A7A60 100%)" },
  { id: "ocean",    label: "Ocean",    css: "linear-gradient(135deg,#1e3a5f 0%,#2563EB 100%)" },
  { id: "sunset",   label: "Sunset",   css: "linear-gradient(135deg,#C2570A 0%,#F59E0B 100%)" },
  { id: "rose",     label: "Rose",     css: "linear-gradient(135deg,#9D174D 0%,#F472B6 100%)" },
  { id: "violet",   label: "Violet",   css: "linear-gradient(135deg,#4C1D95 0%,#7C3AED 100%)" },
  { id: "slate",    label: "Slate",    css: "linear-gradient(135deg,#1e293b 0%,#475569 100%)" },
  { id: "forest",   label: "Forest",   css: "linear-gradient(135deg,#14532d 0%,#22C55E 100%)" },
  { id: "crimson",  label: "Crimson",  css: "linear-gradient(135deg,#7f1d1d 0%,#EF4444 100%)" },
];

// ── Props ─────────────────────────────────────────────────────────────────

interface Props {
  /** Current CSS background string (e.g. "linear-gradient(...)") */
  currentGradient?: string;
  /** Called with the CSS background string when user picks a gradient */
  onGradientChange: (css: string) => void;
  /** Called when user uploads an image — receives the data URL (demo) or upload URL */
  onImageChange?: (dataUrl: string) => void;
  /** True while save is pending */
  saving?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────

export function CourseThumbnailPicker({ currentGradient = "linear-gradient(135deg,#0F5D4A 0%,#1A7A60 100%)", onGradientChange, onImageChange, saving }: Props) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const activePreset = GRADIENT_PRESETS.find((p) => p.css === currentGradient) ?? GRADIENT_PRESETS[0];
  const displayCss = previewUrl ? `url(${previewUrl}) center/cover` : (currentGradient ?? activePreset.css);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read as data URL for preview; in prod, POST to /api/upload → Vercel Blob
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        onImageChange?.(result);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Preview card */}
      <div
        className="w-full aspect-video rounded-r2 overflow-hidden flex items-end relative"
        style={{ background: displayCss }}
      >
        {!previewUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none">
            <span className="font-display text-[28px] text-white/80 italic leading-none">VERDA</span>
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/50">LMS</span>
          </div>
        )}

        {/* Upload overlay button */}
        <label
          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity cursor-pointer rounded-r2"
          aria-label="อัปโหลดภาพปก"
        >
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
            disabled={uploading || saving}
          />
          {uploading ? (
            <Loader2 size={24} className="text-white animate-spin" />
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <ImagePlus size={22} className="text-white" />
              <span className="font-mono text-[10px] tracking-wider uppercase text-white">อัปโหลดภาพ</span>
            </div>
          )}
        </label>
      </div>

      {/* Gradient swatches */}
      <div>
        <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-ink-4 mb-2 select-none">
          สี Gradient
        </p>
        <div className="flex flex-wrap gap-2">
          {GRADIENT_PRESETS.map((preset) => {
            const isActive = !previewUrl && preset.css === currentGradient;
            return (
              <button
                key={preset.id}
                onClick={() => { setPreviewUrl(null); onGradientChange(preset.css); }}
                aria-label={`เลือก gradient ${preset.label}`}
                aria-pressed={isActive}
                title={preset.label}
                className="relative w-8 h-8 rounded-r2 focus:outline-none focus-visible:ring-2 focus-visible:ring-viridian focus-visible:ring-offset-2 transition-transform hover:scale-110 active:scale-95"
                style={{
                  background: preset.css,
                  boxShadow: isActive ? `0 0 0 2px var(--paper-3), 0 0 0 4px rgba(0,0,0,0.4)` : undefined,
                }}
              >
                {isActive && (
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Check size={12} strokeWidth={3} className="text-white drop-shadow-sm" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="font-mono text-[10px] text-ink-4 mt-2 select-none">
          {previewUrl ? "ภาพที่อัปโหลด" : activePreset.label}
          {" · "}
          {previewUrl ? "Custom" : "Gradient"}
        </p>
      </div>
    </div>
  );
}
