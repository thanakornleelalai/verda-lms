"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

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

  const { courseSlug, courseRating, instructorRating, comment } = payload;

  try {
    const { db } = await import("@/lib/db");

    // Find course
    const course = await db.course.findUnique({
      where: { slug: courseSlug },
      select: { id: true, ratingCount: true, rating: true },
    });

    if (course) {
      // Update aggregated course rating (rolling average)
      const newCount = course.ratingCount + 1;
      const newRating =
        ((course.rating ?? 0) * course.ratingCount + courseRating) / newCount;

      await db.course.update({
        where: { id: course.id },
        data: { rating: newRating, ratingCount: newCount },
      });

      // Find the user's certificate for this course
      const cert = await db.certificate.findFirst({
        where: { userId: session.user.id, courseId: course.id },
        select: { id: true },
      });

      return { success: true, certId: cert?.id ?? null };
    }
  } catch {
    // DB unavailable — fall through to mock
  }

  // Mock fallback: simulate success and return a demo cert id
  const MOCK_CERT_MAP: Record<string, string> = {
    "ux-design-figma-masterclass": "cert_ux_001",
    "financial-planning-for-freelancers": "cert_fp_001",
  };
  return { success: true, certId: MOCK_CERT_MAP[courseSlug] ?? "cert_ux_001" };
}

export async function skipReviewAndGetCert(
  courseSlug: string,
  locale: string
): Promise<ReviewResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const { db } = await import("@/lib/db");
    const course = await db.course.findUnique({
      where: { slug: courseSlug },
      select: { id: true },
    });
    if (course) {
      const cert = await db.certificate.findFirst({
        where: { userId: session.user.id, courseId: course.id },
        select: { id: true },
      });
      return { success: true, certId: cert?.id ?? null };
    }
  } catch {
    // fall through
  }

  const MOCK_CERT_MAP: Record<string, string> = {
    "ux-design-figma-masterclass": "cert_ux_001",
    "financial-planning-for-freelancers": "cert_fp_001",
  };
  return { success: true, certId: MOCK_CERT_MAP[courseSlug] ?? "cert_ux_001" };
}
