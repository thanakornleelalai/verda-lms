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

function getBotReply(text: string): string {
  const q = text.toLowerCase();

  if (q.match(/คอร์ส|เรียน|วิชา|หลักสูตร/)) {
    return "มีคอร์สกว่า 200+ คอร์สครับ ครอบคลุมหลายหมวด เช่น\n• UX/UI Design\n• Machine Learning & AI\n• Next.js / Web Development\n• Data Science\n• Digital Marketing\n\nดูทั้งหมดได้ที่หน้า คอร์สทั้งหมด ครับ 📚";
  }
  if (q.match(/ราคา|ค่าใช้จ่าย|เท่าไหร่|แพง|ถูก|ค่า|บาท|สมัคร/)) {
    return "มี 3 แผนราคาครับ\n\n💳 รายเดือน — ฿299/เดือน\n👑 รายปี — ฿2,490/ปี (ประหยัด 30%)\n♾ ตลอดชีพ — ฿4,990 จ่ายครั้งเดียว\n\nทุกแผนเข้าถึงคอร์สได้ทั้งหมด และมีทดลองใช้ฟรี 7 วันครับ!";
  }
  if (q.match(/ใบประกาศ|certificate|ประกาศนียบัตร|วุฒิ/)) {
    return "มีใบประกาศนียบัตรดิจิทัลครับ 🎓\n\nหลังเรียนจบและผ่านแบบทดสอบแล้ว ระบบจะออกใบประกาศให้อัตโนมัติ สามารถ:\n• ดาวน์โหลดเป็น PDF ได้\n• แชร์ลง LinkedIn ได้\n• มี QR Code สำหรับยืนยันความถูกต้อง";
  }
  if (q.match(/ผู้สอน|อาจารย์|instructor|ครู|สอนโดย/)) {
    return "ผู้สอนของ VERDA เป็นผู้เชี่ยวชาญที่ทำงานจริงในอุตสาหกรรมครับ เช่น\n• คุณพิมพ์ชนก — UX Designer จาก SCB\n• Andrew Ng — Machine Learning Expert\n• คุณธนกร — Full Stack Developer\n\nดูโปรไฟล์ผู้สอนทั้งหมดได้ที่หน้า ผู้สอน ครับ";
  }
  if (q.match(/ชำระ|จ่าย|payment|บัตร|promptpay|qr/)) {
    return "รองรับหลายวิธีชำระเงินครับ 💳\n• บัตรเครดิต / เดบิต (Visa, Mastercard)\n• PromptPay (QR Code)\n• รองรับทุกธนาคารในไทย\n\nชำระเงินปลอดภัย ผ่าน Stripe และ Omise";
  }
  if (q.match(/ออฟไลน์|offline|ดาวน์โหลด|download/)) {
    return "ดาวน์โหลดเนื้อหาเพื่อเรียน offline ได้ครับ 📥\nรองรับในแผนรายปีและตลอดชีพ สามารถเรียนได้แม้ไม่มีอินเทอร์เน็ต";
  }
  if (q.match(/live|สด|session|webinar/)) {
    return "มี Live Session ทุกเดือนครับ 🎙\nสำหรับสมาชิกแผนรายปีและตลอดชีพ สามารถถามตอบกับผู้สอนได้แบบ real-time";
  }
  if (q.match(/สมัคร|register|sign up|account|บัญชี/)) {
    return "สมัครสมาชิกง่ายมากครับ 👇\n1. กดปุ่ม สมัครสมาชิก ด้านบนขวา\n2. กรอกอีเมลและรหัสผ่าน หรือ Login ด้วย Google / LINE\n3. เลือกแผนที่ต้องการ\n4. เริ่มเรียนได้ทันที!\n\nมีทดลองใช้ฟรี 7 วัน ไม่ต้องใส่บัตรเครดิต";
  }
  if (q.match(/ยกเลิก|cancel|คืนเงิน|refund/)) {
    return "สมาชิกรายเดือนยกเลิกได้ทุกเมื่อครับ จะมีผลในรอบบิลถัดไป\n\nสมาชิกรายปีสามารถขอคืนเงินได้ภายใน 7 วันแรกหลังสมัคร\n\nติดต่อทีมงานได้ที่ hello@verda.co.th";
  }
  if (q.match(/องค์กร|บริษัท|ทีม|enterprise|corporate/)) {
    return "มีแผน Enterprise ครับ 🏢\nเริ่มต้นที่ 10 ที่นั่ง พร้อม:\n• Dashboard สำหรับผู้ดูแล\n• ติดตามความคืบหน้าของทีม\n• ราคาพิเศษสำหรับองค์กร\n\nติดต่อได้ที่ hello@verda.co.th";
  }
  if (q.match(/สวัสดี|หวัดดี|hello|hi|ดีครับ|ดีค่ะ/)) {
    return "สวัสดีครับ! 👋 ผม Verdy ผู้ช่วย AI ของ VERDA LMS\nสามารถถามเรื่องคอร์สเรียน ราคา การสมัคร หรือฟีเจอร์ต่าง ๆ ได้เลยครับ";
  }
  if (q.match(/ขอบคุณ|thanks|thank|ขอบใจ/)) {
    return "ยินดีครับ! 😊 ถ้ามีคำถามเพิ่มเติมเกี่ยวกับคอร์สหรือระบบ ถามได้เลยนะครับ";
  }

  return "ขอบคุณสำหรับคำถามครับ 🤔\nผมอาจจะยังไม่เข้าใจคำถามนี้\n\nลองถามเรื่องเหล่านี้ได้เลยครับ:\n• คอร์สที่มีในระบบ\n• ราคาและแผนสมาชิก\n• วิธีสมัครและชำระเงิน\n• ใบประกาศนียบัตร\n\nหรือติดต่อทีมงานที่ hello@verda.co.th ครับ";
}

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

  function handleOpen() {
    setOpen(true);
    setMinimized(false);
    setUnread(0);
  }

  function handleClose() {
    setOpen(false);
    setUnread(0);
  }

  function handleReset() {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = { id: Date.now(), from: "user", text: trimmed, time: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

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
      {/* Chat panel */}
      {open && !minimized && (
        <div className="w-[340px] rounded-r4 border border-line bg-paper shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "480px" }}>

          {/* Header */}
          <div className="bg-viridian px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Bot size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-[14px] leading-none">Verdy</p>
              <p className="text-[11px] text-white/70 mt-0.5">ผู้ช่วย VERDA LMS · ออนไลน์</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                title="เริ่มใหม่"
              >
                <RotateCcw size={13} className="text-white/80" />
              </button>
              <button
                onClick={() => setMinimized(true)}
                className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                title="ย่อ"
              >
                <Minimize2 size={13} className="text-white/80" />
              </button>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                title="ปิด"
              >
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
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-ink-3 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
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
                className="text-[11px] font-thai px-2.5 py-1 rounded-pill border border-line bg-paper-2 text-ink-2 hover:border-viridian hover:text-viridian transition-colors"
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
              className="flex-1 text-[13px] font-thai bg-paper-2 border border-line rounded-pill px-3.5 py-2 outline-none focus:border-viridian transition-colors placeholder:text-ink-4 text-ink"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-9 h-9 rounded-full bg-viridian flex items-center justify-center hover:bg-viridian/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={15} className="text-white" />
            </button>
          </form>
        </div>
      )}

      {/* Minimized bar */}
      {open && minimized && (
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2.5 bg-viridian text-white px-4 py-2.5 rounded-pill shadow-lg hover:bg-viridian/90 transition-colors"
        >
          <Bot size={16} />
          <span className="text-[13px] font-medium">Verdy</span>
          {unread > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-viridian text-[11px] font-bold flex items-center justify-center">
              {unread}
            </span>
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
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger text-white text-[11px] font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
