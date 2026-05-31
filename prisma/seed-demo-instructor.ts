/**
 * Seed: 1 demo instructor-application account.
 * Run: npx tsx prisma/seed-demo-instructor.ts (DATABASE_URL + DIRECT_URL required)
 *
 * Creates an account that has filled & submitted the instructor application
 * (status PENDING) — ready to demo the full flow: login → see "รอแอดมินตรวจ",
 * and admin → /admin/instructors → approve → role becomes INSTRUCTOR.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const EMAIL = "teacher.demo@verda.dev";
const PASSWORD = "teacher1234";
const FULL_NAME = "ครูเดโม สอนสนุก";

async function main() {
  console.log("🌱 Creating demo instructor-application account...\n");

  // Clean prior runs
  const prev = await db.user.findUnique({ where: { email: EMAIL }, select: { id: true } });
  if (prev) {
    await db.instructorApplication.deleteMany({ where: { userId: prev.id } });
    await db.user.delete({ where: { id: prev.id } });
  }

  // 1. Account (created via signup — role STUDENT until approved)
  const user = await db.user.create({
    data: {
      email: EMAIL,
      name: FULL_NAME,
      passwordHash: await bcrypt.hash(PASSWORD, 12),
      role: "STUDENT",
      emailVerified: new Date(),
    },
  });

  // 2. Submitted instructor application (PENDING)
  await db.instructorApplication.create({
    data: {
      userId: user.id,
      status: "PENDING",
      fullName: FULL_NAME,
      email: EMAIL,
      headline: "Senior Frontend Engineer @ Tech Startup",
      expertise: "Web Development",
      bio: "นักพัฒนา Frontend ประสบการณ์ 7 ปี เชี่ยวชาญ React, Next.js และ TypeScript เคยเป็น tech lead ทีม 8 คน และชอบถ่ายทอดความรู้ผ่านการสอนและเขียนบทความ",
      experience: "7 ปีในสายงาน Frontend Development · สร้างระบบ e-commerce ที่มีผู้ใช้ 1M+ · พูดใน meetup หลายงาน",
      courseIdea: "คอร์ส 'React + Next.js สำหรับมือใหม่จนถึงระดับกลาง' — ครอบคลุม Hooks, App Router, Server Components, State Management และการ deploy จริง พร้อม workshop ทำโปรเจกต์",
      linkedIn: "https://linkedin.com/in/teacher-demo",
      website: "https://teacherdemo.dev",
    },
  });

  console.log("✅ Demo instructor-application account created\n");
  console.log("🔑 Login:");
  console.log(`   Email:    ${EMAIL}`);
  console.log(`   Password: ${PASSWORD}`);
  console.log("\n📋 Application status: PENDING (รอแอดมินตรวจสอบ)");
  console.log("   → Admin อนุมัติได้ที่ /th/admin/instructors → role เปลี่ยนเป็น INSTRUCTOR");
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌", e); process.exit(1); });
