import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/primitives/Button";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { CourseThumbnail } from "@/components/course/CourseThumbnail";
import { MOCK_COURSES, MOCK_INSTRUCTOR } from "@/mock";
import { formatNumber, formatPrice } from "@/lib/utils";
import { devGetCoursesByInstructor } from "@/lib/dev-store";
import {
  Plus, ExternalLink, Clock, CheckCircle, AlertCircle,
  ShieldCheck, Send, Eye, BookOpen,
} from "lucide-react";

export const dynamic = "force-dynamic";

type CourseRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  price: number;
  currency: string;
  enrollmentCount: number;
  rating: number;
  monogram: string | null;
  art: string | null;
  _count: { sections: number };
};

export default async function StudioCoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const userId = session?.user?.id ?? "";

  let courses: CourseRow[] = [];

  try {
    courses = await db.course.findMany({
      where: { instructorId: userId },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        status: true,
        price: true,
        currency: true,
        enrollmentCount: true,
        rating: true,
        monogram: true,
        art: true,
        _count: { select: { sections: true } },
      },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    });
  } catch {
    // DB unavailable — merge mock courses + dev-store courses for this instructor
    const mockCourses = MOCK_COURSES.filter((c) => c.instructor.id === MOCK_INSTRUCTOR.id);
    const devCourses = devGetCoursesByInstructor(userId || MOCK_INSTRUCTOR.id);

    const allCourses = [...devCourses, ...mockCourses];
    courses = allCourses.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description ?? "",
      status: c.status,
      price: c.price,
      currency: c.currency,
      enrollmentCount: c.enrollmentCount,
      rating: c.rating,
      monogram: c.monogram ?? null,
      art: c.art ?? null,
      _count: { sections: c.sections.length },
    }));
  }

  const reviewCourses = courses.filter((c) => c.status === "REVIEW");
  const otherCourses = courses.filter((c) => c.status !== "REVIEW");

  return (
    <div className="p-8 max-w-[1100px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <EyebrowLabel className="mb-1">STUDIO / COURSES</EyebrowLabel>
          <h1 className="font-display text-[32px] text-ink tracking-[-0.015em]">คอร์สของฉัน</h1>
          <p className="text-[14px] text-ink-3 mt-1">{courses.length} คอร์ส</p>
        </div>
        <Link href="courses/new">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={16} /> สร้างคอร์สใหม่
          </Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-line rounded-r3">
          <BookOpen size={40} className="mx-auto mb-4 text-ink-4 opacity-40" />
          <p className="text-ink-3 text-[15px] mb-4">ยังไม่มีคอร์ส</p>
          <Link href="courses/new">
            <Button variant="primary">
              <Plus size={15} className="mr-2" /> สร้างคอร์สแรกของคุณ
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">

          {/* ── REVIEW section ───────────────────────────────────────── */}
          {reviewCourses.length > 0 && (
            <section>
              {/* Section header */}
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-amber-500" />
                <h2 className="font-semibold text-[15px] text-ink">
                  รอการอนุมัติจากแอดมิน
                </h2>
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-white font-bold text-[11px]">
                  {reviewCourses.length}
                </span>
              </div>

              {/* Review process timeline */}
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-r3 px-5 py-4">
                <p className="text-[13px] font-medium text-amber-800 mb-3">
                  ขั้นตอนการอนุมัติคอร์ส
                </p>
                <div className="flex items-start gap-0 relative">
                  {[
                    { icon: Send, label: "ส่งคอร์สแล้ว", done: true },
                    { icon: Eye, label: "แอดมินกำลังตรวจสอบ", done: false, active: true },
                    { icon: ShieldCheck, label: "อนุมัติและเผยแพร่", done: false },
                  ].map((step, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 relative">
                      {/* Connector line */}
                      {i < 2 && (
                        <div className={`absolute top-[14px] left-1/2 w-full h-[2px] ${step.done ? "bg-amber-400" : "bg-amber-200"}`} />
                      )}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 ${
                        step.done
                          ? "bg-amber-400 text-white"
                          : step.active
                          ? "bg-white border-2 border-amber-400 text-amber-500"
                          : "bg-white border-2 border-amber-200 text-amber-300"
                      }`}>
                        <step.icon size={13} />
                      </div>
                      <p className={`text-[11px] text-center font-thai leading-tight ${
                        step.done ? "text-amber-700 font-medium" :
                        step.active ? "text-amber-600 font-semibold" :
                        "text-amber-400"
                      }`}>
                        {step.label}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-[12px] text-amber-600 mt-4 font-thai">
                  โดยทั่วไปใช้เวลา <strong>1-3 วันทำการ</strong> — คุณยังแก้ไขเนื้อหาเพิ่มเติมได้ระหว่างรอ
                </p>
              </div>

              {/* REVIEW course cards */}
              <div className="flex flex-col gap-3">
                {reviewCourses.map((course) => (
                  <ReviewCourseCard
                    key={course.id}
                    course={course}
                    locale={locale}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Published / Draft section ─────────────────────────────── */}
          {otherCourses.length > 0 && (
            <section>
              {reviewCourses.length > 0 && (
                <h2 className="font-semibold text-[15px] text-ink mb-4">คอร์สอื่นๆ</h2>
              )}
              <div className="flex flex-col gap-4">
                {otherCourses.map((course) => (
                  <NormalCourseCard
                    key={course.id}
                    course={course}
                    locale={locale}
                  />
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}

// ── Review course card (prominent pending state) ──────────────────────────────

function ReviewCourseCard({ course, locale }: { course: CourseRow; locale: string }) {
  return (
    <div className="border-2 border-amber-200 rounded-r3 overflow-hidden bg-white shadow-sm">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 border-b border-amber-200">
        <Clock size={13} className="text-amber-500 shrink-0 animate-pulse" />
        <p className="text-[12px] font-medium text-amber-700">
          รอการตรวจสอบและอนุมัติจากทีมแอดมิน — จะเผยแพร่ให้นักเรียนหลังได้รับการอนุมัติ
        </p>
      </div>

      <div className="p-5 flex gap-5">
        {/* Thumbnail */}
        <div className="w-[130px] shrink-0 rounded-r2 overflow-hidden relative">
          <CourseThumbnail
            title={course.title}
            monogram={course.monogram ?? undefined}
            art={course.art ?? undefined}
            aspectRatio="16/9"
          />
          {/* Pending overlay */}
          <div className="absolute inset-0 bg-amber-900/20 flex items-center justify-center rounded-r2">
            <span className="font-mono text-[9px] tracking-wider bg-amber-400 text-white px-2 py-0.5 rounded-full uppercase">
              รอตรวจ
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="font-semibold text-[16px] text-ink line-clamp-1">{course.title}</h3>
            <span className="shrink-0 inline-flex items-center gap-1 font-mono text-[10px] px-2.5 py-1 rounded-pill uppercase bg-amber-100 text-amber-700 border border-amber-200">
              <Clock size={10} /> รอตรวจสอบ
            </span>
          </div>
          <p className="text-[13px] text-ink-3 line-clamp-2 mb-3">{course.description}</p>

          {/* Stats */}
          <div className="flex items-center gap-5 text-[13px] text-ink-4">
            <span>
              <strong className="text-ink">{formatPrice(course.price, course.currency)}</strong>
            </span>
            <span>
              <strong className="text-ink">{course._count.sections}</strong> หัวข้อ
            </span>
            <span className="text-ink-4 text-[11px] font-mono">ยังไม่มีนักเรียน (รอเผยแพร่)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0">
          <Link href={`courses/${course.slug}/edit`}>
            <Button variant="ghost" size="sm" className="w-full">
              แก้ไขเนื้อหา
            </Button>
          </Link>
          <Link
            href={`/${locale}/courses/${course.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="quiet" size="sm" className="flex items-center gap-1.5 w-full">
              <ExternalLink size={12} /> Preview
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Normal course card (Published / Draft) ───────────────────────────────────

function NormalCourseCard({ course, locale }: { course: CourseRow; locale: string }) {
  return (
    <div className="bg-paper-3 border border-line rounded-r3 p-5 flex gap-5 hover:border-viridian-3 transition-colors">
      <div className="w-[140px] shrink-0 rounded-r2 overflow-hidden">
        <CourseThumbnail
          title={course.title}
          monogram={course.monogram ?? undefined}
          art={course.art ?? undefined}
          aspectRatio="16/9"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-[16px] text-ink line-clamp-1">{course.title}</h3>
            <p className="text-[13px] text-ink-3 mt-1 line-clamp-2">{course.description}</p>
          </div>
          <StatusBadge status={course.status} />
        </div>
        <div className="flex items-center gap-6 mt-4 text-[13px] text-ink-3">
          <span><strong className="text-ink">{formatNumber(course.enrollmentCount)}</strong> นักเรียน</span>
          <span><strong className="text-ink">{course.rating.toFixed(1)}</strong> ⭐</span>
          <span><strong className="text-ink">{formatPrice(course.price, course.currency)}</strong></span>
          <span><strong className="text-ink">{course._count.sections}</strong> หัวข้อ</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 shrink-0">
        <Link href={`courses/${course.slug}/edit`}>
          <Button variant="ghost" size="sm">แก้ไข</Button>
        </Link>
        <Link href={`courses/${course.slug}/analytics`}>
          <Button variant="quiet" size="sm">Analytics</Button>
        </Link>
        <Link href={`/${locale}/courses/${course.slug}`} target="_blank" rel="noopener noreferrer">
          <Button variant="quiet" size="sm" className="flex items-center gap-1.5 w-full">
            <ExternalLink size={12} /> Preview
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === "PUBLISHED")
    return (
      <span className="shrink-0 inline-flex items-center gap-1 font-mono text-[10px] px-2.5 py-1 rounded-pill tracking-wide uppercase bg-ok/10 text-ok">
        <CheckCircle size={10} /> เผยแพร่แล้ว
      </span>
    );
  if (status === "DRAFT")
    return (
      <span className="shrink-0 inline-flex items-center gap-1 font-mono text-[10px] px-2.5 py-1 rounded-pill tracking-wide uppercase bg-warn/10 text-warn">
        <AlertCircle size={10} /> Draft
      </span>
    );
  return (
    <span className="shrink-0 font-mono text-[10px] px-2.5 py-1 rounded-pill tracking-wide uppercase bg-line text-ink-3">
      {status}
    </span>
  );
}
