import { NextRequest, NextResponse } from "next/server";
import { verifyCertificate } from "@/actions/certificate";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ certId: string }> },
) {
  const { certId } = await params;
  const result = await verifyCertificate(certId);

  const status = result.valid ? 200 : 404;
  return NextResponse.json(result, {
    status,
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
