"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface CourseReview {
  id: string;
  courseSlug: string;
  userName: string;
  courseRating: number;      // 1-5
  instructorRating: number;  // 1-5
  comment: string;
  createdAt: string;
}

// In-memory store (mirrors content/announcements pattern; swap for a Review model later)
const reviewStore: CourseReview[] = [
  {
    id: "rv_seed_1", courseSlug: "ux-design-figma-masterclass",
    userName: "สมชาย ดีมาก", courseRating: 5, instructorRating: 5,
    comment: "คอร์สนี้ดีมากครับ เนื้อหาครอบคลุมและอาจารย์อธิบายได้ชัดเจน เข้าใจง่าย แนะนำสำหรับคนที่เริ่มต้นเลยครับ",
    createdAt: new Date("2026-04-12").toISOString(),
  },
  {
    id: "rv_seed_2", courseSlug: "ux-design-figma-masterclass",
    userName: "วรรณา สุขใจ", courseRating: 5, instructorRating: 4,
    comment: "เรียนแล้วได้ความรู้จริงๆ ค่ะ โปรเจกต์ท้ายคอร์สทำให้ได้ลองใช้งานจริงด้วย ชอบมากๆ",
    createdAt: new Date("2026-04-03").toISOString(),
  },
];

export async function getReviews(courseSlug: string): Promise<CourseReview[]> {
  return reviewStore
    .filter((r) => r.courseSlug === courseSlug)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getReviewSummary(courseSlug: string): Promise<{
  count: number; avgCourse: number; avgInstructor: number;
}> {
  const list = reviewStore.filter((r) => r.courseSlug === courseSlug);
  if (list.length === 0) return { count: 0, avgCourse: 0, avgInstructor: 0 };
  const avg = (sel: (r: CourseReview) => number) =>
    Math.round((list.reduce((s, r) => s + sel(r), 0) / list.length) * 10) / 10;
  return { count: list.length, avgCourse: avg((r) => r.courseRating), avgInstructor: avg((r) => r.instructorRating) };
}

export async function addReview(data: {
  courseSlug: string;
  courseRating: number;
  instructorRating: number;
  comment: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  const user = session?.user as { name?: string } | null;
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบก่อนรีวิว" };
  if (data.courseRating < 1 || data.instructorRating < 1) {
    return { success: false, error: "กรุณาให้คะแนนทั้งคอร์สและผู้สอน" };
  }
  if (!data.comment.trim()) return { success: false, error: "กรุณาเขียนความคิดเห็น" };

  reviewStore.unshift({
    id: `rv_${Date.now().toString(36)}`,
    courseSlug: data.courseSlug,
    userName: user.name ?? "ผู้เรียน",
    courseRating: data.courseRating,
    instructorRating: data.instructorRating,
    comment: data.comment.trim(),
    createdAt: new Date().toISOString(),
  });

  revalidatePath(`/th/courses/${data.courseSlug}`);
  revalidatePath(`/en/courses/${data.courseSlug}`);
  return { success: true };
}

// ── Course-level Q&A (สอบถามข้อสงสัย) ──────────────────────────────────────────

export interface CourseQuestion {
  id: string;
  courseSlug: string;
  userName: string;
  question: string;
  answer?: string;       // instructor answer
  answeredBy?: string;
  createdAt: string;
}

const questionStore: CourseQuestion[] = [
  {
    id: "q_seed_1", courseSlug: "ux-design-figma-masterclass",
    userName: "ปกรณ์ ใฝ่รู้",
    question: "คอร์สนี้ต้องมีพื้นฐานการออกแบบมาก่อนไหมครับ?",
    answer: "ไม่จำเป็นเลยค่ะ คอร์สนี้เริ่มจากศูนย์ เหมาะกับมือใหม่มากค่ะ",
    answeredBy: "คุณพิมพ์ชนก วัฒนากร",
    createdAt: new Date("2026-04-10").toISOString(),
  },
];

export async function getQuestions(courseSlug: string): Promise<CourseQuestion[]> {
  return questionStore
    .filter((q) => q.courseSlug === courseSlug)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function askQuestion(data: {
  courseSlug: string;
  question: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  const user = session?.user as { name?: string } | null;
  if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบก่อนถามคำถาม" };
  if (!data.question.trim() || data.question.trim().length < 5) {
    return { success: false, error: "กรุณาพิมพ์คำถามอย่างน้อย 5 ตัวอักษร" };
  }

  questionStore.unshift({
    id: `q_${Date.now().toString(36)}`,
    courseSlug: data.courseSlug,
    userName: user.name ?? "ผู้เรียน",
    question: data.question.trim(),
    createdAt: new Date().toISOString(),
  });

  revalidatePath(`/th/courses/${data.courseSlug}`);
  revalidatePath(`/en/courses/${data.courseSlug}`);
  return { success: true };
}
