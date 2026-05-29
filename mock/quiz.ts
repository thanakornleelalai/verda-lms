export const MOCK_QUIZ_FALLBACK = {
  id: "mock-quiz-1",
  title: "ทดสอบความเข้าใจ: UX Research & Figma Basics",
  timeLimitSec: 300,
  passingScore: 70,
  questions: [
    {
      id: "q1",
      text: "ข้อใดคือวิธี UX Research เชิงคุณภาพ (Qualitative Research)?",
      type: "SINGLE" as const,
      options: [
        { id: "q1a", text: "A/B Testing" },
        { id: "q1b", text: "In-depth Interview" },
        { id: "q1c", text: "Google Analytics Dashboard" },
        { id: "q1d", text: "Heat Map Analysis" },
      ],
      correct: ["q1b"],
    },
    {
      id: "q2",
      text: "User Persona คืออะไร?",
      type: "SINGLE" as const,
      options: [
        { id: "q2a", text: "รูปโปรไฟล์ของผู้ใช้จริงในระบบ" },
        { id: "q2b", text: "ตัวแทนผู้ใช้สมมุติที่สร้างจากข้อมูลวิจัย เพื่อเป็นเป้าหมายในการออกแบบ" },
        { id: "q2c", text: "แผนภาพแสดงขั้นตอนการใช้งาน (User Flow)" },
        { id: "q2d", text: "ชื่อของ Component Library ใน Design System" },
      ],
      correct: ["q2b"],
    },
    {
      id: "q3",
      text: "ข้อใดบ้างเป็น Deliverable ที่ได้จาก UX Research? (เลือกได้มากกว่า 1 ข้อ)",
      type: "MULTIPLE" as const,
      options: [
        { id: "q3a", text: "Affinity Diagram" },
        { id: "q3b", text: "Source Code Repository" },
        { id: "q3c", text: "Customer Journey Map" },
        { id: "q3d", text: "Database Schema" },
      ],
      correct: ["q3a", "q3c"],
    },
    {
      id: "q4",
      text: "Figma Frame ขนาดใดที่ใช้ออกแบบสำหรับ iPhone 14 Pro?",
      type: "SINGLE" as const,
      options: [
        { id: "q4a", text: "375 × 667 px" },
        { id: "q4b", text: "390 × 844 px" },
        { id: "q4c", text: "393 × 852 px" },
        { id: "q4d", text: "428 × 926 px" },
      ],
      correct: ["q4c"],
    },
    {
      id: "q5",
      text: "เหตุใดจึงควรทำ Low-fidelity Wireframe ก่อน High-fidelity Mockup?",
      type: "SINGLE" as const,
      options: [
        { id: "q5a", text: "เพราะทำให้ดีไซน์ขั้นสุดท้ายสวยงามมากขึ้น" },
        { id: "q5b", text: "เพราะ Figma ไม่รองรับ High-fidelity ในทันที" },
        { id: "q5c", text: "เพราะช่วยให้ทีมเห็น Layout และ Flow ได้เร็ว โดยไม่เสียเวลากับรายละเอียดสีและ Typography" },
        { id: "q5d", text: "เพราะต้องส่งให้ Developer ทำ CSS ก่อน" },
      ],
      correct: ["q5c"],
    },
  ],
};

// ── Machine Learning Quiz (crs_ml_001) ────────────────────────────────────
export const MOCK_QUIZ_ML = {
  id: "mock-quiz-ml",
  title: "แบบทดสอบ: Machine Learning Fundamentals",
  timeLimitSec: 480,
  passingScore: 70,
  questions: [
    {
      id: "ml_q1",
      text: "ข้อใดอธิบาย Supervised Learning ได้ถูกต้องที่สุด?",
      type: "SINGLE" as const,
      options: [
        { id: "ml_q1a", text: "โมเดลเรียนรู้จากข้อมูลที่ไม่มี label โดยหาโครงสร้างเอง" },
        { id: "ml_q1b", text: "โมเดลเรียนรู้จากข้อมูลที่มี input-output pair (X, Y) ที่กำหนดไว้แล้ว" },
        { id: "ml_q1c", text: "โมเดลเรียนรู้จากการลองผิดลองถูกและได้รับ reward" },
        { id: "ml_q1d", text: "โมเดลที่ไม่ต้องใช้ข้อมูลในการเรียนรู้" },
      ],
      correct: ["ml_q1b"],
    },
    {
      id: "ml_q2",
      text: "Cost Function ใน Linear Regression มีหน้าที่อะไร?",
      type: "SINGLE" as const,
      options: [
        { id: "ml_q2a", text: "วัดความเร็วในการ train โมเดล" },
        { id: "ml_q2b", text: "วัดความแตกต่างระหว่างค่าที่โมเดลทำนายกับค่าจริง เพื่อใช้เป็นตัวชี้วัดความผิดพลาด" },
        { id: "ml_q2c", text: "กำหนดจำนวน iteration ที่ใช้ใน training" },
        { id: "ml_q2d", text: "เลือก feature ที่สำคัญที่สุดโดยอัตโนมัติ" },
      ],
      correct: ["ml_q2b"],
    },
    {
      id: "ml_q3",
      text: "ถ้า Learning Rate (α) มีค่าสูงเกินไปใน Gradient Descent จะเกิดอะไรขึ้น?",
      type: "SINGLE" as const,
      options: [
        { id: "ml_q3a", text: "โมเดลจะ converge เร็วขึ้นและ accurate มากขึ้น" },
        { id: "ml_q3b", text: "โมเดลจะเรียนรู้ได้ดีขึ้นในทุกกรณี" },
        { id: "ml_q3c", text: "Cost function อาจกระโดดข้ามจุดต่ำสุดและไม่ converge (diverge)" },
        { id: "ml_q3d", text: "Training จะหยุดทำงานโดยอัตโนมัติ" },
      ],
      correct: ["ml_q3c"],
    },
    {
      id: "ml_q4",
      text: "ข้อใดบ้างเป็นประโยชน์ของ Feature Scaling? (เลือกได้มากกว่า 1 ข้อ)",
      type: "MULTIPLE" as const,
      options: [
        { id: "ml_q4a", text: "ช่วยให้ Gradient Descent converge เร็วขึ้น" },
        { id: "ml_q4b", text: "ทำให้โมเดลสามารถเพิ่มจำนวน feature ได้ไม่จำกัด" },
        { id: "ml_q4c", text: "ป้องกันไม่ให้ feature ที่มีค่าตัวเลขสูงครอบงำ feature อื่น" },
        { id: "ml_q4d", text: "ลบข้อมูลที่ไม่จำเป็นออกจาก dataset โดยอัตโนมัติ" },
      ],
      correct: ["ml_q4a", "ml_q4c"],
    },
    {
      id: "ml_q5",
      text: "Logistic Regression ใช้ Sigmoid Function เพราะเหตุใด?",
      type: "SINGLE" as const,
      options: [
        { id: "ml_q5a", text: "เพราะ Sigmoid คำนวณได้เร็วกว่า Linear Function มาก" },
        { id: "ml_q5b", text: "เพราะ Sigmoid แปลงค่าผลลัพธ์ให้อยู่ระหว่าง 0-1 ซึ่งตีความเป็น probability ได้" },
        { id: "ml_q5c", text: "เพราะ Sigmoid ช่วยลด overfitting โดยอัตโนมัติ" },
        { id: "ml_q5d", text: "เพราะ Linear Function ไม่รองรับ negative values" },
      ],
      correct: ["ml_q5b"],
    },
    {
      id: "ml_q6",
      text: "Neural Network แตกต่างจาก Logistic Regression อย่างไร?",
      type: "SINGLE" as const,
      options: [
        { id: "ml_q6a", text: "Neural Network ไม่ต้องใช้ข้อมูล training เลย" },
        { id: "ml_q6b", text: "Neural Network มี hidden layers ที่ช่วยให้เรียนรู้ non-linear patterns ที่ซับซ้อนได้" },
        { id: "ml_q6c", text: "Neural Network ใช้ Gradient Descent แต่ Logistic Regression ไม่ใช้" },
        { id: "ml_q6d", text: "Neural Network เหมาะสำหรับข้อมูลขนาดเล็กเท่านั้น" },
      ],
      correct: ["ml_q6b"],
    },
    {
      id: "ml_q7",
      text: "โมเดลที่มี High Bias (Underfitting) มีลักษณะอย่างไร?",
      type: "SINGLE" as const,
      options: [
        { id: "ml_q7a", text: "ทำงานได้ดีบน training data แต่แย่บน test data" },
        { id: "ml_q7b", text: "ทำงานได้แย่ทั้งบน training data และ test data" },
        { id: "ml_q7c", text: "ทำงานได้ดีทั้งบน training data และ test data" },
        { id: "ml_q7d", text: "ไม่สามารถ train ได้เลยเพราะ gradient ไม่ไหล" },
      ],
      correct: ["ml_q7b"],
    },
    {
      id: "ml_q8",
      text: "อัลกอริทึมใดบ้างจัดอยู่ในกลุ่ม Ensemble Methods? (เลือกได้มากกว่า 1 ข้อ)",
      type: "MULTIPLE" as const,
      options: [
        { id: "ml_q8a", text: "Random Forest" },
        { id: "ml_q8b", text: "K-means Clustering" },
        { id: "ml_q8c", text: "XGBoost" },
        { id: "ml_q8d", text: "Linear Regression" },
      ],
      correct: ["ml_q8a", "ml_q8c"],
    },
  ],
};

// ── Quiz selector — pick the right mock quiz based on course slug ─────────
export function getMockQuiz(slug: string) {
  if (slug === "machine-learning-andrew-ng") return MOCK_QUIZ_ML;
  return MOCK_QUIZ_FALLBACK;
}
