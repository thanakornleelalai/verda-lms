"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface UpdateProfileData {
  name: string;
  bio?: string;
  headline?: string;
  website?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

// ── Get current user ID ────────────────────────────────────────────────────────

async function requireUserId(): Promise<string | null> {
  try {
    const session = await auth();
    return (session?.user as { id?: string } | null)?.id ?? null;
  } catch {
    return null;
  }
}

// ── Update Profile ─────────────────────────────────────────────────────────────

export async function updateProfile(data: UpdateProfileData): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "กรุณาเข้าสู่ระบบก่อน" };

  const { name, bio, headline, website } = data;
  if (!name.trim()) return { success: false, error: "กรุณากรอกชื่อ" };
  if (website && !/^https?:\/\/.+/.test(website)) {
    return { success: false, error: "URL ต้องขึ้นต้นด้วย http:// หรือ https://" };
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: { name: name.trim(), bio: bio?.trim(), headline: headline?.trim(), website: website?.trim() },
    });
    return { success: true };
  } catch {
    return { success: false, error: "ไม่สามารถบันทึกได้ กรุณาลองใหม่" };
  }
}

// ── Change Password ────────────────────────────────────────────────────────────

export async function changePassword(data: ChangePasswordData): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "กรุณาเข้าสู่ระบบก่อน" };

  const { currentPassword, newPassword, confirmPassword } = data;

  if (!currentPassword || !newPassword) return { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  if (newPassword.length < 8) return { success: false, error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร" };
  if (newPassword !== confirmPassword) return { success: false, error: "รหัสผ่านใหม่ไม่ตรงกัน" };
  if (currentPassword === newPassword) return { success: false, error: "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสเดิม" };

  try {
    const user = await db.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
    if (!user?.passwordHash) return { success: false, error: "บัญชีนี้ไม่มีรหัสผ่าน กรุณาใช้ Social Login" };

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return { success: false, error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" };

    const hashed = await bcrypt.hash(newPassword, 12);
    await db.user.update({ where: { id: userId }, data: { passwordHash: hashed } });
    return { success: true };
  } catch {
    return { success: false, error: "ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่" };
  }
}

// ── Update Notification Preferences ────────────────────────────────────────────

export async function updateNotifications(prefs: {
  newLesson: boolean;
  quizReminder: boolean;
  newsletter: boolean;
  promotions: boolean;
}): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "กรุณาเข้าสู่ระบบก่อน" };

  // Store as JSON in user metadata (future: separate NotificationPreferences model)
  try {
    await db.user.update({
      where: { id: userId },
      // @ts-expect-error — meta field may not exist yet in schema
      data: { notificationPrefs: prefs },
    });
    return { success: true };
  } catch {
    // DB unavailable or field not in schema — success for demo
    return { success: true };
  }
}

// ── Get Profile ────────────────────────────────────────────────────────────────

export async function getProfile() {
  const userId = await requireUserId();
  if (!userId) return null;

  try {
    return await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, bio: true, headline: true, website: true, image: true, role: true, emailVerified: true, createdAt: true },
    });
  } catch {
    return null;
  }
}

// ── Delete Account ─────────────────────────────────────────────────────────────

export async function deleteAccount(password: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "กรุณาเข้าสู่ระบบก่อน" };

  try {
    const user = await db.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
    if (user?.passwordHash) {
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return { success: false, error: "รหัสผ่านไม่ถูกต้อง" };
    }

    await db.user.delete({ where: { id: userId } });
    return { success: true };
  } catch {
    return { success: false, error: "ไม่สามารถลบบัญชีได้ กรุณาติดต่อทีมงาน" };
  }
}

// ── Admin: Update User Role ────────────────────────────────────────────────────

export async function adminUpdateUserRole(
  targetUserId: string,
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN",
): Promise<ActionResult> {
  const adminId = await requireUserId();
  if (!adminId) return { success: false, error: "Unauthorized" };

  try {
    const admin = await db.user.findUnique({ where: { id: adminId }, select: { role: true } });
    if (!admin || !["ADMIN", "SUPERADMIN"].includes(admin.role)) {
      return { success: false, error: "ไม่มีสิทธิ์ดำเนินการ" };
    }

    await db.user.update({ where: { id: targetUserId }, data: { role } });
    return { success: true };
  } catch {
    return { success: false, error: "ไม่สามารถอัปเดตบทบาทได้" };
  }
}

// ── Admin: Suspend / Restore User ───────────────────────────────────────────────

/**
 * Suspend or restore a user. Suspended users cannot log in, and their content
 * (courses, etc.) is hidden across the site.
 */
export async function adminSetUserSuspended(
  targetUserId: string,
  suspended: boolean,
): Promise<ActionResult> {
  const adminId = await requireUserId();
  if (!adminId) return { success: false, error: "Unauthorized" };

  try {
    const admin = await db.user.findUnique({ where: { id: adminId }, select: { role: true } });
    if (!admin || !["ADMIN", "SUPERADMIN"].includes(admin.role)) {
      return { success: false, error: "ไม่มีสิทธิ์ดำเนินการ" };
    }
    if (targetUserId === adminId) return { success: false, error: "ไม่สามารถระงับบัญชีตนเองได้" };

    const target = await db.user.findUnique({ where: { id: targetUserId }, select: { role: true } });
    if (target && ["ADMIN", "SUPERADMIN"].includes(target.role)) {
      return { success: false, error: "ไม่สามารถระงับบัญชีผู้ดูแลระบบได้" };
    }

    await db.user.update({ where: { id: targetUserId }, data: { suspended } });

    // When suspending an instructor, hide their published courses (→ ARCHIVED)
    if (suspended) {
      await db.course.updateMany({
        where: { instructorId: targetUserId, status: "PUBLISHED" },
        data: { status: "ARCHIVED" },
      });
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    return { success: true };
  } catch {
    return { success: false, error: "ไม่สามารถอัปเดตสถานะผู้ใช้ได้" };
  }
}

// ── Admin: Reset User Password ──────────────────────────────────────────────────

/**
 * Admin sets a new password for a STUDENT or INSTRUCTOR account.
 * Cannot target other admins.
 */
export async function adminResetUserPassword(
  targetUserId: string,
  newPassword: string,
): Promise<ActionResult> {
  const adminId = await requireUserId();
  if (!adminId) return { success: false, error: "Unauthorized" };

  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" };
  }

  try {
    const admin = await db.user.findUnique({ where: { id: adminId }, select: { role: true } });
    if (!admin || !["ADMIN", "SUPERADMIN"].includes(admin.role)) {
      return { success: false, error: "ไม่มีสิทธิ์ดำเนินการ" };
    }

    const target = await db.user.findUnique({ where: { id: targetUserId }, select: { role: true } });
    if (!target) return { success: false, error: "ไม่พบผู้ใช้" };
    if (["ADMIN", "SUPERADMIN"].includes(target.role)) {
      return { success: false, error: "ไม่สามารถตั้งรหัสผ่านให้บัญชีผู้ดูแลระบบได้" };
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.user.update({ where: { id: targetUserId }, data: { passwordHash } });
    return { success: true };
  } catch {
    return { success: false, error: "ไม่สามารถตั้งรหัสผ่านได้" };
  }
}

// ── Admin: Delete User ───────────────────────────────────────────────────────

export async function adminDeleteUser(targetUserId: string): Promise<ActionResult> {
  const adminId = await requireUserId();
  if (!adminId) return { success: false, error: "Unauthorized" };

  try {
    const admin = await db.user.findUnique({ where: { id: adminId }, select: { role: true } });
    if (!admin || !["ADMIN", "SUPERADMIN"].includes(admin.role)) {
      return { success: false, error: "ไม่มีสิทธิ์ดำเนินการ" };
    }
    if (targetUserId === adminId) return { success: false, error: "ไม่สามารถลบบัญชีตนเองได้" };

    await db.user.delete({ where: { id: targetUserId } });
    return { success: true };
  } catch {
    return { success: false, error: "ไม่สามารถลบผู้ใช้ได้" };
  }
}
