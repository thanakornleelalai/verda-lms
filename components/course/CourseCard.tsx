"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { Star, Heart, Users } from "lucide-react";
import { cn, formatPrice, formatNumber } from "@/lib/utils";
import type { Course } from "@/types";
import { Tag } from "@/components/primitives/Tag";
import { CourseThumbnail } from "./CourseThumbnail";
import { useWishlist } from "@/lib/wishlist";

interface CourseCardProps {
  course: Course;
  className?: string;
  showBadge?: "hot" | "new" | "bestseller";
  /** Stagger index for the fade-in-up animation delay */
  index?: number;
}

export function CourseCard({ course, className, showBadge, index = 0 }: CourseCardProps) {
  const locale = useLocale();
  const { has, toggle } = useWishlist();
  const wishlisted = has(course.slug);

  // Cap the stagger delay at 7 cards so late items don't wait too long
  const delayMs = Math.min(index, 7) * 75;

  return (
    <div
      className={cn("group relative animate-fade-in-up", className)}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <Link
        href={`/${locale}/courses/${course.slug}`}
        className={cn(
          // Named group for scoped hover selectors inside (image zoom etc.)
          "group/card",
          "flex flex-col bg-paper-3 border border-line rounded-r3 overflow-hidden",
          // Smooth cubic-bezier on all properties
          "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          // Lift + glow shadow + border dissolve on hover
          "hover:-translate-y-2",
          "hover:shadow-card-hover",
          "hover:border-transparent"
        )}
      >
        {/* ── Thumbnail ─────────────────────────────────────────────── */}
        <div className="relative overflow-hidden">
          <CourseThumbnail
            title={course.title}
            monogram={course.monogram}
            art={course.art}
            thumbnail={course.thumbnail}
            zoom
          />

          {/* Dark overlay fade on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/10 transition-all duration-300 z-10 pointer-events-none" />

          {/* Hot / New / Bestseller badge — top-left */}
          {showBadge && (
            <div className="absolute top-3 left-3 z-20">
              <Tag variant={showBadge === "hot" ? "hot" : showBadge === "new" ? "new" : "gold"}>
                {showBadge === "hot" ? "HOT" : showBadge === "new" ? "NEW" : "BESTSELLER"}
              </Tag>
            </div>
          )}

          {/* Category chip — bottom-left */}
          <div className="absolute bottom-3 left-3 z-20">
            <span className="font-mono text-[9.5px] tracking-[0.12em] uppercase text-white/90 bg-black/35 backdrop-blur-md px-2 py-1 rounded-r1 border border-white/10">
              {course.tags?.[0] ?? "คอร์ส"}
            </span>
          </div>
        </div>

        {/* ── Meta ──────────────────────────────────────────────────── */}
        <div className="p-[18px] flex flex-col gap-2 flex-1">

          {/* Category label (text, above title) */}
          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-viridian leading-none">
            {course.tags?.[0] ?? "คอร์ส"}
          </p>

          {/* Course title — max 2 lines */}
          <h3 className="text-[15.5px] font-semibold leading-[1.35] tracking-[-0.01em] text-ink line-clamp-2 min-h-[42px]">
            {course.title}
          </h3>

          {/* Instructor */}
          <div className="flex items-center gap-2 text-[12px] text-ink-3 mt-0.5">
            {/* Small avatar circle with initials */}
            <span className="w-5 h-5 rounded-full bg-viridian/15 flex items-center justify-center font-mono text-[9px] text-viridian font-semibold shrink-0 uppercase">
              {course.instructor?.name?.[0] ?? "?"}
            </span>
            <span className="truncate">{course.instructor?.name ?? "ผู้สอน"}</span>
          </div>

          {/* Rating row */}
          <div className="flex items-center gap-2 text-[12px] text-ink-3">
            {/* Stars */}
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  className={
                    i < Math.round(course.rating)
                      ? "fill-gold text-gold"
                      : "fill-paper-2 text-line"
                  }
                />
              ))}
            </span>
            <span className="font-semibold text-ink">{course.rating.toFixed(1)}</span>
            <span className="text-ink-4">({formatNumber(course.ratingCount)})</span>
          </div>

          {/* Enrollment count */}
          <div className="flex items-center gap-1.5 text-[11.5px] text-ink-4">
            <Users size={11} className="shrink-0" />
            <span>{formatNumber(course.enrollmentCount)} ผู้เรียน</span>
          </div>

          {/* Price row */}
          <div className="mt-auto pt-3 border-t border-dashed border-line flex items-center justify-between gap-2">
            <span className="font-display text-[22px] leading-none text-viridian">
              {formatPrice(course.price, course.currency)}
            </span>
            <span className={cn(
              "font-mono text-[9px] uppercase tracking-wider px-2 py-1 rounded-r1",
              course.level === "BEGINNER"
                ? "bg-ok/10 text-ok"
                : course.level === "INTERMEDIATE"
                  ? "bg-warn/10 text-warn"
                  : "bg-danger/10 text-danger"
            )}>
              {course.level === "BEGINNER" ? "เริ่มต้น" : course.level === "INTERMEDIATE" ? "กลาง" : "สูง"}
            </span>
          </div>
        </div>
      </Link>

      {/* ── Wishlist button ────────────────────────────────────────── */}
      {/* Sibling of Link so it doesn't trigger Link navigation */}
      <button
        onClick={() => toggle(course.slug)}
        aria-label={wishlisted ? "นำออกจาก Wishlist" : "บันทึกใน Wishlist"}
        className={cn(
          "absolute top-3 right-3 z-30",
          "w-8 h-8 rounded-full flex items-center justify-center",
          "bg-white/90 backdrop-blur-sm shadow-sm border border-white/50",
          "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
          "hover:scale-110 active:scale-90",
          wishlisted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <Heart
          size={14}
          strokeWidth={2}
          className={cn(
            "transition-colors duration-150",
            wishlisted ? "fill-red-500 text-red-500" : "text-ink-3"
          )}
        />
      </button>
    </div>
  );
}
