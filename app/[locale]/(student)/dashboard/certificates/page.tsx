import Link from "next/link";
import { redirect } from "next/navigation";
import { Trophy, Download, ExternalLink, ArrowLeft } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Container } from "@/components/layout/Container";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { CourseThumbnail } from "@/components/course/CourseThumbnail";

export const dynamic = "force-dynamic";

export default async function CertificatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const userId = session.user.id;

  type CertRow = {
    id: string;
    courseId: string;
    courseTitle: string;
    courseSlug: string;
    courseMonogram: string | undefined;
    courseArt: string | undefined;
    issuedAt: string;
    pdfUrl: string | null;
  };

  let certs: CertRow[] = [];

  try {
    const rows = await db.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            monogram: true,
            art: true,
          },
        },
      },
    });
    certs = rows.map((r) => ({
      id: r.id,
      courseId: r.courseId,
      courseTitle: r.course.title,
      courseSlug: r.course.slug,
      courseMonogram: r.course.monogram ?? undefined,
      courseArt: r.course.art ?? undefined,
      issuedAt: r.issuedAt.toISOString(),
      pdfUrl: r.pdfUrl ?? null,
    }));
  } catch {
    // DB unavailable — demo fallback
    certs = [
      {
        id: "cert_fp_001",
        courseId: "crs_006",
        courseTitle: "Financial Planning for Freelancers",
        courseSlug: "financial-planning-for-freelancers",
        courseMonogram: "FP",
        courseArt: "linear-gradient(135deg, #713f12 0%, #a16207 100%)",
        issuedAt: "2026-01-10T00:00:00Z",
        pdfUrl: null,
      },
      {
        id: "cert_ux_001",
        courseId: "crs_001",
        courseTitle: "UX Design & Figma Masterclass",
        courseSlug: "ux-design-figma-masterclass",
        courseMonogram: "UX",
        courseArt: "linear-gradient(135deg, #0F5D4A 0%, #1A7A60 100%)",
        issuedAt: "2026-03-20T00:00:00Z",
        pdfUrl: null,
      },
    ];
  }

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main>
        <Container className="py-10">
          <div className="mb-8">
            <Link
              href={`/${locale}/dashboard`}
              className="inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink mb-4"
            >
              <ArrowLeft size={14} /> กลับหน้าแดชบอร์ด
            </Link>
            <EyebrowLabel className="mb-1">— CERTIFICATES</EyebrowLabel>
            <h1 className="font-display text-[38px] tracking-[-0.015em] text-ink">
              ใบประกาศของฉัน
            </h1>
          </div>

          {certs.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-5">
                <Trophy size={28} className="text-gold opacity-50" />
              </div>
              <p className="text-[18px] text-ink-3 mb-2">ยังไม่มีใบประกาศ</p>
              <p className="text-[14px] text-ink-4 mb-6">
                เรียนจบคอร์สเพื่อรับใบประกาศนียบัตร
              </p>
              <Link
                href={`/${locale}/courses`}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-viridian text-white text-[14px] rounded-pill hover:bg-viridian-2 transition-colors"
              >
                ดูคอร์สทั้งหมด →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certs.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-paper-3 border border-[#FDE68A] rounded-r3 overflow-hidden hover:border-gold transition-colors group"
                >
                  <div className="h-[140px] relative overflow-hidden">
                    <CourseThumbnail
                      title={cert.courseTitle}
                      monogram={cert.courseMonogram}
                      art={cert.courseArt}
                      aspectRatio="16/9"
                      className="h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gold/30 border border-gold/50 flex items-center justify-center">
                        <Trophy size={13} className="text-gold" />
                      </div>
                      <span className="text-white text-[11px] font-mono uppercase tracking-wider">
                        Certificate
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-semibold text-[15px] text-ink leading-[1.3] mb-1">
                      {cert.courseTitle}
                    </h3>
                    <p className="text-[12px] text-ink-4 font-mono mb-4">
                      ออกเมื่อ{" "}
                      {new Date(cert.issuedAt).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/${locale}/certificate/${cert.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-line rounded-r2 text-[13px] text-ink hover:border-viridian hover:text-viridian transition-colors"
                      >
                        <ExternalLink size={13} />
                        ดูใบประกาศ
                      </Link>
                      {cert.pdfUrl ? (
                        <a
                          href={cert.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-gold/20 border border-gold/40 rounded-r2 text-[13px] text-yellow-700 hover:bg-gold/30 transition-colors"
                        >
                          <Download size={13} />
                          PDF
                        </a>
                      ) : (
                        <span className="flex items-center gap-1 py-2 px-3 text-[12px] text-ink-4 font-mono">
                          <Download size={12} className="opacity-40" />
                          กำลังสร้าง...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
