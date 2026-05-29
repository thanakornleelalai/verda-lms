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
  "ราคาเท่าไหร่?",
  "มีใบประกาศไหม?",
  "วิธีสมัครสมาชิก",
];

function getTime() {
  return new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

// ── Keyword matching engine ────────────────────────────────────────────────

type Rule = { keys: RegExp; answer: string };

const RULES: Rule[] = [
  // ทักทาย
  {
    keys: /สวัสดี|หวัดดี|hello|hi\b|ดีครับ|ดีค่ะ|เฮ้|hey/i,
    answer: "สวัสดีครับ! 👋 ผม Verdy ผู้ช่วย AI ของ VERDA LMS\nถามเรื่องคอร์ส ราคา หรือการสมัครได้เลยครับ",
  },
  {
    keys: /ขอบคุณ|thank|ขอบใจ|โอเค|ok\b/i,
    answer: "ยินดีครับ 😊 มีอะไรอยากรู้เพิ่มเติมบอกได้เลยนะครับ",
  },

  // คอร์ส
  {
    keys: /คอร์ส.*มี|มี.*คอร์ส|เรียน.*อะไร|หลักสูตร|วิชา|สอน.*อะไร/i,
    answer: "VERDA มีคอร์สกว่า 200+ คอร์สครับ แบ่งเป็นหมวดหลัก:\n\n🎨 UX/UI Design & Figma\n🤖 Machine Learning & AI\n💻 Next.js / Web Development\n📊 Data Science & Analytics\n📱 Digital Marketing\n🖥️ Backend & DevOps\n\nดูทั้งหมดที่หน้า คอร์สทั้งหมด ได้เลยครับ",
  },
  {
    keys: /ux|ui|design|ดีไซน์|figma/i,
    answer: "มีคอร์ส UX/UI Design หลายคอร์สครับ 🎨\n\nคอร์สยอดนิยม:\n• UX Design & Figma Masterclass (คุณพิมพ์ชนก)\n• UI Design System Workshop\n• Product Design for Developers\n\nสอนโดยดีไซเนอร์ที่ทำงานจริงใน startup และบริษัทชั้นนำครับ",
  },
  {
    keys: /machine learning|ml\b|ai\b|ปัญญาประดิษฐ์|deep learning|neural/i,
    answer: "คอร์ส AI & Machine Learning ของ VERDA ครับ 🤖\n\nคอร์สยอดนิยม:\n• Machine Learning Specialization (Andrew Ng)\n• Deep Learning with PyTorch\n• Practical AI for Business\n\nเหมาะสำหรับทั้งผู้เริ่มต้นและผู้ที่มีพื้นฐาน Math แล้วครับ",
  },
  {
    keys: /next\.?js|react|web dev|fullstack|full.?stack|frontend|backend|node/i,
    answer: "คอร์ส Web Development ครับ 💻\n\nคอร์สยอดนิยม:\n• Next.js 15 Fullstack Bootcamp\n• React Advanced Patterns\n• Node.js & API Design\n• TypeScript Mastery\n\nจากผู้สอนที่ทำงานใน startup จริงครับ",
  },

  // ราคา / แผน
  {
    keys: /ราคา|ค่าใช้จ่าย|เท่าไ(ห)?ร่|แพง|ถูก|ค่า.*สมัคร|ค่า.*เรียน|บาท|plan|แผน/i,
    answer: "แผนราคาของ VERDA ครับ 💳\n\n📅 รายเดือน — ฿299/เดือน\n• เข้าถึงคอร์สทั้งหมด 200+\n• ดาวน์โหลด offline ได้\n• ใบประกาศนียบัตรดิจิทัล\n\n👑 รายปี — ฿2,490/ปี (ประหยัด 30%)\n• ทุกอย่างของรายเดือน\n• Live Session ทุกเดือน\n• Discord exclusive\n\n♾ ตลอดชีพ — ฿4,990 จ่ายครั้งเดียว\n• ทุกอย่างของรายปี\n• 1:1 Mentoring 1 ครั้ง\n\n✅ ทุกแผนทดลองใช้ฟรี 7 วัน ไม่ต้องใส่บัตรเครดิต",
  },
  {
    keys: /รายเดือน|monthly/i,
    answer: "แผนรายเดือน ฿299/เดือน ครับ 📅\n\nรวม:\n✅ คอร์สทั้งหมด 200+\n✅ ดาวน์โหลด offline\n✅ ใบประกาศนียบัตรดิจิทัล\n✅ Q&A กับผู้สอนไม่จำกัด\n✅ อัปเดตเนื้อหาตลอดชีพ\n\nยกเลิกได้ทุกเมื่อ ไม่ผูกมัดครับ",
  },
  {
    keys: /รายปี|yearly|annual/i,
    answer: "แผนรายปี ฿2,490/ปี ครับ 👑 (ประหยัด 30% เมื่อเทียบรายเดือน)\n\nรวมทุกอย่างของรายเดือน บวก:\n✅ Live Session กับผู้สอนทุกเดือน\n✅ Community Discord exclusive\n✅ ใบประกาศ PDF คุณภาพสูง\n\nยอดนิยมที่สุดครับ!",
  },
  {
    keys: /ตลอดชีพ|lifetime/i,
    answer: "แผนตลอดชีพ ฿4,990 ครับ ♾\n\nจ่ายครั้งเดียว เรียนได้ตลอดชีพ!\n\nรวมทุกอย่างของรายปี บวก:\n✅ 1:1 Mentoring session 1 ครั้ง\n✅ Priority support\n\nคุ้มที่สุดสำหรับคนที่อยากเรียนระยะยาวครับ",
  },

  // ทดลองใช้ฟรี
  {
    keys: /ฟรี|free|ทดลอง|trial/i,
    answer: "มีครับ! 🎁 ทุกแผนได้ทดลองใช้ฟรี 7 วัน\n\n✅ ไม่ต้องใส่บัตรเครดิต\n✅ เข้าถึงคอร์สได้เต็มรูปแบบ\n✅ ยกเลิกก่อนครบ 7 วันก็ไม่เสียค่าใช้จ่าย\n\nแค่กด สมัครสมาชิก แล้วเลือกแผนได้เลยครับ",
  },

  // สมัคร / ลงทะเบียน
  {
    keys: /สมัคร|ลงทะเบียน|register|sign.?up|เริ่มต้น|เปิด.*บัญชี/i,
    answer: "สมัครง่ายมากครับ 3 ขั้นตอน 👇\n\n1️⃣ กดปุ่ม สมัครสมาชิก มุมบนขวา\n2️⃣ กรอกอีเมล + รหัสผ่าน\n   หรือ Login ด้วย Google / LINE\n3️⃣ เลือกแผนที่ต้องการ\n\nเริ่มเรียนได้ทันที มีทดลองฟรี 7 วันครับ!",
  },
  {
    keys: /login|เข้าสู่ระบบ|เข้า.*ระบบ|ล็อกอิน/i,
    answer: "เข้าสู่ระบบได้หลายวิธีครับ:\n\n📧 Email + รหัสผ่าน\n🟢 Google Account\n💚 LINE Account\n📱 เบอร์โทรศัพท์ + OTP\n\nไปที่หน้า เข้าสู่ระบบ ได้เลยครับ",
  },

  // ใบประกาศ
  {
    keys: /ใบประกาศ|certificate|ประกาศนียบัตร|วุฒิ|cert/i,
    answer: "มีใบประกาศนียบัตรดิจิทัลครับ 🎓\n\nหลังเรียนจบ + ผ่านแบบทดสอบ:\n✅ ออกอัตโนมัติทันที\n✅ ดาวน์โหลดเป็น PDF\n✅ แชร์ลง LinkedIn ได้\n✅ มี QR Code ยืนยันความจริง\n✅ ระบุชื่อ-นามสกุลจริง\n\nแผนรายปีและตลอดชีพได้ใบประกาศ PDF คุณภาพสูงพิเศษครับ",
  },

  // ผู้สอน
  {
    keys: /ผู้สอน|อาจารย์|instructor|ครู|สอนโดย|สอนจาก/i,
    answer: "ผู้สอนของ VERDA เป็นผู้เชี่ยวชาญที่ทำงานจริงครับ 👨‍🏫\n\nตัวอย่างผู้สอน:\n• คุณพิมพ์ชนก — Lead UX Designer @ SCB\n• Andrew Ng — Stanford / Coursera AI\n• คุณธนกร — Full Stack @ Agoda\n• คุณวิชัย — Data Scientist @ Lazada\n\nดูโปรไฟล์ทั้งหมดที่หน้า ผู้สอน ได้เลยครับ",
  },

  // ชำระเงิน
  {
    keys: /ชำระ|จ่าย|payment|บัตร.*เครดิต|PromptPay|QR|โอน|สแกน/i,
    answer: "รองรับหลายวิธีชำระครับ 💳\n\n✅ บัตรเครดิต/เดบิต Visa, Mastercard\n✅ PromptPay (QR Code)\n✅ รองรับทุกธนาคารในไทย\n\nชำระผ่านระบบ Stripe & Omise ปลอดภัย 100% ครับ",
  },

  // ยกเลิก / คืนเงิน
  {
    keys: /ยกเลิก|cancel|คืนเงิน|refund|หยุด.*ใช้/i,
    answer: "นโยบายยกเลิกครับ:\n\n📅 รายเดือน — ยกเลิกได้ทุกเมื่อ มีผลรอบบิลถัดไป\n📆 รายปี — คืนเงินได้ภายใน 7 วันแรก\n♾ ตลอดชีพ — ไม่สามารถคืนได้ (จ่ายครั้งเดียว)\n\nติดต่อทีมงานที่ hello@verda.co.th ครับ",
  },

  // Offline
  {
    keys: /offline|ออฟไลน์|ดาวน์โหลด|download|ไม่มี.*internet|ไม่ได้.*net/i,
    answer: "ดาวน์โหลดเพื่อเรียน offline ได้ครับ 📥\n\n✅ รองรับทุกแผน (เดือน/ปี/ตลอดชีพ)\n✅ เรียนได้แม้ไม่มี internet\n✅ ทำงานบนมือถือและแท็บเล็ต\n\nดาวน์โหลดผ่านแอปบนมือถือ (iOS/Android) ได้เลยครับ",
  },

  // Live Session
  {
    keys: /live|สด|webinar|session.*สด|เรียนสด/i,
    answer: "มี Live Session ทุกเดือนครับ 🎙️\n\nสำหรับสมาชิกแผน รายปี และ ตลอดชีพ:\n✅ ถามตอบกับผู้สอนแบบ real-time\n✅ บันทึกย้อนดูได้ภายหลัง\n✅ หัวข้อหมุนเวียนตามความต้องการ\n\nตารางแจ้งล่วงหน้าทาง Discord ครับ",
  },

  // องค์กร
  {
    keys: /องค์กร|บริษัท|ทีม|enterprise|corporate|หลาย.*คน|คน.*ขึ้นไป/i,
    answer: "มีแผน Enterprise สำหรับองค์กรครับ 🏢\n\n✅ เริ่มต้นที่ 10 ที่นั่ง\n✅ Dashboard ติดตามความคืบหน้าทีม\n✅ ราคาพิเศษสำหรับองค์กร\n✅ Invoice & ภาษีหัก ณ ที่จ่าย\n✅ รองรับ SSO / LMS Integration\n\nติดต่อได้ที่ hello@verda.co.th ครับ",
  },

  // PWA / มือถือ
  {
    keys: /มือถือ|โทรศัพท์|app|แอป|mobile|android|ios|iphone/i,
    answer: "ใช้งานบนมือถือได้ครับ 📱\n\n✅ PWA — ติดตั้งเป็นแอปบนมือถือได้ทันที\n✅ รองรับ Android & iOS\n✅ ดาวน์โหลดคอร์สเรียน offline\n✅ หน้าจอแสดงผลได้สวยงามทุกขนาด\n\nเปิดเว็บแล้วกด 'Add to Home Screen' ได้เลยครับ",
  },

  // Discord
  {
    keys: /discord|community|ชุมชน|กลุ่ม/i,
    answer: "มี Community Discord exclusive ครับ 💬\n\nสำหรับสมาชิกแผน รายปี และ ตลอดชีพ:\n✅ พูดคุยกับผู้เรียนคนอื่น\n✅ ช่องถาม-ตอบแยกตามหมวดคอร์ส\n✅ แชร์งาน portfolio และรับ feedback\n✅ ข่าวสารและ Live Session ล่วงหน้า",
  },

  // ติดต่อ
  {
    keys: /ติดต่อ|contact|support|ช่วยเหลือ|email|อีเมล|โทร/i,
    answer: "ติดต่อทีมงาน VERDA ได้ครับ 📬\n\n✉️ Email: hello@verda.co.th\n💬 Live Chat: หน้าเว็บไซต์\n📱 Discord: Community (สมาชิกรายปี+)\n\nทีมงานตอบกลับภายใน 24 ชั่วโมงครับ",
  },
];

function getBotReply(text: string): string {
  const q = text.toLowerCase().trim();

  for (const rule of RULES) {
    if (rule.keys.test(q)) return rule.answer;
  }

  return "ขอบคุณสำหรับคำถามครับ 🤔\nผมยังไม่เข้าใจคำถามนี้\n\nลองถามเรื่องเหล่านี้ได้เลย:\n• คอร์สที่มีในระบบ\n• ราคาและแผนสมาชิก\n• วิธีสมัครและชำระเงิน\n• ใบประกาศนียบัตร\n\nหรือติดต่อทีมงานที่ hello@verda.co.th ครับ";
}

// ── Component ──────────────────────────────────────────────────────────────

const INITIAL_MESSAGE: Message = {
  id: 0,
  from: "bot",
  text: "สวัสดีครับ! 👋 ผม Verdy ผู้ช่วย AI ของ VERDA LMS\n\nสามารถถามเรื่องคอร์สเรียน ราคา วิธีสมัคร หรืออะไรก็ได้เลยครับ",
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
  function handleReset() { setMessages([INITIAL_MESSAGE]); setInput(""); }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMsg: Message = { id: Date.now(), from: "user", text: trimmed, time: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // simulate typing delay 600–900ms
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 300));

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
          style={{ height: "480px" }}
        >
          {/* Header */}
          <div className="bg-viridian px-4 py-3 flex items-center gap-3">
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
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 bg-paper-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.from === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {msg.from === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-viridian flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[75%] flex flex-col gap-0.5 ${msg.from === "user" ? "items-end" : "items-start"}`}>
                  <div className={`rounded-r3 px-3 py-2 text-[13px] leading-[1.6] whitespace-pre-line font-thai ${
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
          <div className="px-3 pt-2 pb-1 flex gap-1.5 flex-wrap border-t border-line bg-paper">
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
          <form onSubmit={handleSubmit} className="px-3 pb-3 pt-2 flex gap-2 bg-paper">
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
