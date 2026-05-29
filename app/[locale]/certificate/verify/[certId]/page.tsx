import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, ShieldCheck, ExternalLink, Calendar, Clock, User } from "lucide-react";
import { verifyCertificate } from "@/actions/certificate";
import { Button } from "@/components/primitives/Button";

interface Props {
  params: Promise<{ certId: string; locale: string }>;
}

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { certId } = await params;
  const result = await verifyCertificate(certId);

  if (!result.valid) {
    return { title: "ใบประกาศไม่ถูกต้อง | VERDA" };
  }

  return {
    title: `ยืนยันใบประกาศ — ${result.courseTitle} | VERDA`,
    description: `ยืนยันว่า ${result.studentName} ได้รับใบประกาศสำหรับ "${result.courseTitle}" จาก VERDA อย่างถูกต้อง`,
  };
}

export default async function CertificateVerifyPage({ params }: Props) {
  const { certId, locale } = await params;
  const result = await verifyCertificate(certId);

  const issuedFormatted = result.issuedAt
    ? new Date(result.issuedAt).toLocaleDateString("th-TH", {
        year: "numeric", month: "long", day: "numeric",
      })
    : null;

  if (!result.valid) {
    return (
      <div className="min-h-screen bg-paper-2 flex flex-col items-center justify-center py-16 px-4">
        <div className="w-full max-w-[520px] bg-paper border border-line rounded-r4 shadow-lg overflow-hidden">
          <div className="h-1.5 bg-danger" />
          <div className="p-10 text-center">
            {/* Brand */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="font-display text-[22px] tracking-[-0.02em] text-ink">VERDA</span>
              <span className="w-[6px] h-[6px] rounded-full bg-viridian inline-block" />
            </div>

            <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-5">
              <XCircle size={32} className="text-danger" />
            </div>

            <h1 className="font-display text-[26px] text-ink tracking-[-0.015em] mb-2">
              ใบประกาศไม่ถูกต้อง
            </h1>
            <p className="text-[14px] text-ink-3 font-thai mb-2">
              ไม่พบใบประกาศ ID:{" "}
              <span className="font-mono text-ink-2">{certId}</span>
            </p>
            <p className="text-[13px] text-ink-4 font-thai mb-8">
              ใบประกาศนี้อาจถูกยกเลิก หรือ ID ไม่ถูกต้อง
            </p>

            <div className="flex items-center justify-center gap-2 p-3 bg-danger/5 rounded-r2 mb-6">
              <ShieldCheck size={15} className="text-danger" />
              <span className="text-[13px] text-danger font-medium">ไม่ผ่านการยืนยัน</span>
            </div>

            <Link href={`/${locale}`}>
              <Button variant="ghost" size="sm">กลับหน้าหลัก</Button>
            </Link>
          </div>
        </div>

        <p className="mt-6 text-[12px] text-ink-4 text-center">
          ระบบยืนยันใบประกาศ VERDA — ตรวจสอบความถูกต้องแบบ real-time
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper-2 flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-[560px] bg-paper border border-line rounded-r4 shadow-lg overflow-hidden">
        {/* Top accent */}
        <div className="h-1.5 bg-gradient-to-r from-viridian to-[#1A7A60]" />

        <div className="p-10">
          {/* Brand */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="font-display text-[22px] tracking-[-0.02em] text-ink">VERDA</span>
            <span className="w-[6px] h-[6px] rounded-full bg-viridian inline-block" />
          </div>

          {/* Verification badge */}
          <div className="flex items-center justify-center gap-2.5 py-2.5 px-5 bg-ok/10 border border-ok/30 rounded-pill w-fit mx-auto mb-8">
            <CheckCircle2 size={16} className="text-ok" />
            <span className="text-[13px] text-ok font-semibold">ใบประกาศถูกต้อง · Verified</span>
          </div>

          {/* Certificate details */}
          <div className="space-y-4 mb-8">
            {/* Student */}
            <div className="flex items-start gap-3 p-4 bg-paper-2 rounded-r3 border border-line">
              <div className="w-9 h-9 rounded-full bg-viridian/10 flex items-center justify-center shrink-0 mt-0.5">
                <User size={16} className="text-viridian" />
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-4 mb-0.5">
                  ผู้เรียน
                </p>
                <p className="font-semibold text-[17px] text-ink">{result.studentName}</p>
              </div>
            </div>

            {/* Course */}
            <div className="p-4 bg-paper-2 rounded-r3 border border-line">
              <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-4 mb-1">
                หลักสูตร
              </p>
              <p className="font-semibold text-[16px] text-ink leading-[1.3] mb-1">
                {result.courseTitle}
              </p>
              <p className="text-[13px] text-ink-3">โดย {result.instructorName}</p>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 p-3.5 bg-paper-2 rounded-r3 border border-line">
                <Calendar size={15} className="text-viridian shrink-0" />
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-ink-4">ออกเมื่อ</p>
                  <p className="text-[13px] text-ink font-medium">{issuedFormatted}</p>
                </div>
              </div>
              {(result.hours ?? 0) > 0 && (
                <div className="flex items-center gap-2.5 p-3.5 bg-paper-2 rounded-r3 border border-line">
                  <Clock size={15} className="text-viridian shrink-0" />
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-ink-4">ชั่วโมงเรียน</p>
                    <p className="text-[13px] text-ink font-medium">{result.hours} ชั่วโมง</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Certificate ID */}
          <div className="p-3 bg-paper-3 rounded-r2 border border-line mb-6">
            <p className="font-mono text-[10px] tracking-[0.08em] uppercase text-ink-4 mb-1">
              Certificate ID
            </p>
            <p className="font-mono text-[12px] text-ink break-all">{certId.toUpperCase()}</p>
          </div>

          {/* CTA */}
          <Link href={`/${locale}/certificate/${certId}`}>
            <Button variant="primary" size="default" className="w-full justify-center gap-2">
              <ExternalLink size={14} />
              ดูใบประกาศฉบับเต็ม
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-6 flex items-center gap-2 text-[12px] text-ink-4 text-center">
        <ShieldCheck size={13} className="text-ok" />
        ระบบยืนยันใบประกาศ VERDA · ตรวจสอบอัตโนมัติแบบ real-time
      </div>
    </div>
  );
}
