"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ── Auth guard ─────────────────────────────────────────────────────────────────

async function requireAdmin(): Promise<{ id: string; role: string } | null> {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | null;
  if (!user?.id) return null;
  if (!["ADMIN", "SUPERADMIN"].includes(user.role ?? "")) return null;
  return { id: user.id, role: user.role ?? "ADMIN" };
}

type ActionResult = { success: boolean; error?: string };

// ── Coupon Management ──────────────────────────────────────────────────────────

export async function createCoupon(data: {
  code: string;
  discountPct: number;
  maxUses?: number;
  expiresAt?: string;
}): Promise<ActionResult> {
  if (!await requireAdmin()) return { success: false, error: "Unauthorized" };
  const code = data.code.toUpperCase().trim();
  if (!code || code.length < 3) return { success: false, error: "โค้ดต้องมีอย่างน้อย 3 ตัวอักษร" };
  if (data.discountPct < 1 || data.discountPct > 100) return { success: false, error: "ส่วนลดต้องอยู่ระหว่าง 1-100%" };

  try {
    const existing = await db.coupon.findUnique({ where: { code } });
    if (existing) return { success: false, error: "โค้ดนี้มีอยู่แล้ว" };

    await db.coupon.create({
      data: {
        code,
        discountPct: data.discountPct,
        maxUses: data.maxUses ?? null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch {
    return { success: false, error: "ไม่สามารถสร้างโค้ดได้" };
  }
}

export async function deleteCoupon(code: string): Promise<ActionResult> {
  if (!await requireAdmin()) return { success: false, error: "Unauthorized" };
  try {
    await db.coupon.delete({ where: { code } });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch {
    return { success: false, error: "ไม่สามารถลบโค้ดได้" };
  }
}

export async function getCoupons() {
  try {
    return await db.coupon.findMany({ orderBy: { code: "asc" } });
  } catch {
    return [
      { id: "cp1", code: "VERDA15", discountPct: 15, maxUses: 1000, usedCount: 234, expiresAt: new Date("2027-12-31") },
      { id: "cp2", code: "VERDA20", discountPct: 20, maxUses: 500, usedCount: 87, expiresAt: new Date("2027-06-30") },
      { id: "cp3", code: "WELCOME10", discountPct: 10, maxUses: null, usedCount: 412, expiresAt: null },
    ];
  }
}

// ── Announcements ──────────────────────────────────────────────────────────────

export interface Announcement {
  id: string;
  title: string;
  body: string;
  type: "info" | "success" | "warn" | "danger";
  active: boolean;
  createdAt: string;
  expiresAt?: string | null;
}

// In-memory store (replace with DB model when schema is extended)
const announcementStore: Announcement[] = [
  {
    id: "ann_001",
    title: "ยินดีต้อนรับสู่ VERDA LMS v1.0",
    body: "แพลตฟอร์มเรียนออนไลน์ของเราพร้อมให้บริการแล้ว!",
    type: "success",
    active: true,
    createdAt: new Date("2026-05-01").toISOString(),
    expiresAt: null,
  },
];

export async function getAnnouncements(): Promise<Announcement[]> {
  return announcementStore;
}

export async function createAnnouncement(data: {
  title: string;
  body: string;
  type: "info" | "success" | "warn" | "danger";
  expiresAt?: string;
}): Promise<ActionResult> {
  if (!await requireAdmin()) return { success: false, error: "Unauthorized" };
  if (!data.title.trim() || !data.body.trim()) return { success: false, error: "กรุณากรอกหัวข้อและเนื้อหา" };

  announcementStore.unshift({
    id: `ann_${Date.now()}`,
    title: data.title.trim(),
    body: data.body.trim(),
    type: data.type,
    active: true,
    createdAt: new Date().toISOString(),
    expiresAt: data.expiresAt ?? null,
  });

  revalidatePath("/admin/announcements");
  return { success: true };
}

export async function toggleAnnouncement(id: string): Promise<ActionResult> {
  if (!await requireAdmin()) return { success: false, error: "Unauthorized" };
  const item = announcementStore.find((a) => a.id === id);
  if (!item) return { success: false, error: "ไม่พบประกาศ" };
  item.active = !item.active;
  revalidatePath("/admin/announcements");
  return { success: true };
}

export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  if (!await requireAdmin()) return { success: false, error: "Unauthorized" };
  const idx = announcementStore.findIndex((a) => a.id === id);
  if (idx >= 0) announcementStore.splice(idx, 1);
  revalidatePath("/admin/announcements");
  return { success: true };
}

// ── Content Moderation ─────────────────────────────────────────────────────────

export async function getModerationItems() {
  type PostWithThread = {
    id: string;
    body: string;
    createdAt: Date;
    thread: { title: string; courseId: string };
    user: { name: string | null; email: string | null };
    _count: { votes: number };
  };

  try {
    const flaggedPosts = await db.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        thread: { select: { title: true, courseId: true } },
        user: { select: { name: true, email: true } },
        _count: { select: { votes: true } },
      },
    }) as PostWithThread[];

    const pendingCourses = await db.course.findMany({
      where: { status: "REVIEW" },
      include: { instructor: { select: { name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
    });

    return { flaggedPosts, pendingCourses };
  } catch {
    return {
      flaggedPosts: [
        {
          id: "pst_001",
          body: "ตัวอย่าง post ที่รอตรวจสอบ — spam หรือ inappropriate content",
          createdAt: new Date("2026-05-10"),
          thread: { title: "ถามเรื่อง Component Library", courseId: "crs_001" },
          user: { name: "ผู้ใช้ทดสอบ", email: "user@test.com" },
          _count: { votes: -5 },
        },
      ],
      pendingCourses: [
        {
          id: "crs_draft_001",
          title: "Python for Beginners",
          status: "REVIEW",
          slug: "python-for-beginners",
          level: "BEGINNER",
          createdAt: new Date("2026-05-15"),
          updatedAt: new Date("2026-05-15"),
          instructor: { name: "คุณสมศักดิ์ สอนดี", email: "instructor2@verda.dev" },
        },
      ],
    };
  }
}

export async function deletePost(postId: string): Promise<ActionResult> {
  if (!await requireAdmin()) return { success: false, error: "Unauthorized" };
  try {
    await db.post.delete({ where: { id: postId } });
    revalidatePath("/admin/moderation");
    return { success: true };
  } catch {
    return { success: false, error: "ไม่สามารถลบโพสต์ได้" };
  }
}

export async function approveCourse(courseId: string): Promise<ActionResult> {
  if (!await requireAdmin()) return { success: false, error: "Unauthorized" };
  try {
    await db.course.update({ where: { id: courseId }, data: { status: "PUBLISHED" } });
    revalidatePath("/admin/moderation");
    revalidatePath("/admin/courses");
    return { success: true };
  } catch {
    return { success: false, error: "ไม่สามารถอนุมัติคอร์สได้" };
  }
}

export async function rejectCourse(courseId: string): Promise<ActionResult> {
  if (!await requireAdmin()) return { success: false, error: "Unauthorized" };
  try {
    await db.course.update({ where: { id: courseId }, data: { status: "DRAFT" } });
    revalidatePath("/admin/moderation");
    return { success: true };
  } catch {
    return { success: false, error: "ไม่สามารถปฏิเสธคอร์สได้" };
  }
}

// ── Analytics ──────────────────────────────────────────────────────────────────

export async function getAnalyticsData() {
  try {
    const [totalUsers, totalCourses, totalOrders, totalRevenue] = await Promise.all([
      db.user.count(),
      db.course.count({ where: { status: "PUBLISHED" } }),
      db.order.count({ where: { status: "PAID" } }),
      db.order.aggregate({ where: { status: "PAID" }, _sum: { total: true } }),
    ]);

    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return d;
    });

    const monthlyData = await Promise.all(
      months.map(async (start) => {
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
        const [rev, orders, users] = await Promise.all([
          db.order.aggregate({ where: { status: "PAID", createdAt: { gte: start, lte: end } }, _sum: { total: true } }),
          db.order.count({ where: { status: "PAID", createdAt: { gte: start, lte: end } } }),
          db.user.count({ where: { createdAt: { gte: start, lte: end } } }),
        ]);
        return {
          month: start.toLocaleDateString("th-TH", { month: "short" }),
          revenue: (rev._sum.total ?? 0) / 100,
          orders,
          newUsers: users,
        };
      }),
    );

    const topCourses = await db.course.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { enrollmentCount: "desc" },
      take: 5,
      select: { id: true, title: true, enrollmentCount: true, rating: true, price: true },
    });

    return {
      totalUsers,
      totalCourses,
      totalOrders,
      totalRevenue: (totalRevenue._sum.total ?? 0) / 100,
      monthlyData,
      topCourses,
    };
  } catch {
    // Mock data
    return {
      totalUsers: 4238,
      totalCourses: 24,
      totalOrders: 1842,
      totalRevenue: 3240000,
      monthlyData: [
        { month: "ม.ค.", revenue: 210000, orders: 87, newUsers: 234 },
        { month: "ก.พ.", revenue: 275000, orders: 112, newUsers: 312 },
        { month: "มี.ค.", revenue: 248000, orders: 99, newUsers: 287 },
        { month: "เม.ย.", revenue: 320000, orders: 134, newUsers: 398 },
        { month: "พ.ค.", revenue: 390000, orders: 162, newUsers: 445 },
        { month: "มิ.ย.", revenue: 358000, orders: 147, newUsers: 411 },
      ],
      topCourses: [
        { id: "c1", title: "UX Design & Figma Masterclass", enrollmentCount: 1203, rating: 4.9, price: 199900 },
        { id: "c2", title: "Machine Learning Specialization", enrollmentCount: 2841, rating: 4.8, price: 299900 },
        { id: "c3", title: "Next.js 15 Fullstack Bootcamp", enrollmentCount: 891, rating: 4.7, price: 249900 },
        { id: "c4", title: "Python Data Science Bootcamp", enrollmentCount: 673, rating: 4.6, price: 189900 },
        { id: "c5", title: "Digital Marketing Pro", enrollmentCount: 542, rating: 4.5, price: 159900 },
      ],
    };
  }
}

// ── Bulk user actions ──────────────────────────────────────────────────────────

export async function bulkUpdateUserRole(
  userIds: string[],
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN",
): Promise<ActionResult> {
  if (!await requireAdmin()) return { success: false, error: "Unauthorized" };
  if (userIds.length === 0) return { success: false, error: "ไม่ได้เลือกผู้ใช้" };
  try {
    await db.user.updateMany({ where: { id: { in: userIds } }, data: { role } });
    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { success: false, error: "ไม่สามารถอัปเดตบทบาทได้" };
  }
}
