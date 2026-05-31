import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Star, Users, ArrowRight, ChevronRight } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { Avatar } from "@/components/primitives/Avatar";
import { MOCK_INSTRUCTORS, PLATFORM_STATS } from "@/mock";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "ผู้สอนทั้งหมด | VERDA",
  description:
    "พบกับผู้สอนมืออาชีพบน VERDA — เรียนกับคนที่ทำงานจริงในอุตสาหกรรม",
};

export const revalidate = 3600;

export default async function InstructorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Try DB, fallback to mock
  let instructors = MOCK_INSTRUCTORS;
  try {
    const { db } = await import("@/lib/db");
    const dbInstructors = await db.user.findMany({
      where: { role: "INSTRUCTOR", suspended: false },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        headline: true,
        _count: { select: { courses: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    if (dbInstructors.length > 0) {
      instructors = dbInstructors.map((u) => ({
        id: u.id,
        name: u.name ?? "Instructor",
        avatarUrl: u.image ?? undefined,
        bio: u.bio ?? u.headline ?? undefined,
        courseCount: u._count.courses,
        studentCount: 0,
        avgRating: 0,
        specialties: [],
      }));
    }
  } catch {
    // DB unavailable — use MOCK_INSTRUCTORS
  }

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />

      {/* ── Dark hero ── */}
      <section
        className="py-[72px] relative overflow-hidden"
        style={{ background: "var(--ink)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 72% 50%, rgba(15,93,74,0.42) 0%, transparent 58%)",
          }}
        />
        <Container className="relative text-center">
          <EyebrowLabel className="text-[#8A938E] mb-4">
            — OUR INSTRUCTORS
          </EyebrowLabel>
          <h1
            className="font-display tracking-[-0.018em] leading-[1.06] text-white mb-4"
            style={{ fontSize: "clamp(42px, 6vw, 64px)" }}
          >
            เรียนกับคนที่
            <em className="not-italic text-viridian"> ทำงานจริง</em>
          </h1>
          <p className="text-[16px] text-[#C9CDC8] max-w-[520px] mx-auto leading-[1.6]">
            ผู้สอนทุกคนบน VERDA คือมืออาชีพในสาขาของตน
            ไม่ใช่แค่ทฤษฎี — แต่ประสบการณ์จริงจากการทำงาน
          </p>
        </Container>
      </section>

      {/* ── Stats bar ── */}
      <div className="bg-paper-3 border-b border-line">
        <Container className="py-5">
          <div className="flex items-center gap-14 justify-center">
            {[
              { value: `${PLATFORM_STATS.instructors}+`, label: "ผู้สอน" },
              { value: `${PLATFORM_STATS.courses}+`, label: "คอร์ส" },
              {
                value: `${formatNumber(PLATFORM_STATS.learners)}+`,
                label: "ผู้เรียน",
              },
              { value: "4.8 ★", label: "คะแนนเฉลี่ย" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-display text-[28px] tracking-[-0.012em] text-ink">
                  {value}
                </div>
                <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-3 mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      <Container className="py-14">
        {/* ── Section header ── */}
        <div className="mb-8">
          <EyebrowLabel className="mb-2">— ALL INSTRUCTORS</EyebrowLabel>
          <h2 className="font-display text-[40px] tracking-[-0.012em]">
            ผู้สอนทั้งหมด
          </h2>
        </div>

        {/* ── Instructor card grid ── */}
        <div className="grid grid-cols-2 gap-5 mb-16">
          {instructors.map((instructor) => (
            <Link
              key={instructor.id}
              href={`/${locale}/instructors/${instructor.id}`}
              className="group flex gap-5 p-5 bg-paper-3 border border-line rounded-r3 hover:border-viridian-3 hover:shadow-sm transition-all"
            >
              <div className="shrink-0">
                <Avatar name={instructor.name} size="lg" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[15px] text-ink group-hover:text-viridian transition-colors leading-snug">
                  {instructor.name}
                </h3>
                {instructor.bio && (
                  <p className="text-[12px] text-ink-3 mt-1 line-clamp-2 leading-[1.5]">
                    {instructor.bio}
                  </p>
                )}

                {/* Metrics */}
                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1 text-[11px] text-ink-3">
                    <BookOpen size={11} className="text-viridian" />
                    {instructor.courseCount} คอร์ส
                  </span>
                  {instructor.studentCount > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-ink-3">
                      <Users size={11} className="text-viridian" />
                      {formatNumber(instructor.studentCount)} ผู้เรียน
                    </span>
                  )}
                  {instructor.avgRating > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-amber-600">
                      <Star size={11} className="text-amber-500" />
                      {instructor.avgRating.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Specialty pills */}
                {instructor.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {instructor.specialties.map((s) => (
                      <span
                        key={s}
                        className="font-mono text-[9px] tracking-[0.08em] uppercase px-2 py-0.5 rounded-pill bg-viridian-wash border border-viridian-tint text-viridian"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <ArrowRight
                size={15}
                className="text-ink-3 group-hover:text-viridian transition-colors shrink-0 mt-0.5"
              />
            </Link>
          ))}
        </div>

        {/* ── "Become an Instructor" CTA ── */}
        <div
          className="rounded-r4 overflow-hidden relative"
          style={{ background: "var(--ink)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 85% 50%, rgba(15,93,74,0.38) 0%, transparent 56%)",
            }}
          />
          <div className="relative px-14 py-12 flex items-center justify-between gap-10">
            {/* Left text */}
            <div className="max-w-[460px]">
              <EyebrowLabel className="text-[#8A938E] mb-3">
                — BECOME AN INSTRUCTOR
              </EyebrowLabel>
              <h2
                className="font-display tracking-[-0.016em] text-white leading-[1.1] mb-3"
                style={{ fontSize: "clamp(32px, 3.5vw, 46px)" }}
              >
                มาสอนกับ{" "}
                <em className="not-italic text-viridian">VERDA</em>
              </h2>
              <p className="text-[15px] text-[#C9CDC8] leading-[1.65]">
                แบ่งปันความรู้และประสบการณ์ของคุณ สร้างรายได้จากคอร์สออนไลน์
                ดูแลโดยทีม VERDA ตลอดเส้นทาง
              </p>
            </div>

            {/* Right CTAs */}
            <div className="shrink-0 flex flex-col items-end gap-3">
              <Link
                href={`/${locale}/studio`}
                className="flex items-center gap-2 bg-viridian hover:bg-viridian-2 text-white font-medium text-[15px] px-7 py-3.5 rounded-pill transition-colors whitespace-nowrap"
              >
                เริ่มสอนเลย
                <ChevronRight size={16} />
              </Link>
              <Link
                href={`/${locale}/pricing`}
                className="flex items-center gap-1.5 text-[13px] text-[#8A938E] hover:text-white transition-colors"
              >
                ดูแพ็กเกจและค่าธรรมเนียม
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  );
}
