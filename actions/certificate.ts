"use server";

import { db } from "@/lib/db";
import { MOCK_COURSES } from "@/mock";
import { getCertVerifyUrl, getCertDownloadUrl } from "@/lib/certificate-url";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CertificateIssueResult {
  success: boolean;
  certId?: string;
  error?: string;
  alreadyExists?: boolean;
}

export interface VerifyResult {
  valid: boolean;
  certId: string;
  studentName?: string;
  courseTitle?: string;
  instructorName?: string;
  issuedAt?: string;
  hours?: number;
  revokedAt?: string | null;
}

// ── Auto-issue Certificate ─────────────────────────────────────────────────────

/**
 * เรียกเมื่อนักเรียนเรียนจบคอร์สและผ่านแบบทดสอบ
 * ถ้ามีใบประกาศอยู่แล้วจะ return alreadyExists: true
 */
export async function issueCertificate(
  userId: string,
  courseId: string,
): Promise<CertificateIssueResult> {
  try {
    // Check if already issued
    const existing = await db.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) {
      return { success: true, certId: existing.id, alreadyExists: true };
    }

    // Create certificate with the download URL pre-populated
    const cert = await db.certificate.create({
      data: { userId, courseId },
    });
    // Backfill pdfUrl so dashboard download button has a valid URL immediately
    await db.certificate.update({
      where: { id: cert.id },
      data: { pdfUrl: getCertDownloadUrl(cert.id) },
    });

    // Award XP points (100 pts per certificate)
    await db.userPoints.upsert({
      where: { userId },
      create: { userId, total: 100 },
      update: { total: { increment: 100 } },
    });

    // Send certificate email notification (no-op when RESEND_API_KEY is unset)
    await sendCertificateEmail(userId, cert.id, courseId).catch(() => {});

    return { success: true, certId: cert.id };
  } catch {
    // Mock mode — return mock cert ID
    const mockId = `cert_${courseId.slice(0, 4)}_${userId.slice(0, 4)}_${Date.now()}`;
    return { success: true, certId: mockId };
  }
}

// ── Auto-issue after Quiz Pass ─────────────────────────────────────────────────

/**
 * เรียกหลัง finalizeAttempt() เมื่อ passed = true
 * ตรวจว่าทุก quiz ใน course ผ่านหมดแล้วหรือยัง (ถ้ามี quiz)
 */
export async function maybeCertifyOnQuizPass(
  userId: string,
  courseId: string,
): Promise<CertificateIssueResult> {
  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        sections: { include: { lessons: { include: { quizzes: true } } } },
      },
    });

    if (!course) return { success: false, error: "Course not found" };

    // Get all quiz IDs in course
    const allQuizIds = course.sections
      .flatMap((s) => s.lessons)
      .flatMap((l) => l.quizzes)
      .map((q) => q.id);

    if (allQuizIds.length === 0) {
      // No quizzes — certify immediately
      return issueCertificate(userId, courseId);
    }

    // Check if user passed all quizzes
    const passedAttempts = await db.attempt.findMany({
      where: { userId, quizId: { in: allQuizIds }, passed: true },
      select: { quizId: true },
    });

    const passedQuizIds = new Set(passedAttempts.map((a) => a.quizId));
    const allPassed = allQuizIds.every((id) => passedQuizIds.has(id));

    if (allPassed) {
      return issueCertificate(userId, courseId);
    }

    return { success: false, error: "Not all quizzes passed yet" };
  } catch {
    return issueCertificate(userId, courseId);
  }
}

// ── Verify Certificate ─────────────────────────────────────────────────────────

export async function verifyCertificate(certId: string): Promise<VerifyResult> {
  try {
    const cert = await db.certificate.findUnique({
      where: { id: certId },
      include: {
        user: { select: { name: true } },
        course: {
          select: {
            title: true,
            totalDuration: true,
            instructor: { select: { name: true } },
          },
        },
      },
    });

    if (!cert) return { valid: false, certId };

    return {
      valid: true,
      certId: cert.id,
      studentName: cert.user.name ?? "ผู้เรียน",
      courseTitle: cert.course.title,
      instructorName: cert.course.instructor?.name ?? "Instructor",
      issuedAt: cert.issuedAt.toISOString(),
      hours: Math.round((cert.course.totalDuration ?? 0) / 3600),
    };
  } catch {
    // Mock fallback
    const MOCK: Record<string, Omit<VerifyResult, "valid" | "certId">> = {
      cert_fp_001: {
        studentName: "วีรวัฒน์ ใจดี",
        courseTitle: "Financial Planning for Freelancers",
        instructorName: "ธนพล สิทธิกุล",
        issuedAt: "2026-01-10T00:00:00Z",
        hours: 4,
      },
      cert_ux_001: {
        studentName: "วีรวัฒน์ ใจดี",
        courseTitle: "UX Design & Figma Masterclass",
        instructorName: "พิมพ์ชนก วัฒนากร",
        issuedAt: "2026-03-20T00:00:00Z",
        hours: 8,
      },
    };
    const data = MOCK[certId];
    if (!data) return { valid: false, certId };
    return { valid: true, certId, ...data };
  }
}

// ── Revoke Certificate ─────────────────────────────────────────────────────────

export async function revokeCertificate(
  certId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.certificate.delete({ where: { id: certId } });
    return { success: true };
  } catch {
    return { success: false, error: "ไม่สามารถยกเลิกใบประกาศได้" };
  }
}

// ── Get User Certificates ──────────────────────────────────────────────────────

export async function getCertificatesForUser(userId: string) {
  try {
    const rows = await db.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" },
      include: {
        course: { select: { title: true, slug: true, monogram: true, art: true, totalDuration: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      courseTitle: r.course.title,
      courseSlug: r.course.slug,
      monogram: r.course.monogram ?? undefined,
      art: r.course.art ?? undefined,
      hours: Math.round((r.course.totalDuration ?? 0) / 3600),
      issuedAt: r.issuedAt.toISOString(),
      pdfUrl: r.pdfUrl,
    }));
  } catch {
    return [
      {
        id: "cert_fp_001",
        courseTitle: "Financial Planning for Freelancers",
        courseSlug: "financial-planning-for-freelancers",
        monogram: "FP",
        art: "linear-gradient(135deg,#713f12 0%,#a16207 100%)",
        hours: 4,
        issuedAt: "2026-01-10T00:00:00Z",
        pdfUrl: null,
      },
      {
        id: "cert_ux_001",
        courseTitle: "UX Design & Figma Masterclass",
        courseSlug: "ux-design-figma-masterclass",
        monogram: "UX",
        art: "linear-gradient(135deg,#0F5D4A 0%,#1A7A60 100%)",
        hours: 8,
        issuedAt: "2026-03-20T00:00:00Z",
        pdfUrl: null,
      },
    ];
  }
}

// ── Admin: Certificate Stats ───────────────────────────────────────────────────

export async function getCertificateStats() {
  try {
    const total = await db.certificate.count();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = await db.certificate.count({
      where: { issuedAt: { gte: startOfMonth } },
    });
    return { total, thisMonth };
  } catch {
    return { total: 2, thisMonth: 1 };
  }
}

// ── Admin: List All Certificates ──────────────────────────────────────────────

export async function getAllCertificates(filters?: { courseId?: string; search?: string }) {
  try {
    const rows = await db.certificate.findMany({
      where: {
        courseId: filters?.courseId,
        user: filters?.search
          ? { name: { contains: filters.search, mode: "insensitive" } }
          : undefined,
      },
      orderBy: { issuedAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true, slug: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      studentName: r.user.name ?? "—",
      studentEmail: r.user.email ?? "—",
      courseTitle: r.course.title,
      courseSlug: r.course.slug,
      issuedAt: r.issuedAt.toISOString(),
    }));
  } catch {
    return [
      {
        id: "cert_fp_001",
        studentName: "วีรวัฒน์ ใจดี",
        studentEmail: "student@verda.dev",
        courseTitle: "Financial Planning for Freelancers",
        courseSlug: "financial-planning-for-freelancers",
        issuedAt: "2026-01-10T00:00:00Z",
      },
      {
        id: "cert_ux_001",
        studentName: "วีรวัฒน์ ใจดี",
        studentEmail: "student@verda.dev",
        courseTitle: "UX Design & Figma Masterclass",
        courseSlug: "ux-design-figma-masterclass",
        issuedAt: "2026-03-20T00:00:00Z",
      },
    ];
  }
}

// ── Email helper (stub) ────────────────────────────────────────────────────────

export async function sendCertificateEmail(
  userId: string,
  certId: string,
  courseId: string,
): Promise<void> {
  // TODO: implement with Resend when RESEND_API_KEY is set
  const course = MOCK_COURSES.find((c) => c.id === courseId);
  console.log("[Certificate] Email notification (stub)", {
    userId, certId,
    courseTitle: course?.title,
    verifyUrl: getCertVerifyUrl(certId),
  });
}
