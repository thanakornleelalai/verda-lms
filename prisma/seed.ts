/**
 * Prisma Seed Script — VERDA LMS
 * Run: npx prisma db seed
 * Requires: DATABASE_URL in .env.local
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding VERDA LMS database...");

  // ── Categories ────────────────────────────────────────────────────────────

  const categories = await Promise.all([
    db.category.upsert({ where: { slug: "design" }, update: {}, create: { slug: "design", label: "UX/UI Design", icon: "🎨", count: 0 } }),
    db.category.upsert({ where: { slug: "ai-data" }, update: {}, create: { slug: "ai-data", label: "AI & Data", icon: "🤖", count: 0 } }),
    db.category.upsert({ where: { slug: "development" }, update: {}, create: { slug: "development", label: "Web Development", icon: "💻", count: 0 } }),
    db.category.upsert({ where: { slug: "marketing" }, update: {}, create: { slug: "marketing", label: "Digital Marketing", icon: "📱", count: 0 } }),
    db.category.upsert({ where: { slug: "business" }, update: {}, create: { slug: "business", label: "Business", icon: "💼", count: 0 } }),
  ]);
  console.log(`✅ ${categories.length} categories`);

  // ── Users ─────────────────────────────────────────────────────────────────

  const [studentUser, instructorUser, adminUser] = await Promise.all([
    db.user.upsert({
      where: { email: "student@verda.dev" },
      update: {},
      create: {
        id: "usr_student_001",
        email: "student@verda.dev",
        name: "คุณสมชาย ทดสอบ",
        passwordHash: await bcrypt.hash("student1234", 12),
        role: "STUDENT",
        bio: "นักเรียนที่ชอบเรียนรู้สิ่งใหม่ๆ",
        emailVerified: new Date(),
      },
    }),
    db.user.upsert({
      where: { email: "instructor@verda.dev" },
      update: {},
      create: {
        id: "usr_instructor_001",
        email: "instructor@verda.dev",
        name: "คุณพิมพ์ชนก วัฒนากร",
        passwordHash: await bcrypt.hash("instructor1234", 12),
        role: "INSTRUCTOR",
        headline: "Lead UX Designer @ SCB",
        bio: "ดีไซเนอร์ที่มีประสบการณ์ 10+ ปี ในการออกแบบ UX/UI สำหรับ fintech และ e-commerce",
        emailVerified: new Date(),
      },
    }),
    db.user.upsert({
      where: { email: "admin@verda.dev" },
      update: {},
      create: {
        id: "usr_admin_001",
        email: "admin@verda.dev",
        name: "Admin (Dev)",
        passwordHash: await bcrypt.hash("admin1234", 12),
        role: "ADMIN",
        emailVerified: new Date(),
      },
    }),
  ]);
  console.log("✅ 3 users (student, instructor, admin)");

  // ── Demo accounts ─────────────────────────────────────────────────────────

  await db.user.upsert({
    where: { email: "demo@verda.dev" },
    update: {},
    create: {
      id: "usr_demo_001",
      email: "demo@verda.dev",
      name: "Demo User",
      passwordHash: await bcrypt.hash("demo1234", 12),
      role: "STUDENT",
      emailVerified: new Date(),
    },
  });

  // ── Courses ───────────────────────────────────────────────────────────────

  const uxCourse = await db.course.upsert({
    where: { slug: "ux-design-figma-masterclass" },
    update: {},
    create: {
      id: "crs_001",
      slug: "ux-design-figma-masterclass",
      title: "UX Design & Figma Masterclass",
      description: "เรียนรู้ UX Design และ Figma จากผู้เชี่ยวชาญที่ทำงานจริง",
      longDescription: "คอร์สครบวงจรสำหรับนักออกแบบที่ต้องการพัฒนาทักษะ UX/UI",
      monogram: "UX",
      art: "linear-gradient(135deg, #0F5D4A 0%, #1A7A60 100%)",
      price: 199900,
      currency: "THB",
      level: "BEGINNER",
      status: "PUBLISHED",
      language: "th",
      tags: ["UX", "UI", "Figma", "Design"],
      totalDuration: 28800,
      rating: 4.9,
      ratingCount: 248,
      enrollmentCount: 1203,
      instructorId: instructorUser.id,
      categoryId: categories[0].id,
    },
  });

  const mlCourse = await db.course.upsert({
    where: { slug: "machine-learning-specialization" },
    update: {},
    create: {
      id: "crs_002",
      slug: "machine-learning-specialization",
      title: "Machine Learning Specialization",
      description: "Machine Learning จาก Andrew Ng — ภาษาไทย",
      monogram: "ML",
      art: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
      price: 299900,
      currency: "THB",
      level: "INTERMEDIATE",
      status: "PUBLISHED",
      language: "th",
      tags: ["ML", "Python", "AI"],
      totalDuration: 43200,
      rating: 4.8,
      ratingCount: 512,
      enrollmentCount: 2841,
      instructorId: instructorUser.id,
      categoryId: categories[1].id,
    },
  });

  const nextjsCourse = await db.course.upsert({
    where: { slug: "nextjs-15-fullstack-bootcamp" },
    update: {},
    create: {
      id: "crs_003",
      slug: "nextjs-15-fullstack-bootcamp",
      title: "Next.js 15 Fullstack Bootcamp",
      description: "สร้าง web app จริงด้วย Next.js 15 + TypeScript + Prisma",
      monogram: "NX",
      art: "linear-gradient(135deg, #1A2320 0%, #2D6A4F 100%)",
      price: 249900,
      currency: "THB",
      level: "INTERMEDIATE",
      status: "PUBLISHED",
      language: "th",
      tags: ["Next.js", "React", "TypeScript", "Fullstack"],
      totalDuration: 36000,
      rating: 4.7,
      ratingCount: 186,
      enrollmentCount: 891,
      instructorId: instructorUser.id,
      categoryId: categories[2].id,
    },
  });

  console.log("✅ 3 courses");

  // ── Sections & Lessons ────────────────────────────────────────────────────

  const section1 = await db.section.upsert({
    where: { id: "sec_ux_001" },
    update: {},
    create: {
      id: "sec_ux_001",
      courseId: uxCourse.id,
      title: "บทที่ 1 — พื้นฐาน UX Design",
      order: 1,
    },
  });

  await db.lesson.upsert({
    where: { id: "les_ux_001" },
    update: {},
    create: {
      id: "les_ux_001",
      sectionId: section1.id,
      title: "แนะนำ UX Design คืออะไร?",
      type: "VIDEO",
      order: 1,
      duration: 1800,
      isFree: true,
    },
  });

  await db.lesson.upsert({
    where: { id: "les_ux_002" },
    update: {},
    create: {
      id: "les_ux_002",
      sectionId: section1.id,
      title: "กระบวนการ Design Thinking",
      type: "VIDEO",
      order: 2,
      duration: 2400,
      isFree: false,
    },
  });

  console.log("✅ Sections & lessons");

  // ── Enrollment ────────────────────────────────────────────────────────────

  await db.enrollment.upsert({
    where: { userId_courseId: { userId: studentUser.id, courseId: uxCourse.id } },
    update: {},
    create: {
      userId: studentUser.id,
      courseId: uxCourse.id,
    },
  });

  console.log("✅ 1 enrollment");

  // ── Certificate ───────────────────────────────────────────────────────────

  await db.certificate.upsert({
    where: { userId_courseId: { userId: studentUser.id, courseId: uxCourse.id } },
    update: {},
    create: {
      id: "cert_ux_001",
      userId: studentUser.id,
      courseId: uxCourse.id,
      issuedAt: new Date("2026-03-20"),
    },
  });

  console.log("✅ 1 certificate");

  // ── Badges ────────────────────────────────────────────────────────────────

  await Promise.all([
    db.badge.upsert({ where: { slug: "first-course" }, update: {}, create: { slug: "first-course", name: "First Step", description: "เรียนจบคอร์สแรก", icon: "🎯", tier: "BRONZE" } }),
    db.badge.upsert({ where: { slug: "speed-learner" }, update: {}, create: { slug: "speed-learner", name: "Speed Learner", description: "เรียนจบคอร์สภายใน 7 วัน", icon: "⚡", tier: "SILVER" } }),
    db.badge.upsert({ where: { slug: "quiz-master" }, update: {}, create: { slug: "quiz-master", name: "Quiz Master", description: "ผ่าน Quiz ด้วยคะแนน 100% 3 ครั้ง", icon: "🧠", tier: "GOLD" } }),
    db.badge.upsert({ where: { slug: "top-learner" }, update: {}, create: { slug: "top-learner", name: "Top Learner", description: "ติดอันดับ Top 10 Leaderboard", icon: "👑", tier: "PLATINUM" } }),
  ]);

  console.log("✅ 4 badges");

  // ── Coupon codes ──────────────────────────────────────────────────────────

  await Promise.all([
    db.coupon.upsert({ where: { code: "VERDA15" }, update: {}, create: { code: "VERDA15", discountPct: 15, maxUses: 1000, expiresAt: new Date("2027-12-31") } }),
    db.coupon.upsert({ where: { code: "VERDA20" }, update: {}, create: { code: "VERDA20", discountPct: 20, maxUses: 500, expiresAt: new Date("2027-06-30") } }),
    db.coupon.upsert({ where: { code: "WELCOME10" }, update: {}, create: { code: "WELCOME10", discountPct: 10, maxUses: 999 } }),
  ]);

  console.log("✅ 3 coupon codes (VERDA15, VERDA20, WELCOME10)");

  // ── UserPoints ────────────────────────────────────────────────────────────

  await db.userPoints.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: { userId: studentUser.id, total: 350 },
  });

  // ── Forum thread ──────────────────────────────────────────────────────────

  const thread = await db.thread.upsert({
    where: { id: "thr_001" },
    update: {},
    create: {
      id: "thr_001",
      courseId: uxCourse.id,
      userId: studentUser.id,
      title: "ถามเรื่อง Component Library ใน Figma",
      body: "อยากรู้ว่าควรสร้าง Component Library ยังไงดีครับ มีเทคนิคแนะนำไหม?",
      status: "OPEN",
    },
  });

  await db.post.upsert({
    where: { id: "pst_001" },
    update: {},
    create: {
      id: "pst_001",
      threadId: thread.id,
      userId: instructorUser.id,
      body: "แนะนำให้เริ่มจาก Atomic Design ครับ เริ่มจาก Atoms → Molecules → Organisms แล้วค่อยประกอบเป็น Templates",
    },
  });

  console.log("✅ 1 forum thread + 1 post");

  console.log("\n🎉 Seed complete!");
  console.log(`
📊 สรุป:
  - 5 Categories
  - 4 Users (student, instructor, admin, demo)
  - 3 Courses (UX, ML, Next.js)
  - 1 Enrollment
  - 1 Certificate
  - 4 Badges
  - 3 Coupons
  - 1 Forum thread

🔑 Login credentials:
  Student:    student@verda.dev  / student1234
  Instructor: instructor@verda.dev / instructor1234
  Admin:      admin@verda.dev  / admin1234
  Demo:       demo@verda.dev   / demo1234
  `);
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => db.$disconnect());
