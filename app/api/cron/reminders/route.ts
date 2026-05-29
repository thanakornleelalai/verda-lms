import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  // Triggered weekly Monday 09:00 UTC
  // TODO: find students inactive > 7 days, send reminder email via Resend
  console.log("weekly reminder cron", new Date().toISOString());
  return NextResponse.json({ ok: true, ran: new Date().toISOString() });
}
