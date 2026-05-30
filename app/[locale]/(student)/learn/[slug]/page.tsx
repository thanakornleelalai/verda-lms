import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCourseBySlug } from "@/lib/queries/courses";

export const dynamic = "force-dynamic";

/**
 * /learn/[slug] — no lessonId in the URL.
 * Redirect to the first lesson automatically.
 * This happens when the user navigates directly to the course player URL
 * without a specific lesson (e.g. from a bookmark or a link that lost its lessonId).
 */
export default async function LearnRedirectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const firstLesson = course.sections
    .flatMap((s) => s.lessons)
    .find(Boolean);

  if (firstLesson) {
    redirect(`/${locale}/learn/${slug}/${firstLesson.id}`);
  }

  // Course exists but has no lessons yet — send back to course detail page
  redirect(`/${locale}/courses/${slug}`);
}
