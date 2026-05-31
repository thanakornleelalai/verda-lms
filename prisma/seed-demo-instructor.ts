/**
 * Seed: 1 demo instructor account (APPROVED → role INSTRUCTOR).
 * Run: npx tsx prisma/seed-demo-instructor.ts (DATABASE_URL + DIRECT_URL required)
 *
 * Account has a filled instructor application that is APPROVED, so the user's
 * role is INSTRUCTOR and login routes to /studio (Instructor Studio).
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

  const HEADLINE = "Senior Frontend Engineer @ Tech Startup";
  const BIO = "นักพัฒนา Frontend ประสบการณ์ 7 ปี เชี่ยวชาญ React, Next.js และ TypeScript เคยเป็น tech lead ทีม 8 คน และชอบถ่ายทอดความรู้ผ่านการสอนและเขียนบทความ";

  // 1. Account — role INSTRUCTOR (approved) with profile filled
  const user = await db.user.create({
    data: {
      email: EMAIL,
      name: FULL_NAME,
      passwordHash: await bcrypt.hash(PASSWORD, 12),
      role: "INSTRUCTOR",
      headline: HEADLINE,
      bio: BIO,
      website: "https://teacherdemo.dev",
      emailVerified: new Date(),
    },
  });

  // 2. Instructor application — APPROVED
  await db.instructorApplication.create({
    data: {
      userId: user.id,
      status: "APPROVED",
      reviewedBy: "usr_admin_001",
      reviewedAt: new Date(),
      reviewNote: "อนุมัติ — โปรไฟล์และไอเดียคอร์สครบถ้วน",
      fullName: FULL_NAME,
      email: EMAIL,
      headline: HEADLINE,
      expertise: "Web Development",
      bio: BIO,
      experience: "7 ปีในสายงาน Frontend Development · สร้างระบบ e-commerce ที่มีผู้ใช้ 1M+ · พูดใน meetup หลายงาน",
      courseIdea: "คอร์ส 'React + Next.js สำหรับมือใหม่จนถึงระดับกลาง' — ครอบคลุม Hooks, App Router, Server Components, State Management และการ deploy จริง พร้อม workshop ทำโปรเจกต์",
      linkedIn: "https://linkedin.com/in/teacher-demo",
      website: "https://teacherdemo.dev",
    },
  });

  console.log("✅ Demo INSTRUCTOR account created (role=INSTRUCTOR, application APPROVED)\n");
  console.log("🔑 Login:");
  console.log(`   Email:    ${EMAIL}`);
  console.log(`   Password: ${PASSWORD}`);
  console.log("\n➡️  Login → /redirect → /studio (Instructor Studio)");
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌", e); process.exit(1); });
