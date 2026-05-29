"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizTimerProps {
  totalSeconds: number;
  onExpire?: () => void;
  className?: string;
}

export function QuizTimer({ totalSeconds, onExpire, className }: QuizTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire?.();
      return;
    }
    const id = setInterval(() => setRemaining((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [remaining, onExpire]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isWarning = remaining <= 60;
  const isDanger = remaining <= 30;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-pill border font-mono text-[14px]",
        isDanger
          ? "bg-danger/10 border-danger/30 text-danger"
          : isWarning
          ? "bg-warn/10 border-warn/30 text-warn"
          : "bg-paper-2 border-line text-ink-2",
        className
      )}
    >
      <Timer size={14} />
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  );
}
