import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight, Play, Sparkles, Check,
  BookOpen, Zap, Clock, Shield, Star,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/primitives/Button";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { DisplayHeading } from "@/components/primitives/DisplayHeading";
import { CourseGrid } from "@/components/course/CourseGrid";
import { Avatar } from "@/components/primitives/Avatar";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { StatCounter } from "@/components/home/StatCounter";
import { PopularCoursesBanner, type BannerCourse } from "@/components/home/PopularCoursesBanner";
import { TrendingMarquee } from "@/components/home/TrendingMarquee";

import { MOCK_COURSES, MOCK_CATEGORIES, MOCK_INSTRUCTORS, PLATFORM_STATS } from "@/mock";
import { formatNumber } from "@/lib/utils";
import { getCourses } from "@/lib/queries/courses";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.hero" });
  return {
    title: "VERDA — School of Practice",
    description: t("sub"),
  };
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main>
        <HeroSection />
        <PopularBanner />
        <TrendingMarquee />
        <StatsSection />
        <TrialSection />
        <FeaturedCoursesSection />
        <CategoriesSection />
        <InstructorsSection />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   POPULAR COURSES BANNER — auto-rotating, dynamic
   ════════════════════════════════════════════════════════════════════ */
function PopularBanner() {
  const top: BannerCourse[] = [...MOCK_COURSES]
    .sort((a, b) => (b.enrollmentCount ?? 0) - (a.enrollmentCount ?? 0))
    .slice(0, 5)
    .map((c) => ({
      slug: c.slug,
      title: c.title,
      instructor: c.instructor?.name ?? "VERDA",
      rating: c.rating ?? 0,
      enrollmentCount: c.enrollmentCount ?? 0,
      price: c.price ?? 0,
      level: c.level ?? "BEGINNER",
      tags: c.tags ?? [],
      art: c.art ?? "linear-gradient(135deg, #0F5D4A 0%, #1A7A60 100%)",
      monogram: c.monogram ?? c.title.slice(0, 2).toUpperCase(),
    }));

  return <PopularCoursesBanner courses={top} />;
}

/* ════════════════════════════════════════════════════════════════════
   HERO SECTION
   Art-driven split layout: headline + trial CTA left, floating cards right
   ════════════════════════════════════════════════════════════════════ */
function HeroSection() {
  const t = useTranslations("home.hero");

  return (
    <section className="relative py-[80px] lg:py-[100px] overflow-hidden border-b border-line">
      {/* Layered background mesh — viridian + purple blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-30%] right-[-15%] w-[680px] h-[680px] rounded-full opacity-[0.08]"
          style={{
            background: "radial-gradient(circle, var(--viridian) 0%, transparent 68%)",
            animation: "drift 14s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-[-25%] left-[-12%] w-[520px] h-[520px] rounded-full opacity-[0.05]"
          style={{
            background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)",
            animation: "drift 18s ease-in-out infinite reverse",
          }}
        />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(var(--ink-3) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <Container className="relative grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 lg:gap-20 items-center">
        {/* ── Left: copy + CTAs ── */}
        <div className="flex flex-col gap-6 max-w-[580px]">
          {/* Trial badge */}
          <div
            className="inline-flex items-center gap-2.5 self-start px-4 py-2 rounded-pill border text-[#6D28D9]"
            style={{
              background: "rgba(109,40,217,0.07)",
              borderColor: "rgba(167,139,250,0.45)",
              animation: "badge-in 0.5s ease forwards",
            }}
          >
            <Sparkles size={14} className="flex-shrink-0" />
            <span className="font-mono text-[11px] tracking-[0.08em] uppercase font-medium">
              ทดลองเรียนฟรี 7 วัน — ทุกคอร์ส ทุกฟีเจอร์
            </span>
          </div>

          <EyebrowLabel>{t("eyebrow")}</EyebrowLabel>

          {/* Hero headline — Thai bold */}
          <h1 className="font-thai font-bold text-[52px] lg:text-[62px] leading-[1.08] tracking-[-0.015em] text-ink m-0">
            {t("headline")}{" "}
            <span className="text-viridian">{t("headlineAccent")}</span>
          </h1>

          <p className="text-[16px] text-ink-3 leading-[1.7] max-w-[440px] font-thai">
            {t("sub")}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link href="/th/login?tab=signup">
              <button className="trial-cta ripple-btn px-7 py-[15px] rounded-pill font-thai font-bold text-[15px] text-white flex items-center gap-2.5 whitespace-nowrap">
                <Sparkles size={16} />
                เริ่มทดลองฟรี 7 วัน
              </button>
            </Link>
            <Link href="/th/courses">
              <Button variant="ghost" size="lg" className="flex items-center gap-2 whitespace-nowrap">
                <Play size={14} className="fill-current" />
                {t("ctaSecondary")}
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-ink-3 font-thai mt-1">
            {["ไม่ต้องใช้บัตรเครดิต", "ยกเลิกได้ทุกเมื่อ", "รองรับ PromptPay"].map((text) => (
              <span key={text} className="flex items-center gap-1.5">
                <Check size={13} className="text-viridian flex-shrink-0" />
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* ── Right: floating course card previews ── */}
        <div className="relative h-[420px] hidden lg:block">
          {/* Card 1 — UX Design (teal gradient) */}
          <div
            className="absolute top-0 right-0 w-[308px] bg-paper-3 border border-line rounded-r3 overflow-hidden shadow-lg"
            style={{ animation: "float-a 7s ease-in-out infinite" }}
          >
            <div
              className="h-[148px] relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #0F5D4A 0%, #1A7A60 100%)" }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0 12px, transparent 12px 24px)",
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-display text-[56px] text-white/22 italic select-none">
                UX
              </span>
            </div>
            <div className="p-4">
              <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-viridian mb-1">UX DESIGN</p>
              <p className="font-semibold text-[14px] text-ink leading-[1.35]">UX Design & Figma Masterclass</p>
              <p className="text-[11px] text-ink-3 mt-1">คุณพิมพ์พร วัฒนากร</p>
              <div className="flex items-center gap-1 mt-2">
                <Star size={11} className="fill-gold text-gold" />
                <span className="text-[12px] font-medium text-ink">4.9</span>
                <span className="text-[11px] text-ink-3 ml-0.5">(412)</span>
              </div>
              <div className="mt-2 font-display text-[22px] text-viridian">฿1,990</div>
            </div>
          </div>

          {/* Card 2 — Next.js (navy gradient) */}
          <div
            className="absolute bottom-10 left-0 w-[280px] bg-paper-3 border border-line rounded-r3 overflow-hidden shadow-lg"
            style={{ animation: "float-b 9s ease-in-out infinite" }}
          >
            <div
              className="h-[128px] relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2d5a9e 100%)" }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0 12px, transparent 12px 24px)",
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-display text-[44px] text-white/22 italic select-none">
                NJ
              </span>
            </div>
            <div className="p-4">
              <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-[#3B82F6] mb-1">NEXT.JS</p>
              <p className="font-semibold text-[14px] text-ink leading-[1.35]">Next.js 15 Fullstack Bootcamp</p>
              <p className="text-[11px] text-ink-3 mt-1">คุณธนพล สิทธิกุล</p>
              <div className="mt-3 font-display text-[22px] text-viridian">฿2,990</div>
            </div>
          </div>

          {/* Decorative floating dots */}
          <div className="absolute top-[44%] left-[34%] w-3 h-3 rounded-full bg-viridian/40" />
          <div className="absolute top-[49%] left-[39%] w-2 h-2 rounded-full bg-viridian/20" />
          <div className="absolute top-[46%] left-[44%] w-2.5 h-2.5 rounded-full opacity-30"
            style={{ background: "var(--viridian)" }} />
          <div className="absolute top-[30%] right-[-10px] w-4 h-4 rounded-full opacity-20"
            style={{ background: "#7C3AED", animation: "drift 10s ease-in-out infinite" }} />
        </div>
      </Container>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════
   STATS STRIP — count-up animation on scroll
   ════════════════════════════════════════════════════════════════════ */
function StatsSection() {
  const t = useTranslations("home.stats");

  const stats = [
    { value: PLATFORM_STATS.learners, label: t("learners"), suffix: "+" },
    { value: PLATFORM_STATS.courses, label: t("courses"), suffix: "" },
    { value: PLATFORM_STATS.instructors, label: t("instructors"), suffix: "" },
    { value: PLATFORM_STATS.completionRate, label: t("completionRate"), suffix: "%" },
  ];

  return (
    <section className="py-14 border-b border-line bg-viridian-wash">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <ScrollReveal key={s.label} delay={i * 90} className="text-center">
              <div className="font-display text-[48px] leading-none text-viridian italic">
                <StatCounter value={s.value} suffix={s.suffix} />
              </div>
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-ink-3 mt-2.5">
                {s.label}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════
   7-DAY FREE TRIAL SECTION — impossible-to-miss dark feature block
   ════════════════════════════════════════════════════════════════════ */
function TrialSection() {
  return (
    <section className="relative overflow-hidden py-[88px] bg-ink border-b border-[#2A332E]">
      {/* Animated background blobs */}
      <div
        className="absolute top-[-35%] right-[-8%] w-[560px] h-[560px] rounded-full opacity-[0.14] pointer-events-none"
        style={{
          background: "radial-gradient(circle, #7C3AED, transparent 68%)",
          animation: "drift 11s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[-30%] left-[5%] w-[440px] h-[440px] rounded-full opacity-[0.10] pointer-events-none"
        style={{
          background: "radial-gradient(circle, #2FA87A, transparent 70%)",
          animation: "drift 15s ease-in-out infinite reverse",
        }}
      />
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <Container className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left — headline + CTA */}
        <ScrollReveal direction="left">
          <EyebrowLabel className="text-[#5C6863] mb-4" prefix={false}>
            — EXCLUSIVE OFFER
          </EyebrowLabel>
          <h2 className="font-thai font-bold text-[42px] lg:text-[54px] leading-[1.08] text-white mb-5">
            เริ่มทดลองเรียนฟรี{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #A78BFA 0%, #F472B6 55%, #FCD34D 100%)",
              }}
            >
              7 วัน!
            </span>
          </h2>
          <p className="text-[16px] text-[#8A938E] leading-[1.7] mb-8 max-w-[400px] font-thai">
            เข้าถึงทุกคอร์ส ทุกฟีเจอร์ ไม่ต้องผูกบัตรเครดิต ยกเลิกได้ทุกเมื่อ
          </p>
          <Link href="/th/login?tab=signup">
            <button className="trial-cta ripple-btn px-8 py-[16px] rounded-pill font-thai font-bold text-[16px] text-white flex items-center gap-3 whitespace-nowrap">
              <Sparkles size={18} />
              เริ่มทดลองใช้งานฟรีเลย
              <ArrowRight size={16} />
            </button>
          </Link>
          <p className="text-[12px] text-[#5C6863] mt-4 font-mono">
            * ไม่มีข้อผูกมัด · ยกเลิกได้ทันทีก่อนสิ้นสุด 7 วัน
          </p>
        </ScrollReveal>

        {/* Right — feature grid */}
        <ScrollReveal direction="right" delay={120}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: <BookOpen size={20} />,
                title: "ทุกคอร์สทั้งหมด",
                sub: "340+ คอร์สจากผู้เชี่ยวชาญตัวจริง",
              },
              {
                icon: <Zap size={20} />,
                title: "ทุกฟีเจอร์",
                sub: "Quiz, Certificate, Live Q&A และอื่นๆ",
              },
              {
                icon: <Clock size={20} />,
                title: "เรียนเมื่อไหร่ก็ได้",
                sub: "วิดีโอ On-demand ตลอด 24/7",
              },
              {
                icon: <Shield size={20} />,
                title: "ปลอดภัย 100%",
                sub: "ไม่ต้องใส่ข้อมูลบัตรเครดิต",
              },
            ].map(({ icon, title, sub }) => (
              <div
                key={title}
                className="flex gap-3.5 p-5 rounded-r3 border transition-colors hover:border-white/20"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <span className="text-viridian-3 mt-0.5 flex-shrink-0">{icon}</span>
                <div>
                  <p className="font-semibold text-white text-[14px]">{title}</p>
                  <p className="text-[12px] text-[#8A938E] mt-1 leading-[1.5]">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════
   FEATURED COURSES
   ════════════════════════════════════════════════════════════════════ */
async function FeaturedCoursesGrid() {
  const { courses } = await getCourses({ pageSize: 6 });
  return <CourseGrid courses={courses} columns={3} />;
}

function FeaturedCoursesSection() {
  const t = useTranslations("home.featured");

  return (
    <section className="py-[80px] border-b border-line">
      <Container>
        <ScrollReveal className="flex items-end justify-between mb-[28px] gap-6">
          <div>
            <EyebrowLabel className="mb-2">{t("eyebrow")}</EyebrowLabel>
            <DisplayHeading as="h2">{t("title")}</DisplayHeading>
            <p className="text-[13px] text-ink-3 mt-1.5">{t("sub")}</p>
          </div>
          <Link
            href="/th/courses"
            className="font-mono text-[11px] tracking-[0.1em] uppercase text-viridian hover:text-viridian-2 transition-colors shrink-0 flex items-center gap-1.5"
          >
            {t("more")} <ArrowRight size={11} />
          </Link>
        </ScrollReveal>

        <Suspense fallback={<CourseGrid courses={MOCK_COURSES.slice(0, 6)} columns={3} />}>
          <FeaturedCoursesGrid />
        </Suspense>
      </Container>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════
   CATEGORIES — hover lift + tilt micro-interaction
   ════════════════════════════════════════════════════════════════════ */
function CategoriesSection() {
  const t = useTranslations("home.categories");

  return (
    <section className="py-[80px] border-b border-line">
      <Container>
        <ScrollReveal className="mb-[28px]">
          <EyebrowLabel className="mb-2">{t("eyebrow")}</EyebrowLabel>
          <DisplayHeading as="h2">{t("title")}</DisplayHeading>
        </ScrollReveal>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {MOCK_CATEGORIES.map((cat, i) => (
            <ScrollReveal key={cat.id} delay={i * 35}>
              <Link
                href={`/th/courses?category=${cat.id}`}
                className="group flex flex-col items-center gap-2.5 p-4 bg-paper-3 border border-line rounded-r3
                           hover:border-viridian hover:bg-viridian-wash hover:-translate-y-[3px] hover:rotate-1
                           hover:shadow-md transition-all duration-200 ease-out"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                  {cat.icon}
                </span>
                <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-ink-3 text-center leading-tight group-hover:text-viridian transition-colors duration-200">
                  {cat.label}
                </span>
                <span className="font-mono text-[10px] text-ink-4">{cat.count}</span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════
   INSTRUCTORS — dark elegant section
   ════════════════════════════════════════════════════════════════════ */
function InstructorsSection() {
  const t = useTranslations("home.instructors");

  return (
    <section className="py-[88px] bg-ink border-b border-[#2A332E] relative overflow-hidden">
      {/* Subtle green glow */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 60%, #0F5D4A 0%, transparent 70%)",
        }}
      />

      <Container className="relative">
        <ScrollReveal className="flex items-end justify-between mb-10">
          <div>
            <EyebrowLabel className="mb-2 text-[#5C6863]">{t("eyebrow")}</EyebrowLabel>
            <DisplayHeading as="h2" className="text-white">
              {t("title")}
            </DisplayHeading>
          </div>
          <Link
            href="/th/instructors"
            className="font-mono text-[11px] tracking-[0.1em] uppercase text-viridian-3 hover:text-viridian transition-colors shrink-0 flex items-center gap-1.5"
          >
            {t("more")} <ArrowRight size={11} />
          </Link>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MOCK_INSTRUCTORS.map((inst, i) => (
            <ScrollReveal key={inst.id} delay={i * 80}>
              <Link
                href={`/th/instructors/${inst.id}`}
                className="group flex flex-col items-center gap-4 p-6 rounded-r3 text-center
                           bg-[#1c2421] border border-[#2A332E]
                           hover:bg-[#1f2924] hover:border-viridian/40
                           transition-all duration-300 ease-out hover:-translate-y-[3px]"
              >
                {/* Avatar with glow ring on hover */}
                <div className="relative">
                  <Avatar name={inst.name} size="xl" />
                  <div
                    className="absolute inset-[-3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow: "0 0 0 2px rgba(47,168,122,0.5)" }}
                  />
                </div>

                <div className="w-full">
                  <p className="font-semibold text-white text-[15px]">{inst.name}</p>
                  <p className="text-[12px] text-[#8A938E] mt-1.5 leading-[1.5] line-clamp-2">
                    {inst.bio}
                  </p>
                  {/* Specialty tags */}
                  {inst.specialties && inst.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center mt-3">
                      {inst.specialties.slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="font-mono text-[9px] tracking-[0.06em] uppercase px-2 py-0.5 rounded"
                          style={{
                            background: "rgba(255,255,255,0.07)",
                            color: "#6E756F",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[12px] font-mono mt-auto" style={{ color: "#5C6863" }}>
                  <span>{formatNumber(inst.studentCount)} นักเรียน</span>
                  <span>·</span>
                  <span className="text-gold">⭐ {inst.avgRating}</span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        {/* Become an instructor mini-CTA */}
        <ScrollReveal delay={200} className="mt-12 text-center">
          <p className="text-[14px] text-[#8A938E] font-thai mb-3">
            คุณมีความเชี่ยวชาญที่อยากแบ่งปัน?
          </p>
          <Link
            href="/th/studio"
            className="inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.08em] uppercase text-viridian-3 hover:text-viridian border border-[#2A332E] hover:border-viridian/40 px-5 py-2.5 rounded-pill transition-all duration-200"
          >
            สมัครเป็นผู้สอน <ArrowRight size={12} />
          </Link>
        </ScrollReveal>
      </Container>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════
   FOR INSTRUCTORS CTA BANNER — animated gradient with geometric shapes
   ════════════════════════════════════════════════════════════════════ */
function CtaBanner() {
  return (
    <section className="py-[88px]">
      <Container>
        <ScrollReveal>
          <div
            className="relative rounded-r4 overflow-hidden p-[60px] lg:p-[72px] flex flex-col lg:flex-row items-center justify-between gap-10"
            style={{
              background:
                "linear-gradient(135deg, #0A4537 0%, #0F5D4A 35%, #1a1f3a 75%, #0A0E1A 100%)",
            }}
          >
            {/* Animated background circles */}
            <div
              className="absolute top-[-30%] right-[8%] w-[320px] h-[320px] rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(47,168,122,0.30), transparent 68%)",
                animation: "drift 9s ease-in-out infinite",
              }}
            />
            <div
              className="absolute bottom-[-35%] left-[20%] w-[260px] h-[260px] rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(124,58,237,0.22), transparent 70%)",
                animation: "drift 13s ease-in-out infinite reverse",
              }}
            />
            <div
              className="absolute top-[-10%] left-[-5%] w-[200px] h-[200px] rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(212,168,83,0.15), transparent 70%)",
                animation: "drift 17s ease-in-out infinite",
              }}
            />
            {/* Subtle grid */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
                backgroundSize: "44px 44px",
              }}
            />

            {/* Content */}
            <div className="relative z-10">
              <EyebrowLabel className="text-[rgba(255,255,255,0.45)] mb-3" prefix={false}>
                — FOR INSTRUCTORS
              </EyebrowLabel>
              <DisplayHeading
                as="h2"
                className="text-white text-[36px] lg:text-[44px] leading-[1.1]"
              >
                สอนกับ VERDA
              </DisplayHeading>
              <p className="text-[#A8D4C4] mt-4 max-w-[400px] text-[15px] leading-[1.7] font-thai">
                เผยแพร่ความรู้และสร้างรายได้ passive income กับชุมชนผู้เรียนชาวไทยกว่า 92,000 คน
              </p>
            </div>

            {/* CTAs */}
            <div className="relative z-10 flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/th/studio">
                <button className="px-7 py-[15px] rounded-pill bg-white text-ink font-thai font-bold text-[15px] hover:bg-paper-2 transition-colors whitespace-nowrap shadow-sm">
                  เริ่มสอนวันนี้
                </button>
              </Link>
              <Link href="/th/instructors">
                <button className="px-7 py-[15px] rounded-pill border font-thai font-medium text-[15px] transition-all whitespace-nowrap flex items-center gap-2 text-white hover:bg-white/10"
                  style={{ borderColor: "rgba(255,255,255,0.28)" }}>
                  เรียนรู้เพิ่มเติม <ArrowRight size={15} />
                </button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
