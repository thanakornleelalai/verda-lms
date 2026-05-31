"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Minimize2, RotateCcw, Sparkles } from "lucide-react";

interface Message {
  id: number;
  from: "user" | "bot";
  text: string;
  time: string;
}

const QUICK_QUESTIONS = [
  "มีคอร์สอะไรบ้างคะ? 📚",
  "เรียน on-site ที่ไหนคะ? 🏫",
  "ราคาเท่าไหร่คะ? 💳",
  "มีใบประกาศไหมคะ? 🎓",
];

function getTime() {
  return new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

// ── Keyword Matching Engine ────────────────────────────────────────────────

type Rule = { keys: RegExp; answer: string };

const RULES: Rule[] = [

  // ── ทักทาย & ขอบคุณ ────────────────────────────────────────────────────
  {
    keys: /^(สวัสดี|หวัดดี|ดีครับ|ดีค่ะ|เฮ้|hello|hi|hey)[\s!ครับค่ะ]*$/i,
    answer: "สวัสดีค่ะ~ ✨ หนูชื่อ Verdy หุ่นยนต์ผู้ช่วยน้อยของ VERDA LMS\n\nหนูยินดีช่วยเรื่องคอร์สเรียน ราคา สถานที่เรียน หรืออะไรก็ได้เลยนะคะ 🤖💚",
  },
  {
    keys: /ขอบคุณ|thank|ขอบใจ|เยี่ยม|เจ๋ง|ดีมาก|โอเค|ok\b/i,
    answer: "ยินดีเลยค่ะ~ 😊✨ มีอะไรอยากรู้เพิ่มเติม ถามหนูได้เลยนะคะ หนูพร้อมช่วยเสมอค่ะ 💚",
  },
  {
    keys: /verda.*คือ|verda.*อะไร|แพลตฟอร์ม.*คือ|lms.*คือ/i,
    answer: "VERDA LMS คือแพลตฟอร์มเรียนออนไลน์ที่หนูดูแลอยู่ค่ะ 🤖💚\n\n✨ มีคอร์สจากผู้เชี่ยวชาญที่ทำงานจริง\n✨ เรียนออนไลน์ได้ทุกที่ทุกเวลา\n🏫 เรียน On-site ได้ที่ PIM สถาบันปัญญาภิวัฒน์\n✨ รองรับภาษาไทย/อังกฤษ\n✨ คอร์สกว่า 200+ หลักสูตร\n\nหนูพาไปดูรายละเอียดเพิ่มเติมได้เลยนะคะ~ 🌟",
  },
  {
    keys: /verdy.*คือ|เธอ.*คือ|คุณ.*คือ|หนู.*คือ|bot.*คือ|ผู้ช่วย.*คือ/i,
    answer: "หนูคือ Verdy ค่ะ~ 🤖✨\n\nหุ่นยนต์ผู้ช่วยน้อยของ VERDA LMS ที่ถูกสร้างมาเพื่อช่วยทุกคนค่ะ 💚\n\nหนูรู้เรื่อง:\n📚 คอร์สทั้งหมดกว่า 200+ หลักสูตร\n💳 ราคาและแผนสมาชิก\n🏫 สถานที่เรียน On-site ที่ PIM\n🎓 ใบประกาศนียบัตร\nและอีกเยอะเลยค่ะ~\n\nถามได้เลยนะคะ ไม่ต้องเกรงใจค่ะ 😊",
  },

  // ── สถานที่เรียน On-site ─────────────────────────────────────────────────
  {
    keys: /on.?site|ออนไซต์|ที่เรียน|สถานที่|ห้องเรียน|เรียน.*สด|เรียน.*จริง|face.?to.?face|เรียน.*ตรง|มาเรียน|ไป.*เรียน/i,
    answer: "เรียน On-site ได้ที่นี่เลยค่ะ 🏫✨\n\n📍 PIM — สถาบันปัญญาภิวัฒน์\nถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง\nเขตหลักสี่ กรุงเทพฯ 10210\n\n🚇 การเดินทางสะดวกมากค่ะ:\n• MRT สายสีชมพู สถานี PIM (ลงตรงเลย!)\n• รถเมล์: สาย 52, 356, 357\n• 🚗 ที่จอดรถฟรีในมหาวิทยาลัย\n\n📅 วันเรียน On-site:\n• เสาร์–อาทิตย์ (หลักสูตรเข้มข้น)\n• วันธรรมดา (บางคอร์ส)\n\n💡 ผสม Online + On-site ได้ตามสะดวกเลยค่ะ~",
  },
  {
    keys: /PIM|ปัญญาภิวัฒน์|แจ้งวัฒนะ|หลักสี่/i,
    answer: "ใช่เลยค่ะ! 🏫✨ VERDA จัดเรียน On-site ที่ PIM ค่ะ~\n\nPIM — สถาบันปัญญาภิวัฒน์\nถนนแจ้งวัฒนะ เขตหลักสี่ กรุงเทพฯ\n\n🌟 สิ่งอำนวยความสะดวกพร้อมมากค่ะ:\n• ห้องปฏิบัติการคอมพิวเตอร์\n• ห้อง Workshop พร้อมอุปกรณ์\n• Co-working space น่ารักๆ\n• อาหารและร้านค้าในมหาวิทยาลัย\n• WiFi ความเร็วสูงทั่วพื้นที่\n\n📞 นัดเยี่ยมชมได้ที่ hello@verda.co.th นะคะ 😊",
  },
  {
    keys: /เดินทาง|รถไฟฟ้า|MRT|BTS|จอดรถ|bus|รถเมล์|ทิศทาง|map|แผนที่/i,
    answer: "หนูบอกเส้นทางให้ค่ะ~ 🗺️✨\n\n🚇 รถไฟฟ้า MRT:\n→ สายสีชมพู สถานี PIM ลงตรงเลยค่ะ!\n\n🚌 รถโดยสาร:\n→ สาย 52, 356, 357, 389\n→ ป้ายหน้า PIM\n\n🚗 ขับรถ:\n→ ถนนแจ้งวัฒนะ ใกล้ทางด่วนอุดรรัถยา\n→ ที่จอดรถฟรีในมหาวิทยาลัยค่ะ\n\n📍 Google Maps: ค้นหา 'สถาบันปัญญาภิวัฒน์' ได้เลยนะคะ~",
  },
  {
    keys: /workshop|เวิร์คช็อป|bootcamp|บูทแคมป์|intensive|เข้มข้น/i,
    answer: "มี Workshop และ Bootcamp On-site ที่ PIM ด้วยนะคะ 🏋️✨\n\n📅 รูปแบบที่หนูแนะนำ:\n• Weekend Bootcamp 🗓️ เสาร์–อาทิตย์ 2 วัน\n• Intensive Workshop ⚡ 5 วันเต็ม\n• Evening Class 🌙 จ–ศ 18:00–21:00\n\n👥 ขนาดกลุ่มน่ารักๆ: 15–30 คน/รุ่นค่ะ\n\n💡 ข้อดีเรียน On-site:\n✨ ฝึกจริงกับ instructor โดยตรง\n✨ Networking กับเพื่อนใหม่\n✨ อุปกรณ์ครบครัน ไม่ต้องพกเองค่ะ\n\nสอบถามตารางได้ที่ hello@verda.co.th นะคะ~",
  },

  // ── หมวดคอร์ส ───────────────────────────────────────────────────────────
  {
    keys: /คอร์ส.*มี|มี.*คอร์ส|เรียน.*อะไร|หลักสูตร.*มี|วิชา.*มี|สอน.*อะไร|อยาก.*เรียน/i,
    answer: "VERDA มีคอร์สกว่า 200+ คอร์สเลยค่ะ 📚✨\n\n🎨 Design\n  UX/UI, Figma, Product Design\n\n🤖 AI & Data\n  Machine Learning, Deep Learning, Data Science\n\n💻 Development\n  Next.js, React, Node.js, Python, TypeScript\n\n📱 Digital Marketing\n  SEO, Social Media, Content Marketing\n\n🖥️ Backend & DevOps\n  AWS, Docker, PostgreSQL, API Design\n\n🎬 Content Creation\n  Video Editing, Motion Graphics\n\n📍 เรียนออนไลน์ หรือ On-site ที่ PIM ได้เลยนะคะ~ 💚",
  },
  {
    keys: /ux|ui|design|ดีไซน์|figma|canva|illustrator|photoshop|prototype|wireframe/i,
    answer: "คอร์ส UX/UI Design น่าเรียนมากเลยค่ะ 🎨✨\n\nคอร์สยอดนิยมที่หนูแนะนำ:\n• UX Design & Figma Masterclass ⭐\n• UI Design System Workshop\n• Product Design for Developers\n• User Research & Usability Testing\n\n👩‍🏫 สอนโดย: คุณพิมพ์พร Lead UX Designer @ SCB ค่ะ\n\n🏫 มีทั้งออนไลน์ และ Workshop On-site ที่ PIM นะคะ~",
  },
  {
    keys: /machine learning|ml\b|ai\b|ปัญญาประดิษฐ์|deep learning|neural|tensorflow|pytorch|llm|chatgpt|generative/i,
    answer: "คอร์ส AI & Machine Learning เจ๋งมากเลยค่ะ 🤖✨\n\nหนูแนะนำคอร์สเหล่านี้ค่ะ:\n• Machine Learning Specialization ⭐ (Andrew Ng)\n• Deep Learning with PyTorch\n• Generative AI & LLM Engineering 🔥\n• Practical AI for Business\n• Computer Vision Fundamentals\n\n🏫 มี Workshop Intensive On-site ที่ PIM เสาร์–อาทิตย์ด้วยนะคะ~",
  },
  {
    keys: /next\.?js|react|vue|angular|svelte|web.*dev|fullstack|full.?stack|frontend|backend|node|express/i,
    answer: "คอร์ส Web Development สุดฮอตเลยค่ะ 💻✨\n\nหนูแนะนำค่ะ:\n• Next.js 15 Fullstack Bootcamp ⭐🔥\n• React Advanced Patterns\n• Node.js & REST API Design\n• TypeScript Mastery\n• Tailwind CSS & Design Systems\n\n👨‍💻 สอนโดย: คุณธนกร Full Stack @ Agoda ค่ะ\n\n🏫 Bootcamp 5 วัน On-site ที่ PIM ทุกไตรมาสนะคะ~",
  },
  {
    keys: /python|data science|data.*analysis|pandas|numpy|sql|database|postgresql|mysql/i,
    answer: "คอร์ส Data Science น่าสนุกมากเลยค่ะ 📊✨\n\nหนูแนะนำค่ะ:\n• Python for Data Science ⭐\n• Data Analysis with Pandas\n• SQL & Database Design\n• Business Intelligence & Dashboard\n• Statistics for Data Scientists\n\n👩‍💻 สอนโดย: คุณวิชัย Senior Data Scientist @ Lazada ค่ะ\n\n🏫 Workshop ปฏิบัติ On-site ที่ PIM นะคะ~",
  },
  {
    keys: /digital marketing|seo|social media|content|ads|google ads|facebook ads|tiktok|influencer|copywriting/i,
    answer: "คอร์ส Digital Marketing ฮิตมากเลยค่ะ 📱✨\n\nหนูแนะนำค่ะ:\n• SEO & Content Marketing ⭐\n• Social Media Strategy\n• Google & Facebook Ads\n• TikTok Marketing 🔥\n• Email Marketing Automation\n• Copywriting & Storytelling\n\n🏫 Workshop ปฏิบัติ On-site ที่ PIM ด้วยนะคะ~",
  },
  {
    keys: /devops|aws|cloud|docker|kubernetes|ci.*cd|linux|server|deploy|git|github/i,
    answer: "คอร์ส DevOps & Cloud เทพมากเลยค่ะ 🖥️✨\n\nหนูแนะนำค่ะ:\n• AWS Cloud Practitioner ⭐\n• Docker & Kubernetes\n• CI/CD Pipeline\n• Linux Administration\n• Infrastructure as Code\n\n🏫 Bootcamp Intensive On-site ที่ PIM ด้วยนะคะ~",
  },

  // ── ราคา / แผน ──────────────────────────────────────────────────────────
  {
    keys: /ราคา|ค่าใช้จ่าย|เท่าไ(ห)?ร่|แพง|ถูก|ค่า.*สมัคร|ค่า.*เรียน|บาท|plan|แผน|subscription/i,
    answer: "แผนราคาของ VERDA คุ้มค่ามากเลยค่ะ 💳✨\n\n📅 รายเดือน — ฿299/เดือน\n→ คอร์ส 200+ ทุกหมวดค่ะ\n→ ดาวน์โหลด offline ได้\n→ ใบประกาศดิจิทัล\n\n👑 รายปี — ฿2,490/ปี (ประหยัด 30%!)\n→ ทุกอย่างของรายเดือน +\n→ Live Session ทุกเดือน ✨\n→ Discord exclusive\n\n♾ ตลอดชีพ — ฿4,990 จ่ายครั้งเดียว\n→ ทุกอย่างของรายปี +\n→ 1:1 Mentoring 1 ครั้ง 🌟\n\n🏫 คอร์ส On-site ที่ PIM: ฿1,500–฿8,000/คอร์ส\n\n🎁 ทุกแผนทดลองฟรี 7 วัน ไม่ต้องใส่บัตรเครดิตเลยนะคะ~",
  },
  {
    keys: /รายเดือน|monthly/i,
    answer: "แผนรายเดือน ฿299/เดือน ค่ะ 📅✨\n\nได้ครบเลยนะคะ:\n✅ คอร์สออนไลน์ 200+ ทุกหมวด\n✅ ดาวน์โหลด offline ไม่ต้องใช้ net\n✅ ใบประกาศนียบัตรดิจิทัล\n✅ Q&A กับผู้สอนไม่จำกัด\n✅ อัปเดตเนื้อหาตลอดชีพ\n\n💡 คอร์ส On-site ที่ PIM ซื้อแยกได้นะคะ\n\n💚 ยกเลิกได้ทุกเมื่อ ไม่ผูกมัดค่ะ~",
  },
  {
    keys: /รายปี|yearly|annual/i,
    answer: "แผนรายปี ฿2,490/ปี ยอดนิยมที่สุดเลยค่ะ 👑✨\n(ประหยัด 30% เทียบรายเดือนนะคะ)\n\nรวมทุกอย่างของรายเดือน บวกด้วย:\n✅ Live Session กับผู้สอนทุกเดือน 🎙️\n✅ Community Discord exclusive 💬\n✅ ใบประกาศ PDF premium 🎓\n✅ Priority support 💚\n\n🏫 ส่วนลดพิเศษ 10% สำหรับคอร์ส On-site ที่ PIM ด้วยนะคะ~\n\nสมาชิกเลือกแผนนี้มากที่สุดเลยค่ะ 🔥",
  },
  {
    keys: /ตลอดชีพ|lifetime/i,
    answer: "แผนตลอดชีพ ฿4,990 คุ้มที่สุดเลยค่ะ ♾✨\n\nจ่ายครั้งเดียว เรียนได้ตลอดชีพ!\n\nรวมทุกอย่างของรายปี บวกด้วย:\n✅ 1:1 Mentoring session 1 ครั้ง 🌟\n✅ VIP priority support ⭐\n✅ Early access คอร์สใหม่ก่อนใคร\n\n🏫 ส่วนลด 20% สำหรับ Workshop On-site ที่ PIM ทุกครั้งเลยค่ะ~\n\nสำหรับคนที่อยากเรียนระยะยาว หนูแนะนำแผนนี้เลยค่ะ 💚",
  },

  // ── ทดลองฟรี ────────────────────────────────────────────────────────────
  {
    keys: /ฟรี|free|ทดลอง|trial|ลอง.*ใช้|ใช้.*ฟรี/i,
    answer: "มีค่ะ มีค่ะ! 🎁✨ ทุกแผนทดลองฟรี 7 วันเลยนะคะ\n\n✅ ไม่ต้องใส่บัตรเครดิตเลย\n✅ เข้าถึงคอร์สออนไลน์ได้เต็มรูปแบบ\n✅ ยกเลิกก่อนครบ 7 วัน ไม่เสียค่าใช้จ่ายค่ะ\n\n💡 คอร์ส On-site ที่ PIM บางหลักสูตรมีชั่วโมงทดลองฟรีด้วยนะคะ~\n\nแค่กด สมัครสมาชิก ได้เลยค่ะ ง่ายมากเลย~ 🌟",
  },

  // ── สมัคร / Login ────────────────────────────────────────────────────────
  {
    keys: /สมัคร|ลงทะเบียน|register|sign.?up|เริ่มต้น|เปิด.*บัญชี|create.*account/i,
    answer: "สมัครง่ายมากเลยค่ะ แค่ 3 ขั้นตอนเองนะคะ 🌟\n\n1️⃣ กดปุ่ม สมัครสมาชิก มุมบนขวาค่ะ\n2️⃣ กรอกอีเมล + รหัสผ่าน\n   หรือ Login ด้วย Google / LINE ก็ได้ค่ะ\n3️⃣ เลือกแผนที่ต้องการค่ะ\n\nเริ่มเรียนออนไลน์ได้ทันทีเลยนะคะ ✨\n\n🏫 อยากเรียน On-site ที่ PIM:\nติดต่อ hello@verda.co.th เพื่อจองที่นั่งได้เลยค่ะ~",
  },
  {
    keys: /login|เข้าสู่ระบบ|เข้า.*ระบบ|ล็อกอิน|sign.?in/i,
    answer: "เข้าสู่ระบบได้หลายวิธีเลยค่ะ 🔑✨\n\n📧 Email + รหัสผ่าน\n🟢 Google Account\n💚 LINE Account\n📱 เบอร์โทร + OTP\n\nไปที่หน้า เข้าสู่ระบบ แล้วเลือกวิธีที่สะดวกได้เลยนะคะ~",
  },
  {
    keys: /ลืม.*รหัส|reset.*password|เปลี่ยน.*รหัส|forgot|password/i,
    answer: "ไม่เป็นไรเลยค่ะ รีเซ็ตได้ง่ายๆ เลยนะคะ 🔑✨\n\n1️⃣ ไปที่หน้า เข้าสู่ระบบ ค่ะ\n2️⃣ กด ลืมรหัสผ่าน\n3️⃣ กรอกอีเมลที่ลงทะเบียนไว้\n4️⃣ เช็คอีเมล → กดลิงก์รีเซ็ต\n\nถ้ายังมีปัญหา ติดต่อหนูผ่าน hello@verda.co.th ได้เลยนะคะ 💚",
  },

  // ── ใบประกาศ ─────────────────────────────────────────────────────────────
  {
    keys: /ใบประกาศ|certificate|ประกาศนียบัตร|วุฒิ|cert|diploma/i,
    answer: "มีใบประกาศนียบัตรด้วยนะคะ 🎓✨\n\nหลังเรียนจบ + ผ่านแบบทดสอบ:\n✅ ออกอัตโนมัติทันทีเลยค่ะ\n✅ ดาวน์โหลดเป็น PDF ได้\n✅ แชร์ลง LinkedIn ได้เลย\n✅ มี QR Code ยืนยันความจริง\n✅ ระบุชื่อ–นามสกุลและหลักสูตร\n\n🏫 ใบประกาศ On-site ที่ PIM:\n→ ออกร่วมกัน VERDA + PIM ค่ะ ✨\n→ ประทับตราสถาบัน\n→ รับรองโดยอาจารย์ผู้สอนโดยตรง\n\nแผนรายปีและตลอดชีพได้ใบประกาศ PDF premium นะคะ~",
  },

  // ── ผู้สอน ────────────────────────────────────────────────────────────────
  {
    keys: /ผู้สอน|อาจารย์|instructor|ครู|สอนโดย|สอนจาก|who.*teach|teacher/i,
    answer: "ผู้สอนของ VERDA เก่งมากเลยค่ะ 👩‍🏫✨\nเป็นผู้เชี่ยวชาญที่ทำงานจริงทุกคนเลยนะคะ\n\nตัวอย่างผู้สอน:\n👩 คุณพิมพ์พร — Lead UX Designer @ SCB\n👨 Andrew Ng — Stanford / Coursera AI\n👨 คุณธนกร — Full Stack @ Agoda\n👨 คุณวิชัย — Data Scientist @ Lazada\n👨 คุณเจษฎา — DevOps @ LINE\n👩 ดร.สุมาลี — อาจารย์ประจำ PIM\n\n🏫 ผู้สอน On-site บาง session เป็นอาจารย์จาก PIM โดยตรงด้วยนะคะ~\n\nดูโปรไฟล์ทั้งหมดที่หน้า ผู้สอน ได้เลยค่ะ 💚",
  },

  // ── ชำระเงิน ──────────────────────────────────────────────────────────────
  {
    keys: /ชำระ|จ่าย|payment|บัตร.*เครดิต|PromptPay|QR|โอน|สแกน|บัตร.*เดบิต/i,
    answer: "รองรับหลายวิธีเลยค่ะ 💳✨\n\n✅ บัตรเครดิต/เดบิต Visa, Mastercard\n✅ PromptPay (QR Code) 📱\n✅ รองรับทุกธนาคารในไทย\n✅ ผ่อน 0% (บัตรที่ร่วมรายการ)\n\n🏫 คอร์ส On-site ที่ PIM:\nรับเงินสด / โอน / บัตรเครดิตหน้างานได้เลยค่ะ\n\nปลอดภัยผ่าน Stripe & Omise นะคะ 🔒",
  },

  // ── ยกเลิก / คืนเงิน ─────────────────────────────────────────────────────
  {
    keys: /ยกเลิก|cancel|คืนเงิน|refund|หยุด.*ใช้|pause/i,
    answer: "ไม่ต้องกังวลเลยนะคะ หนูอธิบายให้ค่ะ 😊✨\n\n📅 รายเดือน\n→ ยกเลิกได้ทุกเมื่อเลยค่ะ\n→ มีผลในรอบบิลถัดไป\n\n📆 รายปี\n→ คืนเงินได้ภายใน 7 วันแรก\n\n♾ ตลอดชีพ\n→ ไม่สามารถคืนได้นะคะ (จ่ายครั้งเดียว)\n\n🏫 คอร์ส On-site ที่ PIM:\n→ ยกเลิกก่อนเรียน 7 วัน คืน 80% ค่ะ\n\nติดต่อทีมงาน: hello@verda.co.th นะคะ 💚",
  },

  // ── Offline / มือถือ ──────────────────────────────────────────────────────
  {
    keys: /offline|ออฟไลน์|ดาวน์โหลด|download|ไม่มี.*net|ไม่มี.*wifi|ไม่ได้.*internet/i,
    answer: "ดาวน์โหลดเรียน offline ได้เลยค่ะ 📥✨\n\n✅ รองรับทุกแผน (เดือน/ปี/ตลอดชีพ)\n✅ เรียนได้แม้ไม่มี internet\n✅ ทำงานบนมือถือและแท็บเล็ต\n✅ ซิงก์อัตโนมัติเมื่อกลับมาออนไลน์\n\nสะดวกมากเลยนะคะ~ 💚",
  },
  {
    keys: /มือถือ|โทรศัพท์|app|แอป|mobile|android|ios|iphone|tablet|ipad/i,
    answer: "ใช้งานบนมือถือได้สบายเลยค่ะ 📱✨\n\n✅ PWA — ติดตั้งเป็นแอปได้ทันที\n✅ รองรับ Android & iOS\n✅ ดาวน์โหลดเรียน offline ได้\n✅ หน้าจอสวยงาม responsive ทุกขนาด\n\nวิธีติดตั้งง่ายมากค่ะ:\n1. เปิดเว็บในมือถือ\n2. กด Share / Menu\n3. เลือก Add to Home Screen\n\nเสร็จแล้วค่ะ~ 🌟",
  },

  // ── Live Session ──────────────────────────────────────────────────────────
  {
    keys: /live|สด|webinar|session.*สด|เรียนสด.*online|zoom|meet/i,
    answer: "มี Live Session ทุกเดือนเลยค่ะ 🎙️✨\n\nสำหรับสมาชิกรายปีและตลอดชีพนะคะ:\n✅ Zoom กับผู้สอนแบบ real-time\n✅ ถามตอบสดได้เลยค่ะ\n✅ บันทึกย้อนดูได้ 30 วัน\n✅ Q&A Session หลังคาบ\n\n🏫 สมาชิกยังสามารถเข้าร่วม Seminar On-site ที่ PIM เพิ่มเติมได้ด้วยนะคะ~ 🌟",
  },

  // ── Discord / Community ───────────────────────────────────────────────────
  {
    keys: /discord|community|ชุมชน|กลุ่ม|เพื่อน|network/i,
    answer: "มี Community น่ารักๆ หลายช่องทางเลยค่ะ 💬✨\n\n📱 Discord (รายปี + ตลอดชีพ):\n→ ถามตอบแยกตามหมวดคอร์ส\n→ แชร์ portfolio รับ feedback\n→ Job board สำหรับสมาชิก 💼\n\n🏫 Networking On-site ที่ PIM:\n→ Event พบปะสมาชิก ทุกไตรมาส ✨\n→ Alumni network\n→ Career fair ร่วมกับ PIM ปีละ 2 ครั้ง\n\nน่ารักมากเลยค่ะ ได้เจอเพื่อนใหม่เยอะมาก~ 💚",
  },

  // ── Career / งาน ──────────────────────────────────────────────────────────
  {
    keys: /งาน|career|job|สมัครงาน|portfolio|ทำงาน|เงินเดือน|interview|หางาน/i,
    answer: "VERDA ช่วยด้านอาชีพด้วยนะคะ 💼✨\n\n✅ Job board ใน Discord (รายปี+)\n✅ Portfolio review จาก instructor\n✅ Resume & LinkedIn workshop\n✅ Mock interview session\n\n🏫 Career Services ที่ PIM:\n→ Career Fair ปีละ 2 ครั้ง 🎉\n→ เชิญ HR จากบริษัทชั้นนำมาพบ\n→ Internship networking\n→ Alumni mentoring program\n\nอยากได้งานดีๆ ต้องมาค่ะ 🌟\nสอบถาม hello@verda.co.th นะคะ~",
  },

  // ── องค์กร / Enterprise ───────────────────────────────────────────────────
  {
    keys: /องค์กร|บริษัท|ทีม|enterprise|corporate|หลาย.*คน|สำหรับ.*พนักงาน|training.*พนักงาน|HR|อบรม/i,
    answer: "มีแผน Enterprise สำหรับองค์กรด้วยค่ะ 🏢✨\n\n✅ เริ่มต้นที่ 10 ที่นั่งค่ะ\n✅ Dashboard ติดตามความคืบหน้าทีม\n✅ Volume discount พิเศษ\n✅ Invoice & ภาษีหัก ณ ที่จ่าย\n✅ Custom learning path\n✅ รายงาน progress รายบุคคล\n\n🏫 In-house Training:\n→ ส่ง Instructor ไปสอนที่บริษัทได้ค่ะ\n→ จัด Workshop ที่ PIM สำหรับทีมใหญ่ได้\n\nติดต่อ hello@verda.co.th ได้เลยนะคะ 💚",
  },

  // ── ระดับ / ภาษา ──────────────────────────────────────────────────────────
  {
    keys: /ภาษา|ไทย|อังกฤษ|english|beginner|เริ่มต้น|มือใหม่|พื้นฐาน|advanced|ขั้นสูง|intermediate/i,
    answer: "VERDA รองรับทุกระดับเลยค่ะ 📶✨\n\n🇹🇭 ภาษา:\n→ คอร์สส่วนใหญ่สอนภาษาไทย\n→ บางคอร์สมีซับไตเติ้ลอังกฤษ\n→ แพลตฟอร์มรองรับ TH/EN\n\n📊 ระดับ:\n🟢 Beginner — ไม่ต้องมีพื้นฐานเลยค่ะ!\n🟡 Intermediate — มีพื้นฐานบ้าง\n🔴 Advanced — สำหรับมือโปรค่ะ\n\nทุกคอร์สระบุ prerequisite ชัดเจนนะคะ 💚",
  },

  // ── ระยะเวลาเรียน ─────────────────────────────────────────────────────────
  {
    keys: /นาน.*แค่ไหน|กี่ชั่วโมง|กี่วัน|กี่เดือน|ระยะเวลา|เรียน.*จบ.*เมื่อไหร่/i,
    answer: "ระยะเวลาขึ้นอยู่กับคอร์สนะคะ ⏱️✨\n\nออนไลน์:\n• Short course: 3–8 ชั่วโมงค่ะ\n• Standard: 10–30 ชั่วโมง\n• Comprehensive: 40–80 ชั่วโมง\n\n🏫 On-site ที่ PIM:\n• Workshop 1 วัน: 6–8 ชั่วโมง\n• Bootcamp Weekend: 14–16 ชั่วโมง\n• Intensive 5 วัน: 35–40 ชั่วโมง\n\n💡 เรียนออนไลน์ได้ตามสะดวกเลยนะคะ ไม่มีเดดไลน์ค่ะ~ 💚",
  },

  // ── Leaderboard ────────────────────────────────────────────────────────────
  {
    keys: /leaderboard|อันดับ|คะแนน|point|badge|รางวัล|gamif/i,
    answer: "มีระบบ Leaderboard น่ารักด้วยนะคะ 🏆✨\n\n✅ สะสม XP จากการเรียนและทำแบบทดสอบ\n✅ Leaderboard รายสัปดาห์/รายเดือน\n✅ Badge พิเศษเมื่อจบหลักสูตร\n✅ รางวัลสำหรับ Top Learners 🎁\n\n🏫 On-site Event ที่ PIM:\n→ ประกาศรางวัล Top Learner ทุกไตรมาสค่ะ\n→ มอบโล่และของรางวัลพิเศษด้วยนะคะ~ 🌟",
  },

  // ── ติดต่อ ─────────────────────────────────────────────────────────────────
  {
    keys: /ติดต่อ|contact|support|ช่วยเหลือ|email|อีเมล|โทร|สอบถาม/i,
    answer: "ติดต่อทีมงาน VERDA ได้เลยค่ะ 📬✨\n\n✉️ Email: hello@verda.co.th\n💬 Live Chat: หน้าเว็บไซต์\n📱 Discord: สมาชิกรายปี+\n\n🏫 สำนักงาน On-site:\nPIM — สถาบันปัญญาภิวัฒน์\nถนนแจ้งวัฒนะ เขตหลักสี่ กรุงเทพฯ\n\n🕐 เวลาทำการ: จ–ศ 09:00–18:00\nทีมงานตอบกลับภายใน 24 ชั่วโมงค่ะ~ 💚",
  },
];

function getBotReply(text: string): string {
  const q = text.toLowerCase().trim();
  for (const rule of RULES) {
    if (rule.keys.test(q)) return rule.answer;
  }
  return "ขอโทษนะคะ หนูยังไม่เข้าใจคำถามนี้ 🥺\n\nลองถามเรื่องเหล่านี้ได้เลยนะคะ:\n📚 คอร์สที่มีและสถานที่เรียน\n💳 ราคาและแผนสมาชิก\n🏫 เรียน On-site ที่ PIM\n🎓 ใบประกาศนียบัตร\n📝 วิธีสมัครและชำระเงิน\n\nหรือติดต่อทีมงานที่ hello@verda.co.th ได้เลยนะคะ 💚";
}

// ── Robot Avatar ─────────────────────────────────────────────────────────────

function VerdyAvatar({ size = "md" }: { size?: "sm" | "md" }) {
  const s = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const fs = size === "sm" ? 14 : 18;
  return (
    <div className={`${s} rounded-full bg-gradient-to-br from-viridian to-[#1a6b4a] flex items-center justify-center shrink-0 shadow-sm`}>
      <span style={{ fontSize: fs }}>🤖</span>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

const INITIAL_MESSAGE: Message = {
  id: 0,
  from: "bot",
  text: "สวัสดีค่ะ~ ✨ หนูชื่อ Verdy หุ่นยนต์ผู้ช่วยน้อยของ VERDA LMS ค่ะ\n\nถามเรื่องคอร์สเรียน ราคา หรือสถานที่เรียน On-site ที่ PIM ได้เลยนะคะ 🤖💚",
  time: getTime(),
};

export function VerdyChat() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, minimized, messages]);

  function handleOpen() { setOpen(true); setMinimized(false); setUnread(0); }
  function handleClose() { setOpen(false); setUnread(0); }
  function handleReset() { setMessages([INITIAL_MESSAGE]); setInput(""); setTyping(false); }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMsg: Message = { id: Date.now(), from: "user", text: trimmed, time: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    await new Promise((r) => setTimeout(r, 500 + Math.random() * 400));

    const botMsg: Message = {
      id: Date.now() + 1,
      from: "bot",
      text: getBotReply(trimmed),
      time: getTime(),
    };
    setMessages((prev) => [...prev, botMsg]);
    setTyping(false);
    if (!open || minimized) setUnread((n) => n + 1);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* ── Chat panel ───────────────────────────────────────────────────── */}
      {open && !minimized && (
        <div
          className="w-[340px] rounded-r4 border border-line bg-paper shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-viridian to-[#1a6b4a] px-4 py-3 flex items-center gap-3 shrink-0">
            <VerdyAvatar size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-white text-[14px] leading-none">Verdy</p>
                <Sparkles size={11} className="text-yellow-300" />
              </div>
              <p className="text-[11px] text-white/75 mt-0.5">
                {typing ? "กำลังพิมพ์~ ✍️" : "หุ่นยนต์ผู้ช่วย · ออนไลน์ 💚"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleReset} className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors" title="เริ่มใหม่">
                <RotateCcw size={13} className="text-white/80" />
              </button>
              <button onClick={() => setMinimized(true)} className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors" title="ย่อ">
                <Minimize2 size={13} className="text-white/80" />
              </button>
              <button onClick={handleClose} className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors" title="ปิด">
                <X size={14} className="text-white/80" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 bg-paper-2 min-h-0">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.from === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {msg.from === "bot" && <VerdyAvatar size="sm" />}
                <div className={`max-w-[80%] flex flex-col gap-0.5 ${msg.from === "user" ? "items-end" : "items-start"}`}>
                  <div className={`rounded-r3 px-3 py-2 text-[13px] leading-[1.65] whitespace-pre-line font-thai ${
                    msg.from === "user"
                      ? "bg-viridian text-white rounded-tr-sm"
                      : "bg-paper border border-line text-ink rounded-tl-sm"
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-ink-4 px-1">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex gap-2 items-end">
                <VerdyAvatar size="sm" />
                <div className="bg-paper border border-line rounded-r3 rounded-tl-sm px-3 py-2.5 flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-viridian/60 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          <div className="px-3 pt-2 pb-1 flex gap-1.5 flex-wrap border-t border-line bg-paper shrink-0">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={typing}
                className="text-[11px] font-thai px-2.5 py-1 rounded-pill border border-line bg-paper-2 text-ink-2 hover:border-viridian hover:text-viridian transition-colors disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="px-3 pb-3 pt-2 flex gap-2 bg-paper shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ถามหนูได้เลยนะคะ~ ✨"
              disabled={typing}
              className="flex-1 text-[13px] font-thai bg-paper-2 border border-line rounded-pill px-3.5 py-2 outline-none focus:border-viridian transition-colors placeholder:text-ink-4 text-ink disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-viridian to-[#1a6b4a] flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-sm"
            >
              <Send size={15} className="text-white" />
            </button>
          </form>
        </div>
      )}

      {/* ── Minimized bar ─────────────────────────────────────────────────── */}
      {open && minimized && (
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2.5 bg-gradient-to-r from-viridian to-[#1a6b4a] text-white px-4 py-2.5 rounded-pill shadow-lg hover:opacity-90 transition-opacity"
        >
          <span className="text-[16px]">🤖</span>
          <span className="text-[13px] font-medium">Verdy</span>
          <Sparkles size={11} className="text-yellow-300" />
          {unread > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-viridian text-[11px] font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
      )}

      {/* ── Floating button ───────────────────────────────────────────────── */}
      {!open && (
        <div className="relative">
          <button
            onClick={handleOpen}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-viridian to-[#1a6b4a] shadow-lg hover:scale-110 active:scale-95 transition-transform flex items-center justify-center"
            aria-label="เปิดแชทกับ Verdy"
          >
            <span className="text-[26px]">🤖</span>
          </button>
          {/* Sparkle ring */}
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center shadow-sm">
            <Sparkles size={10} className="text-white" />
          </span>
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger text-white text-[11px] font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
