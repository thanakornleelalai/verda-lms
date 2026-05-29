import { Container } from "@/components/layout/Container";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { DisplayHeading } from "@/components/primitives/DisplayHeading";
import { CourseGrid } from "@/components/course/CourseGrid";
import { getCourses, getCategories } from "@/lib/queries/courses";
import Link from "next/link";

export const revalidate = 60;

const LEVELS = [
  { value: "BEGINNER", label: "ผู้เริ่มต้น" },
  { value: "INTERMEDIATE", label: "ระดับกลาง" },
  { value: "ADVANCED", label: "ระดับสูง" },
];

const PRICE_RANGES = [
  { label: "ฟรี", priceMax: 0 },
  { label: "ต่ำกว่า ฿1,000", priceMax: 1000 },
  { label: "ต่ำกว่า ฿2,000", priceMax: 2000 },
];

const SORTS = [
  { value: "popular", label: "ยอดนิยม" },
  { value: "newest", label: "ใหม่ล่าสุด" },
  { value: "price-asc", label: "ราคา: ต่ำ→สูง" },
  { value: "price-desc", label: "ราคา: สูง→ต่ำ" },
  { value: "rating", label: "คะแนนสูงสุด" },
];

export default async function CoursesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    category?: string;
    level?: string;
    priceMax?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const { locale } = await params;
  const { category, level, priceMax, sort, page: pageStr } = await searchParams;
  const page = parseInt(pageStr ?? "1", 10);
  const priceMaxNum = priceMax !== undefined ? parseInt(priceMax, 10) : undefined;

  const [{ courses, total }, categories] = await Promise.all([
    getCourses({
      categorySlug: category,
      level,
      priceMax: priceMaxNum,
      sort: sort as "popular" | "newest" | "price-asc" | "price-desc" | "rating" | undefined,
      page,
      pageSize: 12,
    }),
    getCategories(),
  ]);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const base = { category, level, priceMax, sort };
    const merged = { ...base, ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined && v !== "") params.set(k, v);
    });
    const qs = params.toString();
    return `/${locale}/courses${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main>
        {/* Header */}
        <div className="py-12 border-b border-line bg-viridian-wash">
          <Container>
            <EyebrowLabel className="mb-2">— ALL COURSES</EyebrowLabel>
            <DisplayHeading as="h1">คอร์สทั้งหมด</DisplayHeading>
            <p className="text-ink-3 mt-2">{total} คอร์ส</p>
          </Container>
        </div>

        <Container className="py-10">
          <div className="flex gap-8">
            {/* Sidebar filter */}
            <aside className="w-[248px] shrink-0">
              <div className="sticky top-24 flex flex-col gap-6">
                {/* Category */}
                <div>
                  <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-3 mb-3">CATEGORY</p>
                  <ul className="flex flex-col gap-1">
                    <li>
                      <Link
                        href={buildUrl({ category: undefined, page: undefined })}
                        className={`flex items-center justify-between py-1.5 px-2 text-[14px] hover:text-viridian hover:bg-viridian-wash rounded-r1 transition-colors ${
                          !category ? "text-viridian font-medium" : "text-ink-2"
                        }`}
                      >
                        <span>ทั้งหมด</span>
                        <span className="font-mono text-[11px] text-ink-4">{total}</span>
                      </Link>
                    </li>
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <Link
                          href={buildUrl({ category: cat.slug, page: undefined })}
                          className={`flex items-center justify-between py-1.5 px-2 text-[14px] hover:text-viridian hover:bg-viridian-wash rounded-r1 transition-colors ${
                            category === cat.slug ? "text-viridian font-medium" : "text-ink-2"
                          }`}
                        >
                          <span>{cat.label}</span>
                          <span className="font-mono text-[11px] text-ink-4">{cat.count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Level */}
                <div>
                  <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-3 mb-3">LEVEL</p>
                  <ul className="flex flex-col gap-1">
                    {LEVELS.map((l) => (
                      <li key={l.value}>
                        <Link
                          href={buildUrl({ level: level === l.value ? undefined : l.value, page: undefined })}
                          className={`flex items-center gap-2 py-1.5 px-2 text-[14px] hover:text-viridian hover:bg-viridian-wash rounded-r1 transition-colors cursor-pointer ${
                            level === l.value ? "text-viridian font-medium" : "text-ink-2"
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                              level === l.value ? "bg-viridian border-viridian" : "border-line"
                            }`}
                          >
                            {level === l.value && (
                              <svg viewBox="0 0 10 8" className="w-2 h-2 text-white fill-current">
                                <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                              </svg>
                            )}
                          </span>
                          {l.label}
                        </Link>
                      </li>
                    ))}
                    {level && (
                      <li>
                        <Link
                          href={buildUrl({ level: undefined, page: undefined })}
                          className="text-[12px] text-ink-4 hover:text-danger px-2 py-1"
                        >
                          ล้างตัวกรอง ×
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Price */}
                <div>
                  <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-3 mb-3">PRICE</p>
                  <ul className="flex flex-col gap-1">
                    {PRICE_RANGES.map((p) => {
                      const active = priceMax !== undefined && parseInt(priceMax) === p.priceMax;
                      return (
                        <li key={p.label}>
                          <Link
                            href={buildUrl({
                              priceMax: active ? undefined : String(p.priceMax),
                              page: undefined,
                            })}
                            className={`flex items-center gap-2 py-1.5 px-2 text-[14px] hover:text-viridian hover:bg-viridian-wash rounded-r1 transition-colors ${
                              active ? "text-viridian font-medium" : "text-ink-2"
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                                active ? "bg-viridian border-viridian" : "border-line"
                              }`}
                            >
                              {active && (
                                <svg viewBox="0 0 10 8" className="w-2 h-2 text-white fill-current">
                                  <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                                </svg>
                              )}
                            </span>
                            {p.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </aside>

            {/* Course grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[14px] text-ink-3">
                  แสดง <strong className="text-ink">{courses.length}</strong> จาก {total} คอร์ส
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-ink-3">เรียงโดย</span>
                  <div className="flex gap-1">
                    {SORTS.map((s) => (
                      <Link
                        key={s.value}
                        href={buildUrl({ sort: sort === s.value ? undefined : s.value, page: undefined })}
                        className={`px-2.5 py-1 rounded-pill text-[12px] font-mono border transition-colors ${
                          (sort ?? "popular") === s.value
                            ? "bg-viridian text-white border-viridian"
                            : "border-line text-ink-3 hover:border-viridian hover:text-viridian"
                        }`}
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active filters summary */}
              {(level || priceMax !== undefined) && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {level && (
                    <Link
                      href={buildUrl({ level: undefined, page: undefined })}
                      className="flex items-center gap-1 px-2.5 py-1 bg-viridian-wash border border-viridian-3/40 rounded-pill text-[12px] text-viridian hover:bg-viridian/10"
                    >
                      {LEVELS.find((l) => l.value === level)?.label} ×
                    </Link>
                  )}
                  {priceMax !== undefined && (
                    <Link
                      href={buildUrl({ priceMax: undefined, page: undefined })}
                      className="flex items-center gap-1 px-2.5 py-1 bg-viridian-wash border border-viridian-3/40 rounded-pill text-[12px] text-viridian hover:bg-viridian/10"
                    >
                      {PRICE_RANGES.find((p) => p.priceMax === priceMaxNum)?.label ?? `≤ ฿${priceMax}`} ×
                    </Link>
                  )}
                  <Link
                    href={buildUrl({ level: undefined, priceMax: undefined, page: undefined })}
                    className="px-2.5 py-1 text-[12px] text-ink-4 hover:text-danger"
                  >
                    ล้างทั้งหมด
                  </Link>
                </div>
              )}

              {courses.length > 0 ? (
                <CourseGrid courses={courses} columns={3} />
              ) : (
                <p className="text-ink-3 py-16 text-center text-[15px]">ไม่พบคอร์สที่ตรงกับตัวกรอง</p>
              )}

              {/* Pagination */}
              {total > 12 && (
                <div className="flex justify-center gap-2 mt-10">
                  {page > 1 && (
                    <Link
                      href={buildUrl({ page: String(page - 1) })}
                      className="px-4 py-2 border border-line rounded-r2 text-[14px] text-ink-2 hover:border-viridian hover:text-viridian"
                    >
                      ← ก่อนหน้า
                    </Link>
                  )}
                  <span className="px-4 py-2 text-[14px] text-ink-3 font-mono">หน้า {page}</span>
                  {courses.length === 12 && (
                    <Link
                      href={buildUrl({ page: String(page + 1) })}
                      className="px-4 py-2 border border-line rounded-r2 text-[14px] text-ink-2 hover:border-viridian hover:text-viridian"
                    >
                      ถัดไป →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
