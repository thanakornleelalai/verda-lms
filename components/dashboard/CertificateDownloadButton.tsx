"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface Props {
  certId: string;
  courseTitle: string;
}

export function CertificateDownloadButton({ certId, courseTitle }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/certificate/${certId}/download`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `VERDA-Certificate-${certId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("ดาวน์โหลดไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1 mt-auto">
      <button
        onClick={handleDownload}
        disabled={loading}
        title={`ดาวน์โหลดใบประกาศ: ${courseTitle}`}
        className="flex items-center gap-1.5 text-[12px] text-viridian font-medium hover:text-viridian-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Download size={12} />
        )}
        {loading ? "กำลังสร้าง..." : "ดาวน์โหลด PDF"}
      </button>
      {error && (
        <span className="font-mono text-[9px] text-danger leading-tight text-right max-w-[110px]">
          {error}
        </span>
      )}
    </div>
  );
}
