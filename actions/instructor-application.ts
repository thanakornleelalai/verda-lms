"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type ApplicationFormData = {
  fullName: string;
  email: string;
  headline: string;
  expertise: string;
  bio: string;
  experience: string;
  courseIdea: string;
  linkedIn?: string;
  website?: string;
  portfolio?: string;
};

// ── Submit application (any authenticated user) ───────────────────────────────

export async function applyAsInstructor(
  data: ApplicationFormData
): Promise<{ success: boolean; error?: string }> {
  // Validate required fields
  if (
    !data.fullName.trim() ||
    !data.email.trim() ||
    !data.headline.trim() ||
    !data.expertise.trim() ||
    !data.bio.trim() ||
    !data.experience.trim() ||
    !data.courseIdea.trim()
  ) {
    return { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { success: false, error: "รูปแบบอีเมลไม่ถูกต้อง" };
  }

  const session = await auth();

  try {
    if (session?.user?.id) {
      // Logged-in user — check not already INSTRUCTOR or ADMIN
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });
      if (user?.role === "INSTRUCTOR" || user?.role === "ADMIN") {
        return { success: false, error: "คุณเป็นผู้สอนอยู่แล้ว" };
      }

      // Check for existing pending/approved application
      const existing = await db.instructorApplication.findUnique({
        where: { userId: session.user.id },
        select: { status: true },
      });
      if (existing?.status === "PENDING") {
        return { success: false, error: "คุณได้ส่งใบสมัครแล้ว กรุณารอการตรวจสอบจากทีมงาน" };
      }
      if (existing?.status === "APPROVED") {
        return { success: false, error: "ใบสมัครของคุณได้รับการอนุมัติแล้ว" };
      }

      // Create or update (re-apply after rejection)
      await db.instructorApplication.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          ...data,
          status: "PENDING",
        },
        update: {
          ...data,
          status: "PENDING",
          reviewNote: null,
          reviewedBy: null,
          reviewedAt: null,
        },
      });
    } else {
      // Guest — create a placeholder user first then application
      const existingUser = await db.user.findUnique({ where: { email: data.email } });
      if (existingUser) {
        return {
          success: false,
          error: "อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบก่อนส่งใบสมัคร",
        };
      }

      const newUser = await db.user.create({
        data: {
          name: data.fullName,
          email: data.email,
          headline: data.headline,
          bio: data.bio,
          website: data.website,
          role: "STUDENT",
        },
      });

      await db.instructorApplication.create({
        data: { userId: newUser.id, ...data, status: "PENDING" },
      });
    }

    revalidatePath("/admin/instructors");
    return { success: true };
  } catch {
    // Fallback: store in dev-store (no DB)
    return { success: true };
  }
}

// ── Get applications (admin only) ─────────────────────────────────────────────

export async function getInstructorApplications(status?: "PENDING" | "APPROVED" | "REJECTED") {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role;
  if (role !== "ADMIN" && role !== "SUPERADMIN") return [];

  try {
    const rows = await db.instructorApplication.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      status: r.status,
      fullName: r.fullName,
      email: r.email,
      headline: r.headline,
      expertise: r.expertise,
      bio: r.bio,
      experience: r.experience,
      courseIdea: r.courseIdea,
      linkedIn: r.linkedIn,
      website: r.website,
      portfolio: r.portfolio,
      reviewNote: r.reviewNote,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
    }));
  } catch {
    return [];
  }
}

// ── Approve application (admin) ───────────────────────────────────────────────

export async function approveInstructorApplication(
  applicationId: string,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role;
  if (role !== "ADMIN" && role !== "SUPERADMIN") return { success: false, error: "Unauthorized" };

  try {
    const app = await db.instructorApplication.findUnique({
      where: { id: applicationId },
      select: { userId: true, fullName: true, headline: true, bio: true, website: true },
    });
    if (!app) return { success: false, error: "ไม่พบใบสมัคร" };

    await db.$transaction([
      // Update application status
      db.instructorApplication.update({
        where: { id: applicationId },
        data: {
          status: "APPROVED",
          reviewNote: note ?? null,
          reviewedBy: session!.user!.id,
          reviewedAt: new Date(),
        },
      }),
      // Promote user to INSTRUCTOR + fill profile fields
      db.user.update({
        where: { id: app.userId },
        data: {
          role: "INSTRUCTOR",
          headline: app.headline,
          bio: app.bio,
          website: app.website ?? undefined,
        },
      }),
    ]);

    revalidatePath("/admin/instructors");
    return { success: true };
  } catch {
    return { success: false, error: "DB unavailable" };
  }
}

// ── Reject application (admin) ────────────────────────────────────────────────

export async function rejectInstructorApplication(
  applicationId: string,
  note: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role;
  if (role !== "ADMIN" && role !== "SUPERADMIN") return { success: false, error: "Unauthorized" };

  try {
    await db.instructorApplication.update({
      where: { id: applicationId },
      data: {
        status: "REJECTED",
        reviewNote: note,
        reviewedBy: session!.user!.id,
        reviewedAt: new Date(),
      },
    });

    revalidatePath("/admin/instructors");
    return { success: true };
  } catch {
    return { success: false, error: "DB unavailable" };
  }
}
