/**
 * Mockup Seed — Complete student/demo learning experience
 * Run: npx tsx prisma/seed-mockup.ts  (DATABASE_URL + DIRECT_URL required)
 *
 * Idempotent: uses fixed IDs + delete-then-recreate for clean re-runs.
 * Builds full curriculum (sections, lessons, quizzes) for the 3 real courses,
 * then enrolls student@verda.dev and demo@verda.dev with realistic progress.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const STUDENT = "usr_student_001";
const DEMO = "usr_demo_001";

// ── Curriculum definitions ──────────────────────────────────────────────────
// type: "VIDEO" (yt: token) | "TEXT" (article markdown) | "QUIZ"

type LessonDef = {
  id: string;
  title: string;
  type: "VIDEO" | "TEXT" | "QUIZ";
  duration?: number;
  isFree?: boolean;
  videoAsset?: string;
  content?: string;
};
type SectionDef = { id: string; title: string; lessons: LessonDef[] };
type CourseDef = { id: string; sections: SectionDef[] };

const CURRICULA: CourseDef[] = [
  // ── UX Design & Figma Masterclass ──────────────────────────────────────────
  {
    id: "crs_001",
    sections: [
      {
        id: "sec_ux_1",
        title: "บทที่ 1 — พื้นฐาน UX Design",
        lessons: [
          { id: "les_ux_1_1", title: "ยินดีต้อนรับ + ภาพรวมคอร์ส", type: "VIDEO", duration: 360, isFree: true, videoAsset: "yt:c9Wg6Cb_YlU" },
          { id: "les_ux_1_2", title: "UX vs UI vs Product Design ต่างกันอย่างไร", type: "VIDEO", duration: 720, isFree: true, videoAsset: "yt:5CxXhyhT6Fc" },
          { id: "les_ux_1_3", title: "อ่าน: หลักการ Design Thinking 5 ขั้นตอน", type: "TEXT", duration: 480, content: "Design Thinking เป็นกระบวนการแก้ปัญหาที่เน้นผู้ใช้เป็นศูนย์กลาง ประกอบด้วย 5 ขั้นตอน:\n\n1. Empathize — เข้าใจผู้ใช้ผ่าน user research, interview และ observation\n2. Define — สรุปปัญหาที่แท้จริงเป็น problem statement ที่ชัดเจน\n3. Ideate — ระดมไอเดียแก้ปัญหาให้ได้มากที่สุดโดยไม่ตัดสิน\n4. Prototype — สร้างต้นแบบเพื่อทดสอบไอเดียอย่างรวดเร็ว\n5. Test — ทดสอบกับผู้ใช้จริงแล้วนำ feedback มาปรับปรุง\n\nกระบวนการนี้ไม่ได้เป็นเส้นตรง แต่เป็น iterative — เราวนกลับไปแก้ไขได้ตลอดเวลาเมื่อได้ข้อมูลใหม่" },
        ],
      },
      {
        id: "sec_ux_2",
        title: "บทที่ 2 — Figma สำหรับงานจริง",
        lessons: [
          { id: "les_ux_2_1", title: "ติดตั้ง Figma และตั้งค่า Workspace", type: "VIDEO", duration: 600, videoAsset: "yt:jk1T0CdLxwU" },
          { id: "les_ux_2_2", title: "Auto Layout และ Components", type: "VIDEO", duration: 900, videoAsset: "yt:sFOgQpoChqA" },
          { id: "les_ux_2_3", title: "อ่าน: Best Practices การตั้งชื่อ Layer", type: "TEXT", duration: 300, content: "การตั้งชื่อ layer ที่ดีช่วยให้ทีมทำงานร่วมกันได้ง่ายขึ้น:\n\n- ใช้ชื่อที่สื่อความหมาย เช่น 'btn/primary' แทน 'Rectangle 23'\n- จัดกลุ่มด้วย / เพื่อสร้าง hierarchy เช่น 'card/header/title'\n- ตั้งชื่อ component ตามหน้าที่ ไม่ใช่ตามรูปร่าง\n- ใช้ตัวพิมพ์เล็กและ kebab-case อย่างสม่ำเสมอ" },
        ],
      },
      {
        id: "sec_ux_3",
        title: "บทที่ 3 — วัดความเข้าใจ",
        lessons: [
          { id: "les_ux_3_1", title: "สรุปคอร์ส + ขั้นตอนถัดไป", type: "VIDEO", duration: 420, videoAsset: "yt:c9Wg6Cb_YlU" },
          { id: "les_ux_3_q", title: "แบบทดสอบท้ายคอร์ส UX Design", type: "QUIZ", duration: 600 },
        ],
      },
    ],
  },
  // ── Machine Learning Specialization ────────────────────────────────────────
  {
    id: "crs_002",
    sections: [
      {
        id: "sec_ml_1",
        title: "บทที่ 1 — Introduction to ML",
        lessons: [
          { id: "les_ml_1_1", title: "Machine Learning คืออะไร", type: "VIDEO", duration: 540, isFree: true, videoAsset: "yt:ukzFI9rgwfU" },
          { id: "les_ml_1_2", title: "Supervised vs Unsupervised Learning", type: "VIDEO", duration: 660, videoAsset: "yt:1FZ0A1QCMWc" },
          { id: "les_ml_1_3", title: "อ่าน: ศัพท์พื้นฐานที่ต้องรู้", type: "TEXT", duration: 360, content: "ศัพท์พื้นฐานใน Machine Learning:\n\n- Feature — ตัวแปรนำเข้า (input) ที่ใช้ทำนาย\n- Label — คำตอบที่ถูกต้อง (output) ในข้อมูล training\n- Model — ฟังก์ชันที่เรียนรู้ความสัมพันธ์ระหว่าง feature กับ label\n- Training — กระบวนการปรับ parameter ของ model จากข้อมูล\n- Overfitting — model จำข้อมูล training มากเกินไปจนทำนายข้อมูลใหม่ได้แย่\n- Gradient Descent — อัลกอริทึมหาค่า parameter ที่ทำให้ error ต่ำสุด" },
        ],
      },
      {
        id: "sec_ml_2",
        title: "บทที่ 2 — Linear Regression",
        lessons: [
          { id: "les_ml_2_1", title: "Cost Function และ Gradient Descent", type: "VIDEO", duration: 840, videoAsset: "yt:1FZ0A1QCMWc" },
          { id: "les_ml_2_2", title: "แบบทดสอบ: ML Fundamentals", type: "QUIZ", duration: 480 },
        ],
      },
    ],
  },
  // ── Next.js 15 Fullstack Bootcamp ──────────────────────────────────────────
  {
    id: "crs_003",
    sections: [
      {
        id: "sec_next_1",
        title: "บทที่ 1 — App Router พื้นฐาน",
        lessons: [
          { id: "les_next_1_1", title: "แนะนำ Next.js 15 + App Router", type: "VIDEO", duration: 480, isFree: true, videoAsset: "yt:ZVnjOPwW4ZA" },
          { id: "les_next_1_2", title: "Server Components vs Client Components", type: "VIDEO", duration: 720, videoAsset: "yt:Qdkvc4nfeWE" },
          { id: "les_next_1_3", title: "อ่าน: โครงสร้างโฟลเดอร์ App Router", type: "TEXT", duration: 300, content: "App Router ใช้ file-system routing:\n\n- app/page.tsx → หน้าแรก (/)\n- app/about/page.tsx → /about\n- app/blog/[slug]/page.tsx → /blog/:slug (dynamic)\n- layout.tsx → layout ที่ครอบ route ในโฟลเดอร์นั้น\n- loading.tsx → UI ระหว่างโหลด (Suspense)\n- error.tsx → error boundary\n\nไฟล์ที่ขึ้นต้นด้วย _ หรืออยู่ใน (group) จะไม่สร้าง route" },
        ],
      },
      {
        id: "sec_next_2",
        title: "บทที่ 2 — Data & Server Actions",
        lessons: [
          { id: "les_next_2_1", title: "Server Actions และ Mutations", type: "VIDEO", duration: 900, videoAsset: "yt:dDpZfOQBMaU" },
          { id: "les_next_2_2", title: "แบบทดสอบ: Next.js Core Concepts", type: "QUIZ", duration: 540 },
        ],
      },
    ],
  },
];

// ── Quizzes (keyed by the QUIZ lesson id) ──────────────────────────────────────
const QUIZZES: Record<string, { title: string; questions: { text: string; type: "SINGLE" | "MULTIPLE"; options: { text: string; correct: boolean }[] }[] }> = {
  les_ux_3_q: {
    title: "แบบทดสอบท้ายคอร์ส UX Design",
    questions: [
      { text: "ขั้นตอนแรกของ Design Thinking คืออะไร?", type: "SINGLE", options: [
        { text: "Empathize (เข้าใจผู้ใช้)", correct: true },
        { text: "Prototype", correct: false },
        { text: "Test", correct: false },
        { text: "Define", correct: false },
      ]},
      { text: "ข้อใดเป็นหน้าที่ของ UX Designer (เลือกได้หลายข้อ)", type: "MULTIPLE", options: [
        { text: "ทำ User Research", correct: true },
        { text: "ออกแบบ User Flow", correct: true },
        { text: "เขียน Backend API", correct: false },
        { text: "สร้าง Wireframe", correct: true },
      ]},
      { text: "Auto Layout ใน Figma มีไว้เพื่ออะไร?", type: "SINGLE", options: [
        { text: "จัด element ให้ responsive อัตโนมัติ", correct: true },
        { text: "เปลี่ยนสี theme", correct: false },
        { text: "export เป็นโค้ด", correct: false },
        { text: "เพิ่ม animation", correct: false },
      ]},
    ],
  },
  les_ml_2_2: {
    title: "แบบทดสอบ: ML Fundamentals",
    questions: [
      { text: "Supervised Learning ต้องใช้ข้อมูลแบบใด?", type: "SINGLE", options: [
        { text: "ข้อมูลที่มี label (คำตอบ)", correct: true },
        { text: "ข้อมูลที่ไม่มี label", correct: false },
        { text: "ข้อมูลภาพเท่านั้น", correct: false },
        { text: "ข้อมูลเรียลไทม์", correct: false },
      ]},
      { text: "Overfitting หมายถึงอะไร?", type: "SINGLE", options: [
        { text: "Model จำ training data มากเกินไปจนทำนายข้อมูลใหม่ได้แย่", correct: true },
        { text: "Model เรียนรู้ช้าเกินไป", correct: false },
        { text: "ข้อมูลมีน้อยเกินไป", correct: false },
        { text: "Model ใช้ memory เยอะ", correct: false },
      ]},
    ],
  },
  les_next_2_2: {
    title: "แบบทดสอบ: Next.js Core Concepts",
    questions: [
      { text: "Server Component โดยค่าเริ่มต้นใน App Router คือ?", type: "SINGLE", options: [
        { text: "ทุก component เป็น Server Component จนกว่าจะใส่ 'use client'", correct: true },
        { text: "ทุก component เป็น Client Component", correct: false },
        { text: "ต้องใส่ 'use server' ทุกไฟล์", correct: false },
        { text: "ขึ้นกับ next.config", correct: false },
      ]},
      { text: "ไฟล์ใดสร้าง dynamic route?", type: "SINGLE", options: [
        { text: "app/blog/[slug]/page.tsx", correct: true },
        { text: "app/blog/page.tsx", correct: false },
        { text: "app/blog/slug.tsx", correct: false },
        { text: "app/blog/_slug/page.tsx", correct: false },
      ]},
    ],
  },
};

// ── Enrollment plan: [userId, courseId, progressPct, lastLesson, completed] ────
const ENROLLMENTS: { userId: string; courseId: string; pct: number; lastLesson: string; completedLessons: string[]; cert?: boolean }[] = [
  // Student: 1 complete (+cert), 1 mid, 1 just started
  { userId: STUDENT, courseId: "crs_001", pct: 100, lastLesson: "les_ux_3_1", completedLessons: ["les_ux_1_1","les_ux_1_2","les_ux_1_3","les_ux_2_1","les_ux_2_2","les_ux_2_3","les_ux_3_1"], cert: true },
  { userId: STUDENT, courseId: "crs_002", pct: 60, lastLesson: "les_ml_2_1", completedLessons: ["les_ml_1_1","les_ml_1_2","les_ml_1_3"] },
  { userId: STUDENT, courseId: "crs_003", pct: 25, lastLesson: "les_next_1_2", completedLessons: ["les_next_1_1"] },
  // Demo: 1 complete (+cert), 1 mid
  { userId: DEMO, courseId: "crs_003", pct: 100, lastLesson: "les_next_2_1", completedLessons: ["les_next_1_1","les_next_1_2","les_next_1_3","les_next_2_1"], cert: true },
  { userId: DEMO, courseId: "crs_001", pct: 45, lastLesson: "les_ux_2_1", completedLessons: ["les_ux_1_1","les_ux_1_2","les_ux_1_3"] },
];

async function main() {
  console.log("🌱 Building complete mockup data...\n");

  // 1. Remove junk test courses
  const junk = await db.course.findMany({ where: { slug: { in: ["123", "123456"] } }, select: { id: true } });
  for (const c of junk) {
    await db.course.delete({ where: { id: c.id } }).catch(() => {});
  }
  console.log(`🧹 Removed ${junk.length} junk courses`);

  // 2. Build curriculum for each real course (delete sections → cascade, recreate)
  for (const course of CURRICULA) {
    await db.section.deleteMany({ where: { courseId: course.id } });
    let totalDuration = 0;
    for (const [si, sec] of course.sections.entries()) {
      await db.section.create({ data: { id: sec.id, courseId: course.id, title: sec.title, order: si + 1 } });
      for (const [li, les] of sec.lessons.entries()) {
        totalDuration += les.duration ?? 0;
        await db.lesson.create({
          data: {
            id: les.id, sectionId: sec.id, title: les.title,
            type: les.type, order: li + 1, duration: les.duration ?? null,
            isFree: les.isFree ?? false, videoAsset: les.videoAsset ?? null,
            content: les.content ?? null,
          },
        });
        // Attach quiz if this is a QUIZ lesson
        const quiz = QUIZZES[les.id];
        if (quiz) {
          const q = await db.quiz.create({
            data: { lessonId: les.id, title: quiz.title, timeLimitSec: les.duration ?? 600, passingScore: 70 },
          });
          for (const [qi, qq] of quiz.questions.entries()) {
            const question = await db.question.create({
              data: { quizId: q.id, text: qq.text, type: qq.type, order: qi + 1, points: 1 },
            });
            for (const [oi, opt] of qq.options.entries()) {
              await db.questionOption.create({
                data: { questionId: question.id, text: opt.text, isCorrect: opt.correct, order: oi + 1 },
              });
            }
          }
        }
      }
    }
    const lessonCount = course.sections.reduce((n, s) => n + s.lessons.length, 0);
    await db.course.update({ where: { id: course.id }, data: { totalDuration } });
    console.log(`📚 ${course.id}: ${course.sections.length} sections, ${lessonCount} lessons`);
  }

  // 3. Enrollments + progress + certificates
  for (const e of ENROLLMENTS) {
    // Clean prior records for re-run safety
    const existing = await db.enrollment.findUnique({ where: { userId_courseId: { userId: e.userId, courseId: e.courseId } } });
    if (existing) {
      await db.userCourseProgress.deleteMany({ where: { enrollmentId: existing.id } });
      await db.enrollment.delete({ where: { id: existing.id } });
    }

    const enrollment = await db.enrollment.create({
      data: {
        userId: e.userId, courseId: e.courseId,
        enrolledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
        completedAt: e.pct === 100 ? new Date() : null,
      },
    });
    await db.userCourseProgress.create({
      data: { enrollmentId: enrollment.id, userId: e.userId, courseId: e.courseId, progressPct: e.pct, lastLesson: e.lastLesson },
    });

    // LessonProgress for completed lessons
    for (const lessonId of e.completedLessons) {
      await db.lessonProgress.upsert({
        where: { userId_lessonId: { userId: e.userId, lessonId } },
        create: { userId: e.userId, lessonId, watchedPct: 100, completed: true, completedAt: new Date() },
        update: { watchedPct: 100, completed: true, completedAt: new Date() },
      });
    }

    // Certificate for completed courses
    if (e.cert) {
      await db.certificate.upsert({
        where: { userId_courseId: { userId: e.userId, courseId: e.courseId } },
        create: { userId: e.userId, courseId: e.courseId },
        update: {},
      });
    }
    console.log(`🎓 enroll ${e.userId} → ${e.courseId} (${e.pct}%${e.cert ? " +cert" : ""})`);
  }

  // 4. Refresh course enrollmentCount
  for (const id of ["crs_001", "crs_002", "crs_003"]) {
    const count = await db.enrollment.count({ where: { courseId: id } });
    await db.course.update({ where: { id }, data: { enrollmentCount: { increment: 0 } } }).catch(() => {});
    console.log(`📊 ${id}: ${count} active enrollments`);
  }

  console.log("\n✅ Mockup seed complete!");
  console.log("\n🔑 ทดสอบได้ที่:");
  console.log("  student@verda.dev / student1234 → 3 คอร์ส (100%/60%/25%) + 1 cert");
  console.log("  demo@verda.dev    / demo1234    → 2 คอร์ส (100%/45%) + 1 cert");
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌", e); process.exit(1); });
