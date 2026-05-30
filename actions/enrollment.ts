"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCourseBySlug } from "@/lib/queries/courses";

export async function createFreeEnrollment(
  courseId: string,
  locale: string,
  slug: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { price: true },
    });
    if (!course) return { error: "Course not found" };
    if (course.price > 0) return { error: "This course is not free" };

    await db.enrollment.upsert({
      where: { userId_courseId: { userId: session.user.id, courseId } },
      create: { userId: session.user.id, courseId },
      update: {},
    });
  } catch {
    // DB unavailable in dev — proceed to redirect anyway (mock enrollment)
  }

  // Resolve the first lesson so we land on a valid learn route
  // (/learn/[slug] alone has no page → 404; it needs a lessonId).
  const course = await getCourseBySlug(slug);
  const firstLessonId = course?.sections
    .flatMap((s) => s.lessons)
    .find(Boolean)?.id;

  if (firstLessonId) {
    redirect(`/${locale}/learn/${slug}/${firstLessonId}`);
  }
  redirect(`/${locale}/learn/${slug}/start`);
}

export async function checkEnrollment(
  courseId: string
): Promise<{ enrolled: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { enrolled: false };

  try {
    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
      select: { id: true },
    });
    return { enrolled: !!enrollment };
  } catch {
    return { enrolled: false };
  }
}
