import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, courseId, lessonId, progressPct } = body as {
      userId?: string;
      courseId?: string;
      lessonId?: string;
      progressPct?: number;
    };

    if (!userId || !courseId || !lessonId || progressPct === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const completed = progressPct >= 90;

    // Upsert lesson-level progress
    await db.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        watchedPct: progressPct,
        completed,
        completedAt: completed ? new Date() : null,
      },
      update: {
        watchedPct: progressPct,
        ...(completed ? { completed: true, completedAt: new Date() } : {}),
      },
    });

    // Recalculate course-level completion %
    const [totalLessons, completedLessons] = await Promise.all([
      db.lesson.count({ where: { section: { courseId } } }),
      db.lessonProgress.count({
        where: { userId, lesson: { section: { courseId } }, completed: true },
      }),
    ]);

    const overallPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const courseCompleted = overallPct === 100;

    // Upsert course-level progress
    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    });

    if (enrollment) {
      await db.userCourseProgress.upsert({
        where: { enrollmentId: enrollment.id },
        create: {
          userId,
          courseId,
          enrollmentId: enrollment.id,
          progressPct: overallPct,
          lastLesson: lessonId,
        },
        update: {
          progressPct: overallPct,
          lastLesson: lessonId,
        },
      });

      if (courseCompleted) {
        await db.enrollment.update({
          where: { id: enrollment.id },
          data: { completedAt: new Date() },
        });
      }
    }

    // Update streak record for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await db.streakRecord.upsert({
      where: { userId_date: { userId, date: today } },
      create: { userId, date: today, count: 1 },
      update: { count: { increment: 1 } },
    }).catch(() => {});

    // Log progress event
    await db.progressEvent.create({
      data: { userId, courseId, lessonId, eventType: completed ? "COMPLETE" : "PLAY" },
    }).catch(() => {});

    return NextResponse.json({ ok: true, overallPct });
  } catch (err) {
    console.error("[progress]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
