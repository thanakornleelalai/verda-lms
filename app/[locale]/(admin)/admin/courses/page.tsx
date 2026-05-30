import { db } from "@/lib/db";
import { MOCK_COURSES } from "@/mock";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { CourseListClient, type CourseRow } from "./CourseListClient";
import { devGetCourses } from "@/lib/dev-store";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  const { status: statusFilter = "" } = await searchParams;

  let courses: CourseRow[] = [];
  let total = 0;

  try {
    const dbCourses = await db.course.findMany({
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
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
    // DB unavailable — merge dev-store + mock courses (dev-store first so REVIEW shows up)
    const devCourses = devGetCourses();
    const devIds = new Set(devCourses.map((c) => c.id));
    const allCourses = [
      ...devCourses,
      ...MOCK_COURSES.filter((c) => !devIds.has(c.id)),
    ];
    total = allCourses.length;
    courses = allCourses.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      instructorName: c.instructor?.name ?? "—",
      status: c.status,
      price: c.price,
      currency: c.currency,
      enrollmentCount: c.enrollmentCount,
      rating: c.rating,
      monogram: c.monogram ?? null,
      art: c.art ?? null,
      updatedAt: (c.updatedAt ?? new Date().toISOString()).slice(0, 10),
    }));
  }

  const published = courses.filter((c) => c.status === "PUBLISHED").length;
  const draft = courses.filter((c) => c.status === "DRAFT").length;
  const review = courses.filter((c) => c.status === "REVIEW").length;

  const STATUS_FILTERS = [
    { label: "ทั้งหมด", value: "", count: courses.length },
    { label: "รอตรวจสอบ", value: "REVIEW", count: review },
    { label: "เผยแพร่แล้ว", value: "PUBLISHED", count: published },
    { label: "Draft", value: "DRAFT", count: draft },
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
          {review > 0 && (
            <> · <span className="text-sky-600 font-semibold">{review} รอตรวจสอบ</span></>
          )}
        </p>
      </div>

      {/* Review queue alert */}
      {review > 0 && (
        <div className="flex items-center gap-3 mb-5 px-4 py-3 bg-sky-50 border border-sky-200 rounded-r2 text-[13px] text-sky-700">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse shrink-0" />
          มี <strong className="mx-1">{review} คอร์ส</strong> รอการตรวจสอบ — กด <strong className="mx-1">อนุมัติ</strong> หรือ <strong className="mx-1">ส่งคืน</strong> ในแต่ละรายการด้านล่าง
        </div>
      )}

      <div className="flex gap-3 mb-5 flex-wrap">
        {STATUS_FILTERS.map(({ label, value, count }) => (
          <a
            key={value}
            href={value ? `?status=${value}` : "?"}
            className={`px-4 py-1.5 rounded-pill text-[13px] border transition-colors ${
              statusFilter === value
                ? "bg-viridian text-white border-viridian"
                : value === "REVIEW" && count > 0
                ? "border-sky-300 text-sky-600 hover:bg-sky-50"
                : "border-line text-ink-3 hover:border-viridian-3 hover:text-ink"
            }`}
          >
            {label}
            <span className="ml-1.5 font-mono text-[10px] opacity-70">({count})</span>
          </a>
        ))}
      </div>

      <CourseListClient
        initialCourses={courses}
        locale={locale}
        statusFilter={statusFilter}
      />
    </div>
  );
}
