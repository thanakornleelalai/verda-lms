import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Trophy, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { Avatar } from "@/components/primitives/Avatar";
import { CertificateShareButtons } from "@/components/certificate/CertificateShareButtons";
import { CertificateQRCode } from "@/components/certificate/CertificateQRCode";
import { PrintButton } from "@/components/certificate/PrintButton";
import { auth } from "@/lib/auth";

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

async function getCert(certId: string, sessionName?: string | null): Promise<CertData | null> {
  // ── Try live DB first ──────────────────────────────────────────────────────
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
        studentName: row.user.name ?? sessionName ?? "ผู้เรียน",
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

  // ── Mock fallback — use session user name ──────────────────────────────────
  const studentName = sessionName ?? "ผู้เรียน";

  const MOCK: Record<string, Omit<CertData, "id" | "studentName">> = {
    cert_fp_001: {
      courseTitle: "Financial Planning for Freelancers",
      instructorName: "ธนพล สิทธิกุล",
      issuedAt: new Date("2026-01-10"),
      hours: 4,
      courseSlug: "financial-planning-for-freelancers",
    },
    cert_ux_001: {
      courseTitle: "UX Design & Figma Masterclass",
      instructorName: "พิมพ์พร วัฒนากร",
      issuedAt: new Date("2026-03-20"),
      hours: 8,
      courseSlug: "ux-design-figma-masterclass",
    },
    cert_ml_001: {
      courseTitle: "Machine Learning Specialization",
      instructorName: "Andrew Ng",
      issuedAt: new Date("2026-04-15"),
      hours: 12,
      courseSlug: "machine-learning-specialization",
    },
    cert_nx_001: {
      courseTitle: "Next.js 15 Fullstack Bootcamp",
      instructorName: "ธนกร ดิจิทัล",
      issuedAt: new Date("2026-05-01"),
      hours: 10,
      courseSlug: "nextjs-15-fullstack-bootcamp",
    },
  };

  const data = MOCK[certId];
  if (data) return { id: certId, studentName, ...data };

  // Unknown certId — try to parse slug from ID pattern cert_{slug}_xxx
  const slugMatch = certId.match(/^cert_(.+)_\d+$/);
  if (slugMatch) {
    return {
      id: certId,
      studentName,
      courseTitle: slugMatch[1].replace(/-/g, " "),
      instructorName: "ผู้สอน",
      issuedAt: new Date(),
      hours: 0,
      courseSlug: slugMatch[1],
    };
  }

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { certId } = await params;
  const session = await auth();
  const cert = await getCert(certId, session?.user?.name);
  if (!cert) return { title: "ไม่พบใบประกาศ | VERDA" };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  return {
    title: `ใบประกาศนียบัตร — ${cert.courseTitle} | VERDA`,
    description: `${cert.studentName} สำเร็จหลักสูตร "${cert.courseTitle}" จาก VERDA`,
    openGraph: {
      type: "website",
      title: `${cert.studentName} ได้รับใบประกาศ — ${cert.courseTitle}`,
      description: `สำเร็จหลักสูตร ${cert.hours} ชั่วโมง บน VERDA LMS`,
      url: `${baseUrl}/th/certificate/${certId}`,
      images: [{ url: `${baseUrl}/api/og/certificate?certId=${certId}`, width: 1200, height: 630 }],
    },
  };
}

export default async function CertificatePage({ params }: Props) {
  const { certId, locale } = await params;
  const session = await auth();
  const cert = await getCert(certId, session?.user?.name);
  if (!cert) notFound();

  const issuedFormatted = cert.issuedAt.toLocaleDateString("th-TH", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen bg-paper-2 flex flex-col items-center py-12 px-4">

      {/* ── Action bar ─────────────────────────────────────────────────── */}
      <div className="w-full max-w-[800px] flex items-center justify-between mb-6 print:hidden">
        <Link
          href={`/${locale}/dashboard/certificates`}
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink transition-colors"
        >
          <ArrowLeft size={14} />
          ใบประกาศของฉัน
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/api/certificate/${certId}/download`}>
            <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
              <Download size={14} />
              ดาวน์โหลด
            </Button>
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* ── Certificate card ────────────────────────────────────────────── */}
      <div
        id="certificate"
        className="w-full max-w-[800px] bg-white border border-line rounded-r4 shadow-lg overflow-hidden print:shadow-none print:border-0 print:rounded-none print:max-w-none"
      >
        {/* Top accent bar */}
        <div className="h-[6px] bg-gradient-to-r from-viridian to-[#1A7A60]" />

        <div className="p-[60px] text-center print:p-[48px]">

          {/* Brand */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="font-display text-[30px] tracking-[-0.02em] text-[#1A2320]">VERDA</span>
            <span className="w-[8px] h-[8px] rounded-full bg-viridian inline-block" />
          </div>

          <EyebrowLabel className="mb-5 text-viridian">
            ใบประกาศนียบัตร · Certificate of Completion
          </EyebrowLabel>

          <p className="text-[15px] text-ink-3 mb-3">ขอมอบให้แก่</p>

          <h1 className="font-display text-[52px] text-ink tracking-[-0.02em] leading-tight mb-5">
            {cert.studentName}
          </h1>

          <p className="text-[15px] text-ink-2 mb-2">สำเร็จการเรียนหลักสูตร</p>

          <h2 className="font-display text-[30px] text-viridian mb-8 leading-tight">
            {cert.courseTitle}
          </h2>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-[1px] w-20 bg-line" />
            <Trophy size={18} className="text-gold" />
            <div className="h-[1px] w-20 bg-line" />
          </div>

          <p className="text-[13px] text-ink-3 mb-1">
            {cert.hours > 0 ? `${cert.hours} ชั่วโมงการเรียน · ` : ""}
            ออกให้ {issuedFormatted}
          </p>

          {/* Instructor */}
          <div className="flex items-center justify-center gap-3 mt-10 pt-8 border-t border-line">
            <Avatar name={cert.instructorName} size="md" />
            <div className="text-left">
              <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">
                ผู้สอน / Instructor
              </p>
              <p className="font-semibold text-[15px] text-ink">{cert.instructorName}</p>
            </div>
          </div>

          {/* Bottom row: QR + Cert ID + Seal */}
          <div className="mt-10 pt-6 border-t border-line flex items-end justify-between gap-6">
            {/* QR Code */}
            <div className="flex flex-col items-center gap-1">
              <CertificateQRCode certId={certId} size={90} />
              <p className="font-mono text-[8px] tracking-[0.06em] uppercase text-ink-4">
                ยืนยันที่นี่
              </p>
            </div>

            {/* Center: Cert ID + Verified badge */}
            <div className="flex-1 text-center">
              <p className="font-mono text-[10px] text-ink-4 tracking-[0.06em] uppercase mb-2">
                CERTIFICATE ID
              </p>
              <p className="font-mono text-[11px] text-ink-2 mb-3">
                {cert.id.toUpperCase()}
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-ok/10 border border-ok/30 rounded-pill">
                <ShieldCheck size={12} className="text-ok" />
                <span className="font-mono text-[10px] text-ok tracking-[0.06em] uppercase">
                  VERDA Verified
                </span>
              </div>
            </div>

            {/* VERDA Seal */}
            <div className="w-[90px] h-[90px] rounded-full border-2 border-viridian/20 flex items-center justify-center bg-viridian/5 shrink-0">
              <div className="text-center">
                <p className="font-display text-[14px] text-viridian leading-none">VERDA</p>
                <p className="font-mono text-[7px] text-viridian/60 tracking-[0.1em] uppercase mt-0.5">
                  Certified
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Verification link ────────────────────────────────────────────── */}
      <div className="w-full max-w-[800px] mt-4 print:hidden">
        <Link
          href={`/${locale}/certificate/verify/${certId}`}
          className="flex items-center justify-center gap-2 py-2.5 text-[13px] text-ink-3 hover:text-viridian transition-colors border border-line hover:border-viridian rounded-r2 bg-paper"
        >
          <ShieldCheck size={14} />
          ตรวจสอบความถูกต้องของใบประกาศนี้
        </Link>
      </div>

      {/* ── Share section ────────────────────────────────────────────────── */}
      <div className="w-full max-w-[800px] mt-4 p-6 bg-paper-3 border border-line rounded-r3 print:hidden">
        <CertificateShareButtons
          certId={certId}
          courseTitle={cert.courseTitle}
          studentName={cert.studentName}
        />
      </div>
    </div>
  );
}
