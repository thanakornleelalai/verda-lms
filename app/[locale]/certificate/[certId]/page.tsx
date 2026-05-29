import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Trophy, ArrowLeft } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { Avatar } from "@/components/primitives/Avatar";
import { CertificateShareButtons } from "@/components/certificate/CertificateShareButtons";

export const revalidate = 86400;

interface Props {
  params: Promise<{ certId: string; locale: string }>;
}

interface CertData {
  id: string;
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: Date;
  hours: number;
  courseSlug: string;
}

// Resolve certificate — tries DB, falls back to mock if unavailable or not found
async function getCert(certId: string): Promise<CertData | null> {
  // ── Try live DB first ────────────────────────────────────────────────────
  try {
    const { db } = await import("@/lib/db");
    const row = await db.certificate.findUnique({
      where: { id: certId },
      include: {
        user: { select: { name: true } },
        course: {
          select: {
            slug: true,
            title: true,
            totalDuration: true,
            instructor: { select: { name: true } },
          },
        },
      },
    });
    if (row) {
      return {
        id: row.id,
        studentName: row.user.name ?? "ผู้เรียน",
        courseTitle: row.course.title,
        instructorName: row.course.instructor?.name ?? "ผู้สอน",
        issuedAt: row.issuedAt,
        hours: Math.round((row.course.totalDuration ?? 0) / 3600),
        courseSlug: row.course.slug,
      };
    }
  } catch {
    // DB unavailable — fall through to mock
  }

  // ── Mock fallback ────────────────────────────────────────────────────────
  const MOCK: Record<string, CertData> = {
    cert_fp_001: {
      id: "cert_fp_001",
      studentName: "วีรวัฒน์ ใจดี",
      courseTitle: "Financial Planning for Freelancers",
      instructorName: "ธนพล สิทธิกุล",
      issuedAt: new Date("2026-01-10"),
      hours: 4,
      courseSlug: "financial-planning-for-freelancers",
    },
    cert_ux_001: {
      id: "cert_ux_001",
      studentName: "วีรวัฒน์ ใจดี",
      courseTitle: "UX Design & Figma Masterclass",
      instructorName: "พิมพ์ชนก วัฒนากร",
      issuedAt: new Date("2026-03-20"),
      hours: 8,
      courseSlug: "ux-design-figma-masterclass",
    },
  };

  return MOCK[certId] ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { certId } = await params;
  const cert = await getCert(certId);
  if (!cert) return { title: "ไม่พบใบประกาศ | VERDA" };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  return {
    title: `ใบประกาศนียบัตร — ${cert.courseTitle} | VERDA`,
    description: `${cert.studentName} สำเร็จหลักสูตร "${cert.courseTitle}" จาก VERDA — School of Practice`,
    openGraph: {
      type: "website",
      title: `${cert.studentName} ได้รับใบประกาศ — ${cert.courseTitle}`,
      description: `สำเร็จหลักสูตร ${cert.hours} ชั่วโมง บน VERDA LMS`,
      url: `${baseUrl}/th/certificate/${certId}`,
      siteName: "VERDA — School of Practice",
      images: [
        {
          url: `${baseUrl}/api/og/certificate?certId=${certId}`,
          width: 1200,
          height: 630,
          alt: `ใบประกาศนียบัตร ${cert.courseTitle}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${cert.studentName} ได้รับใบประกาศ — ${cert.courseTitle}`,
      description: `สำเร็จหลักสูตร ${cert.hours} ชั่วโมง บน VERDA LMS`,
      images: [`${baseUrl}/api/og/certificate?certId=${certId}`],
    },
  };
}

export default async function CertificatePage({ params }: Props) {
  const { certId, locale } = await params;
  const cert = await getCert(certId);

  if (!cert) notFound();

  const issuedFormatted = cert.issuedAt.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-paper-2 flex flex-col items-center py-12 px-4">

      {/* ── Action bar ─────────────────────────────────────────────────── */}
      <div className="w-full max-w-[800px] flex items-center justify-between mb-6">
        <Link
          href={`/${locale}/dashboard/certificates`}
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink transition-colors"
        >
          <ArrowLeft size={14} />
          ใบประกาศของฉัน
        </Link>
        <form action={`/api/certificate/${certId}/download`} method="GET">
          <Button variant="primary" size="sm" className="flex items-center gap-2" type="submit">
            <Download size={14} />
            ดาวน์โหลด PDF
          </Button>
        </form>
      </div>

      {/* ── Certificate card ────────────────────────────────────────────── */}
      <div className="w-full max-w-[800px] bg-paper-3 border border-line rounded-r4 shadow-lg overflow-hidden">
        {/* Top accent bar */}
        <div className="h-2 bg-gradient-to-r from-viridian to-[#1A7A60]" />

        <div className="p-[60px] text-center">

          {/* Brand */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="font-display text-[28px] tracking-[-0.02em] text-ink">VERDA</span>
            <span className="w-[8px] h-[8px] rounded-full bg-viridian inline-block" />
          </div>

          <EyebrowLabel className="mb-4">ใบประกาศนียบัตร · Certificate of Completion</EyebrowLabel>

          <p className="text-[15px] text-ink-3 mb-3">ขอมอบให้แก่</p>

          <h1 className="font-display text-[48px] text-ink tracking-[-0.02em] leading-tight mb-4">
            {cert.studentName}
          </h1>

          <p className="text-[15px] text-ink-2 mb-2">สำเร็จการเรียนหลักสูตร</p>

          <h2 className="font-display text-[28px] text-viridian mb-6 leading-tight">
            {cert.courseTitle}
          </h2>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-[1px] w-16 bg-line" />
            <Trophy size={16} className="text-gold" />
            <div className="h-[1px] w-16 bg-line" />
          </div>

          <p className="text-[13px] text-ink-3 mb-2">
            {cert.hours > 0 ? `${cert.hours} ชั่วโมงการเรียน · ` : ""}
            {issuedFormatted}
          </p>

          {/* Instructor */}
          <div className="flex items-center justify-center gap-3 mt-8 pt-8 border-t border-line">
            <Avatar name={cert.instructorName} size="md" />
            <div className="text-left">
              <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">ผู้สอน</p>
              <p className="font-semibold text-ink">{cert.instructorName}</p>
            </div>
          </div>

          {/* Certificate ID */}
          <p className="font-mono text-[10px] text-ink-4 tracking-[0.08em] uppercase mt-8">
            CERTIFICATE ID: {cert.id.toUpperCase()}
          </p>
        </div>
      </div>

      {/* ── Share section ───────────────────────────────────────────────── */}
      <div className="w-full max-w-[800px] mt-6 p-6 bg-paper-3 border border-line rounded-r3">
        <CertificateShareButtons
          certId={certId}
          courseTitle={cert.courseTitle}
          studentName={cert.studentName}
        />
      </div>

    </div>
  );
}
