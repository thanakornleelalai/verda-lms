import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { Avatar } from "@/components/primitives/Avatar";
import { PrintButton } from "@/components/certificate/PrintButton";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    name?: string;
    course?: string;
    instructor?: string;
    date?: string;
  }>;
}

export default async function CertificatePreviewPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  const sp = await searchParams;

  const studentName = sp.name?.trim() || "ผู้เรียน";
  const courseTitle = sp.course?.trim() || "หลักสูตร";
  const instructorName = sp.instructor?.trim() || "ผู้สอน";

  const issuedFormatted = sp.date
    ? new Date(sp.date).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <div className="min-h-screen bg-paper-2 flex flex-col items-center py-12 px-4 print:bg-white print:py-0 print:block">

      {/* Action bar — hidden when printing */}
      <div className="w-full max-w-[800px] flex items-center justify-between mb-6 print:hidden">
        <Link
          href={`/${locale}/admin/certificates`}
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink transition-colors"
        >
          <ArrowLeft size={14} />
          กลับหน้าจัดการใบประกาศ
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-pill">
            ตัวอย่าง — Preview
          </span>
          <PrintButton />
        </div>
      </div>

      {/* Certificate card */}
      <div className="w-full max-w-[800px] bg-paper-3 border border-line rounded-r4 shadow-lg overflow-hidden print:shadow-none print:border-0 print:max-w-full">

        {/* Top accent bar */}
        <div className="h-2 bg-gradient-to-r from-viridian to-[#1A7A60]" />

        <div className="p-[60px] text-center">

          {/* Brand */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="font-display text-[28px] tracking-[-0.02em] text-ink">
              VERDA
            </span>
            <span className="w-[8px] h-[8px] rounded-full bg-viridian inline-block" />
          </div>

          <EyebrowLabel className="mb-4">
            ใบประกาศนียบัตร · Certificate of Completion
          </EyebrowLabel>

          <p className="text-[15px] text-ink-3 mb-3">ขอมอบให้แก่</p>

          <h1 className="font-display text-[48px] text-ink tracking-[-0.02em] leading-tight mb-4">
            {studentName}
          </h1>

          <p className="text-[15px] text-ink-2 mb-2">สำเร็จการเรียนหลักสูตร</p>

          <h2 className="font-display text-[28px] text-viridian mb-6 leading-tight">
            {courseTitle}
          </h2>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-[1px] w-16 bg-line" />
            <Trophy size={16} className="text-gold" />
            <div className="h-[1px] w-16 bg-line" />
          </div>

          <p className="text-[13px] text-ink-3 mb-2">{issuedFormatted}</p>

          {/* Instructor */}
          <div className="flex items-center justify-center gap-3 mt-8 pt-8 border-t border-line">
            <Avatar name={instructorName} size="md" />
            <div className="text-left">
              <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">
                ผู้สอน
              </p>
              <p className="font-semibold text-ink">{instructorName}</p>
            </div>
          </div>

          {/* Footer */}
          <p className="font-mono text-[10px] text-ink-4 tracking-[0.08em] uppercase mt-8">
            VERDA — School of Practice · {issuedFormatted}
          </p>
        </div>
      </div>

      {/* Bottom hint — hidden when printing */}
      <p className="mt-6 text-[12px] text-ink-4 print:hidden">
        กด <strong>พิมพ์ / บันทึก PDF</strong> แล้วเลือก &quot;Save as PDF&quot; ใน browser เพื่อบันทึกเป็นไฟล์
      </p>
    </div>
  );
}
