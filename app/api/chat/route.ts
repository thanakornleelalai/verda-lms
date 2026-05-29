import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `คุณคือ Verdy ผู้ช่วย AI ของแพลตฟอร์มเรียนออนไลน์ VERDA LMS
ตอบคำถามเกี่ยวกับคอร์สเรียน ราคา วิธีสมัคร และฟีเจอร์ต่าง ๆ เป็นภาษาไทย

ข้อมูลแพลตฟอร์ม VERDA LMS:
- คอร์สกว่า 200+ คอร์ส ครอบคลุม UX/UI Design, Machine Learning, Next.js, Data Science, Digital Marketing ฯลฯ
- ผู้สอนเป็นผู้เชี่ยวชาญที่ทำงานจริง เช่น คุณพิมพ์ชนก (UX Designer), Andrew Ng (ML), คุณธนกร (Full Stack)

แผนราคา:
- รายเดือน: ฿299/เดือน — เข้าถึงคอร์สทั้งหมด ดาวน์โหลด Offline ใบประกาศดิจิทัล Q&A ไม่จำกัด
- รายปี: ฿2,490/ปี (ประหยัด 30%) — รวมทุกอย่าง + Live Session ทุกเดือน + Discord exclusive
- ตลอดชีพ: ฿4,990 จ่ายครั้งเดียว — รวมทุกอย่าง + 1:1 Mentoring 1 ครั้ง
- ทุกแผนมีทดลองใช้ฟรี 7 วัน ไม่ต้องใส่บัตรเครดิต

ฟีเจอร์:
- รองรับภาษาไทย/อังกฤษ, Dark/Light mode, PWA ติดตั้งบนมือถือได้
- ⌘K ค้นหาคอร์สได้ทันที, ฟอรัมถาม-ตอบ, Leaderboard
- ชำระเงินด้วยบัตรเครดิต Visa/Mastercard และ PromptPay (QR Code)
- ยกเลิกรายเดือนได้ทุกเมื่อ, รายปีคืนเงินได้ภายใน 7 วัน
- แผน Enterprise สำหรับองค์กร เริ่มต้น 10 ที่นั่ง ติดต่อ hello@verda.co.th

วิธีสมัคร: กดปุ่ม "สมัครสมาชิก" → กรอกอีเมล+รหัสผ่าน หรือ Login ด้วย Google/LINE → เลือกแผน → เริ่มเรียนได้ทันที

ตอบสั้น กระชับ เป็นธรรมชาติ ใช้ emoji ได้บ้าง ถ้าไม่รู้ให้แนะนำให้ติดต่อ hello@verda.co.th`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const { messages } = await req.json() as {
    messages: { role: "user" | "assistant"; content: string }[];
  };

  const stream = client.messages.stream({
    model: "claude-haiku-4-5",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages,
  });

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
