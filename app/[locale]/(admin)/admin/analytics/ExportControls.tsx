"use client";

import { useState } from "react";
import { Download, Calendar } from "lucide-react";

const TYPES = [
  { id: "enrollments", label: "Enrollments" },
  { id: "orders", label: "Orders" },
  { id: "progress", label: "Progress" },
] as const;

export function ExportControls() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function buildUrl(type: string) {
    const params = new URLSearchParams({ type });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return `/api/analytics/export?${params.toString()}`;
  }

  return (
    <div className="flex items-center gap-3 flex-wrap justify-end">
      {/* Date range */}
      <div className="flex items-center gap-1.5 bg-paper border border-line rounded-r2 px-2.5 h-[34px]">
        <Calendar size={13} className="text-ink-3 shrink-0" />
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="bg-transparent text-[12px] text-ink outline-none w-[120px]"
          title="จากวันที่"
        />
        <span className="text-ink-4 text-[12px]">–</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="bg-transparent text-[12px] text-ink outline-none w-[120px]"
          title="ถึงวันที่"
        />
      </div>

      {/* Export buttons */}
      <div className="flex items-center gap-2">
        {TYPES.map(({ id, label }) => (
          <a
            key={id}
            href={buildUrl(id)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-line rounded-r2 text-[12px] text-ink-2 hover:border-viridian hover:text-viridian transition-colors bg-paper"
          >
            <Download size={12} />
            {label} CSV
          </a>
        ))}
      </div>
    </div>
  );
}
