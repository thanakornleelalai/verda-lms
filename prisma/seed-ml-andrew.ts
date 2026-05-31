/**
 * Seed: Machine Learning Specialization (Andrew Ng) — slug: machine-learning-andrew-ng
 * Run: npx tsx prisma/seed-ml-andrew.ts  (DATABASE_URL + DIRECT_URL required)
 *
 * Uses the 41 videos from playlist PLkDaE6sCZn6FNC6YRfRQc_FbeQrF8BwGI
 * (Course 1 — Supervised Machine Learning: Regression & Classification),
 * mapped in playlist order to Andrew Ng's official Course 1 syllabus.
 * Idempotent: fixed IDs + delete-then-recreate sections.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const COURSE_ID = "crs_ml_andrew";
const SLUG = "machine-learning-andrew-ng";
const INSTRUCTOR_ID = "usr_andrew_ng";

// 41 video IDs in playlist order
const VIDS = "vStJoetOxJg,wiNXzydta4c,XtlwSmJfUs4,sca5rQ9x1cA,hh6gE0LxfO8,gG_wI_uGfIE,_0bhZBqtCCs,6dTL76DWYQU,dLc-lfEEYss,KWULpBYzIYk,CFN5zHzEuGY,peNRqkfukYY,bFNz2u0hl9E,L5INhX5cbWU,WtlvKq_zxPI,w_2vCijLiiM,PKm61nrqpCA,k0h8emRAAHE,RGL_XUjPkGo,tHDDbqYfflM,jXg0vU0y1ak,U6zuBcmLxSg,uvTL1N02f04,YjpCQof9tI8,YVtP5UGdgXg,gmJqLGrUscg,5g4H5_gsTpU,P_9hNBVRldM,ecOdZlY9jsQ,IFkRKJ5iBDE,p-ltr1C7u2o,xuTiAW0OR40,0az8RjxLLPQ,vq4Ie5xWhww,YkTcK_LXAxw,6SZUnXEHCns,8upNQi-40Q8,1kgcON0Eauc,NIiZZY7nlfU,jhrrw8Iuus0,NhZXRzH2y-E".split(",");

// Lesson titles mapped to playlist order (Andrew Ng — Course 1 official syllabus)
const TITLES = [
  // Week 1 (1–20)
  "Welcome to machine learning",
  "Applications of machine learning",
  "What is machine learning?",
  "Supervised learning part 1",
  "Supervised learning part 2",
  "Unsupervised learning part 1",
  "Unsupervised learning part 2",
  "Jupyter Notebooks",
  "Linear regression model part 1",
  "Linear regression model part 2",
  "Cost function formula",
  "Cost function intuition",
  "Visualizing the cost function",
  "Visualization examples",
  "Gradient descent",
  "Implementing gradient descent",
  "Gradient descent intuition",
  "Learning rate",
  "Gradient descent for linear regression",
  "Running gradient descent",
  // Week 2 (21–30)
  "Multiple features",
  "Vectorization part 1",
  "Vectorization part 2",
  "Gradient descent for multiple linear regression",
  "Feature scaling part 1",
  "Feature scaling part 2",
  "Checking gradient descent for convergence",
  "Choosing the learning rate",
  "Feature engineering",
  "Polynomial regression",
  // Week 3 (31–41)
  "Motivations (Classification)",
  "Logistic regression",
  "Decision boundary",
  "Cost function for logistic regression",
  "Simplified cost function",
  "Gradient descent implementation",
  "The problem of overfitting",
  "Addressing overfitting",
  "Cost function with regularization",
  "Regularized linear regression",
  "Regularized logistic regression",
];

// Section boundaries (0-indexed start in VIDS): week 1 = 0..19, week 2 = 20..29, week 3 = 30..40
const SECTIONS = [
  { id: "sec_mla_1", title: "Week 1 — Introduction to ML & Linear Regression", start: 0, end: 20 },
  { id: "sec_mla_2", title: "Week 2 — Regression with Multiple Variables", start: 20, end: 30 },
  { id: "sec_mla_3", title: "Week 3 — Classification & Regularization", start: 30, end: 41 },
];

async function main() {
  console.log("🌱 Seeding Machine Learning Specialization (Andrew Ng)...\n");

  // 1. Instructor
  await db.user.upsert({
    where: { id: INSTRUCTOR_ID },
    update: {},
    create: {
      id: INSTRUCTOR_ID,
      name: "Andrew Ng",
      email: "andrew.ng@verda.dev",
      role: "INSTRUCTOR",
      headline: "Founder of DeepLearning.AI · Co-founder of Coursera",
      bio: "Andrew Ng เป็นผู้เชี่ยวชาญด้าน AI ระดับโลก ผู้ก่อตั้ง DeepLearning.AI และ Coursera อดีตหัวหน้า Google Brain และ Chief Scientist ที่ Baidu",
    },
  });
  console.log("✅ Instructor: Andrew Ng");

  // 2. Course (upsert by id)
  await db.course.upsert({
    where: { id: COURSE_ID },
    update: {
      slug: SLUG, title: "Machine Learning Specialization", status: "PUBLISHED",
      price: 0, instructorId: INSTRUCTOR_ID,
    },
    create: {
      id: COURSE_ID, slug: SLUG,
      title: "Machine Learning Specialization",
      description: "เรียน Machine Learning ตั้งแต่พื้นฐานกับ Andrew Ng — Course 1: Supervised Learning ครอบคลุม Linear Regression, Gradient Descent, Logistic Regression, Classification และ Regularization พร้อมวิดีโอบรรยายเต็มหลักสูตร 41 บทเรียน",
      longDescription: "หลักสูตร Machine Learning Specialization โดย Andrew Ng — Course 1 ว่าด้วย Supervised Machine Learning: Regression and Classification เหมาะสำหรับผู้เริ่มต้น เรียนรู้ทั้งทฤษฎีและการนำไปใช้จริงด้วย Python",
      status: "PUBLISHED", price: 0, currency: "THB", level: "BEGINNER", language: "en",
      instructorId: INSTRUCTOR_ID,
      monogram: "ML", art: "linear-gradient(135deg,#1e3a8a 0%,#3b82f6 100%)",
      tags: ["AI & Data", "Machine Learning", "Python"],
      rating: 4.9, ratingCount: 1284, enrollmentCount: 8420,
    },
  });
  console.log("✅ Course: machine-learning-andrew-ng (free)");

  // 3. Rebuild sections + lessons
  await db.section.deleteMany({ where: { courseId: COURSE_ID } });
  let totalDuration = 0;
  let lessonNum = 0;

  for (const [si, sec] of SECTIONS.entries()) {
    await db.section.create({ data: { id: sec.id, courseId: COURSE_ID, title: sec.title, order: si + 1 } });
    let order = 0;
    for (let i = sec.start; i < sec.end; i++) {
      order++;
      lessonNum++;
      const duration = 360 + (i % 5) * 120; // 6–14 min spread
      totalDuration += duration;
      await db.lesson.create({
        data: {
          id: `les_mla_${i + 1}`,
          sectionId: sec.id,
          title: `${lessonNum}. ${TITLES[i]}`,
          type: "VIDEO",
          order,
          duration,
          isFree: i < 4, // first 4 lessons free preview
          videoAsset: `yt:${VIDS[i]}`,
        },
      });
    }

    // Add a quiz at the end of each section
    const quizId = `les_mla_quiz_${si + 1}`;
    await db.lesson.create({
      data: { id: quizId, sectionId: sec.id, title: `แบบทดสอบท้าย ${sec.title.split("—")[0].trim()}`, type: "QUIZ", order: order + 1, isFree: false },
    });
    const quiz = await db.quiz.create({
      data: { lessonId: quizId, title: `แบบทดสอบ — ${sec.title}`, timeLimitSec: 600, passingScore: 70 },
    });
    const QUIZ_QS = SECTION_QUIZZES[si];
    for (const [qi, q] of QUIZ_QS.entries()) {
      const question = await db.question.create({ data: { quizId: quiz.id, text: q.text, type: "SINGLE", order: qi + 1, points: 1 } });
      for (const [oi, opt] of q.options.entries()) {
        await db.questionOption.create({ data: { questionId: question.id, text: opt.text, isCorrect: opt.correct, order: oi + 1 } });
      }
    }
  }

  await db.course.update({ where: { id: COURSE_ID }, data: { totalDuration } });
  console.log(`✅ ${SECTIONS.length} sections · ${lessonNum} video lessons · 3 quizzes · ${Math.round(totalDuration / 60)} min total`);

  // 4. Enroll demo + student so it shows in their dashboard
  for (const userId of ["usr_demo_001", "usr_student_001"]) {
    const existing = await db.enrollment.findUnique({ where: { userId_courseId: { userId, courseId: COURSE_ID } } });
    if (!existing) {
      const enr = await db.enrollment.create({ data: { userId, courseId: COURSE_ID } });
      await db.userCourseProgress.create({ data: { enrollmentId: enr.id, userId, courseId: COURSE_ID, progressPct: 10, lastLesson: "les_mla_1" } });
      await db.lessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId: "les_mla_1" } },
        create: { userId, lessonId: "les_mla_1", watchedPct: 100, completed: true, completedAt: new Date() },
        update: {},
      });
      console.log(`🎓 enrolled ${userId} (10%)`);
    }
  }

  console.log("\n✅ Done! → /th/learn/machine-learning-andrew-ng/les_mla_1");
}

const SECTION_QUIZZES: { text: string; options: { text: string; correct: boolean }[] }[][] = [
  [
    { text: "Supervised Learning ต่างจาก Unsupervised Learning อย่างไร?", options: [
      { text: "Supervised ใช้ข้อมูลที่มี label (คำตอบ), Unsupervised ไม่มี", correct: true },
      { text: "Supervised เร็วกว่าเสมอ", correct: false },
      { text: "Unsupervised ใช้ neural network เท่านั้น", correct: false },
      { text: "ไม่ต่างกัน", correct: false },
    ]},
    { text: "Cost Function ใน Linear Regression มีไว้เพื่ออะไร?", options: [
      { text: "วัดความคลาดเคลื่อนระหว่างค่าทำนายกับค่าจริง", correct: true },
      { text: "เพิ่มความเร็วการเทรน", correct: false },
      { text: "ลดจำนวน feature", correct: false },
      { text: "สร้างกราฟ", correct: false },
    ]},
    { text: "Learning Rate (α) ที่ใหญ่เกินไปจะเกิดอะไร?", options: [
      { text: "Gradient descent อาจ overshoot และไม่ converge", correct: true },
      { text: "เทรนเร็วและแม่นยำเสมอ", correct: false },
      { text: "ไม่มีผล", correct: false },
      { text: "ลด overfitting", correct: false },
    ]},
  ],
  [
    { text: "Feature Scaling มีประโยชน์อย่างไร?", options: [
      { text: "ช่วยให้ gradient descent converge เร็วขึ้นเมื่อ feature มี range ต่างกันมาก", correct: true },
      { text: "ลบ feature ที่ไม่จำเป็น", correct: false },
      { text: "เพิ่มจำนวนข้อมูล", correct: false },
      { text: "ทำให้ model ซับซ้อนขึ้น", correct: false },
    ]},
    { text: "Vectorization ช่วยเรื่องใด?", options: [
      { text: "คำนวณเร็วขึ้นด้วยการใช้ operation บน vector/matrix แทน loop", correct: true },
      { text: "เพิ่มความแม่นยำ", correct: false },
      { text: "ลด overfitting", correct: false },
      { text: "เปลี่ยนเป็น classification", correct: false },
    ]},
    { text: "Polynomial Regression ใช้เมื่อใด?", options: [
      { text: "เมื่อความสัมพันธ์ของข้อมูลไม่เป็นเส้นตรง", correct: true },
      { text: "เมื่อมี feature เดียว", correct: false },
      { text: "เมื่อข้อมูลมีน้อย", correct: false },
      { text: "เมื่อต้องการ classification", correct: false },
    ]},
  ],
  [
    { text: "Logistic Regression ใช้สำหรับงานประเภทใด?", options: [
      { text: "Classification (ทำนายคลาส/ความน่าจะเป็น)", correct: true },
      { text: "ทำนายค่าต่อเนื่องเท่านั้น", correct: false },
      { text: "Clustering", correct: false },
      { text: "ลดมิติข้อมูล", correct: false },
    ]},
    { text: "Overfitting คืออะไร?", options: [
      { text: "Model fit ข้อมูล training ดีเกินไปจน generalize กับข้อมูลใหม่ได้แย่", correct: true },
      { text: "Model เรียนรู้ช้า", correct: false },
      { text: "ข้อมูลน้อยเกินไป", correct: false },
      { text: "Learning rate ต่ำ", correct: false },
    ]},
    { text: "Regularization ช่วยแก้ปัญหาใด?", options: [
      { text: "ลด overfitting โดยลงโทษ parameter ที่ใหญ่เกินไป", correct: true },
      { text: "เพิ่มความเร็ว", correct: false },
      { text: "เพิ่มจำนวน feature", correct: false },
      { text: "ทำ feature scaling", correct: false },
    ]},
  ],
];

main().then(() => process.exit(0)).catch((e) => { console.error("❌", e); process.exit(1); });
