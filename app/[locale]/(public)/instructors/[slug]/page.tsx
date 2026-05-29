import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Star, Users, Globe, ExternalLink } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { CourseGrid } from "@/components/course/CourseGrid";
import { Avatar } from "@/components/primitives/Avatar";
import { getInstructorPublicProfile } from "@/lib/queries/courses";
import { MOCK_INSTRUCTORS, MOCK_COURSES } from "@/mock";
import { formatNumber } from "@/lib/utils";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const instructor = await getInstructorPublicProfile(slug);
  const name = instructor?.name ?? slug;
  return {
    title: `${name} — Instructor · VERDA`,
    description: instructor?.bio ?? `สอนโดย ${name} บน VERDA`,
  };
}

export default async function InstructorProfilePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;

  // Try DB first, fall back to mock
  let instructor = await getInstructorPublicProfile(slug);

  // Mock fallback
  if (!instructor) {
    const mock = MOCK_INSTRUCTORS.find((i) => i.id === slug || i.name.toLowerCase().replace(/\s+/g, "-") === slug);
    if (mock) {
      instructor = {
        id: mock.id,
        name: mock.name,
        image: mock.avatarUrl ?? null,
        bio: mock.bio ?? null,
        headline: mock.specialties.join(" · ") || null,
        website: null,
        courses: MOCK_COURSES.filter((c) => c.instructor.id === mock.id),
      };
    }
  }

  if (!instructor) notFound();

  const totalStudents = instructor.courses.reduce((sum, c) => sum + c.enrollmentCount, 0);
  const avgRating =
    instructor.courses.length > 0
      ? instructor.courses.reduce((sum, c) => sum + c.rating, 0) / instructor.courses.length
      : 0;
  const initial = instructor.name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />

      {/* Dark hero */}
      <section
        className="py-[60px] relative overflow-hidden"
        style={{ background: "var(--ink)", color: "#E7E5DA" }}
      >
        {/* Viridian radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 80% 30%, rgba(15,93,74,0.45) 0%, transparent 50%), radial-gradient(circle at 20% 90%, rgba(15,93,74,0.18) 0%, transparent 60%)",
          }}
        />
        <Container className="relative">
          <div className="grid grid-cols-[260px_1fr_auto] gap-12 items-center">
            {/* Portrait */}
            <div
              className="w-[260px] h-[320px] rounded-r3 overflow-hidden flex items-end p-[18px] relative shrink-0"
              style={{ background: "#1A2320", border: "1px solid #2A332E" }}
            >
              {instructor.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={instructor.image} alt={instructor.name} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <span
                  className="absolute right-[18px] top-[12px] font-display text-[140px] leading-none font-normal italic"
                  style={{ color: "var(--viridian-3)" }}
                >
                  {initial}
                </span>
              )}
              <span className="font-mono text-[10px] tracking-[0.1em] text-[#8A938E] uppercase relative z-10">
                portrait · 4:5
              </span>
            </div>

            {/* Info */}
            <div>
              <EyebrowLabel className="text-[#8A938E] mb-3">
                — {instructor.headline ?? "INSTRUCTOR · VERDA"}
              </EyebrowLabel>
              <h1
                className="font-display font-normal tracking-[-0.018em] leading-none text-white mb-3"
                style={{ fontSize: "clamp(48px, 6vw, 78px)" }}
              >
                {instructor.name}
              </h1>
              {instructor.bio && (
                <p className="text-[#C9CDC8] text-[15px] leading-[1.55] max-w-[540px] mb-5">
                  {instructor.bio}
                </p>
              )}
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-viridian text-white rounded-pill font-mono text-[10px] tracking-[0.08em] uppercase">
                  ✓ Verified Instructor
                </span>
                <span className="px-3 py-1 rounded-pill font-mono text-[10px] tracking-[0.08em] uppercase text-[#E7E5DA]" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  ⭐ Top rated
                </span>
                {instructor.courses.slice(0, 3).map((c) =>
                  c.tags[0] ? (
                    <span
                      key={c.id}
                      className="px-3 py-1 rounded-pill font-mono text-[10px] tracking-[0.08em] uppercase text-[#E7E5DA]"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                    >
                      — {c.tags[0]}
                    </span>
                  ) : null
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 shrink-0 items-end">
              <button className="px-5 py-2.5 bg-viridian text-white rounded-pill text-[14px] font-medium hover:bg-viridian-2 transition-colors whitespace-nowrap">
                + ติดตาม
              </button>
              <button
                className="px-5 py-2.5 rounded-pill text-[14px] whitespace-nowrap"
                style={{ background: "transparent", color: "#E7E5DA", border: "1px solid rgba(255,255,255,0.2)" }}
              >
                ✉ ส่งข้อความ
              </button>
              {instructor.website && (
                <Link
                  href={instructor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[12px] text-[#8A938E] hover:text-white transition-colors"
                >
                  <ExternalLink size={12} /> เว็บไซต์
                </Link>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div
            className="grid grid-cols-5 gap-7 mt-10 pt-7"
            style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
          >
            {[
              { value: instructor.courses.length, label: "คอร์สที่สอน" },
              { value: formatNumber(totalStudents), label: "ผู้เรียนทั้งหมด" },
              { value: formatNumber(instructor.courses.reduce((sum, c) => sum + c.ratingCount, 0)), label: "รีวิว" },
              { value: `${avgRating.toFixed(1)} ★`, label: "คะแนนเฉลี่ย" },
              { value: "—", label: "ผู้ติดตาม" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-[38px] leading-none text-white">{s.value}</div>
                <div className="font-mono text-[10px] tracking-[0.12em] text-[#8A938E] uppercase mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Sticky tabs */}
      <nav className="border-b border-line bg-paper sticky top-0 z-10">
        <Container>
          <div className="flex gap-7 px-0">
            {[
              { label: "ภาพรวม", active: true },
              { label: `คอร์ส (${instructor.courses.length})`, active: false },
              { label: "รีวิว", active: false },
            ].map((tab) => (
              <button
                key={tab.label}
                className={`py-[18px] text-[14px] relative border-b-2 transition-colors ${
                  tab.active
                    ? "text-viridian border-viridian"
                    : "text-ink-3 border-transparent hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Container>
      </nav>

      {/* Main content */}
      <Container>
        <div className="py-14 grid grid-cols-[1fr_320px] gap-12">
          {/* Left: About + Courses */}
          <main>
            {/* About */}
            {instructor.bio && (
              <section className="mb-14">
                <EyebrowLabel className="mb-2">— ABOUT</EyebrowLabel>
                <h2 className="font-display text-[36px] font-normal tracking-[-0.012em] mb-4">
                  เกี่ยวกับ {instructor.name.split(" ")[0]}
                </h2>
                <p className="text-ink-2 text-[15px] leading-[1.65]">{instructor.bio}</p>
              </section>
            )}

            {/* Courses */}
            {instructor.courses.length > 0 && (
              <section>
                <EyebrowLabel className="mb-2">— COURSES</EyebrowLabel>
                <h2 className="font-display text-[36px] font-normal tracking-[-0.012em] mb-6">
                  คอร์สทั้งหมด
                </h2>
                <CourseGrid courses={instructor.courses} columns={2} />
              </section>
            )}
          </main>

          {/* Right: Sidebar */}
          <aside className="sticky top-[80px] self-start flex flex-col gap-4">
            {/* Stats card */}
            <div className="bg-paper-3 border border-line rounded-r3 p-6">
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-ink-3 mb-4">STATS</p>
              {[
                { icon: <BookOpen size={15} />, label: "คอร์สทั้งหมด", value: instructor.courses.length },
                { icon: <Users size={15} />, label: "ผู้เรียน", value: formatNumber(totalStudents) },
                { icon: <Star size={15} />, label: "คะแนนเฉลี่ย", value: avgRating > 0 ? `${avgRating.toFixed(1)} / 5.0` : "—" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 py-2.5 border-t border-dashed border-line first:border-0 first:pt-0">
                  <span className="text-ink-3">{item.icon}</span>
                  <span className="text-[13px] text-ink-2 flex-1">{item.label}</span>
                  <span className="font-mono text-[13px] text-viridian font-medium">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Expertise */}
            {instructor.courses.length > 0 && (
              <div className="bg-paper-3 border border-line rounded-r3 p-6">
                <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-ink-3 mb-4">EXPERTISE</p>
                {Array.from(new Set(instructor.courses.flatMap((c) => c.tags))).slice(0, 6).map((tag) => (
                  <div key={tag} className="flex items-center py-2.5 border-t border-dashed border-line first:border-0 first:pt-0 text-[13px]">
                    <span className="text-ink-2 flex-1">{tag}</span>
                    <span className="font-mono text-[11px] text-viridian tracking-[0.08em]">Expert</span>
                  </div>
                ))}
              </div>
            )}

            {/* Links */}
            {instructor.website && (
              <div className="bg-paper-3 border border-line rounded-r3 p-6">
                <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-ink-3 mb-4">LINKS</p>
                <Link
                  href={instructor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 py-2.5 text-[13px] text-ink-2 hover:text-viridian transition-colors"
                >
                  <Globe size={14} className="text-ink-3" />
                  {instructor.website.replace(/^https?:\/\//, "").split("/")[0]}
                  <ExternalLink size={11} className="ml-auto text-ink-4" />
                </Link>
              </div>
            )}

            {/* Instructor avatar */}
            <div className="bg-paper-3 border border-line rounded-r3 p-6 flex items-center gap-4">
              <Avatar name={instructor.name} size="lg" />
              <div>
                <p className="font-semibold text-[14px] text-ink">{instructor.name}</p>
                <p className="text-[12px] text-ink-3 mt-0.5">{instructor.headline ?? "Instructor"}</p>
              </div>
            </div>
          </aside>
        </div>
      </Container>

      <Footer />
    </div>
  );
}
