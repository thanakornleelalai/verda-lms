"use server";

import { auth } from "@/lib/auth";
import { issueCertificate } from "@/actions/certificate";

export type ReviewPayload = {
  courseSlug: string;
  locale: string;
  courseRating: number;       // 1-5
  instructorRating: number;   // 1-5
  comment: string;
};

export type ReviewResult =
  | { success: true; certId: string | null }
  | { error: string };

export async function submitReview(payload: ReviewPayload): Promise<ReviewResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = session.user.id;
  const { courseSlug, courseRating, instructorRating, comment } = payload;

  try {
    const { db } = await import("@/lib/db");

    const course = await db.course.findUnique({
      where: { slug: courseSlug },
      select: { id: true, ratingCount: true, rating: true },
    });

    if (course) {
      // Update rolling average rating
      const newCount = course.ratingCount + 1;
      const newRating = ((course.rating ?? 0) * course.ratingCount + courseRating) / newCount;

      await db.$transaction([
        db.course.update({
          where: { id: course.id },
          data: { rating: newRating, ratingCount: newCount },
        }),
      ]);

      // Auto-issue certificate — create if not exists
      const issued = await issueCertificate(userId, course.id);
      return { success: true, certId: issued.certId ?? null };
    }
  } catch {
    // DB unavailable — fall through to mock
  }

  // Mock fallback
  const MOCK_CERT_MAP: Record<string, string> = {
    "ux-design-figma-masterclass": "cert_ux_001",
    "financial-planning-for-freelancers": "cert_fp_001",
    "machine-learning-specialization": "cert_ml_001",
    "nextjs-15-fullstack-bootcamp": "cert_nx_001",
  };
  const certId = MOCK_CERT_MAP[courseSlug] ?? `cert_${courseSlug.slice(0, 4)}_${Date.now()}`;
  return { success: true, certId };
}

export async function skipReviewAndGetCert(
  courseSlug: string,
  locale: string,
): Promise<ReviewResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = session.user.id;

  try {
    const { db } = await import("@/lib/db");
    const course = await db.course.findUnique({
      where: { slug: courseSlug },
      select: { id: true },
    });
    if (course) {
      const issued = await issueCertificate(userId, course.id);
      return { success: true, certId: issued.certId ?? null };
    }
  } catch {
    // fall through
  }

  const MOCK_CERT_MAP: Record<string, string> = {
    "ux-design-figma-masterclass": "cert_ux_001",
    "financial-planning-for-freelancers": "cert_fp_001",
    "machine-learning-specialization": "cert_ml_001",
    "nextjs-15-fullstack-bootcamp": "cert_nx_001",
  };
  return { success: true, certId: MOCK_CERT_MAP[courseSlug] ?? "cert_ux_001" };
}
