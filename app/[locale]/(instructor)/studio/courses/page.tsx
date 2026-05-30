import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/primitives/Button";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { CourseThumbnail } from "@/components/course/CourseThumbnail";
import { MOCK_COURSES, MOCK_INSTRUCTOR } from "@/mock";
import { formatNumber, formatPrice } from "@/lib/utils";
import { Plus, ExternalLink, Clock, CheckCircle, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  if (status === "PUBLISHED")
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2.5 py-1 rounded-pill tracking-wide uppercase bg-ok/10 text-ok">
        <CheckCircle size={10} /> เผยแพร่แล้ว
      </span>
    );
  if (status === "REVIEW")
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2.5 py-1 rounded-pill tracking-wide uppercase bg-sky-100 text-sky-600">
        <Clock size={10} /> รอตรวจสอบ
      </span>
    );
  if (status === "DRAFT")
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2.5 py-1 rounded-pill tracking-wide uppercase bg-warn/10 text-warn">
        <AlertCircle size={10} /> Draft
      </span>
    );
  return (
    <span className="font-mono text-[10px] px-2.5 py-1 rounded-pill tracking-wide uppercase bg-line text-ink-3">
      {status}
    </span>
  );
}

export default async function StudioCoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const userId = session?.user?.id ?? "";

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
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    // DB unavailable — fall back to mock instructor courses
    const mock = MOCK_COURSES.filter((c) => c.instructor.id === MOCK_INSTRUCTOR.id);
    courses = mock.map((c) => ({
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

  return (
    <div className="p-8 max-w-[1100px]">
      <div className="flex items-start justify-between mb-8">
        <div>
          <EyebrowLabel className="mb-1">STUDIO / COURSES</EyebrowLabel>
          <h1 className="font-display text-[32px] text-ink tracking-[-0.015em]">คอร์สของฉัน</h1>
          <p className="text-[14px] text-ink-3 mt-1">{courses.length} คอร์ส</p>
        </div>
        <Link href="courses/new">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={16} />
            สร้างคอร์สใหม่
          </Button>
        </Link>
      </div>

      {/* Review-queue banner */}
      {courses.some((c) => c.status === "REVIEW") && (
        <div className="flex items-center gap-3 mb-5 px-4 py-3 bg-sky-50 border border-sky-200 rounded-r2 text-[13px] text-sky-700">
          <Clock size={15} className="shrink-0" />
          <span>
            คุณมี <strong>{courses.filter((c) => c.status === "REVIEW").length} คอร์ส</strong> ที่กำลังรอแอดมินตรวจสอบ — จะได้รับการแจ้งเตือนเมื่ออนุมัติเผยแพร่
          </span>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-line rounded-r3">
          <p className="text-ink-3 text-[15px] mb-4">ยังไม่มีคอร์ส</p>
          <Link href="courses/new">
            <Button variant="primary">
              <Plus size={15} className="mr-2" />
              สร้างคอร์สแรกของคุณ
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-paper-3 border border-line rounded-r3 p-5 flex gap-5 hover:border-viridian-3 transition-colors"
            >
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
                  <span>
                    <strong className="text-ink">{formatNumber(course.enrollmentCount)}</strong> นักเรียน
                  </span>
                  <span>
                    <strong className="text-ink">{course.rating.toFixed(1)}</strong> ⭐
                  </span>
                  <span>
                    <strong className="text-ink">{formatPrice(course.price, course.currency)}</strong>
                  </span>
                  <span>
                    <strong className="text-ink">{course._count.sections}</strong> หัวข้อ
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                {course.status === "REVIEW" ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-r2 bg-sky-50 border border-sky-200 text-sky-600 text-[12px] font-medium whitespace-nowrap">
                    <Clock size={12} /> รอแอดมินตรวจ
                  </div>
                ) : null}
                <Link href={`courses/${course.slug}/edit`}>
                  <Button variant="ghost" size="sm">
                    แก้ไข
                  </Button>
                </Link>
                <Link href={`courses/${course.slug}/analytics`}>
                  <Button variant="quiet" size="sm">
                    Analytics
                  </Button>
                </Link>
                <Link
                  href={`/${locale}/courses/${course.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="quiet" size="sm" className="flex items-center gap-1.5 w-full">
                    <ExternalLink size={12} />
                    Preview
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
