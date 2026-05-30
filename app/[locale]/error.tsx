"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[VERDA] route error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="text-center max-w-[440px]">
        <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-viridian mb-3">— VERDA</p>
        <h1 className="font-display text-[34px] text-ink tracking-[-0.015em] mb-3">
          เกิดข้อผิดพลาด
        </h1>
        <p className="text-[15px] text-ink-3 font-thai leading-[1.7] mb-7">
          ระบบพบปัญหาที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง หากยังพบปัญหา
          ติดต่อทีมงานที่ hello@verda.co.th
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-pill bg-viridian text-[#F5F0E1] font-medium text-[14px] btn-depth hover:bg-viridian-2 transition-colors"
          >
            ลองใหม่อีกครั้ง
          </button>
          <Link
            href="/th"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-pill border border-line text-ink font-medium text-[14px] hover:bg-paper-2 transition-colors"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
}
