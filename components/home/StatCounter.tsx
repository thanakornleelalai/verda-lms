"use client";

import { useEffect, useRef, useState } from "react";

interface StatCounterProps {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
  formatFn?: (n: number) => string;
}

export function StatCounter({
  value,
  suffix = "",
  duration = 1600,
  className = "",
  formatFn,
}: StatCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTs = performance.now();

          const tick = (now: number) => {
            const p = Math.min((now - startTs) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setCount(Math.round(ease * value));
            if (p < 1) requestAnimationFrame(tick);
            else setCount(value);
          };

          requestAnimationFrame(tick);
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  const display = formatFn ? formatFn(count) : count.toLocaleString();

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}
