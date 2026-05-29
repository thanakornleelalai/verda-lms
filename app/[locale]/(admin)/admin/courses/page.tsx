import { db } from "@/lib/db";
import { MOCK_COURSES } from "@/mock";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { CourseThumbnail } from "@/components/course/CourseThumbnail";
import { formatNumber, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

type CourseRow = {
  id: string;
  slug: string;
  title: string;
  instructorName: string;
  status: string;
  price: number;
  currency: string;
  enrollmentCount: number;
  rating: number;
  monogram: string | null;
  art: string | null;
  updatedAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "bg-ok/10 text-ok",
  DRAFT: "bg-warn/10 text-warn",
  REVIEW: "bg-sky-400/10 text-sky-600",
  ARCHIVED: "bg-line text-ink-3",
};

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusFilter = "" } = await searchParams;

  let courses: CourseRow[] = [];
  let total = 0;

  try {
    const dbCourses = await db.course.findMany({
      orderBy: { updatedAt: "desc" },
      take: 100,
      select: {
        id: true,
        slug: true,
        title: true,
        instructor: { select: { name: true } },
        status: true,
        price: true,
        currency: true,
        enrollmentCount: true,
        rating: true,
        monogram: true,
        art: true,
        updatedAt: true,
      },
    });
    total = await db.course.count();
    courses = dbCourses.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      instructorName: c.instructor?.name ?? "—",
      status: c.status,
      price: c.price,
      currency: c.currency,
      enrollmentCount: c.enrollmentCount,
      rating: c.rating,
      monogram: c.monogram,
      art: c.art,
      updatedAt: c.updatedAt.toISOString().slice(0, 10),
    }));
  } catch {
    total = MOCK_COURSES.length;
    courses = MOCK_COURSES.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      instructorName: c.instructor.name,
      status: c.status,
      price: c.price,
      currency: c.currency,
      enrollmentCount: c.enrollmentCount,
      rating: c.rating,
      monogram: c.monogram ?? null,
      art: c.art ?? null,
      updatedAt: c.updatedAt.slice(0, 10),
    }));
  }

  const published = courses.filter((c) => c.status === "PUBLISHED").length;
  const draft = courses.filter((c) => c.status === "DRAFT").length;
  const review = courses.filter((c) => c.status === "REVIEW").length;

  const filtered = statusFilter
    ? courses.filter((c) => c.status === statusFilter)
    : courses;

  const STATUS_FILTERS = [
    { label: "ทั้งหมด", value: "", count: courses.length },
    { label: "เผยแพร่แล้ว", value: "PUBLISHED", count: published },
    { label: "Draft", value: "DRAFT", count: draft },
    { label: "รอตรวจ", value: "REVIEW", count: review },
  ];

  return (
    <div className="p-8 max-w-[1100px]">
      <div className="mb-8">
        <EyebrowLabel className="mb-1">ADMIN / COURSES</EyebrowLabel>
        <h1 className="font-display text-[32px] text-ink tracking-[-0.015em]">จัดการคอร์ส</h1>
        <p className="text-[14px] text-ink-3 mt-1">
          <strong className="text-ink">{total}</strong> คอร์สทั้งหมด ·{" "}
          <span className="text-ok">{published} เผยแพร่แล้ว</span> ·{" "}
          <span className="text-warn">{draft} Draft</span>
        </p>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        {STATUS_FILTERS.map(({ label, value, count }) => (
          <a
            key={value}
            href={value ? `?status=${value}` : "?"}
            className={`px-4 py-1.5 rounded-pill text-[13px] border transition-colors ${
              statusFilter === value
                ? "bg-viridian text-white border-viridian"
                : "border-line text-ink-3 hover:border-viridian-3 hover:text-ink"
            }`}
          >
            {label}
            <span className="ml-1.5 font-mono text-[10px] opacity-70">({count})</span>
          </a>
        ))}
      </div>

      <div className="bg-paper-3 border border-line rounded-r3 overflow-hidden">
        <div className="px-5 py-3 border-b border-line bg-paper-2">
          <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">
            {statusFilter ? `${statusFilter} ` : ""}คอร์ส ({filtered.length} รายการที่แสดง)
          </p>
        </div>
        <div className="divide-y divide-line">
          {filtered.map((course) => (
            <div key={course.id} className="flex items-center gap-4 px-5 py-4 hover:bg-paper-2 transition-colors">
              <div className="w-[80px] shrink-0 rounded-r2 overflow-hidden">
                <CourseThumbnail
                  title={course.title}
                  monogram={course.monogram ?? undefined}
                  art={course.art ?? undefined}
                  aspectRatio="16/9"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[14px] text-ink truncate">{course.title}</h3>
                <p className="text-[12px] text-ink-3 mt-0.5">{course.instructorName}</p>
                <div className="flex items-center gap-4 mt-2 text-[12px] text-ink-3">
                  <span><strong className="text-ink">{formatNumber(course.enrollmentCount)}</strong> นักเรียน</span>
                  <span><strong className="text-ink">{course.rating.toFixed(1)}</strong> ⭐</span>
                  <span><strong className="text-ink">{formatPrice(course.price, course.currency)}</strong></span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded-pill uppercase tracking-wide ${STATUS_COLORS[course.status] ?? "bg-line text-ink-3"}`}>
                  {course.status}
                </span>
                <span className="font-mono text-[10px] text-ink-4">{course.updatedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
