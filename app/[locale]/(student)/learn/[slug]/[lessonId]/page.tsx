import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCourseBySlug } from "@/lib/queries/courses";
import { LessonPlayer } from "@/components/learn/LessonPlayer";
import { MOCK_COMPLETED_LESSON_IDS } from "@/mock";
import type { Lesson, Section } from "@/types";
import type { ThreadWithPosts } from "@/components/learn/LessonPlayer";

export const dynamic = "force-dynamic";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; lessonId: string }>;
}) {
  const { locale, slug, lessonId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }
  const userId = session.user.id;

  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  // Check enrollment
  let isEnrolled = false;
  let completedLessonIds: string[] = [];

  try {
    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });
    isEnrolled = !!enrollment;

    if (isEnrolled) {
      const lessonProgress = await db.lessonProgress.findMany({
        where: { userId, lesson: { section: { courseId: course.id } }, completed: true },
        select: { lessonId: true },
      });
      completedLessonIds = lessonProgress.map((lp) => lp.lessonId);
    }
  } catch {
    // DB unavailable — allow access in dev, use mock completed lesson IDs
    isEnrolled = true;
    completedLessonIds = MOCK_COMPLETED_LESSON_IDS;
  }

  const allLessons = course.sections.flatMap((s) => s.lessons);
  const currentLesson = allLessons.find((l) => l.id === lessonId) ?? allLessons[0];

  if (!currentLesson) notFound();

  // QUIZ type lessons redirect to the dedicated quiz page
  if (currentLesson.type === "QUIZ") {
    redirect(`/${locale}/learn/${slug}/quiz/${currentLesson.id}`);
  }

  // Free preview or enrolled
  const isFreeLesson = currentLesson.isFree;
  if (!isEnrolled && !isFreeLesson) {
    redirect(`/${locale}/courses/${slug}`);
  }

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const currentSection = course.sections.find((s) =>
    s.lessons.some((l) => l.id === currentLesson.id)
  ) as Section;

  let initialThreads: ThreadWithPosts[] = [];
  try {
    const threads = await db.thread.findMany({
      where: { lessonId: currentLesson.id },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, image: true } },
        posts: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
    });
    initialThreads = threads.map((t) => ({
      id: t.id,
      title: t.title,
      body: t.body,
      createdAt: t.createdAt.toISOString(),
      user: { id: t.user.id, name: t.user.name ?? "User", image: t.user.image ?? null },
      posts: t.posts.map((p) => ({
        id: p.id,
        body: p.body,
        createdAt: p.createdAt.toISOString(),
        user: { id: p.user.id, name: p.user.name ?? "User", image: p.user.image ?? null },
      })),
    }));
  } catch {
    // DB unavailable — no threads
  }

  return (
    <LessonPlayer
      course={course}
      currentLesson={currentLesson as Lesson}
      currentSection={currentSection}
      prevLesson={prevLesson as Lesson | null}
      nextLesson={nextLesson as Lesson | null}
      locale={locale}
      userId={userId}
      initialCompletedIds={completedLessonIds}
      initialThreads={initialThreads}
    />
  );
}
