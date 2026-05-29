"use client";

import { useState } from "react";
import { Link2, Linkedin, Twitter, Facebook, CheckCircle2 } from "lucide-react";

interface Props {
  certId: string;
  courseTitle: string;
  studentName: string;
}

interface ShareConfig {
  label: string;
  icon: React.ReactNode;
  color: string; // Tailwind bg class for the button
  href: (url: string, text: string) => string;
}

const SHARE_CONFIGS: ShareConfig[] = [
  {
    label: "LinkedIn",
    icon: <Linkedin size={16} />,
    color: "bg-[#0A66C2] hover:bg-[#004182] text-white",
    href: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    label: "Facebook",
    icon: <Facebook size={16} />,
    color: "bg-[#1877F2] hover:bg-[#0C5CB6] text-white",
    href: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    label: "X / Twitter",
    icon: <Twitter size={16} />,
    color: "bg-[#000000] hover:bg-[#333] text-white",
    href: (url, text) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
];

export function CertificateShareButtons({ certId, courseTitle }: Omit<Props, "studentName"> & { studentName?: string }) {
  const [copied, setCopied] = useState(false);

  // Build the canonical public URL for this certificate.
  // In production this should use NEXT_PUBLIC_BASE_URL from env.
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL ?? "https://verda.app";

  const certUrl = `${baseUrl}/th/certificate/${certId}`;

  const shareText = `ฉันเพิ่งสำเร็จหลักสูตร "${courseTitle}" บน VERDA LMS 🎓 #VERDA #เรียนออนไลน์`;

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(certUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for browsers that block clipboard API without user gesture
      const textarea = document.createElement("textarea");
      textarea.value = certUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function openShareWindow(url: string) {
    window.open(url, "_blank", "width=600,height=500,noopener,noreferrer");
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-3">
        แชร์ใบประกาศ
      </p>

      <div className="flex flex-wrap gap-2">
        {SHARE_CONFIGS.map(({ label, icon, color, href }) => (
          <button
            key={label}
            onClick={() =>
              openShareWindow(href(certUrl, shareText))
            }
            aria-label={`แชร์ไปยัง ${label}`}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-pill text-[13px] font-medium transition-colors ${color}`}
          >
            {icon}
            {label}
          </button>
        ))}

        {/* Copy link */}
        <button
          onClick={handleCopyLink}
          aria-label="คัดลอกลิงก์"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-pill text-[13px] font-medium transition-colors border ${
            copied
              ? "bg-ok/10 border-ok text-ok"
              : "bg-paper-2 border-line text-ink-2 hover:border-viridian-3"
          }`}
        >
          {copied ? (
            <CheckCircle2 size={16} className="text-ok" />
          ) : (
            <Link2 size={16} />
          )}
          {copied ? "คัดลอกแล้ว!" : "คัดลอกลิงก์"}
        </button>
      </div>

      {/* Hint for LinkedIn credential */}
      <p className="text-[11px] text-ink-4 leading-relaxed">
        เพิ่มใบประกาศนี้ใน{" "}
        <strong className="text-ink-3">LinkedIn Licenses &amp; Certifications</strong>
        {" "}โดยใช้ Certification URL ด้านบน
      </p>
    </div>
  );
}
