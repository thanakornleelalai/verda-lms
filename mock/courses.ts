import type { Course, Enrollment } from "@/types";

export const MOCK_COURSES: Course[] = [
  {
    id: "crs_001",
    tenantId: "ten_default",
    slug: "ux-design-figma-masterclass",
    title: "UX Design & Figma Masterclass",
    description:
      "เรียนรู้กระบวนการ UX ตั้งแต่ต้นจนจบ พร้อม Figma ขั้นเทพ เหมาะสำหรับนักออกแบบมือใหม่จนถึงระดับกลาง ครอบคลุมตั้งแต่ User Research, Wireframing, Prototyping จนถึงการ Handoff ให้ Developer",
    status: "PUBLISHED",
    price: 1990,
    currency: "THB",
    level: "BEGINNER",
    language: "th",
    instructorId: "usr_instructor_001",
    instructor: { id: "usr_instructor_001", name: "คุณพิมพ์ชนก วัฒนากร" },
    sections: [
      {
        id: "sec_001_1",
        courseId: "crs_001",
        title: "บทนำ — UX คืออะไร?",
        order: 1,
        lessons: [
          { id: "les_001_1_1", sectionId: "sec_001_1", title: "ยินดีต้อนรับ + ภาพรวมคอร์ส", order: 1, type: "VIDEO", duration: 420, isFree: true },
          { id: "les_001_1_2", sectionId: "sec_001_1", title: "UX vs UI vs Product Design", order: 2, type: "VIDEO", duration: 780, isFree: true },
          {
            id: "les_001_1_3",
            sectionId: "sec_001_1",
            title: "ติดตั้ง Figma และตั้งค่า Workspace",
            order: 3,
            type: "ARTICLE",
            isFree: false,
            content: `ติดตั้ง Figma และตั้งค่า Workspace

Figma เป็นเครื่องมือออกแบบ UI/UX ที่ทำงานบนเว็บเบราว์เซอร์เป็นหลัก ไม่จำเป็นต้องติดตั้งโปรแกรมใดๆ แค่มีบัญชีและ browser ก็พร้อมใช้งานทันที

ขั้นตอนที่ 1 — สมัครบัญชี Figma
เข้าไปที่ figma.com แล้วกด "Get started for free" สมัครด้วย Google account หรือ email ได้เลย สำหรับนักเรียน Figma มี Education Plan ฟรีที่ให้ฟีเจอร์ Professional เพิ่มเติม

ขั้นตอนที่ 2 — เลือกวิธีใช้งาน
• Figma Browser (แนะนำ): เปิดผ่าน figma.com — ไม่ต้องติดตั้งอะไรเลย ใช้ได้กับ Chrome, Edge, Firefox
• Figma Desktop: ดาวน์โหลดจาก figma.com/downloads — เหมาะสำหรับทำงานออฟไลน์และใช้ font ในเครื่อง

ขั้นตอนที่ 3 — ตั้งค่า Workspace เบื้องต้น
1. สร้าง New Design File → ตั้งชื่อว่า "UX Course — Practice"
2. เปลี่ยน Units เป็น Pixels ใน Preferences
3. ลอง Frame แรก: กด F แล้วเลือก iPhone 14 Pro (393×852)
4. เปิด Grid: Ctrl+Shift+4 (PC) หรือ Cmd+Shift+4 (Mac)

Plugin ที่แนะนำสำหรับ UX Designer
• Unsplash — ดึง stock photo ฟรีเข้า design โดยตรง
• Iconify — icon library มากกว่า 150,000 icon
• Content Reel — สร้าง dummy content (ชื่อ, อีเมล, รูป)

เคล็ดลับ: กดปุ่ม ? ใน Figma เพื่อดู keyboard shortcuts ทั้งหมด การจำ shortcuts ช่วยให้ทำงานเร็วขึ้น 3–5 เท่า`,
          },
        ],
      },
      {
        id: "sec_001_2",
        courseId: "crs_001",
        title: "User Research",
        order: 2,
        lessons: [
          { id: "les_001_2_1", sectionId: "sec_001_2", title: "Qualitative vs Quantitative Research", order: 1, type: "VIDEO", duration: 1200, isFree: false },
          { id: "les_001_2_2", sectionId: "sec_001_2", title: "User Interview Workshop", order: 2, type: "VIDEO", duration: 2400, isFree: false },
          { id: "les_001_2_3", sectionId: "sec_001_2", title: "สร้าง User Persona", order: 3, type: "VIDEO", duration: 1800, isFree: false },
        ],
      },
      {
        id: "sec_001_3",
        courseId: "crs_001",
        title: "Wireframing ด้วย Figma",
        order: 3,
        lessons: [
          { id: "les_001_3_1", sectionId: "sec_001_3", title: "Figma Basics: Frames & Auto Layout", order: 1, type: "VIDEO", duration: 1500, isFree: false },
          { id: "les_001_3_2", sectionId: "sec_001_3", title: "Low-fidelity Wireframe Workshop", order: 2, type: "VIDEO", duration: 2100, isFree: false },
          { id: "les_001_3_3", sectionId: "sec_001_3", title: "Prototype & Handoff สำหรับ Developer", order: 3, type: "VIDEO", duration: 1680, isFree: false },
        ],
      },
      {
        id: "sec_001_4",
        courseId: "crs_001",
        title: "แบบทดสอบความรู้",
        order: 4,
        lessons: [
          { id: "les_001_4_q", sectionId: "sec_001_4", title: "แบบทดสอบ: UX Research & Figma Basics", order: 1, type: "QUIZ", isFree: false },
        ],
      },
    ],
    totalDuration: 28800,
    enrollmentCount: 3241,
    rating: 4.86,
    ratingCount: 412,
    tags: ["UX", "Figma", "Design"],
    publishedAt: "2025-12-01T00:00:00Z",
    updatedAt: "2026-04-10T00:00:00Z",
    art: "linear-gradient(135deg, #0F5D4A 0%, #1A7A60 100%)",
    monogram: "UX",
  },
  {
    id: "crs_002",
    tenantId: "ten_default",
    slug: "nextjs-fullstack-2026",
    title: "Next.js 15 Fullstack Bootcamp",
    description:
      "สร้าง SaaS จริงๆ ด้วย Next.js 15, TypeScript, PostgreSQL, Stripe และ Deploy บน Vercel ตั้งแต่ต้นจนจบ",
    status: "PUBLISHED",
    price: 2990,
    currency: "THB",
    level: "INTERMEDIATE",
    language: "th",
    instructorId: "usr_instructor_002",
    instructor: { id: "usr_instructor_002", name: "คุณธนพล สิทธิกุล" },
    sections: [
      {
        id: "sec_002_1",
        courseId: "crs_002",
        title: "Next.js App Router ทุกอย่างที่ต้องรู้",
        order: 1,
        lessons: [
          { id: "les_002_1_1", sectionId: "sec_002_1", title: "App Router vs Pages Router", order: 1, type: "VIDEO", duration: 900, isFree: true },
          { id: "les_002_1_2", sectionId: "sec_002_1", title: "Server Components Deep Dive", order: 2, type: "VIDEO", duration: 1800, isFree: false },
          { id: "les_002_1_3", sectionId: "sec_002_1", title: "Client Components & Hydration", order: 3, type: "VIDEO", duration: 1200, isFree: false },
        ],
      },
    ],
    totalDuration: 43200,
    enrollmentCount: 5812,
    rating: 4.91,
    ratingCount: 893,
    tags: ["Next.js", "TypeScript", "Full-Stack"],
    publishedAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-05-01T00:00:00Z",
    art: "linear-gradient(135deg, #1e3a5f 0%, #2d5a9e 100%)",
    monogram: "NJ",
  },
  {
    id: "crs_003",
    tenantId: "ten_default",
    slug: "python-data-science-bootcamp",
    title: "Python Data Science Bootcamp",
    description:
      "เรียน Python, Pandas, Scikit-learn และสร้าง ML model จริงจาก Kaggle Dataset ภายใน 8 สัปดาห์",
    status: "PUBLISHED",
    price: 1590,
    currency: "THB",
    level: "BEGINNER",
    language: "th",
    instructorId: "usr_instructor_003",
    instructor: { id: "usr_instructor_003", name: "คุณนันทวัน ชัยวิชิต" },
    sections: [],
    totalDuration: 36000,
    enrollmentCount: 2104,
    rating: 4.78,
    ratingCount: 287,
    tags: ["Python", "Data Science", "ML", "data"],
    publishedAt: "2025-10-20T00:00:00Z",
    updatedAt: "2026-03-15T00:00:00Z",
    art: "linear-gradient(135deg, #3b1f5e 0%, #6b35a8 100%)",
    monogram: "DS",
  },
  {
    id: "crs_004",
    tenantId: "ten_default",
    slug: "meta-ads-masterclass-2026",
    title: "Meta Ads Masterclass 2026",
    description:
      "เรียนรู้การยิงโฆษณา Meta (Facebook + Instagram) แบบมืออาชีพ ROAS สูง Cost ต่ำ สำหรับธุรกิจไทย",
    status: "PUBLISHED",
    price: 1290,
    currency: "THB",
    level: "BEGINNER",
    language: "th",
    instructorId: "usr_instructor_004",
    instructor: { id: "usr_instructor_004", name: "คุณภูริช อินทรศักดิ์" },
    sections: [],
    totalDuration: 21600,
    enrollmentCount: 7390,
    rating: 4.83,
    ratingCount: 1204,
    tags: ["Meta Ads", "Marketing", "Facebook"],
    publishedAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-04-28T00:00:00Z",
    art: "linear-gradient(135deg, #7c2d12 0%, #c05621 100%)",
    monogram: "MA",
  },
  {
    id: "crs_005",
    tenantId: "ten_default",
    slug: "english-for-tech-professionals",
    title: "English for Tech Professionals",
    description:
      "พัฒนา Business English สำหรับนักเทค เขียน Email, ประชุม, พรีเซนต์ด้วยภาษาอังกฤษอย่างมืออาชีพ",
    status: "PUBLISHED",
    price: 990,
    currency: "THB",
    level: "INTERMEDIATE",
    language: "th",
    instructorId: "usr_instructor_001",
    instructor: { id: "usr_instructor_001", name: "คุณพิมพ์ชนก วัฒนากร" },
    sections: [],
    totalDuration: 18000,
    enrollmentCount: 1890,
    rating: 4.72,
    ratingCount: 198,
    tags: ["English", "Business", "Communication"],
    publishedAt: "2026-03-10T00:00:00Z",
    updatedAt: "2026-05-05T00:00:00Z",
    art: "linear-gradient(135deg, #064e3b 0%, #047857 100%)",
    monogram: "EN",
  },
  {
    id: "crs_006",
    tenantId: "ten_default",
    slug: "financial-planning-for-freelancers",
    title: "Financial Planning for Freelancers",
    description:
      "วางแผนการเงินสำหรับ Freelancer และเจ้าของธุรกิจขนาดเล็ก ภาษี กองทุน ลงทุน ประกัน ครบในคอร์สเดียว",
    status: "PUBLISHED",
    price: 890,
    currency: "THB",
    level: "BEGINNER",
    language: "th",
    instructorId: "usr_instructor_002",
    instructor: { id: "usr_instructor_002", name: "คุณธนพล สิทธิกุล" },
    sections: [],
    totalDuration: 14400,
    enrollmentCount: 4210,
    rating: 4.88,
    ratingCount: 562,
    tags: ["Finance", "Tax", "Investment"],
    publishedAt: "2025-09-01T00:00:00Z",
    updatedAt: "2026-02-20T00:00:00Z",
    art: "linear-gradient(135deg, #713f12 0%, #a16207 100%)",
    monogram: "FP",
  },
  // ── Machine Learning Specialization (Andrew Ng) ─────────────────────────
  {
    id: "crs_ml_001",
    tenantId: "ten_default",
    slug: "machine-learning-andrew-ng",
    title: "Machine Learning Specialization",
    description:
      "เรียนรู้ Machine Learning ตั้งแต่พื้นฐานจนถึงระดับสูง ครอบคลุม Linear Regression, Logistic Regression, Neural Networks, Decision Trees, Clustering และ Reinforcement Learning — สอนโดย Andrew Ng ผู้เชี่ยวชาญ AI ระดับโลก",
    status: "PUBLISHED",
    price: 0,
    currency: "THB",
    level: "BEGINNER",
    language: "en",
    instructorId: "usr_andrew_ng",
    instructor: { id: "usr_andrew_ng", name: "Andrew Ng", avatarUrl: undefined },
    sections: [
      // ── Section 1: Introduction ──────────────────────────────────────────
      {
        id: "sec_ml_1",
        courseId: "crs_ml_001",
        title: "Week 1 — Introduction to Machine Learning",
        order: 1,
        lessons: [
          { id: "les_ml_1_1", sectionId: "sec_ml_1", title: "Welcome to Machine Learning", order: 1, type: "VIDEO", duration: 300, isFree: true, videoAsset: "yt:vStJoetOxJg" },
          { id: "les_ml_1_2", sectionId: "sec_ml_1", title: "What is Machine Learning?", order: 2, type: "VIDEO", duration: 480, isFree: true, videoAsset: "yt:XtlwSmJfUs4" },
          { id: "les_ml_1_3", sectionId: "sec_ml_1", title: "Supervised Learning — Regression & Classification", order: 3, type: "VIDEO", duration: 600, isFree: true, videoAsset: "yt:sca5rQ9x1cA" },
          { id: "les_ml_1_4", sectionId: "sec_ml_1", title: "Unsupervised Learning — Clustering & Anomaly Detection", order: 4, type: "VIDEO", duration: 540, isFree: true, videoAsset: "yt:gG_wI_uGfIE" },
          {
            id: "les_ml_1_5",
            sectionId: "sec_ml_1",
            title: "เครื่องมือที่ใช้ในคอร์ส: Python, NumPy, Jupyter Notebook",
            order: 5,
            type: "ARTICLE",
            isFree: true,
            content: `เครื่องมือที่จำเป็นในคอร์ส Machine Learning

ก่อนเริ่มเรียนขอแนะนำเครื่องมือหลัก 3 อย่างที่ใช้ตลอดคอร์สนี้:

1. Python
Python คือภาษาโปรแกรมมิ่งที่นิยมที่สุดสำหรับงาน Machine Learning เพราะมี library ที่ทรงพลังอย่าง NumPy, Pandas, Scikit-learn และ TensorFlow ถ้ายังไม่เคยใช้ Python แนะนำให้ลองเรียนพื้นฐานผ่าน python.org ก่อน

2. NumPy
NumPy (Numerical Python) ช่วยให้คุณทำคณิตศาสตร์กับ Array และ Matrix ได้อย่างรวดเร็ว ในคอร์สนี้เราจะใช้ NumPy ทำ Vectorization ซึ่งช่วยให้ Gradient Descent รันได้เร็วกว่า loop ธรรมดาถึง 100x

ตัวอย่าง:
import numpy as np
x = np.array([1, 2, 3, 4, 5])
print(x.mean())  # 3.0

3. Jupyter Notebook
Jupyter Notebook คือสภาพแวดล้อมที่รัน Python แบบ Interactive ได้ในเบราว์เซอร์ คุณสามารถเขียนโค้ด ดูผลลัพธ์ และเขียนอธิบายได้ในไฟล์เดียวกัน

วิธีติดตั้ง:
pip install jupyter numpy matplotlib scikit-learn
jupyter notebook

หรือใช้ Google Colab (แนะนำ — ไม่ต้องติดตั้งอะไรเลย):
เข้าไปที่ colab.research.google.com แล้วสร้าง New Notebook ได้เลย`,
          },
        ],
      },
      // ── Section 2: Linear Regression ─────────────────────────────────────
      {
        id: "sec_ml_2",
        courseId: "crs_ml_001",
        title: "Week 2 — Linear Regression",
        order: 2,
        lessons: [
          { id: "les_ml_2_1", sectionId: "sec_ml_2", title: "Linear Regression Model", order: 1, type: "VIDEO", duration: 720, isFree: false, videoAsset: "yt:dLc-lfEEYss" },
          { id: "les_ml_2_2", sectionId: "sec_ml_2", title: "Cost Function", order: 2, type: "VIDEO", duration: 900, isFree: false, videoAsset: "yt:CFN5zHzEuGY" },
          { id: "les_ml_2_3", sectionId: "sec_ml_2", title: "Visualizing the Cost Function", order: 3, type: "VIDEO", duration: 480, isFree: false, videoAsset: "yt:bFNz2u0hl9E" },
          { id: "les_ml_2_4", sectionId: "sec_ml_2", title: "Gradient Descent Algorithm", order: 4, type: "VIDEO", duration: 1080, isFree: false, videoAsset: "yt:WtlvKq_zxPI" },
          { id: "les_ml_2_5", sectionId: "sec_ml_2", title: "Learning Rate & Convergence", order: 5, type: "VIDEO", duration: 720, isFree: false, videoAsset: "yt:k0h8emRAAHE" },
          {
            id: "les_ml_2_6",
            sectionId: "sec_ml_2",
            title: "ทำความเข้าใจ Gradient Descent แบบลึก",
            order: 6,
            type: "ARTICLE",
            isFree: false,
            content: `Gradient Descent — เข้าใจแบบภาพรวม

Gradient Descent คืออัลกอริทึมหัวใจของ Machine Learning ที่ช่วยให้โมเดลเรียนรู้โดยค่อยๆ ปรับ parameter เพื่อลด Error ให้น้อยที่สุด

แนวคิดหลัก
ลองนึกภาพคุณยืนอยู่บนภูเขา และอยากลงไปยังจุดต่ำสุด (valley) ให้เร็วที่สุด Gradient Descent ทำงานเหมือนกับการมองรอบตัวและก้าวไปในทิศที่ลาดลงมากที่สุดทีละก้าว

สมการหลัก:
w := w - α × (∂J/∂w)

โดยที่:
• w = parameter ที่ต้องการปรับ (weight)
• α = learning rate (ขนาดของก้าว)
• ∂J/∂w = gradient (ความชันของ cost function)

Learning Rate สำคัญมาก:
• α เล็กเกินไป → เรียนรู้ช้า ใช้เวลานาน
• α ใหญ่เกินไป → กระโดดข้ามจุดต่ำสุด ไม่ converge
• α พอดี → ลดลงสู่จุดต่ำสุดอย่างมีประสิทธิภาพ

ประเภทของ Gradient Descent:
1. Batch Gradient Descent — ใช้ข้อมูลทั้งหมดทุก iteration (ช้าแต่แม่นยำ)
2. Stochastic Gradient Descent (SGD) — ใช้ 1 sample ต่อ iteration (เร็วแต่ noisy)
3. Mini-batch Gradient Descent — ใช้กลุ่มย่อย (ดีที่สุดสำหรับ Neural Networks)`,
          },
        ],
      },
      // ── Section 3: Multiple Linear Regression + Quiz ─────────────────────
      {
        id: "sec_ml_3",
        courseId: "crs_ml_001",
        title: "Week 3 — Multiple Linear Regression",
        order: 3,
        lessons: [
          { id: "les_ml_3_1", sectionId: "sec_ml_3", title: "Multiple Features (Vectorization)", order: 1, type: "VIDEO", duration: 900, isFree: false, videoAsset: "yt:jXg0vU0y1ak" },
          { id: "les_ml_3_2", sectionId: "sec_ml_3", title: "Feature Scaling & Mean Normalization", order: 2, type: "VIDEO", duration: 720, isFree: false, videoAsset: "yt:YVtP5UGdgXg" },
          { id: "les_ml_3_3", sectionId: "sec_ml_3", title: "Checking Gradient Descent Convergence", order: 3, type: "VIDEO", duration: 600, isFree: false, videoAsset: "yt:5g4H5_gsTpU" },
          { id: "les_ml_3_4", sectionId: "sec_ml_3", title: "Feature Engineering & Polynomial Regression", order: 4, type: "VIDEO", duration: 720, isFree: false, videoAsset: "yt:ecOdZlY9jsQ" },
          { id: "les_ml_3_q", sectionId: "sec_ml_3", title: "แบบทดสอบ: Linear Regression & Gradient Descent", order: 5, type: "QUIZ", isFree: false },
        ],
      },
      // ── Section 4: Logistic Regression ────────────────────────────────────
      {
        id: "sec_ml_4",
        courseId: "crs_ml_001",
        title: "Week 4 — Logistic Regression (Classification)",
        order: 4,
        lessons: [
          { id: "les_ml_4_1", sectionId: "sec_ml_4", title: "Classification Problems Overview", order: 1, type: "VIDEO", duration: 480, isFree: false, videoAsset: "yt:p-ltr1C7u2o" },
          { id: "les_ml_4_2", sectionId: "sec_ml_4", title: "Logistic Regression Model", order: 2, type: "VIDEO", duration: 900, isFree: false, videoAsset: "yt:xuTiAW0OR40" },
          { id: "les_ml_4_3", sectionId: "sec_ml_4", title: "Decision Boundary", order: 3, type: "VIDEO", duration: 600, isFree: false, videoAsset: "yt:0az8RjxLLPQ" },
          { id: "les_ml_4_4", sectionId: "sec_ml_4", title: "Cost Function for Logistic Regression", order: 4, type: "VIDEO", duration: 720, isFree: false, videoAsset: "yt:vq4Ie5xWhww" },
          { id: "les_ml_4_5", sectionId: "sec_ml_4", title: "Gradient Descent for Classification", order: 5, type: "VIDEO", duration: 600, isFree: false, videoAsset: "yt:6SZUnXEHCns" },
          { id: "les_ml_4_6", sectionId: "sec_ml_4", title: "Overfitting & Regularization", order: 6, type: "VIDEO", duration: 1080, isFree: false, videoAsset: "yt:8upNQi-40Q8" },
        ],
      },
      // ── Section 5: Neural Networks + Quiz ─────────────────────────────────
      {
        id: "sec_ml_5",
        courseId: "crs_ml_001",
        title: "Week 5 — Neural Networks",
        order: 5,
        lessons: [
          { id: "les_ml_5_1", sectionId: "sec_ml_5", title: "Neural Networks Intuition", order: 1, type: "VIDEO", duration: 900, isFree: false, videoAsset: "yt:cd_KQbf-j_w" },
          { id: "les_ml_5_2", sectionId: "sec_ml_5", title: "Neural Network Model", order: 2, type: "VIDEO", duration: 1080, isFree: false, videoAsset: "yt:hRaXolnvhvk" },
          { id: "les_ml_5_3", sectionId: "sec_ml_5", title: "TensorFlow Implementation", order: 3, type: "VIDEO", duration: 1200, isFree: false, videoAsset: "yt:v0VJ-iULZuU" },
          {
            id: "les_ml_5_4",
            sectionId: "sec_ml_5",
            title: "Forward Propagation: ทำงานยังไง?",
            order: 4,
            type: "ARTICLE",
            isFree: false,
            content: `Forward Propagation — การส่งข้อมูลผ่าน Neural Network

Forward Propagation คือกระบวนการที่ Neural Network รับ input แล้วส่งต่อผ่านแต่ละ layer จนได้ output

โครงสร้างพื้นฐาน:
Input Layer → Hidden Layer(s) → Output Layer

การคำนวณในแต่ละ Layer:
z = W·x + b
a = g(z)

โดยที่:
• z = weighted sum of inputs
• W = weight matrix ของ layer นั้น
• b = bias vector
• g() = activation function (เช่น ReLU, Sigmoid)
• a = activation output

Activation Functions ที่นิยม:
1. ReLU: g(z) = max(0, z) — ใช้ใน hidden layers เป็นหลัก
2. Sigmoid: g(z) = 1/(1+e^-z) — ใช้ใน output layer สำหรับ binary classification
3. Softmax — ใช้ใน output layer สำหรับ multi-class classification

ตัวอย่าง Neural Network ง่ายๆ ใน TensorFlow:
import tensorflow as tf

model = tf.keras.Sequential([
    tf.keras.layers.Dense(25, activation='relu'),   # Hidden layer 1
    tf.keras.layers.Dense(15, activation='relu'),   # Hidden layer 2
    tf.keras.layers.Dense(1, activation='sigmoid')  # Output layer
])

model.compile(loss='binary_crossentropy', optimizer='adam')
model.fit(X_train, y_train, epochs=100)`,
          },
          { id: "les_ml_5_q", sectionId: "sec_ml_5", title: "แบบทดสอบ: Neural Networks", order: 5, type: "QUIZ", isFree: false },
        ],
      },
      // ── Section 6: Training Neural Networks ──────────────────────────────
      {
        id: "sec_ml_6",
        courseId: "crs_ml_001",
        title: "Week 6 — Training Neural Networks",
        order: 6,
        lessons: [
          { id: "les_ml_6_1", sectionId: "sec_ml_6", title: "Training a Neural Network in TensorFlow", order: 1, type: "VIDEO", duration: 1200, isFree: false, videoAsset: "yt:yqA9NThVIw0" },
          { id: "les_ml_6_2", sectionId: "sec_ml_6", title: "Activation Functions Deep Dive", order: 2, type: "VIDEO", duration: 900, isFree: false },
          { id: "les_ml_6_3", sectionId: "sec_ml_6", title: "Multiclass Classification & Softmax", order: 3, type: "VIDEO", duration: 1080, isFree: false },
          { id: "les_ml_6_4", sectionId: "sec_ml_6", title: "Adam Optimizer", order: 4, type: "VIDEO", duration: 720, isFree: false },
        ],
      },
      // ── Section 7: Practical ML Tips ──────────────────────────────────────
      {
        id: "sec_ml_7",
        courseId: "crs_ml_001",
        title: "Week 7 — Practical ML Tips",
        order: 7,
        lessons: [
          { id: "les_ml_7_1", sectionId: "sec_ml_7", title: "Evaluating a Model (Train / CV / Test Split)", order: 1, type: "VIDEO", duration: 720, isFree: false },
          { id: "les_ml_7_2", sectionId: "sec_ml_7", title: "Bias & Variance Trade-off", order: 2, type: "VIDEO", duration: 1080, isFree: false },
          { id: "les_ml_7_3", sectionId: "sec_ml_7", title: "Regularization Techniques (L1, L2, Dropout)", order: 3, type: "VIDEO", duration: 900, isFree: false },
          { id: "les_ml_7_4", sectionId: "sec_ml_7", title: "Transfer Learning & Data Augmentation", order: 4, type: "VIDEO", duration: 720, isFree: false },
        ],
      },
      // ── Section 8: Decision Trees + Quiz ─────────────────────────────────
      {
        id: "sec_ml_8",
        courseId: "crs_ml_001",
        title: "Week 8 — Decision Trees & Ensemble Methods",
        order: 8,
        lessons: [
          { id: "les_ml_8_1", sectionId: "sec_ml_8", title: "Decision Tree Learning", order: 1, type: "VIDEO", duration: 900, isFree: false },
          { id: "les_ml_8_2", sectionId: "sec_ml_8", title: "Random Forest & Bagging", order: 2, type: "VIDEO", duration: 720, isFree: false },
          { id: "les_ml_8_3", sectionId: "sec_ml_8", title: "XGBoost — Boosted Trees", order: 3, type: "VIDEO", duration: 900, isFree: false },
          { id: "les_ml_8_q", sectionId: "sec_ml_8", title: "แบบทดสอบ: Decision Trees & Ensemble", order: 4, type: "QUIZ", isFree: false },
        ],
      },
      // ── Section 9: Unsupervised Learning ──────────────────────────────────
      {
        id: "sec_ml_9",
        courseId: "crs_ml_001",
        title: "Week 9 — Unsupervised Learning",
        order: 9,
        lessons: [
          { id: "les_ml_9_1", sectionId: "sec_ml_9", title: "K-means Clustering", order: 1, type: "VIDEO", duration: 900, isFree: false },
          { id: "les_ml_9_2", sectionId: "sec_ml_9", title: "Anomaly Detection", order: 2, type: "VIDEO", duration: 1080, isFree: false },
          { id: "les_ml_9_3", sectionId: "sec_ml_9", title: "Principal Component Analysis (PCA)", order: 3, type: "VIDEO", duration: 900, isFree: false },
          {
            id: "les_ml_9_4",
            sectionId: "sec_ml_9",
            title: "ประยุกต์ใช้ Unsupervised Learning ในงานจริง",
            order: 4,
            type: "ARTICLE",
            isFree: false,
            content: `Unsupervised Learning ในงานจริง

Unsupervised Learning ต่างจาก Supervised Learning ตรงที่ไม่มี label สอน โมเดลต้องหาโครงสร้างในข้อมูลเอง

Use Cases จริงที่ใช้บ่อย:

1. Customer Segmentation (K-means)
บริษัท e-commerce ใช้ K-means แบ่งลูกค้าออกเป็นกลุ่ม เช่น:
• กลุ่ม High-value: ซื้อบ่อย ราคาสูง
• กลุ่ม Bargain Hunter: ซื้อเฉพาะช่วง Sale
• กลุ่ม Inactive: ไม่ได้ซื้อนานกว่า 6 เดือน
แต่ละกลุ่มจะได้รับ marketing campaign ที่แตกต่างกัน

2. Fraud Detection (Anomaly Detection)
ธนาคารใช้ Anomaly Detection ตรวจจับธุรกรรมผิดปกติ เช่น:
• รูดบัตรจาก 2 ประเทศในเวลาไล่เลี่ยกัน
• ยอดเงินที่ผิดปกติจากพฤติกรรมเดิม

3. Dimensionality Reduction (PCA)
ใช้ลดจำนวน feature จาก 1000 เหลือ 50 ก่อนส่งเข้า ML model เพื่อ:
• ประหยัดเวลา training
• ลด overfitting
• Visualize ข้อมูล 2D/3D ได้

4. Recommender Systems
Netflix, Spotify ใช้ Collaborative Filtering ซึ่งเป็นรูปแบบหนึ่งของ Unsupervised Learning หา pattern ว่าคนที่ชอบ A มักชอบ B ด้วย`,
          },
        ],
      },
      // ── Section 10: Recommender Systems & RL + Final Quiz ─────────────────
      {
        id: "sec_ml_10",
        courseId: "crs_ml_001",
        title: "Week 10 — Recommender Systems & Reinforcement Learning",
        order: 10,
        lessons: [
          { id: "les_ml_10_1", sectionId: "sec_ml_10", title: "Collaborative Filtering Recommender", order: 1, type: "VIDEO", duration: 1080, isFree: false },
          { id: "les_ml_10_2", sectionId: "sec_ml_10", title: "Content-based Filtering", order: 2, type: "VIDEO", duration: 900, isFree: false },
          { id: "les_ml_10_3", sectionId: "sec_ml_10", title: "Reinforcement Learning Introduction", order: 3, type: "VIDEO", duration: 1200, isFree: false },
          { id: "les_ml_10_q", sectionId: "sec_ml_10", title: "แบบทดสอบท้ายคอร์ส: Machine Learning", order: 4, type: "QUIZ", isFree: false },
        ],
      },
    ],
    totalDuration: 36000,
    enrollmentCount: 128400,
    rating: 4.97,
    ratingCount: 24800,
    tags: ["Machine Learning", "AI", "Python", "Deep Learning", "data"],
    publishedAt: "2022-08-01T00:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
    art: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #7c3aed 100%)",
    monogram: "ML",
  },
];

export const MOCK_CATEGORIES = [
  { id: "design", label: "Design & UX", icon: "✏️", count: 42 },
  { id: "engineering", label: "Engineering", icon: "⚙️", count: 87 },
  { id: "marketing", label: "Marketing", icon: "📣", count: 34 },
  { id: "data", label: "Data & AI", icon: "🧠", count: 56 },
  { id: "business", label: "Business", icon: "📊", count: 29 },
  { id: "language", label: "Language", icon: "🌐", count: 18 },
  { id: "finance", label: "Finance", icon: "💰", count: 23 },
  { id: "creative", label: "Creative", icon: "🎨", count: 31 },
];

export const MOCK_ENROLLMENTS: Enrollment[] = [
  {
    id: "enr_001",
    userId: "usr_student_001",
    courseId: "crs_001",
    course: MOCK_COURSES[0],
    enrolledAt: "2026-02-01T00:00:00Z",
    progress: 60,
    lastLessonId: "les_001_3_1",
  },
  {
    id: "enr_002",
    userId: "usr_student_001",
    courseId: "crs_002",
    course: MOCK_COURSES[1],
    enrolledAt: "2026-03-15T00:00:00Z",
    progress: 28,
    lastLessonId: "les_002_1_2",
  },
  {
    id: "enr_003",
    userId: "usr_student_001",
    courseId: "crs_006",
    course: MOCK_COURSES[5],
    enrolledAt: "2026-01-10T00:00:00Z",
    progress: 100,
  },
  {
    id: "enr_ml_001",
    userId: "usr_student_001",
    courseId: "crs_ml_001",
    course: MOCK_COURSES[6],
    enrolledAt: "2026-04-20T00:00:00Z",
    progress: 35,
    lastLessonId: "les_ml_3_4",
  },
];

// Completed lesson IDs for the demo user (usr_student_001)
// crs_001: Section 1+2 (6/10 = 60%) | crs_ml_001: Section 1+2+3 partial (15/43 = 35%)
export const MOCK_COMPLETED_LESSON_IDS: string[] = [
  // UX Design course (crs_001)
  "les_001_1_1", "les_001_1_2", "les_001_1_3",
  "les_001_2_1", "les_001_2_2", "les_001_2_3",
  // ML course (crs_ml_001) — Week 1+2+3 (excl. quiz)
  "les_ml_1_1", "les_ml_1_2", "les_ml_1_3", "les_ml_1_4", "les_ml_1_5",
  "les_ml_2_1", "les_ml_2_2", "les_ml_2_3", "les_ml_2_4", "les_ml_2_5", "les_ml_2_6",
  "les_ml_3_1", "les_ml_3_2", "les_ml_3_3", "les_ml_3_4",
];
