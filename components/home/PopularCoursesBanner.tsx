"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Star, Users, ArrowRight, ChevronLeft, ChevronRight, Flame, TrendingUp } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export interface BannerCourse {
  slug: string;
  title: string;
  instructor: string;
  rating: number;
  enrollmentCount: number;
  price: number;
  level: string;
  tags: string[];
  art: string;
  monogram: string;
}

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "เริ่มต้น",
  INTERMEDIATE: "ปานกลาง",
  ADVANCED: "ขั้นสูง",
};

const ROTATE_MS = 6000;

export function PopularCoursesBanner({ courses }: { courses: BannerCourse[] }) {
  const locale = useLocale();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = courses.length;
  const go = useCallback((i: number) => setActive(((i % total) + total) % total), [total]);
  const next = useCallback(() => go(active + 1), [active, go]);
  const prev = useCallback(() => go(active - 1), [active, go]);

  // Auto-advance — the "dynamic ตลอดเวลา" rotation
  useEffect(() => {
    if (paused || total <= 1) return;
    timerRef.current = setInterval(() => {
      setActive((a) => (a + 1) % total);
    }, ROTATE_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, total]);

  if (total === 0) return null;
  const course = courses[active];

  return (
    <section className="relative overflow-hidden bg-ink">
      {/* Animated gradient backdrop — shifts per active course */}
      <div
        key={active}
        className="absolute inset-0 opacity-90 anim-fade-in"
        style={{ background: course.art }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/55 to-transparent" />
      {/* Soft drifting glow */}
      <div
        className="absolute -top-1/3 -right-1/4 w-[60%] h-[140%] rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: course.art, animation: "drift 14s ease-in-out infinite" }}
      />

      <div
        className="relative max-w-[1200px] mx-auto px-6 lg:px-10 py-12 lg:py-16"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-12 items-center">

          {/* ── Left: course info ── */}
          <div key={`info-${active}`} className="anim-fade-up">
            {/* LIVE / popular badge */}
            <div className="flex items-center gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-white/15 backdrop-blur-sm border border-white/20">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
                </span>
                <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-white">
                  คอร์สยอดนิยม
                </span>
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.1em] uppercase text-white/70">
                <Flame size={11} className="text-amber-400" />
                อันดับ {active + 1}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {course.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="font-mono text-[10px] tracking-wide uppercase text-white/60 border border-white/15 rounded-pill px-2.5 py-0.5">
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <Link href={`/${locale}/courses/${course.slug}`}>
              <h2 className="font-display text-[34px] lg:text-[46px] text-white leading-[1.05] tracking-[-0.02em] mb-3 text-balance hover:text-amber-100 transition-colors">
                {course.title}
              </h2>
            </Link>

            {/* Instructor + meta */}
            <p className="text-[14px] text-white/75 font-thai mb-5">โดย {course.instructor}</p>

            <div className="flex flex-wrap items-center gap-5 mb-7">
              <span className="flex items-center gap-1.5 text-white">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                <span className="font-semibold tabular">{course.rating.toFixed(2)}</span>
              </span>
              <span className="flex items-center gap-1.5 text-white/80">
                <Users size={15} />
                <span className="tabular">{formatNumber(course.enrollmentCount)}</span>
                <span className="text-white/50 text-[13px]">ผู้เรียน</span>
              </span>
              <span className="font-mono text-[11px] px-2.5 py-1 rounded-pill bg-white/10 text-white/80 uppercase tracking-wider">
                {LEVEL_LABEL[course.level] ?? course.level}
              </span>
            </div>

            {/* CTA + price */}
            <div className="flex flex-wrap items-center gap-4">
              <Link href={`/${locale}/courses/${course.slug}`}>
                <span className="inline-flex items-center gap-2 px-6 py-3 rounded-pill bg-white text-ink font-medium text-[15px] btn-depth hover:bg-amber-50 transition-colors">
                  เรียนเลย <ArrowRight size={16} />
                </span>
              </Link>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-[28px] text-white tabular">฿{course.price.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* ── Right: floating art card ── */}
          <div key={`art-${active}`} className="hidden lg:block anim-scale-in">
            <Link href={`/${locale}/courses/${course.slug}`}>
              <div
                className="relative aspect-[4/3] rounded-r4 overflow-hidden shadow-2xl border border-white/20 group"
                style={{ background: course.art }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {/* Monogram */}
                <span className="absolute top-6 left-6 font-display text-[64px] text-white/90 leading-none">
                  {course.monogram}
                </span>
                {/* Bottom info chip */}
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-white/90 backdrop-blur-sm text-ink font-medium text-[13px]">
                    <TrendingUp size={13} className="text-viridian" /> มาแรง
                  </span>
                  <span className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowRight size={18} className="text-ink" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* ── Controls: dots + arrows + progress ── */}
        <div className="flex items-center justify-between mt-10 gap-4">
          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {courses.map((c, i) => (
              <button
                key={c.slug}
                onClick={() => go(i)}
                aria-label={`ไปที่คอร์ส ${i + 1}`}
                className="group/dot py-2"
              >
                <span className={`block h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? "w-8 bg-white" : "w-1.5 bg-white/35 group-hover/dot:bg-white/60"
                }`} />
              </button>
            ))}
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-2">
            <button onClick={prev} aria-label="ก่อนหน้า"
              className="w-10 h-10 rounded-full border border-white/25 flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={next} aria-label="ถัดไป"
              className="w-10 h-10 rounded-full border border-white/25 flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Auto-advance progress bar — resets each slide */}
        <div className="mt-4 h-0.5 bg-white/15 rounded-full overflow-hidden">
          <div
            key={`${active}-${paused}`}
            className="h-full bg-white/70 rounded-full"
            style={{ animation: paused ? "none" : `banner-progress ${ROTATE_MS}ms linear forwards` }}
          />
        </div>
      </div>
    </section>
  );
}
