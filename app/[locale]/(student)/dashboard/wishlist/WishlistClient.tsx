"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { Heart, Trash2, ArrowRight, Star, Users, ShoppingCart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist";
import { CourseThumbnail } from "@/components/course/CourseThumbnail";
import { Button } from "@/components/primitives/Button";
import { formatPrice, formatNumber } from "@/lib/utils";

export interface WishlistCourse {
  slug: string;
  title: string;
  instructor: string;
  rating: number;
  ratingCount: number;
  enrollmentCount: number;
  price: number;
  currency: string;
  level: string;
  art: string;
  monogram: string;
  tag: string;
}

const LEVEL: Record<string, string> = { BEGINNER: "เริ่มต้น", INTERMEDIATE: "กลาง", ADVANCED: "สูง" };

export function WishlistClient({ allCourses }: { allCourses: WishlistCourse[] }) {
  const locale = useLocale();
  const { items, remove, clear } = useWishlist();

  const saved = allCourses.filter((c) => items.includes(c.slug));

  if (saved.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <Heart size={28} className="text-red-300" />
        </div>
        <p className="text-[18px] text-ink-2 mb-2">ยังไม่มีคอร์สที่ถูกใจ</p>
        <p className="text-[14px] text-ink-4 mb-6 font-thai">
          กดรูปหัวใจ ♡ ที่คอร์สใดก็ได้ เพื่อบันทึกไว้ลงทะเบียนเรียนภายหลัง
        </p>
        <Link href={`/${locale}/courses`}>
          <Button variant="primary" className="gap-2">เลือกดูคอร์ส <ArrowRight size={15} /></Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[14px] text-ink-3 font-thai">
          มี <span className="font-semibold text-ink tabular">{saved.length}</span> คอร์สที่ถูกใจ
        </p>
        <button onClick={clear} className="text-[13px] text-ink-4 hover:text-danger transition-colors flex items-center gap-1.5">
          <Trash2 size={13} /> ล้างทั้งหมด
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {saved.map((course) => (
          <div key={course.slug} className="card-interactive bg-paper-3 border border-line rounded-r3 overflow-hidden flex flex-col sm:flex-row gap-4 p-4">
            {/* Thumbnail */}
            <Link href={`/${locale}/courses/${course.slug}`} className="w-full sm:w-[180px] shrink-0 rounded-r2 overflow-hidden">
              <CourseThumbnail title={course.title} monogram={course.monogram} art={course.art} aspectRatio="16/9" />
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col">
              <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-viridian mb-1">{course.tag}</p>
              <Link href={`/${locale}/courses/${course.slug}`}>
                <h3 className="font-semibold text-[16px] text-ink leading-snug hover:text-viridian transition-colors line-clamp-2">
                  {course.title}
                </h3>
              </Link>
              <p className="text-[12px] text-ink-3 mt-1">{course.instructor}</p>
              <div className="flex items-center gap-4 mt-2 text-[12px] text-ink-3">
                <span className="flex items-center gap-1">
                  <Star size={12} className="fill-gold text-gold" />
                  <span className="tabular font-medium text-ink">{course.rating.toFixed(1)}</span>
                  <span className="text-ink-4">({formatNumber(course.ratingCount)})</span>
                </span>
                <span className="flex items-center gap-1">
                  <Users size={12} /><span className="tabular">{formatNumber(course.enrollmentCount)}</span>
                </span>
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-paper-2 text-ink-3">{LEVEL[course.level] ?? course.level}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
              <span className="font-display text-[22px] text-viridian leading-none tabular">
                {formatPrice(course.price, course.currency)}
              </span>
              <div className="flex items-center gap-2">
                <Link href={`/${locale}/cart?course=${course.slug}`}>
                  <Button variant="primary" size="sm" className="gap-1.5">
                    <ShoppingCart size={14} /> ลงทะเบียน
                  </Button>
                </Link>
                <button
                  onClick={() => remove(course.slug)}
                  aria-label="นำออก"
                  className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-ink-4 hover:text-danger hover:border-danger/30 transition-colors"
                >
                  <Heart size={15} className="fill-red-500 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
