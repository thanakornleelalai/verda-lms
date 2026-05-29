import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { Avatar } from "@/components/primitives/Avatar";
import { PrintButton } from "@/components/certificate/PrintButton";
import { auth } from "@/lib/auth";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    name?: string;
    course?: string;
    instructor?: string;
    date?: string;
    certId?: string;
  }>;
}

export default async function CertificatePreviewPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const session = await auth();

  // ชื่อผู้เรียน: ใช้จาก URL param → ถ้าไม่มีให้ใช้ชื่อจาก session → fallback
  const studentName =
    sp.name?.trim() ||
    (session?.user as { name?: string } | null)?.name ||
    "ผู้เรียน";

  const courseTitle = sp.course?.trim() || "หลักสูตร";
  const instructorName = sp.instructor?.trim() || "ผู้สอน";
  const certId = sp.certId?.trim() || "";

  const issuedFormatted = sp.date
    ? new Date(sp.date).toLocaleDateString("th-TH", {
        year: "numeric", month: "long", day: "numeric",
      })
    : new Date().toLocaleDateString("th-TH", {
        year: "numeric", month: "long", day: "numeric",
      });

  const isAdminPreview = !sp.certId; // จาก admin form = ยังไม่ save ลง DB

  return (
    <div className="min-h-screen bg-paper-2 flex flex-col items-center py-12 px-4 print:bg-white print:py-0 print:block">

      {/* Action bar */}
      <div className="w-full max-w-[800px] flex items-center justify-between mb-6 print:hidden">
        <Link
          href={`/${locale}/admin/certificates`}
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink transition-colors"
        >
          <ArrowLeft size={14} />
          กลับหน้าจัดการใบประกาศ
        </Link>
        <div className="flex items-center gap-3">
          {isAdminPreview && (
            <span className="text-[11px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-pill">
              PREVIEW — ยังไม่ได้บันทึก
            </span>
          )}
          <PrintButton />
        </div>
      </div>

      {/* Certificate card */}
      <div className="w-full max-w-[800px] bg-white border border-line rounded-r4 shadow-lg overflow-hidden print:shadow-none print:border-0 print:max-w-full">

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
            {studentName}
          </h1>

          <p className="text-[15px] text-ink-2 mb-2">สำเร็จการเรียนหลักสูตร</p>

          <h2 className="font-display text-[30px] text-viridian mb-8 leading-tight">
            {courseTitle}
          </h2>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-[1px] w-20 bg-line" />
            <Trophy size={18} className="text-gold" />
            <div className="h-[1px] w-20 bg-line" />
          </div>

          <p className="text-[13px] text-ink-3 mb-1">ออกให้ {issuedFormatted}</p>

          {/* Instructor */}
          <div className="flex items-center justify-center gap-3 mt-10 pt-8 border-t border-line">
            <Avatar name={instructorName} size="md" />
            <div className="text-left">
              <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">
                ผู้สอน / Instructor
              </p>
              <p className="font-semibold text-[15px] text-ink">{instructorName}</p>
            </div>
          </div>

          {/* Footer */}
          {certId && (
            <div className="mt-10 pt-6 border-t border-line">
              <p className="font-mono text-[10px] text-ink-4 tracking-[0.06em] uppercase">
                CERTIFICATE ID: {certId.toUpperCase()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom hint */}
      <p className="mt-6 text-[12px] text-ink-4 print:hidden">
        กด <strong>พิมพ์ / บันทึก PDF</strong> แล้วเลือก &quot;Save as PDF&quot; ใน browser
      </p>
    </div>
  );
}
