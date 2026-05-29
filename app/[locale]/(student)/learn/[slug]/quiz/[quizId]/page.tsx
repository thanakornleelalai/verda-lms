import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { MOCK_COURSES } from "@/mock/courses";

export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 3;

export default async function QuizPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; quizId: string }>;
}) {
  const { locale, slug, quizId } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);
  const userId = session.user.id;

  // Compute next lesson after this quiz from course structure
  let nextLessonId: string | null = null;
  const mockCourse = MOCK_COURSES.find((c) => c.slug === slug);
  if (mockCourse) {
    const allLessons = mockCourse.sections.flatMap((s) => s.lessons);
    const idx = allLessons.findIndex((l) => l.id === quizId);
    if (idx !== -1 && idx < allLessons.length - 1) {
      nextLessonId = allLessons[idx + 1].id;
    }
  }

  let quiz;
  let attemptHistory: Array<{ id: string; score: number | null; passed: boolean | null; createdAt: string }> = [];

  try {
    quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: { options: { orderBy: { order: "asc" } } },
        },
      },
    });

    const attempts = await db.attempt.findMany({
      where: { quizId, userId },
      orderBy: { startedAt: "desc" },
      select: { id: true, score: true, passed: true, startedAt: true },
    });
    attemptHistory = attempts.map((a) => ({
      id: a.id,
      score: a.score,
      passed: a.passed,
      createdAt: a.startedAt.toISOString(),
    }));
  } catch {
    quiz = null;
  }

  if (!quiz) {
    const { getMockQuiz } = await import("@/mock/quiz");
    const mockQuiz = getMockQuiz(slug);
    return (
      <QuizRunner
        quiz={{ ...mockQuiz, maxAttempts: MAX_ATTEMPTS }}
        locale={locale}
        slug={slug}
        attemptHistory={attemptHistory}
        nextLessonId={nextLessonId}
      />
    );
  }

  const quizData = {
    id: quiz.id,
    title: quiz.title,
    timeLimitSec: quiz.timeLimitSec ?? 0,
    passingScore: quiz.passingScore,
    maxAttempts: MAX_ATTEMPTS,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      text: q.text,
      type: (q.type === "MULTIPLE" ? "MULTIPLE" : "SINGLE") as "SINGLE" | "MULTIPLE",
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
      correct: q.options.filter((o) => o.isCorrect).map((o) => o.id),
    })),
  };

  return <QuizRunner quiz={quizData} locale={locale} slug={slug} attemptHistory={attemptHistory} nextLessonId={nextLessonId} />;
}
