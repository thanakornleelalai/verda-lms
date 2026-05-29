import { Container } from "@/components/layout/Container";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { CourseGrid } from "@/components/course/CourseGrid";
import { getCourses, getCategories } from "@/lib/queries/courses";
import Link from "next/link";
import { Search } from "lucide-react";

export const revalidate = 60;

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { locale } = await params;
  const { q = "", category } = await searchParams;

  const [{ courses, total }, categories] = await Promise.all([
    getCourses({ query: q || undefined, categorySlug: category }),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main>
        {/* Search header */}
        <div className="py-10 border-b border-line">
          <Container>
            <div className="max-w-[600px] mx-auto">
              <form action={`/${locale}/search`} method="GET">
                <div className="flex items-center bg-paper-3 border border-line rounded-pill px-5 py-3 gap-3 focus-within:border-viridian transition-colors">
                  <Search size={18} className="text-ink-3 shrink-0" />
                  <input
                    type="search"
                    name="q"
                    defaultValue={q}
                    placeholder="ค้นหาคอร์ส ผู้สอน หรือหัวข้อ..."
                    className="flex-1 bg-transparent border-0 outline-none font-thai text-[16px] text-ink placeholder:text-ink-3"
                  />
                </div>
              </form>
            </div>
          </Container>
        </div>

        <Container className="py-10">
          {/* Category pills */}
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            <Link
              href={`/${locale}/search${q ? `?q=${encodeURIComponent(q)}` : ""}`}
              className={`px-4 py-1.5 rounded-pill text-[13px] font-mono border transition-colors ${
                !category
                  ? "bg-viridian text-[#F5F0E1] border-viridian"
                  : "border-line text-ink-2 hover:border-viridian hover:text-viridian"
              }`}
            >
              ทั้งหมด
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/${locale}/search?${q ? `q=${encodeURIComponent(q)}&` : ""}category=${cat.slug}`}
                className={`px-4 py-1.5 rounded-pill text-[13px] font-mono border transition-colors ${
                  category === cat.slug
                    ? "bg-viridian text-[#F5F0E1] border-viridian"
                    : "border-line text-ink-2 hover:border-viridian hover:text-viridian"
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>

          {/* Results */}
          {q && (
            <p className="text-[14px] text-ink-3 mb-6">
              ผลลัพธ์สำหรับ <strong className="text-ink">&ldquo;{q}&rdquo;</strong> — {total} คอร์ส
            </p>
          )}

          {courses.length > 0 ? (
            <CourseGrid courses={courses} columns={3} />
          ) : (
            <div className="text-center py-20 text-ink-3">
              <Search size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-[16px]">ไม่พบคอร์สที่ตรงกับการค้นหา</p>
              <p className="text-[13px] mt-2">ลองใช้คำค้นอื่น หรือดูคอร์สทั้งหมด</p>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
