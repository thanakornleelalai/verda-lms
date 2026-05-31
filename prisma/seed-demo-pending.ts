/**
 * Seed: 1 demo account that has applied to be an instructor and is PENDING.
 * Run: npx tsx prisma/seed-demo-pending.ts (DATABASE_URL + DIRECT_URL required)
 *
 * Demonstrates the gated flow:
 *   login → /studio shows "รออนุมัติ" (cannot do instructor activities)
 *   admin → /admin/instructors → approve → role becomes INSTRUCTOR
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const EMAIL = "applicant.demo@verda.dev";
const PASSWORD = "applicant1234";
const FULL_NAME = "สมหวัง อยากสอน";

async function main() {
  console.log("🌱 Creating PENDING instructor-applicant demo account...\n");

  const prev = await db.user.findUnique({ where: { email: EMAIL }, select: { id: true } });
  if (prev) {
    await db.instructorApplication.deleteMany({ where: { userId: prev.id } });
    await db.user.delete({ where: { id: prev.id } });
  }

  // Account created via signup — role STUDENT (still pending)
  const user = await db.user.create({
    data: {
      email: EMAIL,
      name: FULL_NAME,
      passwordHash: await bcrypt.hash(PASSWORD, 12),
      role: "STUDENT",
      emailVerified: new Date(),
    },
  });

  // Submitted instructor application — PENDING (รอแอดมินอนุมัติ)
  await db.instructorApplication.create({
    data: {
      userId: user.id,
      status: "PENDING",
      fullName: FULL_NAME,
      email: EMAIL,
      headline: "Data Analyst @ E-commerce",
      expertise: "Data Science / AI",
      bio: "นักวิเคราะห์ข้อมูลประสบการณ์ 5 ปี เชี่ยวชาญ Python, SQL และ Data Visualization อยากแบ่งปันความรู้ด้าน Data Analytics ให้คนทั่วไปเข้าถึงได้",
      experience: "5 ปีด้าน Data Analytics · สร้าง dashboard ให้ทีมการตลาด · สอน workshop ภายในองค์กร",
      courseIdea: "คอร์ส 'Data Analytics สำหรับมือใหม่' — เริ่มจาก Excel/Google Sheets ไปจนถึง Python (pandas) และการทำ Dashboard ด้วย Looker Studio",
      linkedIn: "https://linkedin.com/in/applicant-demo",
    },
  });

  console.log("✅ PENDING instructor-applicant created\n");
  console.log("🔑 Login:");
  console.log(`   Email:    ${EMAIL}`);
  console.log(`   Password: ${PASSWORD}`);
  console.log("\n📋 สถานะ: PENDING (role STUDENT)");
  console.log("   • login → เข้า /studio = เห็นหน้า 'รออนุมัติ' (ทำกิจกรรมผู้สอนไม่ได้)");
  console.log("   • admin (admin@verda.dev/admin1234) → /th/admin/instructors → กดอนุมัติ");
  console.log("   • จากนั้นผู้สมัคร login ใหม่ → เข้า Instructor Studio ได้");
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌", e); process.exit(1); });
