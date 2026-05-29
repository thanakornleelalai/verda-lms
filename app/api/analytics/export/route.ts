import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/analytics/export?type=enrollments|orders|progress&from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role;
  if (!role || !["ADMIN", "SUPERADMIN", "INSTRUCTOR"].includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "enrollments";
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date("2026-01-01");
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : new Date();

  let csv = "";
  let filename = "";

  try {
    if (type === "enrollments") {
      filename = `verda-enrollments-${dateStr()}.csv`;
      const rows = await db.enrollment.findMany({
        where: { enrolledAt: { gte: from, lte: to } },
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true, slug: true } },
        },
        orderBy: { enrolledAt: "desc" },
      });
      csv = toCSV(
        ["Student Name", "Email", "Course", "Enrolled At", "Completed At"],
        rows.map((r) => [
          r.user.name ?? "",
          r.user.email ?? "",
          r.course.title,
          r.enrolledAt.toISOString().slice(0, 10),
          r.completedAt ? r.completedAt.toISOString().slice(0, 10) : "",
        ]),
      );
    } else if (type === "orders") {
      filename = `verda-orders-${dateStr()}.csv`;
      const rows = await db.order.findMany({
        where: { createdAt: { gte: from, lte: to } },
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { course: { select: { title: true } } } },
        },
        orderBy: { createdAt: "desc" },
      });
      csv = toCSV(
        ["Order ID", "Student", "Email", "Courses", "Total (THB)", "Status", "Gateway", "Date"],
        rows.map((r) => [
          r.id,
          r.user.name ?? "",
          r.user.email ?? "",
          r.items.map((i) => i.course.title).join("; "),
          (r.total / 100).toFixed(2),
          r.status,
          r.gateway,
          r.createdAt.toISOString().slice(0, 10),
        ]),
      );
    } else if (type === "progress") {
      filename = `verda-progress-${dateStr()}.csv`;
      const rows = await db.userCourseProgress.findMany({
        where: { updatedAt: { gte: from, lte: to } },
        include: {
          user: { select: { name: true, email: true } },
          enrollment: {
            include: { course: { select: { title: true } } },
          },
        },
        orderBy: { updatedAt: "desc" },
      });
      csv = toCSV(
        ["Student", "Email", "Course", "Progress %", "Last Updated"],
        rows.map((r) => [
          r.user.name ?? "",
          r.user.email ?? "",
          r.enrollment.course.title,
          String(r.progressPct),
          r.updatedAt.toISOString().slice(0, 10),
        ]),
      );
    } else {
      return NextResponse.json({ error: "Unknown export type" }, { status: 400 });
    }
  } catch {
    // Mock fallback
    filename = `verda-${type}-mock-${dateStr()}.csv`;
    csv = mockCSV(type);
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-cache",
    },
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function dateStr() {
  return new Date().toISOString().slice(0, 10);
}

function escapeCSV(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function toCSV(headers: string[], rows: string[][]): string {
  const lines = [
    headers.map(escapeCSV).join(","),
    ...rows.map((r) => r.map(escapeCSV).join(",")),
  ];
  return "﻿" + lines.join("\n"); // BOM for Excel Thai support
}

function mockCSV(type: string): string {
  if (type === "enrollments") {
    return toCSV(
      ["Student Name", "Email", "Course", "Enrolled At", "Completed At"],
      [
        ["คุณสมชาย ทดสอบ", "student@verda.dev", "UX Design & Figma Masterclass", "2026-03-20", "2026-04-10"],
        ["Demo User", "demo@verda.dev", "Machine Learning Specialization", "2026-04-01", ""],
      ],
    );
  }
  if (type === "orders") {
    return toCSV(
      ["Order ID", "Student", "Email", "Courses", "Total (THB)", "Status", "Gateway", "Date"],
      [
        ["mock_order_001", "คุณสมชาย ทดสอบ", "student@verda.dev", "UX Design & Figma Masterclass", "1999.00", "PAID", "STRIPE", "2026-03-20"],
        ["mock_order_002", "Demo User", "demo@verda.dev", "Machine Learning Specialization", "2999.00", "PAID", "OMISE", "2026-04-01"],
      ],
    );
  }
  return toCSV(
    ["Student", "Email", "Course", "Progress %", "Last Updated"],
    [
      ["คุณสมชาย ทดสอบ", "student@verda.dev", "UX Design & Figma Masterclass", "75", "2026-04-10"],
    ],
  );
}
