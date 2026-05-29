import Link from "next/link";
import { Award, Trophy, ExternalLink } from "lucide-react";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { IssueCertificateForm } from "@/components/admin/IssueCertificateForm";

export const dynamic = "force-dynamic";

type IssuedRow = {
  id: string;
  studentName: string;
  courseTitle: string;
  issuedAt: string;
};

const MOCK_ISSUED: IssuedRow[] = [
  {
    id: "cert_fp_001",
    studentName: "วีรวัฒน์ ใจดี",
    courseTitle: "Financial Planning for Freelancers",
    issuedAt: "2026-01-10",
  },
  {
    id: "cert_ux_001",
    studentName: "วีรวัฒน์ ใจดี",
    courseTitle: "UX Design & Figma Masterclass",
    issuedAt: "2026-03-20",
  },
];

export default async function AdminCertificatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  let issued: IssuedRow[] = MOCK_ISSUED;
  let total = issued.length;
  let thisMonth = 0;

  try {
    const { db } = await import("@/lib/db");
    const rows = await db.certificate.findMany({
      orderBy: { issuedAt: "desc" },
      take: 50,
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } },
      },
    });
    issued = rows.map((r) => ({
      id: r.id,
      studentName: r.user.name ?? "ผู้เรียน",
      courseTitle: r.course.title,
      issuedAt: r.issuedAt.toISOString().split("T")[0],
    }));
    total = await db.certificate.count();
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    thisMonth = await db.certificate.count({
      where: { issuedAt: { gte: monthStart } },
    });
  } catch {
    // DB unavailable — mock fallback
  }

  return (
    <div className="p-8 max-w-[1000px]">
      <EyebrowLabel className="mb-1">— CERTIFICATES</EyebrowLabel>
      <h1 className="font-display text-[32px] tracking-[-0.015em] text-ink mb-6">
        จัดการใบประกาศ
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-paper-3 border border-line rounded-r3 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
            <Trophy size={18} className="text-gold" />
          </div>
          <div>
            <p className="font-mono text-[11px] text-ink-3 uppercase tracking-wider">
              ออกแล้วทั้งหมด
            </p>
            <p className="text-[28px] font-semibold text-ink">{total}</p>
          </div>
        </div>
        <div className="bg-paper-3 border border-line rounded-r3 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-viridian/10 flex items-center justify-center">
            <Award size={18} className="text-viridian" />
          </div>
          <div>
            <p className="font-mono text-[11px] text-ink-3 uppercase tracking-wider">
              เดือนนี้
            </p>
            <p className="text-[28px] font-semibold text-ink">{thisMonth}</p>
          </div>
        </div>
      </div>

      {/* Issue Certificate Form */}
      <div className="bg-paper-3 border border-line rounded-r3 p-6 mb-8">
        <h2 className="text-[16px] font-semibold text-ink mb-1 flex items-center gap-2">
          <Award size={16} className="text-viridian" />
          ออกใบประกาศใหม่
        </h2>
        <p className="text-[13px] text-ink-3 mb-5">
          กรอกชื่อผู้เรียนและคอร์ส แล้วดูตัวอย่างใบประกาศพร้อมพิมพ์ได้ทันที
        </p>
        <IssueCertificateForm />
      </div>

      {/* Issued Certificates Table */}
      <div className="bg-paper-3 border border-line rounded-r3 overflow-hidden">
        <div className="px-6 py-4 border-b border-line">
          <h2 className="text-[15px] font-semibold text-ink">
            ใบประกาศที่ออกแล้ว
          </h2>
        </div>
        {issued.length === 0 ? (
          <div className="py-12 text-center text-ink-3 text-[14px]">
            ยังไม่มีใบประกาศ
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line bg-paper-2">
                <th className="px-6 py-3 text-left font-medium text-ink-3">
                  ผู้เรียน
                </th>
                <th className="px-6 py-3 text-left font-medium text-ink-3">
                  คอร์ส
                </th>
                <th className="px-6 py-3 text-left font-medium text-ink-3">
                  วันที่ออก
                </th>
                <th className="px-6 py-3 text-left font-medium text-ink-3" />
              </tr>
            </thead>
            <tbody>
              {issued.map((cert) => (
                <tr
                  key={cert.id}
                  className="border-b border-line last:border-0 hover:bg-paper-2 transition-colors"
                >
                  <td className="px-6 py-3 font-medium text-ink">
                    {cert.studentName}
                  </td>
                  <td className="px-6 py-3 text-ink-2">{cert.courseTitle}</td>
                  <td className="px-6 py-3 text-ink-3 font-mono">
                    {new Date(cert.issuedAt).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-3">
                    <Link
                      href={`/${locale}/certificate/${cert.id}`}
                      className="inline-flex items-center gap-1 text-viridian hover:text-viridian-2 transition-colors"
                    >
                      <ExternalLink size={12} />
                      ดู
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
