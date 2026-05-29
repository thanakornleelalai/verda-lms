import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookOpen, Users, Star, TrendingUp, Plus, ArrowRight,
  MessageSquare, Bell, Zap, CheckCircle2, Clock, AlertCircle,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { Button } from "@/components/primitives/Button";
import { Avatar } from "@/components/primitives/Avatar";
import { MOCK_COURSES, MOCK_INSTRUCTOR } from "@/mock";
import { formatNumber, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Mock monthly revenue for demo chart
const MOCK_MONTHLY = [
  { month: "ม.ค.", revenue: 48000 },
  { month: "ก.พ.", revenue: 62000 },
  { month: "มี.ค.", revenue: 55000 },
  { month: "เม.ย.", revenue: 78000 },
  { month: "พ.ค.", revenue: 91000 },
  { month: "มิ.ย.", revenue: 84000 },
];

type CourseRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  enrollmentCount: number;
  rating: number;
  price: number;
  currency: string;
  sectionsCount: number;
  art: string | null;
  monogram: string | null;
};

type EnrollmentRow = {
  userName: string;
  courseTitle: string;
  enrolledAt: string;
  progress: number;
};

type ThreadRow = {
  id: string;
  title: string;
  courseTitle: string;
  createdAt: string;
  postsCount: number;
};

export default async function StudioDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const userId = session.user.id!;
  const instructorName = session.user.name ?? MOCK_INSTRUCTOR.name;

  let courses: CourseRow[] = [];
  let recentEnrollments: EnrollmentRow[] = [];
  let openThreads: ThreadRow[] = [];
  let totalStudents = 0;
  let totalRevenue = 0;
  let avgRating = 0;
  const monthlyRevenue = MOCK_MONTHLY;

  try {
    // Instructor's courses
    const dbCourses = await db.course.findMany({
      where: { instructorId: userId },
      select: {
        id: true, slug: true, title: true, status: true,
        enrollmentCount: true, rating: true, price: true,
        currency: true, art: true, monogram: true,
        _count: { select: { sections: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    courses = dbCourses.map((c) => ({
      id: c.id, slug: c.slug, title: c.title, status: c.status,
      enrollmentCount: c.enrollmentCount, rating: c.rating,
      price: c.price, currency: c.currency,
      sectionsCount: c._count.sections,
      art: c.art, monogram: c.monogram,
    }));

    totalStudents = courses.reduce((s, c) => s + c.enrollmentCount, 0);
    totalRevenue = courses.reduce((s, c) => s + c.price * c.enrollmentCount, 0);
    avgRating = courses.length > 0 ? courses.reduce((s, c) => s + c.rating, 0) / courses.length : 0;

    // Recent enrollments
    const enrollments = await db.enrollment.findMany({
      where: { course: { instructorId: userId } },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } },
        progress: { select: { progressPct: true } },
      },
      orderBy: { enrolledAt: "desc" },
      take: 5,
    });
    recentEnrollments = enrollments.map((e) => ({
      userName: e.user.name ?? "ผู้เรียน",
      courseTitle: e.course.title,
      enrolledAt: e.enrolledAt.toISOString().slice(0, 10),
      progress: e.progress?.progressPct ?? 0,
    }));

    // Open Q&A threads (unanswered = 0 posts)
    const threads = await db.thread.findMany({
      where: { courseId: { in: courses.map((c) => c.id) }, posts: { none: {} } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    openThreads = threads.map((t) => ({
      id: t.id,
      title: t.title,
      courseTitle: courses.find((c) => c.id === t.courseId)?.title ?? "",
      createdAt: t.createdAt.toISOString().slice(0, 10),
      postsCount: 0,
    }));
  } catch {
    // Demo fallback
    const mock = MOCK_COURSES.filter((c) => c.instructor.id === MOCK_INSTRUCTOR.id);
    courses = mock.map((c) => ({
      id: c.id, slug: c.slug, title: c.title, status: c.status,
      enrollmentCount: c.enrollmentCount, rating: c.rating,
      price: c.price, currency: c.currency,
      sectionsCount: c.sections.length,
      art: c.art ?? null, monogram: c.monogram ?? null,
    }));
    totalStudents = courses.reduce((s, c) => s + c.enrollmentCount, 0);
    totalRevenue = courses.reduce((s, c) => s + c.price * c.enrollmentCount, 0);
    avgRating = courses.length > 0 ? courses.reduce((s, c) => s + c.rating, 0) / courses.length : 0;

    const t0 = courses[0]?.title ?? "UX Design & Figma Masterclass";
    const t1 = courses[1]?.title ?? "Next.js 15 Fullstack Bootcamp";
    recentEnrollments = [
      { userName: "คุณสมชาย ทดสอบ", courseTitle: t0, enrolledAt: "2026-05-17", progress: 60 },
      { userName: "คุณสุภาพร มั่นใจ", courseTitle: t1, enrolledAt: "2026-05-16", progress: 0 },
      { userName: "คุณวิชัย เก่งมาก", courseTitle: t0, enrolledAt: "2026-05-14", progress: 100 },
      { userName: "คุณนภา สวยงาม", courseTitle: t1, enrolledAt: "2026-05-12", progress: 45 },
      { userName: "คุณปรีชา ฉลาดดี", courseTitle: t0, enrolledAt: "2026-05-10", progress: 80 },
    ];
    openThreads = [
      { id: "t1", title: "Figma Auto Layout ต่างจาก Flexbox อย่างไร?", courseTitle: t0, createdAt: "2026-05-17", postsCount: 0 },
      { id: "t2", title: "User Persona ต้องทำกี่คน?", courseTitle: t0, createdAt: "2026-05-15", postsCount: 0 },
    ];
  }

  const publishedCourses = courses.filter((c) => c.status === "PUBLISHED").length;
  const draftCourses = courses.filter((c) => c.status === "DRAFT").length;
  const chartMax = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  return (
    <div className="p-8 max-w-[1100px]">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar name={instructorName} size="lg" />
          <div>
            <EyebrowLabel className="mb-0.5">INSTRUCTOR STUDIO</EyebrowLabel>
            <h1 className="font-display text-[32px] text-ink tracking-[-0.015em] leading-tight">
              สวัสดี, <em className="not-italic text-viridian">{instructorName.split(" ")[0]}</em>
            </h1>
            <p className="text-[13px] text-ink-3 mt-0.5">
              {publishedCourses} คอร์สเผยแพร่แล้ว
              {draftCourses > 0 && ` · ${draftCourses} Draft`}
            </p>
          </div>
        </div>
        <Link href="studio/courses/new">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={15} />
            สร้างคอร์สใหม่
          </Button>
        </Link>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "COURSES", value: courses.length, icon: BookOpen, color: "text-viridian", sub: `${publishedCourses} เผยแพร่` },
          { label: "STUDENTS", value: formatNumber(totalStudents), icon: Users, color: "text-viridian", sub: "ลงทะเบียนทั้งหมด" },
          { label: "AVG RATING", value: avgRating.toFixed(2), icon: Star, color: "text-gold", sub: "คะแนนเฉลี่ย" },
          { label: "REVENUE", value: formatPrice(totalRevenue, "THB"), icon: TrendingUp, color: "text-ok", sub: "รายได้รวม" },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-paper-3 border border-line rounded-r3 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-3">{label}</p>
              <Icon size={15} className={color} />
            </div>
            <p className={`font-display text-[26px] ${color} leading-none mb-1`}>{value}</p>
            <p className="text-[11px] text-ink-4">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main 2-column grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-[1fr_320px] gap-6">

        {/* ────── LEFT ────── */}
        <div className="flex flex-col gap-6">

          {/* Revenue chart */}
          <div className="bg-paper-3 border border-line rounded-r3 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-[15px] text-ink flex items-center gap-2">
                <TrendingUp size={15} className="text-viridian" />
                รายได้รายเดือน
              </h2>
              <Link
                href={`/${locale}/studio/analytics`}
                className="font-mono text-[10px] tracking-[0.1em] uppercase text-viridian hover:underline flex items-center gap-1"
              >
                Analytics <ArrowRight size={10} />
              </Link>
            </div>
            <div className="flex items-end gap-3 h-[120px]">
              {monthlyRevenue.map((m) => {
                const barH = Math.max((m.revenue / chartMax) * 96, 4);
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                    <p className="font-mono text-[9px] text-ink-3">
                      {(m.revenue / 1000).toFixed(0)}K
                    </p>
                    <div className="w-full flex flex-col justify-end" style={{ height: "96px" }}>
                      <div
                        className="w-full bg-viridian/80 hover:bg-viridian rounded-t transition-colors cursor-default"
                        style={{ height: `${barH}px` }}
                        title={formatPrice(m.revenue, "THB")}
                      />
                    </div>
                    <p className="font-mono text-[9px] text-ink-4">{m.month}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Course list */}
          <div className="bg-paper-3 border border-line rounded-r3 overflow-hidden">
            <div className="px-5 py-3 border-b border-line bg-paper-2 flex items-center justify-between">
              <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">คอร์สของฉัน</p>
              <Link
                href={`/${locale}/studio/courses`}
                className="font-mono text-[10px] tracking-[0.1em] uppercase text-viridian hover:underline"
              >
                ดูทั้งหมด →
              </Link>
            </div>
            {courses.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[14px] text-ink-3 mb-3">ยังไม่มีคอร์ส</p>
                <Link href={`/${locale}/studio/courses/new`}>
                  <Button variant="primary" size="sm">
                    <Plus size={13} className="mr-1.5" /> สร้างคอร์สแรก
                  </Button>
                </Link>
              </div>
            ) : (
              <table className="w-full text-[14px]">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-left px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">คอร์ส</th>
                    <th className="text-right px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">นักเรียน</th>
                    <th className="text-right px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">คะแนน</th>
                    <th className="text-right px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">รายได้</th>
                    <th className="text-center px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.slice(0, 5).map((course) => (
                    <tr key={course.id} className="border-b border-line last:border-0 hover:bg-paper-2 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/${locale}/studio/courses/${course.slug}/edit`}
                          className="font-medium text-ink hover:text-viridian transition-colors line-clamp-1"
                        >
                          {course.title}
                        </Link>
                        <p className="text-[11px] text-ink-4 mt-0.5">{course.sectionsCount} หัวข้อ</p>
                      </td>
                      <td className="px-5 py-3.5 text-right text-ink-2">{formatNumber(course.enrollmentCount)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-gold">★</span>{" "}
                        <span className="text-ink">{course.rating.toFixed(1)}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-[12px] text-ink">
                        {formatPrice(course.price * course.enrollmentCount, course.currency)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`font-mono text-[9px] px-2 py-0.5 rounded-pill tracking-wide uppercase ${
                            course.status === "PUBLISHED"
                              ? "bg-ok/10 text-ok"
                              : course.status === "DRAFT"
                              ? "bg-warn/10 text-warn"
                              : "bg-line text-ink-3"
                          }`}
                        >
                          {course.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ────── RIGHT sidebar ────── */}
        <div className="flex flex-col gap-5">

          {/* Quick actions */}
          <div className="bg-paper-3 border border-line rounded-r3 p-5">
            <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-3 mb-3">Quick Actions</p>
            <div className="flex flex-col gap-2">
              <Link
                href={`/${locale}/studio/courses/new`}
                className="flex items-center gap-2.5 px-3.5 py-2.5 bg-viridian text-white text-[13px] font-medium rounded-r2 hover:bg-viridian-2 transition-colors"
              >
                <Plus size={14} /> สร้างคอร์สใหม่
              </Link>
              <Link
                href={`/${locale}/studio/analytics`}
                className="flex items-center gap-2.5 px-3.5 py-2.5 border border-line text-ink-2 text-[13px] rounded-r2 hover:border-viridian-3 hover:text-ink transition-colors"
              >
                <TrendingUp size={14} className="text-viridian" /> ดู Analytics
              </Link>
              <Link
                href={`/${locale}/studio/students`}
                className="flex items-center gap-2.5 px-3.5 py-2.5 border border-line text-ink-2 text-[13px] rounded-r2 hover:border-viridian-3 hover:text-ink transition-colors"
              >
                <Users size={14} className="text-viridian" /> จัดการผู้เรียน
              </Link>
            </div>
          </div>

          {/* Recent enrollments */}
          <div className="bg-paper-3 border border-line rounded-r3 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[14px] text-ink flex items-center gap-1.5">
                <Zap size={13} className="text-viridian" />
                ลงทะเบียนล่าสุด
              </h3>
            </div>
            {recentEnrollments.length === 0 ? (
              <p className="text-[12px] text-ink-4 text-center py-4">ยังไม่มีผู้ลงทะเบียน</p>
            ) : (
              <div className="flex flex-col gap-3">
                {recentEnrollments.map((e, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Avatar name={e.userName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-ink truncate">{e.userName}</p>
                      <p className="text-[10px] text-ink-4 truncate">{e.courseTitle}</p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      {e.progress === 100 ? (
                        <CheckCircle2 size={12} className="text-ok" />
                      ) : e.progress > 0 ? (
                        <Clock size={12} className="text-viridian" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-line block" />
                      )}
                      <span className="font-mono text-[9px] text-ink-4">{e.enrolledAt.slice(5)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Open Q&A threads */}
          <div className="bg-paper-3 border border-line rounded-r3 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[14px] text-ink flex items-center gap-1.5">
                <MessageSquare size={13} className="text-amber-500" />
                Q&amp;A รอตอบ
              </h3>
              {openThreads.length > 0 && (
                <span className="font-mono text-[9px] bg-amber-400/15 text-amber-600 px-2 py-0.5 rounded-pill">
                  {openThreads.length}
                </span>
              )}
            </div>
            {openThreads.length === 0 ? (
              <div className="flex items-center gap-2 text-ok text-[12px]">
                <CheckCircle2 size={13} />
                ตอบคำถามครบแล้ว!
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {openThreads.map((t) => (
                  <div key={t.id} className="flex items-start gap-2">
                    <AlertCircle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[12px] text-ink line-clamp-2 leading-snug">{t.title}</p>
                      <p className="text-[10px] text-ink-4 mt-0.5">{t.courseTitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notification badge */}
          <div className="flex items-center gap-3 p-4 bg-viridian-wash border border-viridian-tint rounded-r3">
            <Bell size={15} className="text-viridian shrink-0" />
            <p className="text-[12px] text-ink-2 leading-snug">
              ตั้งค่าการแจ้งเตือนใน{" "}
              <Link href={`/${locale}/studio/settings`} className="text-viridian font-medium hover:underline">
                Studio Settings
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
