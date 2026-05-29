import { NextRequest, NextResponse } from "next/server";

interface CertData {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: string;
  hours: number;
}

function buildCertHtml(certId: string, data: CertData): string {
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ใบประกาศ VERDA — ${data.courseTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=IBM+Plex+Sans+Thai:wght@400;500&family=JetBrains+Mono&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'IBM Plex Sans Thai',sans-serif;background:#F7F5EF;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px}
    .cert{background:#fff;width:800px;padding:72px 60px;text-align:center;border:1px solid #E2DDD5;box-shadow:0 4px 40px rgba(0,0,0,.08)}
    .top-bar{height:6px;background:linear-gradient(90deg,#2D6A4F,#1A7A60);margin:-72px -60px 64px}
    .brand{font-family:'Instrument Serif',serif;font-size:30px;color:#1A2320;letter-spacing:-.02em;margin-bottom:32px}
    .brand-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#2D6A4F;margin-left:6px;vertical-align:middle}
    .eyebrow{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:#2D6A4F;margin-bottom:20px}
    .given-to{font-size:15px;color:#6B7474;margin-bottom:12px}
    .student-name{font-family:'Instrument Serif',serif;font-size:52px;color:#1A2320;letter-spacing:-.02em;line-height:1.1;margin-bottom:28px}
    .completed{font-size:15px;color:#6B7474;margin-bottom:10px}
    .course-title{font-family:'Instrument Serif',serif;font-size:30px;color:#2D6A4F;line-height:1.25;margin-bottom:0}
    .divider{width:64px;height:1px;background:#E2DDD5;margin:36px auto}
    .meta{font-size:13px;color:#6B7474}
    .instructor-row{margin-top:36px;padding-top:36px;border-top:1px solid #E2DDD5;font-size:14px;color:#1A2320}
    .instructor-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#9BA3A0;display:block;margin-bottom:4px}
    .cert-id{font-family:'JetBrains Mono',monospace;font-size:10px;color:#C9CDC8;text-transform:uppercase;margin-top:28px;letter-spacing:.08em}
    .print-hint{font-family:'JetBrains Mono',monospace;font-size:10px;color:#9BA3A0;margin-top:32px}
    @media print{body{background:#fff;padding:0}.print-hint{display:none}}
  </style>
</head>
<body>
  <div class="cert">
    <div class="top-bar"></div>
    <div class="brand">VERDA<span class="brand-dot"></span></div>
    <div class="eyebrow">ใบประกาศนียบัตร · Certificate of Completion</div>
    <p class="given-to">ขอมอบให้แก่</p>
    <h1 class="student-name">${data.studentName}</h1>
    <p class="completed">สำเร็จการเรียนหลักสูตร</p>
    <h2 class="course-title">${data.courseTitle}</h2>
    <div class="divider"></div>
    <p class="meta">${data.hours} ชั่วโมงการเรียน &nbsp;·&nbsp; ออกให้ ${data.issuedAt}</p>
    <div class="instructor-row">
      <span class="instructor-label">ผู้สอน / Instructor</span>
      ${data.instructorName}
    </div>
    <p class="cert-id">Certificate ID: ${certId}</p>
    <p class="print-hint">เปิดใน Browser แล้วกด Ctrl+P (หรือ ⌘+P) เพื่อบันทึกเป็น PDF</p>
  </div>
</body>
</html>`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ certId: string }> },
) {
  const { certId } = await params;

  let certData: CertData = {
    studentName: "วีรวัฒน์ จันทรชุม",
    courseTitle: "Financial Planning for Freelancers",
    instructorName: "ธนพล สิทธิกุล",
    issuedAt: "10 มกราคม 2569",
    hours: 4,
  };

  try {
    const { db } = await import("@/lib/db");
    const dbCert = await db.certificate.findUnique({
      where: { id: certId },
      include: {
        user: { select: { name: true } },
        course: {
          select: {
            title: true,
            totalDuration: true,
            instructor: { select: { name: true } },
          },
        },
      },
    });
    if (dbCert) {
      certData = {
        studentName: dbCert.user.name ?? "ผู้เรียน",
        courseTitle: dbCert.course.title,
        instructorName: dbCert.course.instructor?.name ?? "Instructor",
        issuedAt: dbCert.issuedAt.toLocaleDateString("th-TH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        hours: Math.round((dbCert.course.totalDuration ?? 0) / 3600),
      };
    }
  } catch {
    // DB unavailable — use mock defaults above
  }

  const html = buildCertHtml(certId, certData);

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="VERDA-Certificate-${certId}.html"`,
      "Cache-Control": "private, no-cache",
    },
  });
}
