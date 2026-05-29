import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  Flame, Trophy, BookOpen, CheckCircle2, Clock, ArrowRight,
  Activity, ClipboardCheck, Zap, Play, Star, Medal,
} from "lucide-react";

import { CertificateDownloadButton } from "@/components/dashboard/CertificateDownloadButton";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Container } from "@/components/layout/Container";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { CourseThumbnail } from "@/components/course/CourseThumbnail";
import { MOCK_ENROLLMENTS } from "@/mock";

export const dynamic = "force-dynamic";

/** SVG circular progress ring — server-renderable */
function ProgressRing({ pct, size = 52 }: { pct: number; size?: number }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct === 100 ? "#16a34a" : "#2D6A4F";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E8EDE8" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });

  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const userId = session.user.id;
  const userName = session.user.name ?? "นักเรียน";
  const firstName = userName.split(" ")[0];

  let enrollments: typeof MOCK_ENROLLMENTS = [];
  let streak = 0;
  let recentActivity: Array<{
    lessonId: string; courseId: string; eventType: string;
    createdAt: string; lessonTitle?: string; courseTitle?: string;
  }> = [];
  let certificates: Array<{ id: string; courseId: string; courseTitle: string; issuedAt: string }> = [];
  let recentAttempts: Array<{
    id: string; score: number | null; passed: boolean | null;
    submittedAt: string | null; quizTitle: string; courseTitle: string;
  }> = [];
  let xpPoints = 0;
  let weekActivity: number[] = [0, 0, 0, 0, 0, 0, 0];

  try {
    const dbEnrollments = await db.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: { select: { id: true, name: true, image: true } },
            sections: {
              orderBy: { order: "asc" },
              include: { lessons: { orderBy: { order: "asc" } } },
            },
          },
        },
        progress: { select: { progressPct: true, lastLesson: true } },
      },
      orderBy: { enrolledAt: "desc" },
    });

    enrollments = dbEnrollments.map((e) => ({
      id: e.id,
      userId: e.userId,
      courseId: e.courseId,
      enrolledAt: e.enrolledAt.toISOString(),
      progress: e.progress?.progressPct ?? 0,
      lastLessonId: e.progress?.lastLesson ?? undefined,
      course: {
        id: e.course.id,
        tenantId: e.course.tenantId ?? "default",
        slug: e.course.slug,
        title: e.course.title,
        description: e.course.description ?? undefined,
        thumbnail: e.course.thumbnail ?? undefined,
        status: e.course.status as "PUBLISHED",
        price: e.course.price,
        currency: e.course.currency,
        level: e.course.level as "BEGINNER",
        language: e.course.language,
        instructorId: e.course.instructorId,
        instructor: {
          id: e.course.instructor.id,
          name: e.course.instructor.name ?? "Instructor",
          avatarUrl: e.course.instructor.image ?? undefined,
        },
        sections: e.course.sections.map((s) => ({
          id: s.id,
          courseId: s.courseId,
          title: s.title,
          order: s.order,
          lessons: s.lessons.map((l) => ({
            id: l.id,
            sectionId: l.sectionId,
            title: l.title,
            order: l.order,
            type: l.type as "VIDEO",
            duration: l.duration ?? undefined,
            isFree: l.isFree,
          })),
        })),
        totalDuration: e.course.totalDuration,
        enrollmentCount: e.course.enrollmentCount,
        rating: e.course.rating,
        ratingCount: e.course.ratingCount,
        tags: e.course.tags,
        updatedAt: e.course.updatedAt.toISOString(),
        art: e.course.art ?? undefined,
        monogram: e.course.monogram ?? undefined,
      },
    }));

    const recentStreaks = await db.streakRecord.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 30,
    });
    if (recentStreaks.length > 0) {
      let consecutive = 0;
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      for (let i = 0; i < recentStreaks.length; i++) {
        const expected = new Date(now);
        expected.setDate(expected.getDate() - i);
        const recordDay = new Date(recentStreaks[i].date);
        recordDay.setHours(0, 0, 0, 0);
        if (recordDay.getTime() === expected.getTime()) consecutive++;
        else break;
      }
      streak = consecutive;
    }

    const events = await db.progressEvent.findMany({
      where: { userId, eventType: "COMPLETE" },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
    recentActivity = events.map((ev) => {
      const enrollment = enrollments.find((e) => e.courseId === ev.courseId);
      const lesson = enrollment?.course.sections
        .flatMap((s) => s.lessons)
        .find((l) => l.id === ev.lessonId);
      return {
        lessonId: ev.lessonId,
        courseId: ev.courseId,
        eventType: ev.eventType,
        createdAt: ev.createdAt.toISOString(),
        lessonTitle: lesson?.title,
        courseTitle: enrollment?.course.title,
      };
    });

    const certs = await db.certificate.findMany({
      where: { userId },
      include: { course: { select: { title: true } } },
      orderBy: { issuedAt: "desc" },
    });
    certificates = certs.map((c) => ({
      id: c.id,
      courseId: c.courseId,
      courseTitle: c.course.title,
      issuedAt: c.issuedAt.toISOString(),
    }));

    const attempts = await db.attempt.findMany({
      where: { userId, submittedAt: { not: null } },
      orderBy: { submittedAt: "desc" },
      take: 4,
      include: {
        quiz: {
          select: {
            title: true,
            lesson: { select: { section: { select: { course: { select: { title: true } } } } } },
          },
        },
      },
    });
    recentAttempts = attempts.map((a) => ({
      id: a.id,
      score: a.score ?? null,
      passed: a.passed ?? null,
      submittedAt: a.submittedAt?.toISOString() ?? null,
      quizTitle: a.quiz.title,
      courseTitle: a.quiz.lesson?.section?.course?.title ?? "คอร์ส",
    }));

    const userPoints = await db.userPoints.findFirst({ where: { userId } });
    xpPoints = userPoints?.total ?? 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const weekEvents = await db.progressEvent.findMany({
      where: { userId, createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    });
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    weekActivity = [0, 0, 0, 0, 0, 0, 0];
    for (const ev of weekEvents) {
      const evDay = new Date(ev.createdAt);
      evDay.setHours(0, 0, 0, 0);
      const diff = Math.round((todayMidnight.getTime() - evDay.getTime()) / 86400000);
      if (diff >= 0 && diff <= 6) weekActivity[6 - diff]++;
    }
  } catch {
    // Mock fallback — demo mode
    enrollments = MOCK_ENROLLMENTS;
    streak = 7;
    weekActivity = [2, 0, 4, 1, 5, 3, 2];
    xpPoints = 480;
    certificates = [
      {
        id: "cert_fp_001",
        courseId: "crs_006",
        courseTitle: "Financial Planning for Freelancers",
        issuedAt: "2026-01-10T00:00:00Z",
      },
    ];
    recentAttempts = [
      {
        id: "a1", score: 85, passed: true,
        submittedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        quizTitle: "ทดสอบ: UX Research & Figma Basics",
        courseTitle: "UX Design & Figma Masterclass",
      },
      {
        id: "a2", score: 62, passed: false,
        submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        quizTitle: "JavaScript Fundamentals Quiz",
        courseTitle: "Next.js 15 Fullstack Bootcamp",
      },
    ];
    recentActivity = [
      {
        lessonId: "les_001_1_2", courseId: "crs_001", eventType: "COMPLETE",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        lessonTitle: "UX vs UI vs Product Design",
        courseTitle: "UX Design & Figma Masterclass",
      },
      {
        lessonId: "les_001_1_1", courseId: "crs_001", eventType: "COMPLETE",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        lessonTitle: "ยินดีต้อนรับ + ภาพรวมคอร์ส",
        courseTitle: "UX Design & Figma Masterclass",
      },
      {
        lessonId: "les_002_1_1", courseId: "crs_002", eventType: "COMPLETE",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        lessonTitle: "App Router vs Pages Router",
        courseTitle: "Next.js 15 Fullstack Bootcamp",
      },
    ];
  }

  const completedCount = enrollments.filter((e) => e.progress === 100).length;
  const inProgressCount = enrollments.filter((e) => e.progress > 0 && e.progress < 100).length;

  // Most recent in-progress course for the hero card
  const heroEnrollment = enrollments.find((e) => e.progress > 0 && e.progress < 100)
    ?? enrollments[0];

  // Day labels for chart (last 7 days ending today)
  const DAY_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  const today = new Date();
  const chartLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return { label: DAY_TH[d.getDay()], isToday: i === 6 };
  });
  const chartMax = Math.max(...weekActivity, 1);
  const totalWeekLessons = weekActivity.reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main>
        {/* ── Welcome header strip ── */}
        <div className="bg-paper-3 border-b border-line">
          <Container className="py-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <EyebrowLabel className="mb-1">— LEARNER DASHBOARD</EyebrowLabel>
                <h1 className="font-display text-[34px] tracking-[-0.015em] text-ink leading-tight">
                  ยินดีต้อนรับกลับมา,{" "}
                  <em className="not-italic text-viridian">{firstName}</em>
                </h1>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* XP Badge */}
                <div className="flex flex-col items-center bg-[#FFFBEB] border border-[#FDE68A] rounded-r3 px-5 py-3 min-w-[72px] text-center">
                  <Zap size={15} className="text-amber-500 mb-1" />
                  <span className="font-display text-[22px] leading-none text-amber-700">{xpPoints.toLocaleString()}</span>
                  <span className="font-mono text-[9px] text-amber-500 uppercase tracking-[0.12em] mt-1">XP</span>
                </div>
                {/* Streak Badge */}
                {streak > 0 && (
                  <div className="flex flex-col items-center bg-[#FFF7ED] border border-[#FED7AA] rounded-r3 px-5 py-3 min-w-[72px] text-center">
                    <Flame size={15} className="text-orange-500 mb-1" />
                    <span className="font-display text-[22px] leading-none text-orange-600">{streak}</span>
                    <span className="font-mono text-[9px] text-orange-500 uppercase tracking-[0.12em] mt-1">วันติดต่อ</span>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </div>

        <Container className="py-8">

          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                icon: <BookOpen size={18} />,
                value: enrollments.length,
                label: "คอร์สทั้งหมด",
                sub: "ที่ลงทะเบียน",
                color: "bg-viridian-wash border-viridian-tint text-viridian",
              },
              {
                icon: <Clock size={18} />,
                value: inProgressCount,
                label: "กำลังเรียน",
                sub: "คอร์สที่ยังไม่จบ",
                color: "bg-paper-2 border-line text-ink-2",
              },
              {
                icon: <CheckCircle2 size={18} />,
                value: completedCount,
                label: "สำเร็จแล้ว",
                sub: "คอร์สที่เรียนจบ",
                color: "bg-[#F0FDF4] border-[#BBF7D0] text-ok",
              },
              {
                icon: <Star size={18} />,
                value: `${totalWeekLessons} บท`,
                label: "สัปดาห์นี้",
                sub: "บทเรียนที่เรียนจบ",
                color: "bg-[#EFF6FF] border-[#BFDBFE] text-blue-600",
              },
            ].map(({ icon, value, label, sub, color }) => (
              <div key={label} className={`border rounded-r3 px-5 py-4 flex items-center gap-3.5 ${color}`}>
                <div className="opacity-70">{icon}</div>
                <div>
                  <div className="font-display text-[28px] leading-none">{value}</div>
                  <div className="font-semibold text-[13px] mt-1">{label}</div>
                  <div className="text-[11px] opacity-60 mt-0.5">{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── "Continue Learning" hero card ── */}
          {heroEnrollment && heroEnrollment.progress < 100 && (
            <section className="mb-8">
              <div className="relative bg-ink rounded-r4 overflow-hidden flex items-center gap-0">
                {/* Decorative gradient overlay */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{ background: heroEnrollment.course.art ?? "linear-gradient(135deg, #0F5D4A, #1A7A60)" }}
                />
                {/* Thumbnail strip */}
                <div className="relative w-[200px] shrink-0 self-stretch min-h-[140px]">
                  <CourseThumbnail
                    title={heroEnrollment.course.title}
                    monogram={heroEnrollment.course.monogram}
                    art={heroEnrollment.course.art}
                    aspectRatio="16/9"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink/80" />
                </div>

                {/* Content */}
                <div className="relative flex-1 px-7 py-6">
                  <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-viridian mb-1.5">
                    เรียนต่อล่าสุด
                  </p>
                  <h2 className="font-display text-[22px] text-white leading-[1.25] mb-1">
                    {heroEnrollment.course.title}
                  </h2>
                  <p className="text-[13px] text-[#8A938E] mb-4">
                    {heroEnrollment.course.instructor.name}
                  </p>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-viridian rounded-full"
                        style={{ width: `${heroEnrollment.progress}%` }}
                      />
                    </div>
                    <span className="font-mono text-[12px] text-white/50 shrink-0">
                      {heroEnrollment.progress}%
                    </span>
                  </div>

                  <Link
                    href={`/${locale}/learn/${heroEnrollment.course.slug}/${
                      heroEnrollment.lastLessonId ??
                      heroEnrollment.course.sections[0]?.lessons[0]?.id ?? ""
                    }`}
                    className="inline-flex items-center gap-2 bg-viridian hover:bg-viridian-2 text-white font-medium text-[14px] px-5 py-2.5 rounded-pill transition-colors"
                  >
                    <Play size={14} />
                    เรียนต่อ
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* ── Main 2-column grid ── */}
          <div className="grid grid-cols-[1fr_300px] gap-8">

            {/* ───── LEFT: My Courses ───── */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-[18px] text-ink flex items-center gap-2">
                  <BookOpen size={17} className="text-viridian" />
                  {t("myCourses")}
                </h2>
                <Link
                  href={`/${locale}/courses`}
                  className="font-mono text-[11px] tracking-[0.1em] uppercase text-viridian hover:text-viridian-2 flex items-center gap-1"
                >
                  เพิ่มคอร์ส <ArrowRight size={12} />
                </Link>
              </div>

              {enrollments.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-line rounded-r3 text-ink-3">
                  <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="text-[15px]">ยังไม่ได้ลงทะเบียนคอร์สใดเลย</p>
                  <Link href={`/${locale}/courses`} className="mt-3 inline-block text-viridian text-[14px] hover:underline">
                    ดูคอร์สทั้งหมด →
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {enrollments.map((enrollment) => {
                    const { course, progress, lastLessonId } = enrollment;
                    const allLessons = course.sections.flatMap((s) => s.lessons);
                    const totalLessons = allLessons.length;
                    const doneLessons = Math.round((progress / 100) * totalLessons);
                    const continueUrl = `/${locale}/learn/${course.slug}/${
                      lastLessonId ?? allLessons[0]?.id ?? ""
                    }`;
                    const cert = certificates.find((c) => c.courseId === course.id);

                    return (
                      <div
                        key={enrollment.id}
                        className={`bg-paper-3 border rounded-r3 p-5 flex gap-5 transition-colors hover:border-viridian-3 ${
                          progress === 100 ? "border-[#BBF7D0]" : "border-line"
                        }`}
                      >
                        {/* Thumbnail with progress ring */}
                        <div className="relative shrink-0 w-[96px] h-[96px]">
                          <div className="w-full h-full rounded-r2 overflow-hidden">
                            <CourseThumbnail
                              title={course.title}
                              monogram={course.monogram}
                              art={course.art}
                              aspectRatio="16/9"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* Progress ring overlay */}
                          <div className="absolute -bottom-2 -right-2 bg-paper rounded-full p-0.5 shadow-sm">
                            <div className="relative">
                              <ProgressRing pct={progress} size={32} />
                              <span
                                className="absolute inset-0 flex items-center justify-center font-mono text-[7px] font-bold"
                                style={{ color: progress === 100 ? "#16a34a" : "#2D6A4F" }}
                              >
                                {progress}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Course info */}
                        <div className="flex-1 min-w-0">
                          {course.tags?.[0] && (
                            <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-viridian mb-1">
                              {course.tags[0]}
                            </p>
                          )}
                          <h3 className="font-semibold text-[15px] text-ink leading-[1.3] line-clamp-2 mb-0.5">
                            {course.title}
                          </h3>
                          <p className="text-[12px] text-ink-3 mb-3">{course.instructor.name}</p>

                          {/* Progress bar + lesson count */}
                          <div>
                            <div className="flex justify-between items-center text-[11px] mb-1.5">
                              <span className="text-ink-3">
                                {progress === 100
                                  ? "เรียนจบแล้ว 🎉"
                                  : `${doneLessons}/${totalLessons} บทเรียน`}
                              </span>
                              <span className="font-mono font-semibold text-ink">{progress}%</span>
                            </div>
                            <div className="h-2 bg-line rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  progress === 100 ? "bg-ok" : "bg-viridian"
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="shrink-0 flex flex-col items-end justify-between gap-2">
                          {progress === 100 ? (
                            <>
                              <span className="flex items-center gap-1 text-ok text-[11px] font-mono bg-[#F0FDF4] px-2 py-1 rounded-pill border border-[#BBF7D0]">
                                <CheckCircle2 size={11} /> สำเร็จ
                              </span>
                              {cert ? (
                                <div className="flex flex-col items-end gap-2 mt-auto">
                                  <Link
                                    href={`/${locale}/certificate/${cert.id}`}
                                    className="flex items-center gap-1.5 text-[12px] text-gold font-medium hover:text-yellow-700"
                                  >
                                    <Trophy size={13} /> ดูใบประกาศ
                                  </Link>
                                  <CertificateDownloadButton
                                    certId={cert.id}
                                    courseTitle={course.title}
                                  />
                                </div>
                              ) : (
                                <span className="text-[11px] text-ink-4 font-mono mt-auto">
                                  กำลังออกใบ...
                                </span>
                              )}
                            </>
                          ) : (
                            <Link
                              href={continueUrl}
                              className="flex items-center gap-2 bg-viridian hover:bg-viridian-2 text-white text-[13px] font-medium px-4 py-2 rounded-pill transition-colors mt-auto"
                            >
                              <Play size={12} />
                              เรียนต่อ
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ───── RIGHT SIDEBAR ───── */}
            <div className="flex flex-col gap-6">

              {/* Activity chart */}
              <div className="bg-paper-3 border border-line rounded-r3 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[14px] text-ink flex items-center gap-2">
                    <Activity size={14} className="text-viridian" />
                    กิจกรรม 7 วัน
                  </h3>
                  <span className="font-mono text-[11px] text-ink-3">
                    {totalWeekLessons} บท
                  </span>
                </div>
                <div className="flex items-end gap-1.5" style={{ height: "120px" }}>
                  {weekActivity.map((count, i) => {
                    const barH = Math.max(count > 0 ? (count / chartMax) * 96 : 0, count > 0 ? 6 : 0);
                    const { label, isToday } = chartLabels[i];
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        {count > 0 && (
                          <span className="font-mono text-[9px] text-viridian font-bold">{count}</span>
                        )}
                        <div className="w-full flex flex-col justify-end" style={{ height: "96px" }}>
                          <div
                            className={`w-full rounded-t transition-all ${
                              isToday
                                ? count > 0 ? "bg-viridian" : "bg-viridian/20"
                                : count > 0 ? "bg-viridian/70" : "bg-line"
                            }`}
                            style={{ height: `${barH || 3}px` }}
                          />
                        </div>
                        <span
                          className={`font-mono text-[9px] ${
                            isToday ? "text-viridian font-bold" : "text-ink-4"
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quiz scores */}
              <div className="bg-paper-3 border border-line rounded-r3 p-5">
                <h3 className="font-semibold text-[14px] text-ink flex items-center gap-2 mb-4">
                  <ClipboardCheck size={14} className="text-amber-500" />
                  คะแนน Quiz
                </h3>
                {recentAttempts.length === 0 ? (
                  <p className="text-[12px] text-ink-4 font-thai">ยังไม่มีประวัติการทำ Quiz</p>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {recentAttempts.map((a) => (
                      <div key={a.id} className="flex items-center gap-3">
                        {/* Score circle */}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold ${
                            a.passed === true
                              ? "bg-ok/15 text-ok"
                              : a.passed === false
                              ? "bg-danger/10 text-danger"
                              : "bg-line text-ink-3"
                          }`}
                        >
                          {a.score !== null ? a.score : "—"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-ink font-medium line-clamp-1">{a.quizTitle}</p>
                          <p className="text-[10px] text-ink-4 font-mono">
                            {a.passed === true ? "✓ ผ่าน" : a.passed === false ? "✗ ไม่ผ่าน" : "—"}
                            {a.submittedAt && (
                              <> · {new Date(a.submittedAt).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}</>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent activity */}
              <div className="bg-paper-3 border border-line rounded-r3 p-5">
                <h3 className="font-semibold text-[14px] text-ink flex items-center gap-2 mb-4">
                  <CheckCircle2 size={14} className="text-ok" />
                  บทเรียนล่าสุด
                </h3>
                {recentActivity.length === 0 ? (
                  <p className="text-[12px] text-ink-4 font-thai">ยังไม่มีกิจกรรม</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {recentActivity.slice(0, 4).map((ev, idx) => (
                      <div key={`${ev.lessonId}-${idx}`} className="flex gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-ok mt-1.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[12px] text-ink font-medium line-clamp-1">
                            {ev.lessonTitle ?? "บทเรียน"}
                          </p>
                          <p className="text-[10px] text-ink-4 line-clamp-1">
                            {ev.courseTitle ?? "คอร์ส"}
                          </p>
                          <p className="font-mono text-[9px] text-ink-4 mt-0.5">
                            {new Date(ev.createdAt).toLocaleDateString("th-TH", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick links */}
              <div className="flex flex-col gap-2">
                <Link
                  href={`/${locale}/dashboard/certificates`}
                  className="flex items-center gap-3 p-3.5 bg-paper-3 border border-line rounded-r2 hover:border-viridian-3 transition-colors"
                >
                  <Medal size={15} className="text-gold shrink-0" />
                  <span className="text-[13px] text-ink font-medium flex-1">ใบประกาศของฉัน</span>
                  <ArrowRight size={13} className="text-ink-3" />
                </Link>
                <Link
                  href={`/${locale}/dashboard/settings`}
                  className="flex items-center gap-3 p-3.5 bg-paper-3 border border-line rounded-r2 hover:border-viridian-3 transition-colors"
                >
                  <Star size={15} className="text-amber-500 shrink-0" />
                  <span className="text-[13px] text-ink font-medium flex-1">XP & ตั้งค่าบัญชี</span>
                  <ArrowRight size={13} className="text-ink-3" />
                </Link>
                <Link
                  href={`/${locale}/leaderboard`}
                  className="flex items-center gap-3 p-3.5 bg-paper-3 border border-line rounded-r2 hover:border-viridian-3 transition-colors"
                >
                  <Trophy size={15} className="text-viridian shrink-0" />
                  <span className="text-[13px] text-ink font-medium flex-1">Leaderboard</span>
                  <ArrowRight size={13} className="text-ink-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* ── Certificates ── */}
          {certificates.length > 0 && (
            <section className="mt-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-[18px] text-ink flex items-center gap-2">
                  <Trophy size={17} className="text-gold" />
                  ใบประกาศของฉัน
                </h2>
                <Link
                  href={`/${locale}/dashboard/certificates`}
                  className="font-mono text-[11px] tracking-[0.1em] uppercase text-viridian hover:text-viridian-2 flex items-center gap-1"
                >
                  ดูทั้งหมด <ArrowRight size={12} />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {certificates.slice(0, 4).map((cert) => (
                  <Link
                    key={cert.id}
                    href={`/${locale}/certificate/${cert.id}`}
                    className="flex items-center gap-4 p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-r3 hover:border-gold transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                      <Trophy size={18} className="text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[13px] text-ink truncate">{cert.courseTitle}</p>
                      <p className="text-[11px] text-ink-3 mt-0.5">
                        {new Date(cert.issuedAt).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <ArrowRight size={13} className="text-gold shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}

        </Container>
      </main>
      <Footer />
    </div>
  );
}
