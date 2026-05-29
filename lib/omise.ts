// Omise REST API helper — uses native fetch, no npm package required

import { createHmac, timingSafeEqual } from "crypto";

const BASE = "https://api.omise.co";

function authHeader(key: string) {
  return "Basic " + Buffer.from(key + ":").toString("base64");
}

async function omiseFetch<T = unknown>(
  path: string,
  options?: RequestInit,
  key?: string,
): Promise<T> {
  const apiKey = key ?? process.env.OMISE_SECRET_KEY ?? "";
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: authHeader(apiKey),
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  const data = (await res.json()) as T & { object?: string; message?: string };
  if (!res.ok) throw new Error((data as { message?: string }).message ?? "Omise error");
  return data;
}

export interface OmiseSource {
  id: string;
  object: string;
  type: string;
  amount: number;
  currency: string;
  scannable_code?: {
    type: string;
    image: { download_uri: string };
  };
}

export interface OmiseCharge {
  id: string;
  object: string;
  status: "pending" | "successful" | "failed" | "expired";
  amount: number;
  currency: string;
  source?: OmiseSource;
  metadata: Record<string, string>;
  failure_code?: string;
  failure_message?: string;
}

/** สร้าง PromptPay source — ได้ QR code image URL กลับมา */
export async function createPromptPaySource(amountSatang: number): Promise<OmiseSource> {
  return omiseFetch<OmiseSource>("/sources", {
    method: "POST",
    body: JSON.stringify({ type: "promptpay", amount: amountSatang, currency: "THB" }),
  });
}

/** สร้าง Charge ผูกกับ source — เริ่มรอรับเงิน */
export async function createCharge(
  sourceId: string,
  amountSatang: number,
  metadata: Record<string, string>,
): Promise<OmiseCharge> {
  return omiseFetch<OmiseCharge>("/charges", {
    method: "POST",
    body: JSON.stringify({
      amount: amountSatang,
      currency: "THB",
      source: sourceId,
      metadata,
      capture: true,
    }),
  });
}

/** ตรวจสอบสถานะ charge */
export async function getCharge(chargeId: string): Promise<OmiseCharge> {
  return omiseFetch<OmiseCharge>(`/charges/${chargeId}`);
}

/** Verify Omise webhook signature (HMAC-SHA1) */
export function verifyOmiseWebhook(payload: string, signature: string): boolean {
  const secret = process.env.OMISE_WEBHOOK_SECRET;
  if (!secret) return true; // dev mode: skip verification
  const expected = createHmac("sha1", secret).update(payload).digest("hex");
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
