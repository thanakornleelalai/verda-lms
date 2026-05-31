/**
 * Fixup seed — run: npx tsx prisma/seed-fixup.ts (DATABASE_URL + DIRECT_URL required)
 *
 * 1. Delete duplicate "Machine Learning Specialization" (crs_002) by พิมพ์ชนก
 * 2. Rename instructor พิมพ์ชนก วัฒนากร → พิมพ์พร วัฒนากร
 * 3. Set per-course "outcomes" (สิ่งที่คุณจะได้เรียนรู้) aligned with lessons
 * 4. Add Marketing + Business courses so all 5 teaching categories are covered
 * 5. Re-point student/demo enrollments away from the deleted course
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const VID_INTRO = "yt:c9Wg6Cb_YlU"; // verified-working intro video reused for new courses

async function main() {
  console.log("🔧 Running fixup...\n");

  // ── 1. Delete duplicate ML course (crs_002) ────────────────────────────────
  // Cascade removes its sections/lessons/enrollments/progress.
  const dup = await db.course.findUnique({ where: { id: "crs_002" }, select: { id: true, instructorId: true } });
  if (dup) {
    await db.course.delete({ where: { id: "crs_002" } });
    console.log("🗑️  Deleted crs_002 (Machine Learning Specialization by พิมพ์ชนก)");
  } else {
    console.log("ℹ️  crs_002 already removed");
  }

  // ── 2. Rename instructor ───────────────────────────────────────────────────
  await db.user.updateMany({
    where: { id: "usr_instructor_001" },
    data: { name: "คุณพิมพ์พร วัฒนากร" },
  });
  console.log("✏️  Renamed instructor → คุณพิมพ์พร วัฒนากร");

  // ── 3. Per-course outcomes ─────────────────────────────────────────────────
  const OUTCOMES: Record<string, string[]> = {
    crs_001: [
      "กระบวนการ UX Research ตั้งแต่ต้นจนจบ",
      "ออกแบบ Wireframe และ Prototype ด้วย Figma",
      "ใช้ Auto Layout และ Components อย่างมือโปร",
      "หลักการ Design Thinking 5 ขั้นตอน",
      "ตั้งชื่อ Layer และจัดระเบียบไฟล์ Figma",
      "เตรียมงาน Handoff ให้ Developer",
    ],
    crs_003: [
      "เข้าใจ App Router และโครงสร้างโฟลเดอร์ Next.js 15",
      "แยก Server Components กับ Client Components",
      "ใช้ Server Actions ทำ Mutations",
      "Data Fetching และ Caching",
      "Routing แบบ Dynamic และ Layout",
      "Deploy ขึ้น Vercel",
    ],
    crs_ml_andrew: [
      "เข้าใจ Supervised vs Unsupervised Learning",
      "Linear Regression และ Cost Function",
      "Gradient Descent และ Learning Rate",
      "Multiple Features, Vectorization, Feature Scaling",
      "Logistic Regression และ Classification",
      "Overfitting และ Regularization",
    ],
  };
  for (const [id, outcomes] of Object.entries(OUTCOMES)) {
    await db.course.updateMany({ where: { id }, data: { outcomes } });
  }
  console.log("🎯 Set outcomes for UX / Next.js / ML(Andrew)");

  // ── 4. Add Marketing + Business courses (all-category coverage) ────────────
  const cats = await db.category.findMany({ select: { id: true, slug: true } });
  const catId = (slug: string) => cats.find((c) => c.slug === slug)?.id;

  const NEW_COURSES = [
    {
      id: "crs_marketing_001", slug: "digital-marketing-meta-ads",
      title: "Digital Marketing & Meta Ads Masterclass",
      category: "marketing", monogram: "DM", art: "linear-gradient(135deg,#9d174d 0%,#db2777 100%)",
      price: 1990, level: "BEGINNER" as const, tags: ["Digital Marketing", "Facebook Ads", "Marketing"],
      desc: "ยิงแอด Facebook/Instagram ให้ได้ยอดขายจริง ตั้งแต่ตั้งค่า Pixel, สร้าง Campaign, Targeting จนถึงวัดผล ROAS",
      rating: 4.7, ratingCount: 612, enrollmentCount: 3120,
      outcomes: [
        "ตั้งค่า Meta Business Suite และ Pixel",
        "สร้าง Campaign และเลือก Objective ให้ถูก",
        "Audience Targeting และ Lookalike",
        "เขียน Ad Copy และทำ Creative ที่ขายได้",
        "อ่านรายงานและ optimize ROAS",
        "ทำ Retargeting Funnel",
      ],
      sections: [
        { id: "sec_mkt_1", title: "บทที่ 1 — พื้นฐาน Digital Marketing", lessons: [
          { id: "les_mkt_1_1", title: "ภาพรวม Digital Marketing Funnel", type: "VIDEO", duration: 480, isFree: true, video: VID_INTRO },
          { id: "les_mkt_1_2", title: "อ่าน: ตั้งค่า Meta Business Suite + Pixel", type: "TEXT", duration: 420, content: "Meta Pixel คือโค้ดติดตามพฤติกรรมผู้ใช้บนเว็บไซต์:\n\n1. สร้าง Business Account ที่ business.facebook.com\n2. ไปที่ Events Manager → Connect Data Source → Web\n3. ติดตั้ง Pixel ผ่าน code หรือ Partner Integration\n4. ตั้งค่า Conversion Events (Purchase, Lead, AddToCart)\n5. ตรวจสอบด้วย Meta Pixel Helper\n\nPixel ช่วยให้ยิงแอดแม่นขึ้นและวัดผล conversion ได้แม่นยำ" },
        ]},
        { id: "sec_mkt_2", title: "บทที่ 2 — สร้าง Campaign และวัดผล", lessons: [
          { id: "les_mkt_2_1", title: "อ่าน: โครงสร้าง Campaign / Ad Set / Ad", type: "TEXT", duration: 360, content: "โครงสร้างโฆษณา Meta มี 3 ระดับ:\n\n- Campaign — เลือก Objective (Sales, Leads, Traffic, Awareness)\n- Ad Set — กำหนด Budget, Audience, Placement, Schedule\n- Ad — Creative จริง (รูป/วิดีโอ + Copy + CTA)\n\nหนึ่ง Campaign มีได้หลาย Ad Set และหนึ่ง Ad Set มีได้หลาย Ad — ใช้สำหรับทดสอบ A/B" },
          { id: "les_mkt_2_q", title: "แบบทดสอบ: Meta Ads Fundamentals", type: "QUIZ", duration: 300 },
        ]},
      ],
      quiz: { lessonId: "les_mkt_2_q", title: "แบบทดสอบ: Meta Ads Fundamentals", questions: [
        { text: "Meta Pixel มีไว้เพื่ออะไร?", options: [
          { text: "ติดตามพฤติกรรมผู้ใช้และวัด conversion", correct: true },
          { text: "เพิ่มความเร็วเว็บไซต์", correct: false },
          { text: "สร้างรูปโฆษณา", correct: false },
          { text: "จัดการอีเมล", correct: false } ]},
        { text: "ระดับใดที่กำหนด Budget และ Audience?", options: [
          { text: "Ad Set", correct: true },
          { text: "Campaign", correct: false },
          { text: "Ad", correct: false },
          { text: "Pixel", correct: false } ]},
      ]},
    },
    {
      id: "crs_business_001", slug: "financial-planning-for-freelancers",
      title: "การวางแผนการเงินสำหรับฟรีแลนซ์",
      category: "business", monogram: "FP", art: "linear-gradient(135deg,#713f12 0%,#a16207 100%)",
      price: 990, level: "BEGINNER" as const, tags: ["Business", "Finance", "Freelance"],
      desc: "บริหารเงินสำหรับคนทำงานอิสระ ตั้งแต่วางระบบรายรับ-รายจ่าย ภาษี เงินสำรองฉุกเฉิน จนถึงการลงทุนระยะยาว",
      rating: 4.8, ratingCount: 421, enrollmentCount: 1890,
      outcomes: [
        "วางระบบรายรับ-รายจ่ายสำหรับฟรีแลนซ์",
        "คำนวณและยื่นภาษีเงินได้บุคคลธรรมดา",
        "ตั้งกองทุนเงินสำรองฉุกเฉิน",
        "วางแผนเกษียณด้วย RMF/SSF",
        "ตั้งราคางานให้คุ้มค่า",
        "เริ่มต้นลงทุนระยะยาว",
      ],
      sections: [
        { id: "sec_biz_1", title: "บทที่ 1 — พื้นฐานการเงินฟรีแลนซ์", lessons: [
          { id: "les_biz_1_1", title: "ภาพรวมการเงินสำหรับคนทำงานอิสระ", type: "VIDEO", duration: 420, isFree: true, video: VID_INTRO },
          { id: "les_biz_1_2", title: "อ่าน: ระบบรายรับ-รายจ่าย 50/30/20", type: "TEXT", duration: 360, content: "กฎ 50/30/20 สำหรับจัดสรรรายได้:\n\n- 50% — ค่าใช้จ่ายจำเป็น (ค่าเช่า อาหาร เดินทาง)\n- 30% — ค่าใช้จ่ายตามต้องการ (บันเทิง ช้อปปิ้ง)\n- 20% — เงินออมและการลงทุน\n\nสำหรับฟรีแลนซ์ที่รายได้ไม่แน่นอน ควรเพิ่มสัดส่วนเงินสำรองเป็น 6 เดือนของค่าใช้จ่าย และกันเงินภาษีไว้ทุกครั้งที่รับงาน" },
        ]},
        { id: "sec_biz_2", title: "บทที่ 2 — ภาษีและการลงทุน", lessons: [
          { id: "les_biz_2_1", title: "อ่าน: ภาษีเงินได้สำหรับฟรีแลนซ์", type: "TEXT", duration: 480, content: "ฟรีแลนซ์ต้องยื่นภาษีเงินได้บุคคลธรรมดา (ภ.ง.ด.90/91):\n\n- รายได้จากรับจ้างทั่วไป = เงินได้ประเภท 40(2) หรือ 40(8)\n- หักค่าใช้จ่ายได้ตามจริงหรือเหมา\n- ลดหย่อนได้: ส่วนตัว 60,000, ประกันสังคม, RMF/SSF, ประกันชีวิต\n- ยื่นออนไลน์ที่ rdsmart ของกรมสรรพากร\n\nควรเก็บใบเสร็จและทำบัญชีรายรับทุกเดือนเพื่อความสะดวกตอนยื่น" },
          { id: "les_biz_2_q", title: "แบบทดสอบ: การเงินฟรีแลนซ์", type: "QUIZ", duration: 300 },
        ]},
      ],
      quiz: { lessonId: "les_biz_2_q", title: "แบบทดสอบ: การเงินฟรีแลนซ์", questions: [
        { text: "กฎ 50/30/20 สัดส่วน 20% คือส่วนใด?", options: [
          { text: "เงินออมและการลงทุน", correct: true },
          { text: "ค่าใช้จ่ายจำเป็น", correct: false },
          { text: "ค่าบันเทิง", correct: false },
          { text: "ภาษี", correct: false } ]},
        { text: "ฟรีแลนซ์ควรมีเงินสำรองฉุกเฉินกี่เดือน?", options: [
          { text: "อย่างน้อย 6 เดือนของค่าใช้จ่าย", correct: true },
          { text: "1 เดือน", correct: false },
          { text: "ไม่จำเป็นต้องมี", correct: false },
          { text: "2 สัปดาห์", correct: false } ]},
      ]},
    },
  ];

  for (const c of NEW_COURSES) {
    let totalDuration = 0;
    c.sections.forEach((s) => s.lessons.forEach((l) => { totalDuration += (l as { duration?: number }).duration ?? 0; }));

    await db.course.upsert({
      where: { id: c.id },
      update: { outcomes: c.outcomes, status: "PUBLISHED" },
      create: {
        id: c.id, slug: c.slug, title: c.title, description: c.desc,
        status: "PUBLISHED", price: c.price, currency: "THB", level: c.level, language: "th",
        instructorId: "usr_instructor_001", categoryId: catId(c.category),
        monogram: c.monogram, art: c.art, tags: c.tags, outcomes: c.outcomes,
        rating: c.rating, ratingCount: c.ratingCount, enrollmentCount: c.enrollmentCount,
        totalDuration,
      },
    });

    // Rebuild sections + lessons
    await db.section.deleteMany({ where: { courseId: c.id } });
    for (const [si, sec] of c.sections.entries()) {
      await db.section.create({ data: { id: sec.id, courseId: c.id, title: sec.title, order: si + 1 } });
      for (const [li, les] of sec.lessons.entries()) {
        const l = les as { id: string; title: string; type: string; duration?: number; isFree?: boolean; video?: string; content?: string };
        await db.lesson.create({
          data: {
            id: l.id, sectionId: sec.id, title: l.title,
            type: l.type as "VIDEO" | "TEXT" | "QUIZ", order: li + 1,
            duration: l.duration ?? null, isFree: l.isFree ?? false,
            videoAsset: l.video ?? null, content: l.content ?? null,
          },
        });
      }
    }
    // Quiz
    const quiz = await db.quiz.create({ data: { lessonId: c.quiz.lessonId, title: c.quiz.title, timeLimitSec: 300, passingScore: 70 } });
    for (const [qi, q] of c.quiz.questions.entries()) {
      const question = await db.question.create({ data: { quizId: quiz.id, text: q.text, type: "SINGLE", order: qi + 1, points: 1 } });
      for (const [oi, opt] of q.options.entries()) {
        await db.questionOption.create({ data: { questionId: question.id, text: opt.text, isCorrect: opt.correct, order: oi + 1 } });
      }
    }
    console.log(`📚 Course: ${c.slug} (${c.category})`);
  }

  // ── 5. Enroll student/demo into new + existing courses (replace deleted crs_002) ──
  const enrollPlan = [
    { userId: "usr_student_001", courseId: "crs_marketing_001", pct: 30, lastLesson: "les_mkt_1_1" },
    { userId: "usr_demo_001", courseId: "crs_business_001", pct: 20, lastLesson: "les_biz_1_1" },
  ];
  for (const e of enrollPlan) {
    const existing = await db.enrollment.findUnique({ where: { userId_courseId: { userId: e.userId, courseId: e.courseId } } });
    if (!existing) {
      const enr = await db.enrollment.create({ data: { userId: e.userId, courseId: e.courseId } });
      await db.userCourseProgress.create({ data: { enrollmentId: enr.id, userId: e.userId, courseId: e.courseId, progressPct: e.pct, lastLesson: e.lastLesson } });
      console.log(`🎓 enrolled ${e.userId} → ${e.courseId} (${e.pct}%)`);
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const total = await db.course.count({ where: { status: "PUBLISHED" } });
  console.log(`\n✅ Fixup complete — ${total} published courses covering all 5 categories`);
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌", e); process.exit(1); });
