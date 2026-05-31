"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { SlidersHorizontal, CheckCircle, XCircle, Clock, Ban, RotateCcw } from "lucide-react";
import { CourseThumbnail } from "@/components/course/CourseThumbnail";
import { formatNumber, formatPrice } from "@/lib/utils";
import { approveCourse, rejectCourse, setCourseSuspended } from "@/actions/admin";

export type CourseRow = {
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

const STATUS_LABELS: Record<string, string> = {
  PUBLISHED: "เผยแพร่แล้ว",
  DRAFT: "Draft",
  REVIEW: "รอตรวจสอบ",
  ARCHIVED: "เก็บถาวร",
};

export function CourseListClient({
  initialCourses,
  locale,
  statusFilter,
}: {
  initialCourses: CourseRow[];
  locale: string;
  statusFilter: string;
}) {
  const [courses, setCourses] = useState(initialCourses);
  const [isPending, startTransition] = useTransition();
  const [alert, setAlert] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  function notify(type: "ok" | "err", msg: string) {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3500);
  }

  function handleApprove(id: string, title: string) {
    startTransition(async () => {
      const res = await approveCourse(id);
      if (res.success) {
        setCourses((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: "PUBLISHED" } : c))
        );
        notify("ok", `อนุมัติ "${title}" แล้ว — เผยแพร่สู่สาธารณะ`);
      } else {
        notify("err", res.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  function handleReject(id: string, title: string) {
    startTransition(async () => {
      const res = await rejectCourse(id);
      if (res.success) {
        setCourses((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: "DRAFT" } : c))
        );
        notify("ok", `ส่งคืน "${title}" ให้ผู้สอนแก้ไขแล้ว`);
      } else {
        notify("err", res.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  function handleSuspend(id: string, title: string, suspend: boolean) {
    if (suspend && !confirm(`ระงับการแสดงคอร์ส "${title}"?\n\nคอร์สจะถูกซ่อนจากหน้าเว็บไซต์สาธารณะ`)) return;
    startTransition(async () => {
      const res = await setCourseSuspended(id, suspend);
      if (res.success) {
        setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, status: suspend ? "ARCHIVED" : "PUBLISHED" } : c)));
        notify("ok", suspend ? `ระงับการแสดง "${title}" แล้ว` : `เปิดแสดง "${title}" อีกครั้งแล้ว`);
      } else {
        notify("err", res.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  const filtered = statusFilter
    ? courses.filter((c) => c.status === statusFilter)
    : courses;

  return (
    <>
      {alert && (
        <div
          className={`flex items-center gap-2 text-[13px] rounded-r2 px-4 py-2.5 mb-4 ${
            alert.type === "ok"
              ? "bg-ok/10 border border-ok/20 text-ok"
              : "bg-danger/5 border border-danger/20 text-danger"
          }`}
        >
          {alert.type === "ok" ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {alert.msg}
        </div>
      )}

      <div className="bg-paper-3 border border-line rounded-r3 overflow-hidden">
        <div className="px-5 py-3 border-b border-line bg-paper-2">
          <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">
            {statusFilter ? `${statusFilter} ` : ""}คอร์ส ({filtered.length} รายการที่แสดง)
          </p>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-ink-3 text-[14px]">ไม่มีคอร์สในหมวดนี้</div>
        )}

        <div className="divide-y divide-line">
          {filtered.map((course) => (
            <div
              key={course.id}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-paper-2 transition-colors ${
                course.status === "REVIEW" ? "bg-sky-50/40" : ""
              }`}
            >
              <div className="w-[80px] shrink-0 rounded-r2 overflow-hidden">
                <CourseThumbnail
                  title={course.title}
                  monogram={course.monogram ?? undefined}
                  art={course.art ?? undefined}
                  aspectRatio="16/9"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-medium text-[14px] text-ink truncate">{course.title}</h3>
                  {course.status === "REVIEW" && (
                    <span className="shrink-0 flex items-center gap-1 font-mono text-[9px] bg-sky-100 text-sky-600 px-2 py-0.5 rounded-pill uppercase">
                      <Clock size={9} /> รอตรวจสอบ
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-ink-3 mt-0.5">{course.instructorName}</p>
                <div className="flex items-center gap-4 mt-2 text-[12px] text-ink-3">
                  <span>
                    <strong className="text-ink">{formatNumber(course.enrollmentCount)}</strong> นักเรียน
                  </span>
                  <span>
                    <strong className="text-ink">{course.rating.toFixed(1)}</strong> ⭐
                  </span>
                  <span>
                    <strong className="text-ink">{formatPrice(course.price, course.currency)}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`font-mono text-[10px] px-2 py-0.5 rounded-pill uppercase tracking-wide ${
                    STATUS_COLORS[course.status] ?? "bg-line text-ink-3"
                  }`}
                >
                  {STATUS_LABELS[course.status] ?? course.status}
                </span>
                <span className="font-mono text-[10px] text-ink-4 hidden md:inline">
                  {course.updatedAt}
                </span>

                {/* Approve / Reject — shown only for REVIEW courses */}
                {course.status === "REVIEW" && (
                  <>
                    <button
                      onClick={() => handleReject(course.id, course.title)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-r2 text-[12px] border border-line text-ink-3 hover:border-danger hover:text-danger transition-colors disabled:opacity-40"
                      title="ส่งคืนให้ผู้สอนแก้ไข"
                    >
                      <XCircle size={13} /> ส่งคืน
                    </button>
                    <button
                      onClick={() => handleApprove(course.id, course.title)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-r2 text-[12px] bg-ok text-white hover:bg-ok/90 transition-colors disabled:opacity-40"
                      title="อนุมัติและเผยแพร่"
                    >
                      <CheckCircle size={13} /> อนุมัติ
                    </button>
                  </>
                )}

                {/* Suspend — for PUBLISHED courses (ระงับการแสดงคอร์ส) */}
                {course.status === "PUBLISHED" && (
                  <button
                    onClick={() => handleSuspend(course.id, course.title, true)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-r2 text-[12px] border border-line text-ink-3 hover:border-danger hover:text-danger transition-colors disabled:opacity-40"
                    title="ระงับการแสดงคอร์สจากหน้าเว็บไซต์"
                  >
                    <Ban size={13} /> ระงับ
                  </button>
                )}

                {/* Restore — for ARCHIVED (suspended) courses */}
                {course.status === "ARCHIVED" && (
                  <button
                    onClick={() => handleSuspend(course.id, course.title, false)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-r2 text-[12px] border border-ok/30 text-ok hover:bg-ok/10 transition-colors disabled:opacity-40"
                    title="เปิดแสดงคอร์สอีกครั้ง"
                  >
                    <RotateCcw size={13} /> เปิดแสดง
                  </button>
                )}

                <Link
                  href={`/${locale}/studio/courses/${course.slug}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-[12px] border border-line text-ink-2 hover:border-viridian hover:text-viridian transition-colors"
                  title="จัดการบทเรียนและเนื้อหา"
                >
                  <SlidersHorizontal size={13} />
                  จัดการบทเรียน
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
