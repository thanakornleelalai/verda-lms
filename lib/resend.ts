import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@verda.co.th";
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

// ── Dev/mock helper ────────────────────────────────────────────────────────────

function isMock(): boolean {
  return !process.env.RESEND_API_KEY;
}

async function send(to: string, subject: string, html: string): Promise<void> {
  if (isMock()) {
    console.log(`[Resend Mock] To: ${to} | Subject: ${subject}`);
    return;
  }
  await resend.emails.send({ from: FROM, to, subject, html });
}

// ── Base template ──────────────────────────────────────────────────────────────

function wrap(content: string): string {
  return `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#F0EDE5;margin:0;padding:32px 16px;color:#1A2320}
  .card{background:#fff;max-width:520px;margin:0 auto;border-radius:12px;border:1px solid #E2DDD5;overflow:hidden}
  .top{height:5px;background:linear-gradient(90deg,#2D6A4F,#1A7A60)}
  .body{padding:40px 36px}
  .brand{font-size:24px;font-weight:700;color:#1A2320;letter-spacing:-.02em;margin-bottom:28px}
  .brand-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#2D6A4F;margin-left:4px;vertical-align:middle}
  h1{font-size:22px;margin:0 0 12px;font-weight:600;color:#1A2320}
  p{font-size:15px;line-height:1.7;margin:0 0 16px;color:#3D4A47}
  .btn{display:inline-block;padding:13px 28px;background:#2D6A4F;color:#fff;border-radius:999px;text-decoration:none;font-weight:600;font-size:15px;margin:8px 0 20px}
  .url{font-family:monospace;font-size:12px;color:#6B7474;word-break:break-all;background:#F0EDE5;padding:10px 12px;border-radius:6px;margin-bottom:20px}
  .footer{padding:20px 36px;border-top:1px solid #E2DDD5;font-size:12px;color:#9BA3A0;text-align:center}
  .warn{font-size:12px;color:#9BA3A0;margin-top:4px}
</style></head>
<body><div class="card">
<div class="top"></div>
<div class="body">
<div class="brand">VERDA<span class="brand-dot"></span></div>
${content}
</div>
<div class="footer">© 2026 VERDA — School of Practice &nbsp;|&nbsp; hello@verda.co.th<br>หากไม่ได้ดำเนินการนี้ กรุณาละเว้นอีเมลฉบับนี้</div>
</div></body></html>`;
}

// ── Email functions ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await send(to, "ยินดีต้อนรับสู่ VERDA — School of Practice", wrap(`
    <h1>สวัสดีคุณ ${name}!</h1>
    <p>ขอบคุณที่เข้าร่วม <strong>VERDA</strong> แพลตฟอร์มเรียนออนไลน์ที่สอนโดยผู้เชี่ยวชาญที่ทำงานจริง</p>
    <p>เริ่มเรียนคอร์สแรกของคุณได้เลย:</p>
    <a class="btn" href="${BASE}/th/courses">ดูคอร์สทั้งหมด →</a>
    <p style="font-size:13px;color:#6B7474">หากมีคำถาม ติดต่อเราได้ที่ hello@verda.co.th</p>
  `));
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const url = `${BASE}/th/reset-password/${token}`;
  await send(to, "รีเซ็ตรหัสผ่าน VERDA", wrap(`
    <h1>รีเซ็ตรหัสผ่าน</h1>
    <p>เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชี <strong>${to}</strong></p>
    <p>คลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
    <a class="btn" href="${url}">รีเซ็ตรหัสผ่าน</a>
    <p>หรือคัดลอกลิงก์นี้:</p>
    <div class="url">${url}</div>
    <p class="warn">⏱ ลิงก์นี้จะหมดอายุใน <strong>1 ชั่วโมง</strong><br>หากไม่ได้ขอรีเซ็ต กรุณาละเว้นอีเมลนี้</p>
  `));
}

export async function sendEmailVerificationEmail(to: string, token: string): Promise<void> {
  const url = `${BASE}/th/verify-email/${token}`;
  await send(to, "ยืนยันอีเมล VERDA", wrap(`
    <h1>ยืนยันอีเมลของคุณ</h1>
    <p>กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมล <strong>${to}</strong> ของคุณ</p>
    <a class="btn" href="${url}">ยืนยันอีเมล</a>
    <p>หรือคัดลอกลิงก์นี้:</p>
    <div class="url">${url}</div>
    <p class="warn">⏱ ลิงก์นี้จะหมดอายุใน <strong>24 ชั่วโมง</strong></p>
  `));
}

export async function sendCertificateEmail(
  to: string, name: string, courseTitle: string, certUrl: string,
): Promise<void> {
  await send(to, `ใบประกาศนียบัตร: ${courseTitle}`, wrap(`
    <h1>🎓 ยินดีด้วยคุณ ${name}!</h1>
    <p>คุณเรียนจบหลักสูตร <strong>${courseTitle}</strong> เรียบร้อยแล้ว</p>
    <a class="btn" href="${certUrl}">ดูใบประกาศนียบัตร</a>
    <p style="font-size:13px;color:#6B7474">แชร์ใบประกาศไปยัง LinkedIn เพื่อแสดงทักษะของคุณ</p>
  `));
}
