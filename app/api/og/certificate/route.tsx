import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const certId = searchParams.get("certId") ?? "";

  // ── Resolve cert data (DB → mock fallback) ───────────────────────────
  let studentName = "ผู้เรียน";
  let courseTitle = "หลักสูตร VERDA";
  let instructorName = "ผู้สอน";
  let hours = 0;

  try {
    const { db } = await import("@/lib/db");
    const row = await db.certificate.findUnique({
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
    if (row) {
      studentName = row.user.name ?? "ผู้เรียน";
      courseTitle = row.course.title;
      instructorName = row.course.instructor?.name ?? "ผู้สอน";
      hours = Math.round((row.course.totalDuration ?? 0) / 3600);
    }
  } catch {
    // DB unavailable — use mock defaults per certId
    if (certId === "cert_fp_001") {
      studentName = "วีรวัฒน์ ใจดี";
      courseTitle = "Financial Planning for Freelancers";
      instructorName = "ธนพล สิทธิกุล";
      hours = 4;
    } else if (certId === "cert_ux_001") {
      studentName = "วีรวัฒน์ ใจดี";
      courseTitle = "UX Design & Figma Masterclass";
      instructorName = "พิมพ์พร วัฒนากร";
      hours = 8;
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF8F1",
          fontFamily: "Georgia, serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "linear-gradient(90deg, #0F5D4A, #1A7A60)",
          }}
        />

        {/* Bottom accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #1A7A60, #0F5D4A)",
          }}
        />

        {/* Decorative corner squares */}
        <div
          style={{
            position: "absolute",
            top: "28px",
            left: "28px",
            width: "32px",
            height: "32px",
            border: "2px solid #E5E2D8",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "28px",
            right: "28px",
            width: "32px",
            height: "32px",
            border: "2px solid #E5E2D8",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "28px",
            left: "28px",
            width: "32px",
            height: "32px",
            border: "2px solid #E5E2D8",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "28px",
            right: "28px",
            width: "32px",
            height: "32px",
            border: "2px solid #E5E2D8",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "0 80px",
            textAlign: "center",
          }}
        >
          {/* Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "32px",
            }}
          >
            <span
              style={{
                fontSize: "32px",
                fontFamily: "Georgia, serif",
                color: "#0E1612",
                letterSpacing: "-1px",
              }}
            >
              VERDA
            </span>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#0F5D4A",
              }}
            />
          </div>

          {/* Eyebrow */}
          <p
            style={{
              fontSize: "12px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "#0F5D4A",
              marginBottom: "24px",
              fontFamily: "monospace",
            }}
          >
            CERTIFICATE OF COMPLETION
          </p>

          <p style={{ fontSize: "16px", color: "#5C6863", marginBottom: "8px" }}>
            ขอมอบให้แก่
          </p>

          {/* Student name */}
          <h1
            style={{
              fontSize: "56px",
              fontFamily: "Georgia, serif",
              color: "#0E1612",
              letterSpacing: "-2px",
              lineHeight: 1.1,
              marginBottom: "20px",
            }}
          >
            {studentName}
          </h1>

          <p style={{ fontSize: "16px", color: "#5C6863", marginBottom: "8px" }}>
            สำเร็จการเรียนหลักสูตร
          </p>

          {/* Course title */}
          <h2
            style={{
              fontSize: "28px",
              fontFamily: "Georgia, serif",
              color: "#0F5D4A",
              lineHeight: 1.3,
              marginBottom: "24px",
              maxWidth: "800px",
            }}
          >
            {courseTitle}
          </h2>

          {/* Divider */}
          <div
            style={{
              width: "64px",
              height: "1px",
              background: "#E5E2D8",
              marginBottom: "16px",
            }}
          />

          {/* Meta */}
          <p
            style={{
              fontSize: "14px",
              color: "#8A938E",
              fontFamily: "monospace",
            }}
          >
            {hours > 0 ? `${hours} ชั่วโมงการเรียน  ·  ` : ""}
            สอนโดย {instructorName}
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
