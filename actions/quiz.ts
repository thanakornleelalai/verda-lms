"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const MAX_ATTEMPTS = 3;

export async function startAttempt(quizId: string): Promise<{ attemptId: string } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const count = await db.attempt.count({ where: { quizId, userId: session.user.id } });
    if (count >= MAX_ATTEMPTS) return { error: "max_attempts" };

    const attempt = await db.attempt.create({
      data: { userId: session.user.id, quizId, answers: {} },
    });
    return { attemptId: attempt.id };
  } catch {
    return { error: "db_unavailable" };
  }
}

export async function finalizeAttempt(
  attemptId: string,
  answers: Record<string, string[]>
): Promise<{ score: number; passed: boolean } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const attempt = await db.attempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: { include: { options: true }, orderBy: { order: "asc" } },
          },
        },
      },
    });

    if (!attempt || attempt.userId !== session.user.id) {
      return { error: "Attempt not found" };
    }

    const quiz = attempt.quiz;
    let correct = 0;
    let totalPoints = 0;

    for (const q of quiz.questions) {
      totalPoints += q.points;
      const given = answers[q.id] ?? [];
      const correctOptionIds = q.options.filter((o) => o.isCorrect).map((o) => o.id);
      const isCorrect =
        given.length === correctOptionIds.length &&
        correctOptionIds.every((id) => given.includes(id));
      if (isCorrect) correct += q.points;
    }

    const score = totalPoints > 0 ? Math.round((correct / totalPoints) * 100) : 0;
    const passed = score >= quiz.passingScore;

    await db.attempt.update({
      where: { id: attemptId },
      data: { answers, score, passed, submittedAt: new Date() },
    });

    return { score, passed };
  } catch {
    // DB unavailable — caller falls back to client-side scoring
    return { error: "db_unavailable" };
  }
}
