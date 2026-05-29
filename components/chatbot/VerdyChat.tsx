"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Minimize2, RotateCcw } from "lucide-react";

interface Message {
  id: number;
  from: "user" | "bot";
  text: string;
  time: string;
}

const QUICK_QUESTIONS = [
  "มีคอร์สอะไรบ้าง?",
  "เรียน on-site ที่ไหน?",
  "ราคาเท่าไหร่?",
  "มีใบประกาศไหม?",
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
    answer: "สวัสดีครับ! 👋 ผม Verdy ผู้ช่วย AI ของ VERDA LMS\n\nถามเรื่องคอร์ส ราคา สถานที่เรียน หรืออะไรก็ได้เลยครับ",
  },
  {
    keys: /ขอบคุณ|thank|ขอบใจ|เยี่ยม|เจ๋ง|ดีมาก|โอเค|ok\b/i,
    answer: "ยินดีครับ 😊 มีอะไรสงสัยเพิ่มเติมบอกได้เลยนะครับ",
  },
  {
    keys: /verda.*คือ|verda.*อะไร|แพลตฟอร์ม.*คือ|lms.*คือ/i,
    answer: "VERDA LMS คือแพลตฟอร์มเรียนออนไลน์สำหรับคนไทยครับ 🎓\n\n✅ คอร์สจากผู้เชี่ยวชาญที่ทำงานจริง\n✅ เรียนออนไลน์ได้ทุกที่ทุกเวลา\n✅ เรียน on-site ได้ที่ PIM สถาบันปัญญาภิวัฒน์\n✅ รองรับภาษาไทย/อังกฤษ\n✅ มีคอร์สกว่า 200+ หลักสูตร",
  },

  // ── สถานที่เรียน On-site ─────────────────────────────────────────────────
  {
    keys: /on.?site|ออนไซต์|ที่เรียน|สถานที่|ห้องเรียน|เรียน.*สด|เรียน.*จริง|face.?to.?face|เรียน.*ตรง|มาเรียน|ไป.*เรียน/i,
    answer: "เรียน On-site ได้ที่ครับ 🏫\n\n📍 PIM — สถาบันปัญญาภิวัฒน์\nถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง\nเขตหลักสี่ กรุงเทพฯ 10210\n\n🚇 การเดินทาง:\n• MRT สายสีชมพู สถานี PIM\n• รถโดยสาร: สาย 52, 356, 357\n• มีที่จอดรถฟรีในมหาวิทยาลัย\n\n📅 วันเรียน On-site:\n• เสาร์–อาทิตย์ (หลักสูตรเข้มข้น)\n• วันธรรมดา (บางคอร์ส)\n\n💡 ผสม Online + On-site ได้ตามสะดวกครับ",
  },
  {
    keys: /PIM|ปัญญาภิวัฒน์|แจ้งวัฒนะ|หลักสี่/i,
    answer: "ใช่ครับ! VERDA จัดเรียน On-site ที่ 🏫\n\nPIM — สถาบันปัญญาภิวัฒน์\nถนนแจ้งวัฒนะ เขตหลักสี่ กรุงเทพฯ\n\n🎯 สิ่งอำนวยความสะดวก:\n• ห้องปฏิบัติการคอมพิวเตอร์\n• ห้อง Workshop พร้อมอุปกรณ์\n• Co-working space\n• อาหารและร้านค้าในมหาวิทยาลัย\n• WiFi ความเร็วสูงทั่วพื้นที่\n\n📞 นัดเยี่ยมชมได้ที่ hello@verda.co.th ครับ",
  },
  {
    keys: /เดินทาง|รถไฟฟ้า|MRT|BTS|จอดรถ|bus|รถเมล์|ทิศทาง|map|แผนที่/i,
    answer: "การเดินทางมา PIM — สถาบันปัญญาภิวัฒน์ ครับ 🗺️\n\n🚇 รถไฟฟ้า MRT:\n• สายสีชมพู: สถานี PIM (ลงตรงเลย)\n\n🚌 รถโดยสารสาธารณะ:\n• สาย 52, 356, 357, 389\n• ป้ายหน้า PIM\n\n🚗 ขับรถ:\n• ถนนแจ้งวัฒนะ ใกล้ทางด่วนอุดรรัถยา\n• มีที่จอดรถฟรีในมหาวิทยาลัย\n\n📍 Google Maps: ค้นหา \"สถาบันปัญญาภิวัฒน์\" ครับ",
  },
  {
    keys: /workshop|เวิร์คช็อป|bootcamp|บูทแคมป์|intensive|เข้มข้น/i,
    answer: "มี Workshop และ Bootcamp แบบ On-site ที่ PIM ครับ 🏋️\n\n📅 รูปแบบที่จัด:\n• Weekend Bootcamp (เสาร์–อาทิตย์ 2 วัน)\n• Intensive Workshop (5 วันเต็ม)\n• Evening Class (จ–ศ 18:00–21:00)\n\n👥 ขนาดกลุ่ม: 15–30 คน/รุ่น\n\n💡 ข้อดีเรียน On-site:\n• ฝึกปฏิบัติกับ instructor โดยตรง\n• Networking กับผู้เรียนกลุ่มเดียวกัน\n• อุปกรณ์และซอฟต์แวร์ครบครัน\n\nสอบถามตารางเรียนได้ที่ hello@verda.co.th ครับ",
  },

  // ── หมวดคอร์ส ───────────────────────────────────────────────────────────
  {
    keys: /คอร์ส.*มี|มี.*คอร์ส|เรียน.*อะไร|หลักสูตร.*มี|วิชา.*มี|สอน.*อะไร|อยาก.*เรียน/i,
    answer: "VERDA มีคอร์สกว่า 200+ คอร์สครับ 📚\n\n🎨 Design\n  UX/UI Design, Figma, Product Design\n\n🤖 AI & Data\n  Machine Learning, Deep Learning, Data Science\n\n💻 Development\n  Next.js, React, Node.js, Python, TypeScript\n\n📱 Digital Marketing\n  SEO, Social Media, Content Marketing\n\n🖥️ Backend & DevOps\n  AWS, Docker, PostgreSQL, API Design\n\n🎬 Content Creation\n  Video Editing, Motion Graphics\n\n📍 เรียนออนไลน์ หรือ On-site ที่ PIM ได้ทั้งคู่ครับ",
  },
  {
    keys: /ux|ui|design|ดีไซน์|figma|canva|illustrator|photoshop|prototype|wireframe/i,
    answer: "คอร์ส UX/UI Design ที่ VERDA ครับ 🎨\n\nคอร์สยอดนิยม:\n• UX Design & Figma Masterclass\n• UI Design System Workshop\n• Product Design for Developers\n• User Research & Usability Testing\n\n👨‍🏫 สอนโดย: คุณพิมพ์ชนก (Lead UX Designer @ SCB)\n\n📍 มีทั้งออนไลน์ และ Workshop On-site ที่ PIM ครับ",
  },
  {
    keys: /machine learning|ml\b|ai\b|ปัญญาประดิษฐ์|deep learning|neural|tensorflow|pytorch|llm|chatgpt|generative/i,
    answer: "คอร์ส AI & Machine Learning ครับ 🤖\n\nคอร์สยอดนิยม:\n• Machine Learning Specialization (Andrew Ng)\n• Deep Learning with PyTorch\n• Generative AI & LLM Engineering\n• Practical AI for Business\n• Computer Vision Fundamentals\n\n📍 Workshop Intensive On-site ที่ PIM เสาร์–อาทิตย์ครับ",
  },
  {
    keys: /next\.?js|react|vue|angular|svelte|web.*dev|fullstack|full.?stack|frontend|backend|node|express|fastapi/i,
    answer: "คอร์ส Web Development ครับ 💻\n\nคอร์สยอดนิยม:\n• Next.js 15 Fullstack Bootcamp\n• React Advanced Patterns\n• Node.js & REST API Design\n• TypeScript Mastery\n• Tailwind CSS & Design Systems\n\n👨‍🏫 สอนโดย: คุณธนกร (Full Stack @ Agoda)\n\n📍 Bootcamp 5 วัน On-site ที่ PIM ทุกไตรมาสครับ",
  },
  {
    keys: /python|data science|data.*analysis|pandas|numpy|sql|database|postgresql|mysql/i,
    answer: "คอร์ส Data Science & Analytics ครับ 📊\n\nคอร์สยอดนิยม:\n• Python for Data Science\n• Data Analysis with Pandas\n• SQL & Database Design\n• Business Intelligence & Dashboard\n• Statistics for Data Scientists\n\n👨‍🏫 สอนโดย: คุณวิชัย (Data Scientist @ Lazada)\n\n📍 Workshop ปฏิบัติ On-site ที่ PIM ครับ",
  },
  {
    keys: /digital marketing|seo|social media|content|ads|google ads|facebook ads|tiktok|influencer|copywriting/i,
    answer: "คอร์ส Digital Marketing ครับ 📱\n\nคอร์สยอดนิยม:\n• SEO & Content Marketing\n• Social Media Strategy\n• Google & Facebook Ads\n• TikTok Marketing\n• Email Marketing Automation\n• Copywriting & Storytelling\n\n📍 Workshop ปฏิบัติ On-site ที่ PIM ครับ",
  },
  {
    keys: /devops|aws|cloud|docker|kubernetes|ci.*cd|linux|server|deploy|git|github/i,
    answer: "คอร์ส DevOps & Cloud ครับ 🖥️\n\nคอร์สยอดนิยม:\n• AWS Cloud Practitioner\n• Docker & Kubernetes\n• CI/CD Pipeline\n• Linux Administration\n• Infrastructure as Code\n\n📍 Bootcamp Intensive On-site ที่ PIM ครับ",
  },
  {
    keys: /video|editing|premiere|after effect|motion|graphic|youtube|content creator|vlog/i,
    answer: "คอร์ส Content Creation ครับ 🎬\n\nคอร์สยอดนิยม:\n• Video Editing with Premiere Pro\n• Motion Graphics & After Effects\n• YouTube Channel Growth\n• Podcast Production\n\n📍 เรียนออนไลน์และ Workshop On-site ที่ PIM ครับ",
  },
  {
    keys: /business|ธุรกิจ|entrepreneur|startup|management|leadership|finance|accounting|hr|บัญชี|การเงิน/i,
    answer: "คอร์ส Business & Management ครับ 💼\n\nคอร์สยอดนิยม:\n• Startup & Entrepreneurship\n• Product Management\n• Financial Planning\n• Leadership & Team Management\n• Business Model Canvas\n\n📍 Seminar และ Workshop On-site ที่ PIM ครับ",
  },

  // ── ราคา / แผน ──────────────────────────────────────────────────────────
  {
    keys: /ราคา|ค่าใช้จ่าย|เท่าไ(ห)?ร่|แพง|ถูก|ค่า.*สมัคร|ค่า.*เรียน|บาท|plan|แผน|subscription|ค่าบริการ/i,
    answer: "แผนราคาของ VERDA ครับ 💳\n\n📅 รายเดือน — ฿299/เดือน\n• คอร์ส 200+ ทุกหมวด\n• ดาวน์โหลด offline\n• ใบประกาศดิจิทัล\n• Q&A กับผู้สอน\n\n👑 รายปี — ฿2,490/ปี (ประหยัด 30%)\n• ทุกอย่างของรายเดือน +\n• Live Session ทุกเดือน\n• Discord exclusive\n• ใบประกาศ PDF คุณภาพสูง\n\n♾ ตลอดชีพ — ฿4,990 จ่ายครั้งเดียว\n• ทุกอย่างของรายปี +\n• 1:1 Mentoring 1 ครั้ง\n\n🏫 คอร์ส On-site ที่ PIM: ราคาแยกตามหลักสูตร\n(เริ่มต้น ฿1,500–฿8,000/คอร์ส)\n\n✅ ทุกแผนทดลองใช้ฟรี 7 วัน ไม่ต้องใส่บัตรเครดิต",
  },
  {
    keys: /รายเดือน|monthly/i,
    answer: "แผนรายเดือน ฿299/เดือน ครับ 📅\n\nรวม:\n✅ คอร์สออนไลน์ 200+ ทุกหมวด\n✅ ดาวน์โหลด offline เรียนไม่ต้องใช้ net\n✅ ใบประกาศนียบัตรดิจิทัล\n✅ Q&A กับผู้สอนไม่จำกัด\n✅ อัปเดตเนื้อหาตลอดชีพ\n\n💡 คอร์ส On-site ที่ PIM ซื้อแยกได้ครับ\n\nยกเลิกได้ทุกเมื่อ ไม่ผูกมัด",
  },
  {
    keys: /รายปี|yearly|annual/i,
    answer: "แผนรายปี ฿2,490/ปี ครับ 👑\n(ประหยัด 30% เทียบกับรายเดือน)\n\nรวมทุกอย่างของรายเดือน บวก:\n✅ Live Session กับผู้สอนทุกเดือน\n✅ Community Discord exclusive\n✅ ใบประกาศ PDF premium\n✅ Priority support\n\n🏫 ส่วนลดพิเศษ 10% สำหรับคอร์ส On-site ที่ PIM ด้วยครับ\n\nยอดนิยมที่สุด! 🔥",
  },
  {
    keys: /ตลอดชีพ|lifetime/i,
    answer: "แผนตลอดชีพ ฿4,990 ครับ ♾\n\nจ่ายครั้งเดียว เรียนได้ตลอดชีพ!\n\nรวมทุกอย่างของรายปี บวก:\n✅ 1:1 Mentoring session 1 ครั้ง\n✅ VIP priority support\n✅ Early access คอร์สใหม่\n\n🏫 ส่วนลด 20% สำหรับ Workshop On-site ที่ PIM ทุกครั้ง\n\nคุ้มสุดสำหรับคนเรียนระยะยาวครับ",
  },

  // ── ทดลองใช้ฟรี ─────────────────────────────────────────────────────────
  {
    keys: /ฟรี|free|ทดลอง|trial|ลอง.*ใช้|ใช้.*ฟรี/i,
    answer: "มีครับ! 🎁 ทุกแผนทดลองฟรี 7 วัน\n\n✅ ไม่ต้องใส่บัตรเครดิต\n✅ เข้าถึงคอร์สออนไลน์ได้เต็มรูปแบบ\n✅ ยกเลิกก่อนครบ 7 วันไม่เสียค่าใช้จ่าย\n\n💡 คอร์ส On-site ที่ PIM บางหลักสูตรมีชั่วโมงทดลองฟรีด้วยครับ\n\nแค่กด สมัครสมาชิก แล้วเลือกแผนได้เลย!",
  },

  // ── สมัคร / Login ────────────────────────────────────────────────────────
  {
    keys: /สมัคร|ลงทะเบียน|register|sign.?up|เริ่มต้น|เปิด.*บัญชี|create.*account/i,
    answer: "สมัครง่ายมากครับ 3 ขั้นตอน 👇\n\n1️⃣ กดปุ่ม สมัครสมาชิก มุมบนขวา\n2️⃣ กรอกอีเมล + รหัสผ่าน\n   หรือ Login ด้วย Google / LINE\n3️⃣ เลือกแผนที่ต้องการ\n\nเริ่มเรียนออนไลน์ได้ทันที!\n\n🏫 อยากเรียน On-site ที่ PIM:\nติดต่อ hello@verda.co.th เพื่อจองที่นั่งครับ",
  },
  {
    keys: /login|เข้าสู่ระบบ|เข้า.*ระบบ|ล็อกอิน|sign.?in/i,
    answer: "เข้าสู่ระบบได้หลายวิธีครับ:\n\n📧 Email + รหัสผ่าน\n🟢 Google Account\n💚 LINE Account\n📱 เบอร์โทร + OTP\n\nไปที่หน้า เข้าสู่ระบบ แล้วเลือกวิธีที่สะดวกได้เลยครับ",
  },
  {
    keys: /ลืม.*รหัส|reset.*password|เปลี่ยน.*รหัส|forgot|password/i,
    answer: "รีเซ็ตรหัสผ่านได้ง่ายครับ 🔑\n\n1️⃣ ไปที่หน้า เข้าสู่ระบบ\n2️⃣ กด ลืมรหัสผ่าน\n3️⃣ กรอกอีเมลที่ลงทะเบียนไว้\n4️⃣ เช็คอีเมล → กดลิงก์รีเซ็ต\n\nถ้ามีปัญหาติดต่อได้ที่ hello@verda.co.th ครับ",
  },

  // ── ใบประกาศ ─────────────────────────────────────────────────────────────
  {
    keys: /ใบประกาศ|certificate|ประกาศนียบัตร|วุฒิ|cert|diploma/i,
    answer: "มีใบประกาศนียบัตรครับ 🎓\n\nหลังเรียนจบ + ผ่านแบบทดสอบ:\n✅ ออกอัตโนมัติทันที\n✅ ดาวน์โหลดเป็น PDF\n✅ แชร์ลง LinkedIn ได้\n✅ มี QR Code ยืนยันความจริง\n✅ ระบุชื่อ–นามสกุลและหลักสูตร\n\n🏫 ใบประกาศ On-site:\n• ออกโดย VERDA + PIM ร่วมกัน\n• ประทับตราสถาบัน\n• รับรองโดยอาจารย์ผู้สอน\n\nแผนรายปีและตลอดชีพได้ใบประกาศ PDF คุณภาพสูงครับ",
  },

  // ── ผู้สอน ───────────────────────────────────────────────────────────────
  {
    keys: /ผู้สอน|อาจารย์|instructor|ครู|สอนโดย|สอนจาก|who.*teach|teacher/i,
    answer: "ผู้สอนของ VERDA เป็นผู้เชี่ยวชาญที่ทำงานจริงครับ 👨‍🏫\n\nตัวอย่างผู้สอน:\n• คุณพิมพ์ชนก — Lead UX Designer @ SCB\n• Andrew Ng — Stanford / Coursera AI\n• คุณธนกร — Full Stack Developer @ Agoda\n• คุณวิชัย — Senior Data Scientist @ Lazada\n• คุณเจษฎา — DevOps Engineer @ LINE\n• ดร.สุมาลี — อาจารย์ประจำ PIM\n\n🏫 ผู้สอน On-site บาง session เป็นอาจารย์จาก PIM โดยตรงครับ\n\nดูโปรไฟล์ทั้งหมดที่หน้า ผู้สอน ครับ",
  },

  // ── ชำระเงิน ─────────────────────────────────────────────────────────────
  {
    keys: /ชำระ|จ่าย|payment|บัตร.*เครดิต|PromptPay|QR|โอน|สแกน|บัตร.*เดบิต/i,
    answer: "รองรับหลายวิธีชำระครับ 💳\n\n✅ บัตรเครดิต/เดบิต Visa, Mastercard\n✅ PromptPay (QR Code)\n✅ รองรับทุกธนาคารในไทย\n✅ ผ่อน 0% (บัตรที่ร่วมรายการ)\n\n🏫 คอร์ส On-site ที่ PIM:\nรับเงินสด / โอนเงิน / บัตรเครดิตหน้างาน\n\nชำระผ่าน Stripe & Omise ปลอดภัย ครับ",
  },

  // ── ยกเลิก / คืนเงิน ────────────────────────────────────────────────────
  {
    keys: /ยกเลิก|cancel|คืนเงิน|refund|หยุด.*ใช้|pause|พัก/i,
    answer: "นโยบายยกเลิกครับ:\n\n📅 รายเดือน — ยกเลิกได้ทุกเมื่อ\n   มีผลในรอบบิลถัดไป\n\n📆 รายปี — คืนเงินได้ภายใน 7 วันแรก\n\n♾ ตลอดชีพ — ไม่สามารถคืนได้\n   (จ่ายครั้งเดียว)\n\n🏫 คอร์ส On-site: ยกเลิกได้ก่อนเริ่มเรียน 7 วัน\n   (คืนเงิน 80% หลังหักค่าดำเนินการ)\n\nติดต่อทีมงาน: hello@verda.co.th ครับ",
  },

  // ── Offline / มือถือ ─────────────────────────────────────────────────────
  {
    keys: /offline|ออฟไลน์|ดาวน์โหลด|download|ไม่มี.*net|ไม่มี.*wifi|ไม่ได้.*internet/i,
    answer: "ดาวน์โหลดเรียน offline ได้ครับ 📥\n\n✅ รองรับทุกแผน (เดือน/ปี/ตลอดชีพ)\n✅ เรียนได้แม้ไม่มี internet\n✅ ทำงานบนมือถือและแท็บเล็ต\n✅ ซิงก์อัตโนมัติเมื่อมี internet\n\nดาวน์โหลดผ่านแอปมือถือ (iOS/Android) ครับ",
  },
  {
    keys: /มือถือ|โทรศัพท์|app|แอป|mobile|android|ios|iphone|tablet|ipad/i,
    answer: "ใช้งานบนมือถือได้ครับ 📱\n\n✅ PWA — ติดตั้งเป็นแอปบนมือถือ\n✅ รองรับ Android & iOS\n✅ ดาวน์โหลดเรียน offline ได้\n✅ หน้าจอ responsive ทุกขนาด\n\nวิธีติดตั้ง:\n1. เปิดเว็บในมือถือ\n2. กด Share / Menu\n3. เลือก Add to Home Screen ครับ",
  },

  // ── Live Session ─────────────────────────────────────────────────────────
  {
    keys: /live|สด|webinar|session.*สด|เรียนสด.*online|zoom|meet/i,
    answer: "มี Live Session Online ทุกเดือนครับ 🎙️\n\nสำหรับสมาชิกแผน รายปี และ ตลอดชีพ:\n✅ Zoom กับผู้สอนแบบ real-time\n✅ ถามตอบสดได้\n✅ บันทึกย้อนดูได้ 30 วัน\n✅ Q&A Session หลังคาบ\n\n🏫 สมาชิกสามารถเข้าร่วม Seminar On-site ที่ PIM เพิ่มเติมได้ครับ",
  },

  // ── Discord / Community ──────────────────────────────────────────────────
  {
    keys: /discord|community|ชุมชน|กลุ่ม|เพื่อน|network/i,
    answer: "มี Community หลายช่องทางครับ 💬\n\n📱 Discord (รายปี + ตลอดชีพ):\n• ถามตอบแยกตามหมวดคอร์ส\n• แชร์ portfolio รับ feedback\n• ข่าว Live Session ล่วงหน้า\n• Job board สำหรับสมาชิก\n\n🏫 Networking On-site:\n• Event พบปะสมาชิก ที่ PIM ทุกไตรมาส\n• Alumni network\n• Career fair ร่วมกับ PIM ปีละ 2 ครั้ง",
  },

  // ── Career / งาน ─────────────────────────────────────────────────────────
  {
    keys: /งาน|career|job|สมัครงาน|portfolio|ทำงาน|เงินเดือน|interview|หางาน/i,
    answer: "VERDA ช่วยด้านอาชีพด้วยครับ 💼\n\n✅ Job board ใน Discord (สมาชิกรายปี+)\n✅ Portfolio review จาก instructor\n✅ Resume & LinkedIn workshop\n✅ Mock interview session\n\n🏫 Career Services ที่ PIM:\n• Career Fair ปีละ 2 ครั้ง\n• เชิญ HR จากบริษัทชั้นนำมาพบ\n• Internship networking\n• Alumni mentoring program\n\nติดต่อ hello@verda.co.th สำหรับ Career Consultation ครับ",
  },

  // ── องค์กร / Enterprise ──────────────────────────────────────────────────
  {
    keys: /องค์กร|บริษัท|ทีม|enterprise|corporate|หลาย.*คน|สำหรับ.*พนักงาน|training.*พนักงาน|HR|อบรม/i,
    answer: "มีแผน Enterprise สำหรับองค์กรครับ 🏢\n\n✅ เริ่มต้นที่ 10 ที่นั่ง\n✅ Dashboard ติดตามความคืบหน้าทีม\n✅ ราคาพิเศษแบบ volume discount\n✅ Invoice & ภาษีหัก ณ ที่จ่าย\n✅ Custom learning path\n✅ รายงาน progress รายบุคคล\n\n🏫 In-house Training ที่ PIM หรือที่บริษัท:\n• ส่งทีม Instructor ไปสอนที่บริษัทได้\n• จัดเวิร์คช็อปที่ PIM สำหรับทีมขนาดใหญ่\n\nติดต่อ hello@verda.co.th ครับ",
  },

  // ── ภาษา / ระดับ ────────────────────────────────────────────────────────
  {
    keys: /ภาษา|ไทย|อังกฤษ|english|beginner|เริ่มต้น|มือใหม่|พื้นฐาน|advanced|ขั้นสูง|intermediate/i,
    answer: "ตอบทุกระดับครับ 📶\n\n🇹🇭 ภาษา:\n• คอร์สส่วนใหญ่สอนภาษาไทย\n• บางคอร์สมีซับไตเติ้ลอังกฤษ\n• แพลตฟอร์มรองรับ TH/EN\n\n📊 ระดับ:\n• 🟢 Beginner — ไม่ต้องมีพื้นฐาน\n• 🟡 Intermediate — มีพื้นฐานบ้าง\n• 🔴 Advanced — มีประสบการณ์แล้ว\n\nทุกคอร์สระบุ prerequisite ไว้ชัดเจนครับ",
  },

  // ── ระยะเวลาเรียน ────────────────────────────────────────────────────────
  {
    keys: /นาน.*แค่ไหน|กี่ชั่วโมง|กี่วัน|กี่เดือน|ระยะเวลา|เรียน.*จบ.*เมื่อไหร่/i,
    answer: "ระยะเวลาเรียนแต่ละคอร์สแตกต่างกันครับ ⏱️\n\nออนไลน์:\n• Short course: 3–8 ชั่วโมง\n• Standard course: 10–30 ชั่วโมง\n• Comprehensive: 40–80 ชั่วโมง\n\n🏫 On-site ที่ PIM:\n• Workshop 1 วัน: 6–8 ชั่วโมง\n• Bootcamp Weekend: 14–16 ชั่วโมง\n• Intensive 5 วัน: 35–40 ชั่วโมง\n\n💡 เรียนได้ตามสะดวก ไม่มีเดดไลน์ (ออนไลน์) ครับ",
  },

  // ── ติดต่อ ────────────────────────────────────────────────────────────────
  {
    keys: /ติดต่อ|contact|support|ช่วยเหลือ|email|อีเมล|โทร|สอบถาม/i,
    answer: "ติดต่อทีมงาน VERDA ได้ครับ 📬\n\n✉️ Email: hello@verda.co.th\n💬 Live Chat: หน้าเว็บไซต์\n📱 Discord: สมาชิกรายปี+\n\n🏫 สำนักงาน On-site:\nPIM — สถาบันปัญญาภิวัฒน์\nถนนแจ้งวัฒนะ เขตหลักสี่ กรุงเทพฯ\n\n🕐 เวลาทำการ: จ–ศ 09:00–18:00\nตอบกลับภายใน 24 ชั่วโมงครับ",
  },

  // ── Leaderboard / Gamification ────────────────────────────────────────────
  {
    keys: /leaderboard|อันดับ|คะแนน|point|badge|รางวัล|gamif/i,
    answer: "VERDA มีระบบ Gamification ครับ 🏆\n\n✅ สะสม XP จากการเรียนและทำแบบทดสอบ\n✅ Leaderboard รายสัปดาห์/รายเดือน\n✅ Badge พิเศษเมื่อจบหลักสูตร\n✅ รางวัลสำหรับ Top learners\n\n🏫 On-site Event:\n• ประกาศรางวัล Top Learner ที่ PIM ทุกไตรมาส\n• มอบโล่และของรางวัลพิเศษครับ",
  },
];

function getBotReply(text: string): string {
  const q = text.toLowerCase().trim();
  for (const rule of RULES) {
    if (rule.keys.test(q)) return rule.answer;
  }
  return "ขอบคุณสำหรับคำถามครับ 🤔\nผมยังไม่เข้าใจคำถามนี้\n\nลองถามเรื่องเหล่านี้ได้เลย:\n• คอร์สที่มีและสถานที่เรียน\n• ราคาและแผนสมาชิก\n• เรียน On-site ที่ PIM\n• ใบประกาศนียบัตร\n• วิธีสมัครและชำระเงิน\n\nหรือติดต่อทีมงานที่ hello@verda.co.th ครับ";
}

// ── Component ──────────────────────────────────────────────────────────────

const INITIAL_MESSAGE: Message = {
  id: 0,
  from: "bot",
  text: "สวัสดีครับ! 👋 ผม Verdy ผู้ช่วย AI ของ VERDA LMS\n\nถามเรื่องคอร์สเรียน ราคา หรือสถานที่เรียน On-site ที่ PIM ได้เลยครับ",
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

    const botMsg: Message = { id: Date.now() + 1, from: "bot", text: getBotReply(trimmed), time: getTime() };
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
      {/* Chat panel */}
      {open && !minimized && (
        <div
          className="w-[340px] rounded-r4 border border-line bg-paper shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "500px" }}
        >
          {/* Header */}
          <div className="bg-viridian px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Bot size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-[14px] leading-none">Verdy</p>
              <p className="text-[11px] text-white/70 mt-0.5">
                ผู้ช่วย VERDA LMS · {typing ? "กำลังพิมพ์..." : "ออนไลน์"}
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
                {msg.from === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-viridian flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
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

            {typing && (
              <div className="flex gap-2 items-end">
                <div className="w-7 h-7 rounded-full bg-viridian flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-paper border border-line rounded-r3 rounded-tl-sm px-3 py-2.5 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-ink-3 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
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
              placeholder="พิมพ์คำถามที่นี่..."
              disabled={typing}
              className="flex-1 text-[13px] font-thai bg-paper-2 border border-line rounded-pill px-3.5 py-2 outline-none focus:border-viridian transition-colors placeholder:text-ink-4 text-ink disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="w-9 h-9 rounded-full bg-viridian flex items-center justify-center hover:bg-viridian/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={15} className="text-white" />
            </button>
          </form>
        </div>
      )}

      {/* Minimized bar */}
      {open && minimized && (
        <button onClick={() => setMinimized(false)} className="flex items-center gap-2.5 bg-viridian text-white px-4 py-2.5 rounded-pill shadow-lg hover:bg-viridian/90 transition-colors">
          <Bot size={16} />
          <span className="text-[13px] font-medium">Verdy</span>
          {unread > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-viridian text-[11px] font-bold flex items-center justify-center">{unread}</span>
          )}
        </button>
      )}

      {/* Floating button */}
      {!open && (
        <button
          onClick={handleOpen}
          className="relative w-14 h-14 rounded-full bg-viridian shadow-lg hover:scale-110 active:scale-95 transition-transform flex items-center justify-center"
          aria-label="เปิดแชทกับ Verdy"
        >
          <Bot size={26} className="text-white" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger text-white text-[11px] font-bold flex items-center justify-center">{unread}</span>
          )}
        </button>
      )}
    </div>
  );
}
