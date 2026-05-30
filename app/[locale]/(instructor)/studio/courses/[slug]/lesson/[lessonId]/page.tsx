import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MOCK_COURSES, MOCK_INSTRUCTOR } from "@/mock";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { LessonEditor, type LessonEditorData } from "@/components/studio/LessonEditor";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LessonEditPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; lessonId: string }>;
}) {
  const { locale, slug, lessonId } = await params;

  const session = await auth();
  const userId = session?.user?.id ?? "";
  const role = (session?.user as { role?: string } | undefined)?.role ?? "";

  let courseId = "";
  let courseTitle = "";
  let lesson: LessonEditorData | null = null;

  try {
    const dbLesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: { select: { id: true, title: true, slug: true, instructorId: true } },
          },
        },
      },
    });

    if (!dbLesson || dbLesson.section.course.slug !== slug) notFound();
    if (dbLesson.section.course.instructorId !== userId && role !== "ADMIN") notFound();

    courseId = dbLesson.section.course.id;
    courseTitle = dbLesson.section.course.title;
    lesson = {
      id: dbLesson.id,
      title: dbLesson.title,
      type: dbLesson.type,
      content: dbLesson.content ?? "",
      videoAsset: dbLesson.videoAsset ?? "",
      isFree: dbLesson.isFree,
      durationMin: dbLesson.duration ? Math.round(dbLesson.duration / 60) : 0,
      dripDays: dbLesson.drip ?? 0,
    };
  } catch {
    // DB unavailable — fall back to mock
    const mockCourse = MOCK_COURSES.find((c) => c.slug === slug);
    if (!mockCourse || (mockCourse.instructorId !== MOCK_INSTRUCTOR.id && role !== "ADMIN")) {
      notFound();
    }
    const mockLesson = mockCourse.sections
      .flatMap((s) => s.lessons)
      .find((l) => l.id === lessonId);
    if (!mockLesson) notFound();

    courseId = mockCourse.id;
    courseTitle = mockCourse.title;
    lesson = {
      id: mockLesson.id,
      title: mockLesson.title,
      type: mockLesson.type,
      content: mockLesson.content ?? "",
      videoAsset: mockLesson.videoAsset ?? "",
      isFree: mockLesson.isFree,
      durationMin: mockLesson.duration ? Math.round(mockLesson.duration / 60) : 0,
      dripDays: mockLesson.drip ?? 0,
    };
  }

  return (
    <div className="p-8 max-w-[860px]">
      <div className="mb-8">
        <Link
          href={`/${locale}/studio/courses/${slug}/edit`}
          className="inline-flex items-center gap-1 text-[13px] text-ink-3 hover:text-ink transition-colors mb-2"
        >
          <ChevronLeft size={14} /> กลับแก้ไขคอร์ส
        </Link>
        <EyebrowLabel className="mb-1">STUDIO / LESSON / EDIT</EyebrowLabel>
        <h1 className="font-display text-[30px] text-ink tracking-[-0.015em] line-clamp-1">
          {courseTitle}
        </h1>
      </div>

      <LessonEditor lesson={lesson} courseId={courseId} courseSlug={slug} locale={locale} />
    </div>
  );
}
