import { NextRequest, NextResponse } from "next/server";
import { verifyCertificate } from "@/actions/certificate";
import { getCertVerifyUrl } from "@/lib/certificate-url";

function buildPrintableHtml(certId: string, data: {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: string;
  hours: number;
}, verifyUrl: string): string {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyUrl)}&color=1A2320&bgcolor=ffffff&margin=10`;

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ใบประกาศ VERDA — ${data.courseTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=IBM+Plex+Sans+Thai:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'IBM Plex Sans Thai',sans-serif;background:#F0EDE5;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px;color:#1A2320}
    .page{background:#fff;width:794px;min-height:561px;border:1px solid #E2DDD5;box-shadow:0 8px 48px rgba(0,0,0,.12)}
    .top-bar{height:8px;background:linear-gradient(90deg,#2D6A4F 0%,#1A7A60 60%,#0D9E6A 100%)}
    .body{padding:56px 60px 40px;display:flex;flex-direction:column}
    .brand-row{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:32px}
    .brand{font-family:'Instrument Serif',serif;font-size:32px;color:#1A2320;letter-spacing:-.02em}
    .brand-dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:#2D6A4F}
    .eyebrow{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:#2D6A4F;text-align:center;margin-bottom:24px}
    .given-to{font-size:15px;color:#6B7474;text-align:center;margin-bottom:12px}
    .student-name{font-family:'Instrument Serif',serif;font-size:56px;color:#1A2320;letter-spacing:-.02em;line-height:1.08;text-align:center;margin-bottom:20px}
    .completed{font-size:15px;color:#6B7474;text-align:center;margin-bottom:8px}
    .course-title{font-family:'Instrument Serif',serif;font-size:32px;color:#2D6A4F;line-height:1.2;text-align:center;margin-bottom:0}
    .divider{display:flex;align-items:center;justify-content:center;gap:16px;margin:28px 0}
    .divider-line{height:1px;width:72px;background:#E2DDD5}
    .trophy{color:#B45309;font-size:18px}
    .meta{font-size:13px;color:#6B7474;text-align:center;margin-bottom:0}
    .instructor-row{margin-top:28px;padding-top:24px;border-top:1px solid #E2DDD5;display:flex;align-items:center;justify-content:center;gap:12px}
    .avatar{width:40px;height:40px;border-radius:50%;background:#2D6A4F;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;font-family:'Instrument Serif',serif;flex-shrink:0}
    .instructor-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#9BA3A0;display:block;margin-bottom:3px}
    .instructor-name{font-weight:600;font-size:15px;color:#1A2320}
    .bottom-row{margin-top:24px;padding-top:20px;border-top:1px solid #E2DDD5;display:flex;align-items:flex-end;justify-content:space-between;gap:16px}
    .qr-wrap{display:flex;flex-direction:column;align-items:center;gap:4px}
    .qr-img{width:80px;height:80px;border:1px solid #E2DDD5;border-radius:4px}
    .qr-label{font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:.08em;text-transform:uppercase;color:#9BA3A0}
    .cert-info{flex:1;text-align:center}
    .cert-id-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:#9BA3A0;margin-bottom:4px}
    .cert-id{font-family:'JetBrains Mono',monospace;font-size:10px;color:#6B7474;margin-bottom:10px;word-break:break-all}
    .verified-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:999px}
    .verified-text{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:#16A34A}
    .seal{width:80px;height:80px;border-radius:50%;border:2px solid rgba(45,106,79,.2);display:flex;align-items:center;justify-content:center;background:rgba(45,106,79,.04);flex-shrink:0}
    .seal-inner{text-align:center}
    .seal-brand{font-family:'Instrument Serif',serif;font-size:14px;color:#2D6A4F;line-height:1}
    .seal-sub{font-family:'JetBrains Mono',monospace;font-size:7px;letter-spacing:.1em;text-transform:uppercase;color:rgba(45,106,79,.5);margin-top:3px}
    .verify-url{font-family:'JetBrains Mono',monospace;font-size:9px;color:#9BA3A0;text-align:center;margin-top:12px}
    @media print{body{background:#fff;padding:0;display:block}.page{box-shadow:none;border:none;width:100%}}
    @page{margin:0;size:A4 landscape}
  </style>
</head>
<body>
  <div class="page">
    <div class="top-bar"></div>
    <div class="body">
      <div class="brand-row">
        <span class="brand">VERDA</span>
        <span class="brand-dot"></span>
      </div>
      <div class="eyebrow">ใบประกาศนียบัตร &nbsp;·&nbsp; Certificate of Completion</div>
      <p class="given-to">ขอมอบให้แก่</p>
      <h1 class="student-name">${data.studentName}</h1>
      <p class="completed">สำเร็จการเรียนหลักสูตร</p>
      <h2 class="course-title">${data.courseTitle}</h2>
      <div class="divider">
        <div class="divider-line"></div>
        <span class="trophy">🏆</span>
        <div class="divider-line"></div>
      </div>
      <p class="meta">${data.hours > 0 ? data.hours + " ชั่วโมงการเรียน&nbsp;&nbsp;·&nbsp;&nbsp;" : ""}ออกให้ ${data.issuedAt}</p>
      <div class="instructor-row">
        <div class="avatar">${data.instructorName.charAt(0)}</div>
        <div>
          <span class="instructor-label">ผู้สอน / Instructor</span>
          <div class="instructor-name">${data.instructorName}</div>
        </div>
      </div>
      <div class="bottom-row">
        <div class="qr-wrap">
          <img class="qr-img" src="${qrUrl}" alt="QR Code">
          <span class="qr-label">สแกนยืนยัน</span>
        </div>
        <div class="cert-info">
          <div class="cert-id-label">Certificate ID</div>
          <div class="cert-id">${certId.toUpperCase()}</div>
          <div class="verified-badge">
            <span style="color:#16A34A;font-size:11px">✓</span>
            <span class="verified-text">VERDA Verified</span>
          </div>
        </div>
        <div class="seal">
          <div class="seal-inner">
            <div class="seal-brand">VERDA</div>
            <div class="seal-sub">Certified</div>
          </div>
        </div>
      </div>
      <div class="verify-url">ยืนยัน: ${verifyUrl}</div>
    </div>
  </div>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function(){ window.print(); }, 800);
    });
  </script>
</body>
</html>`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ certId: string }> },
) {
  const { certId } = await params;
  const verifyUrl = getCertVerifyUrl(certId);

  // Try DB first, then fallback
  const result = await verifyCertificate(certId);

  const certData = result.valid
    ? {
        studentName: result.studentName ?? "ผู้เรียน",
        courseTitle: result.courseTitle ?? "หลักสูตร",
        instructorName: result.instructorName ?? "ผู้สอน",
        issuedAt: result.issuedAt
          ? new Date(result.issuedAt).toLocaleDateString("th-TH", {
              year: "numeric", month: "long", day: "numeric",
            })
          : new Date().toLocaleDateString("th-TH"),
        hours: result.hours ?? 0,
      }
    : {
        studentName: "ผู้เรียน",
        courseTitle: "หลักสูตร VERDA",
        instructorName: "ผู้สอน",
        issuedAt: new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }),
        hours: 0,
      };

  const html = buildPrintableHtml(certId, certData, verifyUrl);

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="VERDA-Certificate-${certId}.html"`,
      "Cache-Control": "private, no-cache",
    },
  });
}
