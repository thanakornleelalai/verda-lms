import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "noreply@verda.co.th",
    to,
    subject: "ยินดีต้อนรับสู่ VERDA — School of Practice",
    html: `<p>สวัสดีคุณ ${name},</p><p>ขอบคุณที่เข้าร่วม VERDA ยินดีต้อนรับ!</p>`,
  });
}

export async function sendCertificateEmail(to: string, name: string, courseTitle: string, pdfUrl: string) {
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "noreply@verda.co.th",
    to,
    subject: `ใบประกาศนียบัตร: ${courseTitle}`,
    html: `<p>ยินดีด้วยคุณ ${name}!<br/>คุณเรียนจบคอร์ส <strong>${courseTitle}</strong> เรียบร้อยแล้ว</p><p><a href="${pdfUrl}">ดาวน์โหลดใบประกาศนียบัตร</a></p>`,
  });
}
