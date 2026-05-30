import { NextRequest, NextResponse } from "next/server";
import { getRemainingTime } from "@/lib/kv";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;
  const remaining = await getRemainingTime(attemptId);
  return NextResponse.json({ remaining });
}
