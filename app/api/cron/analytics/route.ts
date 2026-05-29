import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  // Triggered by vercel.json cron schedule daily at 02:00 UTC
  // TODO: aggregate ProgressEvents → AnalyticsSnapshot per course/instructor
  console.log("nightly analytics cron", new Date().toISOString());
  return NextResponse.json({ ok: true, ran: new Date().toISOString() });
}
