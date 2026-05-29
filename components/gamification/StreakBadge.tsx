interface Props {
  streak: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const STREAK_TIERS = [
  { min: 30, emoji: "🔥", label: "Master", color: "bg-orange-500 text-white" },
  { min: 14, emoji: "⚡", label: "Hot", color: "bg-amber-500 text-white" },
  { min: 7,  emoji: "✨", label: "Going", color: "bg-viridian text-white" },
  { min: 3,  emoji: "🌱", label: "Start", color: "bg-ok/80 text-white" },
  { min: 0,  emoji: "💤", label: "Begin", color: "bg-paper-3 text-ink-3 border border-line" },
] as const;

function getTier(streak: number) {
  return STREAK_TIERS.find((t) => streak >= t.min) ?? STREAK_TIERS[STREAK_TIERS.length - 1];
}

const SIZE = {
  sm: { badge: "w-7 h-7 text-[13px]", text: "text-[11px]", label: "text-[10px]" },
  md: { badge: "w-10 h-10 text-[18px]", text: "text-[13px]", label: "text-[11px]" },
  lg: { badge: "w-14 h-14 text-[26px]", text: "text-[16px]", label: "text-[12px]" },
};

export function StreakBadge({ streak, size = "md", showLabel = true }: Props) {
  const tier = getTier(streak);
  const s = SIZE[size];

  return (
    <div className="flex items-center gap-2">
      {/* Fire badge */}
      <div
        className={`${s.badge} ${tier.color} rounded-full flex items-center justify-center shrink-0 shadow-sm`}
        title={`${streak} วันเรียนต่อเนื่อง`}
      >
        {tier.emoji}
      </div>

      {showLabel && (
        <div>
          <p className={`font-semibold text-ink leading-none ${s.text}`}>
            {streak} วัน
          </p>
          <p className={`text-ink-3 mt-0.5 ${s.label}`}>
            Streak {streak >= 7 ? `· ${tier.label}` : ""}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Compact inline version ─────────────────────────────────────────────────────

export function StreakPill({ streak }: { streak: number }) {
  const tier = getTier(streak);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-[12px] font-medium ${tier.color}`}
      title={`${streak} วันเรียนต่อเนื่อง`}
    >
      {tier.emoji} {streak} วัน
    </span>
  );
}
